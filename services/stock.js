export async function getStockPrice(symbol) {
  try {
    const res = await fetch(
      `https://iboard-query.ssi.com.vn/stock/${symbol}?boardId=MAIN`,
       {
        headers: {
          'accept': 'application/json, text/plain, */*',
          'referer': 'https://iboard.ssi.com.vn/',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'api-key': 'Flh4hH9L.UCiJuphpJbPIKLyglbAem'
        }
      }
    );

    const json = await res.json();
    const d = json?.data;

    if (!d) return `❗ Không tìm thấy mã ${symbol}`;

    const fmt = (n) => Number(n).toLocaleString('vi-VN');

    return (
      `📈 <b>${d.stockSymbol}</b>\n` +
      `💰 Giá: ${fmt(d.matchedPrice)}\n` +
      `📊 +/-: ${fmt(d.priceChange)} (${d.priceChangePercent}%)\n` +
      `📦 KL: ${fmt(d.nmTotalTradedQty)}`
    );
  } catch (e) {
    console.error('❌ Stock error:', e.message);
    return `❌ Lỗi lấy dữ liệu ${symbol}`;
  }
}