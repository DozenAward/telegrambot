import { getTransactions } from './db.js';
import { getAllTransactions } from './db.js';
import { getStockPriceRaw } from './stock.js';
import { CommandParser } from '../utils/CommandParser.js';
import { PLCommand } from '../utils/PLCommand.js';
import { BuyCommand } from '../utils/BuyCommand.js';
import { addTransaction } from '../services/db.js';


export async function getListStock(chatId, text) {
  const { options } = CommandParser.parse(text);

  const symbol = options.s?.toUpperCase();
  const sortBy = options.sort || 'symbol';
  const order = (options.order || 'asc').toLowerCase();

  let transactions = await getAllTransactions(chatId);

  if (symbol) {
    transactions = transactions.filter((t) => t.symbol === symbol);
  }

  if (!transactions.length) {
    return '❗ Không có dữ liệu';
  }

  // 🎯 group theo symbol
  const grouped = {};

  for (const t of transactions) {
    if (!grouped[t.symbol]) {
      grouped[t.symbol] = [];
    }
    grouped[t.symbol].push(t);
  }

  // 🚀 tính toán + gọi giá realtime
  let result = [];

  for (const [sym, trans] of Object.entries(grouped)) {
    const price = await getStockPriceRaw(sym); // 🔥 lấy giá realtime

    const calc = calculatePosition(trans, price);

    result.push({
      symbol: sym,
      qty: calc.totalQty,
      avgPrice: calc.avgPrice,
      price,
      pl: calc.pl,
      percent: calc.percent,
    });
  }

  // 🎯 sort
  result.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (typeof valA === 'string') {
      return order === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    return order === 'asc' ? valA - valB : valB - valA;
  });

  // 🎯 format output
  const lines = result.map((r) => {
    const color = r.pl >= 0 ? '🟢' : '🔴';

    return (
      `📊 ${r.symbol} | SL: ${r.qty}\n` +
      `⚖️ ${r.avgPrice.toFixed(2)} → 💰 ${r.price}\n` +
      `${color} ${r.pl.toLocaleString()} (${r.percent.toFixed(2)}%)`
    );
  });

  return lines.join('\n\n');
}

export async function handleBuyCommand(chatId, text, username) {
    try {

        console.log("Chat Id " + chatId + ", Username: " + username + ", text: " + text);
        const { options } = CommandParser.parse(text);

        const cmd = new BuyCommand(options);
        cmd.validate();

        const symbol = cmd.symbol;
        const price = cmd.price;
        const qty = cmd.quantity;
        const fee = cmd.fee;
        const addFee = cmd.af;
        const type = cmd.type;

        // 🎯 xử lý thời gian
        const transactionTime = cmd.time
            ? new Date(cmd.time).toISOString()
            : new Date().toISOString();

        await addTransaction(
            chatId,
            username,
            symbol,
            price,
            qty,
            fee,
            addFee,
            transactionTime, // ✅ đúng format timestamp
            type
        );

        const actionMap = {
            BUY: 'Mua',
            SELL: 'Bán',
        };

        const action = actionMap[type] || 'Mua';

        return `✅ ${action} ${symbol} ${qty} @ ${price}`;

    } catch (err) {
        console.log(err);
        return `❌ ${err.message}`;
    }
}

export async function handlePLCommand(chatId, text) {
    try {
        const { options } = CommandParser.parse(text);

        const cmd = new PLCommand(options);
        cmd.validate();

        const transactions = await getTransactions(chatId, cmd.symbol);

        if (!transactions.length) {
            return `❗ Không có dữ liệu ${cmd.symbol}`;
        }

        const price = await getStockPriceRaw(cmd.symbol);

        const result = calculatePosition(transactions, price);

        const totalFee = cmd.fee + cmd.af;
        const finalPL = result.pl - totalFee;
        const bankProfit = result.bankValue - result.totalCost;
        const diff = finalPL - bankProfit;
        let compareLine = '';

        if (diff >= 0) {
            compareLine =
                `🟢 Vượt bank: +${diff.toLocaleString()}`;
        } else {
            compareLine =
                `🔴 Thua bank: ${diff.toLocaleString()}`;
        }

        return (
            `📊 <b>${cmd.symbol}</b>\n` +
            `⏱ ${new Date(cmd.time).toLocaleString('vi-VN')}\n` +
            `📦 SL: ${result.totalQty}\n` +
            `⏳ Thời gian nắm giữ tb: ${result.durationDays.toFixed(0)} ngày\n` +
            `💰 Giá Hiện tại: ${price}\n` +
            `⚖️ Giá TB: ${result.avgPrice.toFixed(2)}\n` +
            `💵 Lãi/Lỗ: ${finalPL.toLocaleString()}\n` +
            `🏦 Bank: ${bankProfit.toLocaleString()}\n` +
            `${compareLine}\n` +
            `📊 %: ${result.percent.toFixed(2)}%\n` +
            `💸 Phí: ${totalFee.toLocaleString()}`
        );

    } catch (err) {
        return `❌ ${err.message}`;
    }
}


export function calculatePosition(transactions, currentPrice) {
    let totalQty = 0;
    let totalCost = 0;

    let totalTimeWeighted = 0; // 🔥 dùng tính avg date

    for (const t of transactions) {
        const cost =
            t.price * t.quantity +
            (t.fee || 0) +
            (t.addition_fee || 0);
        // console.log("Transaction :"+JSON.stringify(t, null, 2));
        const time = new Date(t.transaction_date).getTime();
        // console.log("Date "+time+"  by convert "+t.transaction_date);

        if (t.type === 'BUY') {
            totalQty += t.quantity;
            totalCost += cost;

            // ✅ tính weighted time
            totalTimeWeighted += time * t.quantity;
        }

        if (t.type === 'SELL') {
            totalQty -= t.quantity;
            totalCost -= cost;

            // ⚠️ trừ luôn phần time tương ứng (quan trọng)
            totalTimeWeighted -= time * t.quantity;
        }
    }

    if (totalQty <= 0) {
        return {
            totalQty: 0,
            avgPrice: 0,
            pl: 0,
            percent: 0,
            avgDate: null,
            durationDays: 0,
            bankValue: 0,
            totalCost: 0,

        };
    }

    // 🎯 avg price
    const avgPrice = totalCost / totalQty;

    // 🎯 avg date
    const avgTimestamp = totalTimeWeighted / totalQty;
    const avgDate = new Date(avgTimestamp);

    // 🎯 duration
    const now = Date.now();
    const durationMs = now - avgTimestamp;
    const durationDays = durationMs / (1000 * 60 * 60 * 24);

    // 🎯 P/L
    const pl = currentPrice * totalQty - totalCost;
    const percent = (pl / totalCost) * 100;

    // 🎯 so với ngân hàng (giả sử 5%/năm)
    const bankRate = 0.05;
    const bankValue =
        totalCost * (1 + (bankRate * durationDays) / 365);

    return {
        totalQty,
        avgPrice,
        pl,
        percent,
        avgDate,
        durationDays,
        bankValue,
        totalCost,
    };
}

// export function calculatePosition(transactions, currentPrice) {
//     let totalQty = 0;
//     let totalCost = 0;

//     for (const t of transactions) {
//         const cost = t.price * t.quantity + (t.fee || 0) + (t.addition_fee || 0);

//         if (t.type === 'BUY') {
//             totalQty += t.quantity;
//             totalCost += cost;
//         }

//         if (t.type === 'SELL') {
//             totalQty -= t.quantity;
//             totalCost -= cost; // đơn giản hóa
//         }
//     }

//     if (totalQty <= 0) {
//         return { totalQty: 0, avgPrice: 0, pl: 0, percent: 0 };
//     }

//     const avgPrice = totalCost / totalQty;
//     const pl = (currentPrice * totalQty) - totalCost;
//     const percent = (pl / totalCost) * 100;

//     return { totalQty, avgPrice, pl, percent };
// }