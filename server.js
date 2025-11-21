const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = '5080119136:AAHM7RJ3wWP-P3zkAset8_bXigyuOorXEsI';
const bot = new TelegramBot(token, { polling: true });

const GOLD_API_KEY = 'bb7459acdad77a8554cd76d21317e332';

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  let message;

  switch (msg.text) {
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
    default:
      message = "❗ Lệnh không hợp lệ. Gõ /giavang để xem giá vàng.";
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
