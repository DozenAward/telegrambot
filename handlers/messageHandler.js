import { sendMessage } from '../services/telegram.js';
import { getStockPrice } from '../services/stock.js';
import { getGoldPrice } from '../services/gold.js';

export async function handleMessage(msg) {
  const chatId = msg.chat.id;
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

    default:
      message = '❗ Lệnh không hợp lệ';
  }

  await sendMessage(chatId, message);
}