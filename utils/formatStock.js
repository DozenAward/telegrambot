import { handleMessage } from '../handlers/messageHandler.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const msg = req.body?.message;

      if (msg) {
        await handleMessage(msg);
      }

      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error('❌ Error:', e.message);
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(200).json({ message: 'Bot is running 🚀' });
}