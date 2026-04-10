import { sendMessage } from '../services/telegram.js';
import { getStockPrice } from '../services/stock.js';
import { getGoldPrice } from '../services/gold.js';
import { addTransaction } from '../services/db.js';

export async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  const text = msg.text?.trim() ?? '';

  console.log(`📝 ${msg.from.first_name}: ${text}`);

  const [cmd, symbol] = text.split(' ');
  const cleanCmd = cmd?.split('@')[0] || '';

  let message;

  switch (cleanCmd) {
    case '/start':
      message = 'Xin chào 👋';
      break;

    case '/giavang':
      message = await getGoldPrice();
      break;

    case '/stock':
      if (!symbol) {
        message = '❗ Nhập mã. Ví dụ: /stock ACB';
      } else {
        message = await getStockPrice(symbol.toUpperCase());
      }
      break;
    case '/buy': {
      console.log('🔥 BUY COMMAND HIT');
      const [, sym, price, qty] = text.split(' ');

      await addTransaction(
        chatId,
        sym.toUpperCase(),
        Number(price),
        Number(qty),
        'BUY'
      );

      message = `✅ Mua ${sym} ${qty} @ ${price}`;
      break;
    }

    case '/pl': {
      const symbol = text.split(' ')[1];

      const transactions = await getTransactions(chatId, symbol);

      if (!transactions.length) {
        message = `❗ Không có dữ liệu ${symbol}`;
        break;
      }

      const stock = await getStockPriceRaw(symbol);
      const result = calculatePosition(transactions, stock.matchedPrice);

      message =
        `📊 <b>${symbol}</b>\n` +
        `📦 SL: ${result.totalQty}\n` +
        `💰 Giá TB: ${result.avgPrice.toFixed(2)}\n` +
        `💵 Lãi/Lỗ: ${result.pl.toLocaleString()}\n` +
        `📊 %: ${result.percent.toFixed(2)}%`;

      break;
    }

    default:
      message = '❗ Lệnh không hợp lệ';
  }

  await sendMessage(chatId, message);
}