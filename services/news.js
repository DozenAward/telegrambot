import axios from 'axios';
import xml2js from 'xml2js';

// 📰 Nguồn tin nổi bật (RSS VnExpress)
const RSS_URL = 'https://vnexpress.net/rss/tin-noi-bat.rss';

const MAX_ITEMS = 10;

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripHtml(str = '') {
  return String(str)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isSameDay(date, ref) {
  return (
    date.getFullYear() === ref.getFullYear() &&
    date.getMonth() === ref.getMonth() &&
    date.getDate() === ref.getDate()
  );
}

function formatTime(date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatDate(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export async function getDailyNews() {
  try {
    const { data } = await axios.get(RSS_URL, {
      timeout: 10000,
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const parsed = await xml2js.parseStringPromise(data, {
      explicitArray: false,
      trim: true
    });

    const rawItems = parsed?.rss?.channel?.item ?? [];
    const items = Array.isArray(rawItems) ? rawItems : [rawItems];

    if (!items.length) {
      return '❗ Hiện chưa có tin nổi bật.';
    }

    const now = new Date();

    const normalized = items
      .map((item) => {
        const pub = item?.pubDate ? new Date(item.pubDate) : null;
        return {
          title: stripHtml(item?.title),
          link: (item?.link || '').trim(),
          date: pub && !isNaN(pub.getTime()) ? pub : null
        };
      })
      .filter((it) => it.title);

    // 🎯 ưu tiên tin trong ngày, nếu chưa có thì lấy tin mới nhất
    const todayItems = normalized.filter(
      (it) => it.date && isSameDay(it.date, now)
    );
    const chosen = (todayItems.length ? todayItems : normalized).slice(
      0,
      MAX_ITEMS
    );

    const lines = chosen.map((it, i) => {
      const time = it.date ? `🕒 ${formatTime(it.date)}` : '';
      const title = escapeHtml(it.title);
      const linked = it.link
        ? `<a href="${escapeHtml(it.link)}">${title}</a>`
        : title;
      return `${i + 1}. ${linked}${time ? `\n   ${time}` : ''}`;
    });

    return (
      `📰 <b>Tin nổi bật hôm nay</b> (${formatDate(now)})\n\n` +
      lines.join('\n\n')
    );
  } catch (err) {
    console.error('❌ News error:', err.message);
    return '❌ Lỗi khi lấy tin nổi bật.';
  }
}
