import { getActiveAlerts } from './db.js';
import { sendMessage } from './telegram.js';
import { getStockPriceRaw } from './stock.js';
import { updateAlertStatus } from './db.js'


export async function checkAlerts() {
  const alerts = await getActiveAlerts();

  if (!alerts.length) return;

  // 🎯 group theo symbol
  const grouped = {};

  for (const a of alerts) {
    if (!grouped[a.symbol]) {
      grouped[a.symbol] = [];
    }
    grouped[a.symbol].push(a);
  }

  // 🎯 loop từng symbol
  for (const symbol of Object.keys(grouped)) {
    const price = await getStockPriceRaw(symbol); // 🔥 API của bạn

    if (!price) continue;

    const alertList = grouped[symbol];

    for (const alert of alertList) {
      const isMatch = checkCondition(
        price,
        alert.operator,
        alert.target_price
      );

      if (isMatch) {
        await triggerAlert(alert, price);
      }
    }
  }
}

function checkCondition(current, operator, target) {
  switch (operator) {
    case '>=':
      return current >= target;
    case '<=':
      return current <= target;
    case '>':
      return current > target;
    case '<':
      return current < target;
    default:
      return false;
  }
}

async function triggerAlert(alert, price) {
  const msg =
    `🚨 ALERT TRIGGERED\n` +
    `📊 ${alert.symbol}\n` +
    `💰 Giá hiện tại: ${price.toLocaleString()}\n` +
    `🎯 Điều kiện: ${alert.operator} ${alert.target_price}\n` +
    `💬 ${alert.message || ''}`;

  await sendMessage(alert.chat_id, msg);

  // ❗ Option: tắt luôn sau khi trigger
  await updateAlertStatus(alert.id, false);
}