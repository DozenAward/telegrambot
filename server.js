const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = '5080119136:AAHM7RJ3wWP-P3zkAset8_bXigyuOorXEsI';
const bot = new TelegramBot(token, { polling: true });
// const bot = new TelegramBot(token);
// bot.setWebHook("https://telegrambot-2p3h.onrender.com/bot");

const GOLD_API_KEY = 'bb7459acdad77a8554cd76d21317e332';
const DEFAULT_CHAT_ID = '1536532575'

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// serve file html
console.log(path.join(__dirname, "index.html"));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use(express.json());

app.post("/bot", (req, res) => {
  console.log("📩 Nhận:", req.body?.message?.text);
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(PORT, async () => {
  console.log("✅  Web running...");

  // await bot.setWebHook("https://telegrambot-2p3h.onrender.com");
  // console.log("✅ Webhook ready");
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim() ?? "";
  console.log(text)
  const [cmd, symbol] = text.split(" "); // ✅ tách lệnh và tham số
  let message;
  const cleanCmd = cmd.split("@")[0];


  switch (cleanCmd) {
    case '/start':
      message = "Xin chào 👋";
      break;
    case '/xsmb':
      message = "Xổ số miền Bắc chưa có dữ liệu 😅";
      break;
    case '/weather':
      message = "Thời tiết hôm nay nắng đẹp 🌤️";
      break;
    case '/giavang':
      message = await getGoldPrice(); // 👈 Thêm await ở đây
      break;
    case '/stock':
      if (!symbol) {
        message = "❗ Vui lòng nhập mã cổ phiếu. Ví dụ: <code>/stock ACB</code>";
      } else {
        message = await getStockPrice(symbol.toUpperCase());
      }
      break;
    default:
      message =
        "❗ Lệnh không hợp lệ. Các lệnh hiện có:\n\n" +
        "/start — Xin chào\n" +
        "/xsmb — Xổ số miền Bắc\n" +
        "/weather — Thời tiết\n" +
        "/giavang — Giá vàng\n" +
        "/stock [mã] — Giá cổ phiếu. Ví dụ: /stock ACB";
  }

  await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});


async function getGoldPrice() {
  try {
    const response = await axios.get('https://api.metalpriceapi.com/v1/latest', {
      params: {
        api_key: GOLD_API_KEY,
        base: 'XAU',
        currencies: 'USD,VND'
      }
    });

    const data = response.data;

    if (!data || !data.rates) return "⚠️ Không lấy được dữ liệu giá vàng.";

    return formatGoldMessage(data); // 👈 Trả về string
  } catch (error) {
    console.error("❌ Lỗi khi gọi API:", error.message);
    return "❌ Lỗi khi gọi API giá vàng.";
  }
}

function formatGoldMessage(data) {
  const lines = Object.entries(data.rates)
    .map(([currency, rate]) => `- 1 ${data.base} = ${rate.toLocaleString()} ${currency}`)
    .join('\n');

  return `
*💰 Giá vàng hiện tại* (${data.base})
🕒 Cập nhật: ${new Date(data.timestamp * 1000).toLocaleString()}
${lines}
`;
}


const cron = require("node-cron");

// Chạy cronjob mỗi ngày lúc 2 giờ sáng
cron.schedule("0 8 * * *", async () => {
  console.log("Cronjob backend chạy vào 2 giờ sáng");
  // Thực hiện công việc: gửi email, cập nhật DB...
  let message = await getGoldPrice();
  bot.sendMessage(DEFAULT_CHAT_ID, message, { parse_mode: "Markdown" });
});



// const fetch = require("node-fetch");

const SSI_HEADERS = {
  "accept": "application/json, text/plain, */*",
  "referer": "https://iboard.ssi.com.vn/",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "api-key": "Flh4hH9L.UCiJuphpJbPIKLyglbAem",
};

// const SSI_HEADERS = {
//   "accept": "application/json, text/plain, */*",
//   "origin": "https://iboard.ssi.com.vn",
//   "referer": "https://iboard.ssi.com.vn/",
// };

async function getStockPrice(symbol = "ACB") {
  try {
    const res = await fetch(
      `https://iboard-query.ssi.com.vn/stock/${symbol}?boardId=MAIN`,
      { headers: SSI_HEADERS }
    );

    const json = await res.json();
    const d = json?.data;

    if (!d) return `❗ Không tìm thấy mã ${symbol}`;

    const fmt = (n) => Number(n).toLocaleString("vi-VN");

    const arrow =
      d.priceChange < 0 ? "🔴" :
        d.priceChange > 0 ? "🟢" : "⚪";

    const padLeft = (str, len) => str.toString().padStart(len, " ");

    // FIX width lớn hơn để tránh lệch
    const PRICE_WIDTH = 8;
    const VOL_WIDTH = 9; // raw number
    const VOL_BRACKET_WIDTH = 12; // sau khi thêm ()

    const fmtPrice = (n) =>
      padLeft(Number(n).toLocaleString("vi-VN"), PRICE_WIDTH);

    // pad số trước
    const fmtVolRaw = (n) =>
      padLeft(Number(n).toLocaleString("vi-VN"), VOL_WIDTH);

    // rồi mới thêm ngoặc + pad lại lần cuối
    const fmtVolBracket = (n) =>
      `(${fmtVolRaw(n).trim()})`.padStart(VOL_BRACKET_WIDTH, " ");

    // row chuẩn
    const row = (bid, bidVol, offer, offerVol) => {
      return `🟢 ${fmtPrice(bid)} ${fmtVolBracket(bidVol)} | 🔴 ${fmtPrice(offer)} ${fmtVolBracket(offerVol)}`;
    };

    const top3 = [
      row(d.best1Bid, d.best1BidVol, d.best1Offer, d.best1OfferVol),
      row(d.best2Bid, d.best2BidVol, d.best2Offer, d.best2OfferVol),
      row(d.best3Bid, d.best3BidVol, d.best3Offer, d.best3OfferVol),
    ].join("\n");

    const formatTime = (ts) => {
      const date = new Date(ts);
      return date.toLocaleTimeString("vi-VN");
    };
    const updateTime = formatTime(d.expectedLastUpdate);

    return (
      `${arrow} *${d.stockSymbol}*\n` +
      `⏱ Cập nhật: ${updateTime}\n` +
      `💰 Giá hiện tại: *${fmt(d.matchedPrice)}*\n` +
      `📊 +/-: ${d.priceChange > 0 ? "+" : ""}${fmt(d.priceChange)} (${d.priceChangePercent}%)\n` +
      `📌 TC: ${fmt(d.refPrice)}\n\n` +

      // `📥 <b>Top 3 MUA</b>\n${topBid}\n\n` +
      // `📤 <b>Top 3 BÁN</b>\n${topOffer}\n\n` +
      `📤 *Top 3*\n${top3}\n\n` +

      `📦 KL: ${fmt(d.nmTotalTradedQty)}\n` +
      `💵 GT: ${(d.nmTotalTradedValue / 1e9).toFixed(2)} tỷ`
    );

  } catch (e) {
    return `❗ Lỗi lấy dữ liệu ${symbol}: ${e.message}`;
  }
}



