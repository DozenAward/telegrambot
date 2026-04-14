import axios from 'axios';
import xml2js from 'xml2js';


function formatMoney(num) {
  return Number(num || 0)
    .toLocaleString('vi-VN', {
      maximumFractionDigits: 0, // ❌ bỏ phần lẻ
    });
}

export async function getGoldPrice() {
  try {
    // 🇻🇳 lấy vàng VN (array)
    const vnGoldList = await getGoldPriceVN();

    // 🌍 lấy vàng thế giới (VND / ounce)
    const globalGold = await getGoldPriceGlobal();

    if (!vnGoldList.length || !globalGold) {
      return '❗ Không lấy được dữ liệu vàng';
    }

    // 👉 lấy SJC
    const sjc = vnGoldList.find((g) =>
      g.name.includes('SJC')
    );

    if (!sjc) {
      return '❗ Không tìm thấy giá SJC';
    }

    // 🎯 convert: ounce → lượng
    const OUNCE_TO_LUONG = 1.20565;
    const globalPerLuong = globalGold * OUNCE_TO_LUONG;

    // 🎯 VN giá bán
    const vnPrice = sjc.sell * 10;
    const sjcBuy = sjc.buy * 10;

    // 📊 tính chênh lệch
    const diff = vnPrice - globalPerLuong;
    const percent = (diff / globalPerLuong) * 100;

    const color = diff >= 0 ? '🔴' : '🟢';
    const status =
      diff >= 0 ? 'VN cao hơn TG' : 'VN thấp hơn TG';

    // 🎯 format đẹp
    return (
      `🥇 <b>Giá vàng hôm nay</b>\n\n` +

      `🇻🇳 SJC:\n` +
      `🟢 Mua: ${formatMoney(sjcBuy)} VND/lượng\n` +
      `🔴 Bán: ${formatMoney(vnPrice)} VND/lượng\n\n` +

      `🌍 Thế giới:\n` +
      `💰 ${formatMoney(globalPerLuong)} VND/lượng\n\n` +

      `${color} ${status}\n` +
      `💸 Chênh lệch: ${formatMoney(diff)} VND/lượng\n` +
      `📊 ${percent.toFixed(2)}%\n\n` +

      `⏱ ${sjc.date}`
    );

  } catch (err) {
    console.error(err);
    return '❌ Lỗi xử lý giá vàng';
  }
}

export async function getGoldPriceGlobal() {
  try {
    const res = await axios.get(
      'https://api.metalpriceapi.com/v1/latest',
      {
        params: {
          api_key: process.env.GOLD_API_KEY,
          base: 'XAU',
          currencies: 'VND'
        }
      }
    );

    const rate = res.data?.rates?.VND;

    return Number(rate); // ✅ chỉ trả number

  } catch (e) {
    console.error('❌ Gold error:', e.message);
    return null;
  }
}

export async function formatVNGoldMessage() {
  const result = await getGoldPriceVN();

  const lines = result
    .filter((g) => g.name.includes('VÀNG') && g.name.includes('SJC'))
    .map(
      (g) =>
        `🥇 ${g.name}\n` +
        `🟢 Mua: ${g.buy.toLocaleString()}\n` +
        `🔴 Bán: ${g.sell.toLocaleString()}\n` +
        `⏱ ${g.date}`
    );

  return lines.join('\n\n');
}


export async function getGoldPriceVN() {
  try {
    const res = await axios.get(
      'http://api.btmc.vn/api/BTMCAPI/getpricebtmc?key=3kd8ub1llcg9t45hnoh8hmn7t5kc2v'
    );

    const dataList = res.data?.DataList?.Data || [];

    const result = dataList.map((item) => {
      const index = item['@row'];

      const name = item[`@n_${index}`];
      const buy = Number(item[`@pb_${index}`]);
      const sell = Number(item[`@ps_${index}`]);
      const date = item[`@d_${index}`];

      return {
        name,
        buy,
        sell,
        date,
      };
    });

    return result;

  } catch (err) {
    console.error(err);
    return [];
  }
}