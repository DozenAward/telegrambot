// 🧪 Local dev runner (polling) — chỉ dùng để test ở máy, KHÔNG deploy.
// Chạy: npm run dev
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

// ⚠️ import động SAU khi load env, để telegram.js đọc được TELEGRAM_BOT_TOKEN
const { default: TelegramBot } = await import('node-telegram-bot-api');
const { handleMessage } = await import('./handlers/messageHandler.js');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('❌ Thiếu TELEGRAM_BOT_TOKEN trong .env.local');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// 🧹 Xoá webhook (nếu đã set trên Vercel) để tránh lỗi 409 khi polling
await bot.deleteWebHook().catch(() => {});

bot.on('message', async (msg) => {
  try {
    await handleMessage(msg);
  } catch (err) {
    console.error('❌ handleMessage error:', err.message);
  }
});

bot.on('polling_error', (err) => {
  console.error('❌ polling_error:', err.message);
});

console.log('🤖 Bot đang chạy ở chế độ polling. Mở Telegram và nhắn thử /help');
