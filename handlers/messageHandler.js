import { sendMessage } from '../services/telegram.js';
import { getStockPrice } from '../services/stock.js';
import { getGoldPrice } from '../services/gold.js';
import { handlePLCommand } from '../services/transaction.js';
import { handleBuyCommand } from '../services/transaction.js';
import { getListStock } from '../services/transaction.js';
import { handleAlertCommand } from '../services/transaction.js';
import { handleAlertActionCommand } from '../services/transaction.js';
import { checkAlerts } from '../services/alert_service.js';




export async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const username = msg.chat.username;
  const text = msg.text?.trim() ?? '';

  console.log(`📝 ${msg.from.first_name}: ${text}`);

  const [cmd, symbol] = text.split(' ');
  const cleanCmd = cmd?.split('@')[0] || '';

  let message;

  switch (cleanCmd) {
    case '/start':
      message = 'Xin chào 👋';
      break;

    case '/giavang':
      message = await getGoldPrice();
      break;

    case '/stock':
      if (!symbol) {
        message = '❗ Nhập mã. Ví dụ: /stock ACB';
      } else {
        message = await getStockPrice(symbol.toUpperCase());
      }
      break;

    case '/list_stock': {
      message = await getListStock(chatId, text, username);
      break;

    }
    case '/buy': {
      message = await handleBuyCommand(chatId, text, username);
      break;

    }

    case '/pl': {
      message = await handlePLCommand(chatId, text);
      break;
    }

    case '/alert': {
      message = await handleAlertCommand(chatId, text);
      break;
    }

    case '/alert_action': {
      message = await handleAlertActionCommand(chatId, text);
      break;
    }

    case '/check_alert': {
      message = await checkAlerts();
      break;
    }

    case '/help':
      message = getHelpMessage();
      break;

    default:
      message = '❗ Lệnh không hợp lệ';
  }

  await sendMessage(chatId, message);
}


function getHelpMessage() {
  return `
📌 DANH SÁCH LỆNH

/start
→ Xin chào, khởi động bot

/xsmb
→ Xem kết quả xổ số miền Bắc

/weather
→ Xem thông tin thời tiết

/giavang
→ Xem giá vàng hiện tại

/stock mã_cp
→ Xem giá cổ phiếu
Ví dụ: /stock ACB

/buy
→ Thực hiện giao dịch mua/bán cổ phiếu
Cú pháp:
  /buy -s &lt;mã_cp&gt; -p giá
       (-t &lt;thời_gian&gt; format yyyy-MM-dd)
       (-fee &lt;phí_giao_dịch&gt;)
       (-af &lt;phí_khác&gt;)
       (-type &lt;BUY|SELL&gt;) (default: BUY)

/pl (-s &lt;mã_cp&gt;)
→ Tính toán lời/lỗ
Ví dụ: /pl -s ACB

/list_stock (-s &lt;mã_cp&gt;)
→ Xem danh mục đầu tư

/alert
→ Tạo cảnh báo giá
Cú pháp:
  /alert -s mã_cp -p giá
      -op ( &gt;=|&lt;=|&gt;|&lt; ) (-mess "message text")

/alert_action
→ Thao tác với alert (update/delete)
Cú pháp:
  /alert_action -id &lt;alert_id&gt; -state &lt;on|off|del&gt;

/check_alert
→ Kiểm tra các cảnh báo
`;
}