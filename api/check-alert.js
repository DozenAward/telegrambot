export default async function handler(req, res) {
  try {
    await checkAlerts(); // 👈 code bạn đã viết

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}