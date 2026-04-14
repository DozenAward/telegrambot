import { handleMessage } from '../handlers/messageHandler.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// ========================================
// WEBHOOK HANDLER (Vercel)
// ========================================

export default async function handler(req, res) {
  // ✅ TELEGRAM GỬI UPDATE (POST)
  if (req.method === 'POST') {
    try {
      const update = req.body;

      console.log('📨 Update:', JSON.stringify(update));

      // Telegram có nhiều loại update (message, callback_query...)
      const msg = update?.message;

      if (msg) {
        await handleMessage(msg);
      }

      // ⚠️ BẮT BUỘC trả 200 cho Telegram
      return res.status(200).json({ ok: true });

    } catch (error) {
      console.error('❌ Handler error:', error.message);

      // vẫn trả 200 để Telegram không retry spam
      return res.status(200).json({ ok: false });
    }
  }

  // ✅ TEST TRÊN BROWSER
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'Bot is running 🚀',
      time: new Date().toISOString()
    });
  }

  // ❌ METHOD KHÁC
  return res.status(405).json({ error: 'Method not allowed' });
}