import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: false
});

export async function sendMessage(chatId, text) {
  return bot.sendMessage(chatId, text, {
    parse_mode: 'HTML'
  });
}