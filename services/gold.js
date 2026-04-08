import axios from 'axios';

export async function getGoldPrice() {
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

    return `💰 Giá vàng: ${Number(rate).toLocaleString('vi-VN')} VND`;
  } catch (e) {
    console.error('❌ Gold error:', e.message);
    return '❌ Lỗi giá vàng';
  }
}