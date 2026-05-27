


export async function getVNIndex() {
  const res = await fetch(
    'https://iboard-query.ssi.com.vn/exchange-index/VNINDEX?hasHistory=false', {
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

  const color = d.change >= 0 ? '🟢' : '🔴';
  const breadth = d.advances - d.declines;

  const text =
    `📊 VNINDEX: ${d.indexValue}\n` +
    `⚖️ ${d.prevIndexValue} → ${d.indexValue}\n` +
    `${color} ${d.change} (${d.changePercent}%)\n\n` +
    `📈 Tăng: ${d.advances} | 📉 Giảm: ${d.declines}\n` +
    `⚖️ Độ rộng: ${breadth}\n\n` +
    `💰 GTGD: ${(d.totalValue / 1e12).toFixed(2)} nghìn tỷ`;

  return text;
}

export async function getStockListPrice(symbols = []) {
  try {
    const results = await Promise.all(
      symbols.map(s => getStockPrice(s))
    );
    console.log("results ");
    return results.join('\n\n────────────\n\n');
  } catch (e) {
    console.error(e);
    return '❌ Lỗi lấy danh sách';
  }
}

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
    const arrow = d.priceChange < 0 ? '🔴' : d.priceChange > 0 ? '🟢' : '⚪';
    const padLeft = (str, len) => str.toString().padStart(len, ' ');

    const PRICE_WIDTH = 8;
    const VOL_WIDTH = 9;
    const VOL_BRACKET_WIDTH = 12;

    const fmtPrice = (n) =>
      padLeft(Number(n).toLocaleString('vi-VN'), PRICE_WIDTH);

    const fmtVolRaw = (n) =>
      padLeft(Number(n).toLocaleString('vi-VN'), VOL_WIDTH);

    const fmtVolBracket = (n) =>
      `(${fmtVolRaw(n).trim()})`.padStart(VOL_BRACKET_WIDTH, ' ');

    const row = (bid, bidVol, offer, offerVol) => {
      return `🟢 ${fmtPrice(bid)} ${fmtVolBracket(bidVol)} | 🔴 ${fmtPrice(offer)} ${fmtVolBracket(offerVol)}`;
    };

    const top3 = [
      row(d.best1Bid, d.best1BidVol, d.best1Offer, d.best1OfferVol),
      row(d.best2Bid, d.best2BidVol, d.best2Offer, d.best2OfferVol),
      row(d.best3Bid, d.best3BidVol, d.best3Offer, d.best3OfferVol)
    ].join('\n');

    const formatTime = (ts) => new Date(ts).toLocaleTimeString('vi-VN');
    const updateTime = formatTime(d.expectedLastUpdate);

    return (
      `${arrow} <b>${d.stockSymbol}</b>\n` +
      `⏱ Cập nhật: ${updateTime}\n` +
      `💰 Giá hiện tại: <b>${fmt(d.matchedPrice)}</b>\n` +
      `📊 +/-: ${d.priceChange > 0 ? '+' : ''}${fmt(d.priceChange)} (${d.priceChangePercent}%)\n` +
      `📌 TC: ${fmt(d.refPrice)}\n\n` +
      `📤 <b>Top 3</b>\n${top3}\n\n` +
      `📦 KL: ${fmt(d.nmTotalTradedQty)}\n` +
      `💵 GT: ${(d.nmTotalTradedValue / 1e9).toFixed(2)} tỷ`
    );
  } catch (e) {
    console.error('❌ Stock error:', e.message);
    return `❌ Lỗi lấy dữ liệu ${symbol}`;
  }
}


export async function getStockPriceRaw(symbol) {
  try {
    const res = await fetch(
      `https://iboard-query.ssi.com.vn/stock/${symbol}?boardId=MAIN`,
      {
        headers: {
          accept: 'application/json, text/plain, */*',
          referer: 'https://iboard.ssi.com.vn/',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'api-key': 'Flh4hH9L.UCiJuphpJbPIKLyglbAem'
        }
      }
    );

    const json = await res.json();
    // console.log("Data: "+JSON.stringify(json, null, 2));
    const d = json?.data;

    if (!d) return 0;

    // 🎯 lấy giá thị trường chuẩn
    const currentPrice =
      d.marketPrice ||
      d.lastPrice ||
      d.matchedPrice ||
      d.best1Offer ||
      d.best1Bid ||
      0;

    return Number(currentPrice);

  } catch (e) {
    console.error('❌ Stock error:', e.message);
    return 0;
  }
}

export async function getStockEventHistory(symbol, startDate, endDate) {
  try {
    // const encodedEventCode = eventCode.split(',').join('%2C');
    console.log("ma cp" + symbol + ", from " + startDate + "  to " + endDate);

    const res = await fetch(
      `https://iboard-api.ssi.com.vn/statistics/company/ssmi/corporate-actions?pageSize=50&page=1&language=vn&symbol=${symbol}&fromDate=${startDate}&toDate=${endDate}&eventCode=DIV`,
      {
        headers: {
          accept: 'application/json, text/plain, */*',
          referer: 'https://iboard.ssi.com.vn/',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'api-key': 'Flh4hH9L.UCiJuphpJbPIKLyglbAem'
        }
      }
    );

    const json = await res.json();

    if (json.code !== 'SUCCESS' || !json.data?.length) {
      return { symbol, events: [] };
    }

    return {
      symbol,
      exchange: json.data[0]?.exchange ?? null,
      events: json.data.map(item => ({
        name: item.eventName,
        type: item.eventListCode,       // 'DIV' | 'ISS' | ...
        exrightDate: item.exrightDate,         // ngày không hưởng quyền
        recordDate: item.recordDate,          // ngày chốt DSCD
        issueDate: item.issueDate,           // ngày thực hiện / thanh toán
        publicDate: item.publicDate,          // ngày công bố
        value: Number(item.value),       // tiền mặt (đồng) hoặc số lượng CP
        ratio: Number(item.ratio),       // tỷ lệ (0.05 = 5%)
        title: item.eventTitle,
      }))
    };

  } catch (e) {
    console.error('❌ Stock error:', e.message);
    return { symbol, events: [] };
  }
}


export async function formatEventHistory(data) {
  if (!data.events.length) {
    return `📊 *${data.symbol}* — Không có sự kiện nào trong khoảng thời gian này.`;
  }

  const typeLabel = {
    DIV: '💰 Cổ tức tiền mặt',
    ISS: '📄 Phát hành thêm',
    BON: '🎁 Cổ tức cổ phiếu',
  };

  const lines = data.events.map((e, i) => {
    const type = typeLabel[e.type] || e.type;
    const ratio = (e.ratio * 100).toFixed(0) + '%';
    const value = e.value.toLocaleString('vi-VN') + ' đ/CP';

    return [
      `${i + 1}. ${type} — ${ratio} (${value})`,
      `   📅 Không hưởng quyền: ${e.exrightDate}`,
      `   📅 Chốt DSCD: ${e.recordDate}`,
      `   📅 Thanh toán: ${e.issueDate} \n`,
    ].join('\n');
  });

  return [
    `📊 *${data.symbol}* (${data.exchange}) — Lịch sử sự kiện`,
    `━━━━━━━━━━━━━━━━━━`,
    ...lines,
    `━━━━━━━━━━━━━━━━━━`,
    `Tổng: ${data.events.length} sự kiện`,
  ].join('\n');
}

