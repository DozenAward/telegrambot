export async function getStockPrice(symbol) {
  try {
    const res = await fetch(
      `https://iboard-query.ssi.com.vn/stock/${symbol}?boardId=MAIN`
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