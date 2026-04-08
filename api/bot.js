// import TelegramBot from 'node-telegram-bot-api';
// import axios from 'axios';

// const token = process.env.TELEGRAM_BOT_TOKEN;
// const bot = new TelegramBot(token);
// const GOLD_API_KEY = process.env.GOLD_API_KEY;

// console.log('✅ Bot initialized');

// // ========================================
// // WEBHOOK HANDLER (Vercel sẽ gọi cái này)
// // ========================================

// export default async function handler(req, res) {
//   if (req.method === 'POST') {
//     try {
//       console.log('📨 Update từ Telegram:', req.body?.message?.text);
      
//       // ✅ NHẬN UPDATE
//       const msg = req.body?.message;
      
//       if (msg) {
//         // ✅ XỬ LÝ MESSAGE TẠI ĐÂY (không dùng bot.on)
//         await handleMessage(msg);
//       }
      
//       res.status(200).json({ ok: true });
//     } catch (error) {
//       console.error('❌ Lỗi:', error.message);
//       res.status(500).json({ error: error.message });
//     }
//   } else if (req.method === 'GET') {
//     res.status(200).json({ message: 'Bot is running 🚀' });
//   } else if (req.method === 'DELETE') {
//     try {
//       await bot.deleteWebHook();
//       res.status(200).json({ message: 'Webhook deleted' });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   } else {
//     res.status(405).json({ error: 'Method not allowed' });
//   }
// }

// // ========================================
// // MESSAGE HANDLER (✅ CHÍNH)
// // ========================================

// async function handleMessage(msg) {
//   const chatId = msg.chat.id;
//   const text = msg.text?.trim() ?? '';
  
//   console.log(`📝 [${msg.from.first_name}]: ${text}`);
  
//   const [cmd, symbol] = text.split(' ');
//   let message;
//   const cleanCmd = cmd?.split('@')[0] || '';

//   switch (cleanCmd) {
//     case '/start':
//       message = 'Xin chào 👋';
//       break;
//     case '/xsmb':
//       message = 'Xổ số miền Bắc chưa có dữ liệu 😅';
//       break;
//     case '/weather':
//       message = 'Thời tiết hôm nay nắng đẹp 🌤️';
//       break;
//     case '/giavang':
//       message = await getGoldPrice();
//       break;
//     case '/stock':
//       if (!symbol) {
//         message = '❗ Vui lòng nhập mã cổ phiếu. Ví dụ: /stock ACB';
//       } else {
//         message = await getStockPrice(symbol.toUpperCase());
//       }
//       break;
//     default:
//       message =
//         '❗ Lệnh không hợp lệ. Các lệnh hiện có:\n\n' +
//         '/start — Xin chào\n' +
//         '/xsmb — Xổ số miền Bắc\n' +
//         '/weather — Thời tiết\n' +
//         '/giavang — Giá vàng\n' +
//         '/stock [mã] — Giá cổ phiếu. Ví dụ: /stock ACB';
//   }

//   try {
//     await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
//     console.log(`✅ Gửi: ${message.substring(0, 50)}...`);
//   } catch (error) {
//     console.error('❌ Lỗi gửi tin nhắn:', error.message);
//   }
// }

// // ========================================
// // API FUNCTIONS
// // ========================================

// async function getGoldPrice() {
//   try {
//     const response = await axios.get('https://api.metalpriceapi.com/v1/latest', {
//       params: {
//         api_key: GOLD_API_KEY,
//         base: 'XAU',
//         currencies: 'USD,VND'
//       }
//     });

//     const data = response.data;
//     if (!data || !data.rates) return '⚠️ Không lấy được dữ liệu giá vàng.';

//     const lines = Object.entries(data.rates)
//       .map(([currency, rate]) => `- 1 ${data.base} = ${rate.toLocaleString()} ${currency}`)
//       .join('\n');

//     return (
//       `<b>💰 Giá vàng hiện tại</b> (${data.base})\n` +
//       `🕒 Cập nhật: ${new Date(data.timestamp * 1000).toLocaleString('vi-VN')}\n` +
//       lines
//     );
//   } catch (error) {
//     console.error('❌ Lỗi API vàng:', error.message);
//     return '❌ Lỗi khi gọi API giá vàng.';
//   }
// }

// async function getStockPrice(symbol = 'ACB') {
//   try {
//     const res = await fetch(
//       `https://iboard-query.ssi.com.vn/stock/${symbol}?boardId=MAIN`,
//       {
//         headers: {
//           'accept': 'application/json, text/plain, */*',
//           'referer': 'https://iboard.ssi.com.vn/',
//           'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
//           'api-key': 'Flh4hH9L.UCiJuphpJbPIKLyglbAem'
//         }
//       }
//     );

//     const json = await res.json();
//     const d = json?.data;

//     if (!d) return `❗ Không tìm thấy mã ${symbol}`;

//     const fmt = (n) => Number(n).toLocaleString('vi-VN');
//     const arrow = d.priceChange < 0 ? '🔴' : d.priceChange > 0 ? '🟢' : '⚪';
//     const padLeft = (str, len) => str.toString().padStart(len, ' ');

//     const PRICE_WIDTH = 8;
//     const VOL_WIDTH = 9;
//     const VOL_BRACKET_WIDTH = 12;

//     const fmtPrice = (n) =>
//       padLeft(Number(n).toLocaleString('vi-VN'), PRICE_WIDTH);

//     const fmtVolRaw = (n) =>
//       padLeft(Number(n).toLocaleString('vi-VN'), VOL_WIDTH);

//     const fmtVolBracket = (n) =>
//       `(${fmtVolRaw(n).trim()})`.padStart(VOL_BRACKET_WIDTH, ' ');

//     const row = (bid, bidVol, offer, offerVol) => {
//       return `🟢 ${fmtPrice(bid)} ${fmtVolBracket(bidVol)} | 🔴 ${fmtPrice(offer)} ${fmtVolBracket(offerVol)}`;
//     };

//     const top3 = [
//       row(d.best1Bid, d.best1BidVol, d.best1Offer, d.best1OfferVol),
//       row(d.best2Bid, d.best2BidVol, d.best2Offer, d.best2OfferVol),
//       row(d.best3Bid, d.best3BidVol, d.best3Offer, d.best3OfferVol)
//     ].join('\n');

//     const formatTime = (ts) => new Date(ts).toLocaleTimeString('vi-VN');
//     const updateTime = formatTime(d.expectedLastUpdate);

//     return (
//       `${arrow} <b>${d.stockSymbol}</b>\n` +
//       `⏱ Cập nhật: ${updateTime}\n` +
//       `💰 Giá hiện tại: <b>${fmt(d.matchedPrice)}</b>\n` +
//       `📊 +/-: ${d.priceChange > 0 ? '+' : ''}${fmt(d.priceChange)} (${d.priceChangePercent}%)\n` +
//       `📌 TC: ${fmt(d.refPrice)}\n\n` +
//       `📤 <b>Top 3</b>\n${top3}\n\n` +
//       `📦 KL: ${fmt(d.nmTotalTradedQty)}\n` +
//       `💵 GT: ${(d.nmTotalTradedValue / 1e9).toFixed(2)} tỷ`
//     );
//   } catch (e) {
//     console.error(`❌ Lỗi API ${symbol}:`, e.message);
//     return `❗ Lỗi lấy dữ liệu ${symbol}: ${e.message}`;
//   }
// }