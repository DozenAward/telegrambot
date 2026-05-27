import { sendMessage } from '../services/telegram.js';
import { getStockPrice } from '../services/stock.js';
import { getVNIndex } from '../services/stock.js';
import { getGoldPrice } from '../services/gold.js';
import { handlePLCommand } from '../services/transaction.js';
import { handleBuyCommand } from '../services/transaction.js';
import { getList } from '../services/transaction.js';
import { getListStock } from '../services/transaction.js';
import { handleAlertCommand } from '../services/transaction.js';
import { handleAlertActionCommand } from '../services/transaction.js';
import { handleEditCommand } from '../services/transaction.js';
import { checkAlerts } from '../services/alert_service.js';
import { getMyStockList } from '../services/transaction.js';
import { getStockListPrice } from '../services/stock.js';
import { getStockEventHistory } from '../services/stock.js';
import { calPortfolioAllocation } from '../services/transaction.js'




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

    case '/vnindex': {
      message = await getVNIndex();
      break;

    }

    case '/event_history': {

      const { options } = CommandParser.parse(text);

      const symbol = options.s?.toUpperCase();


      const { start, end } = getDateRange();
      const startDate = options.from || start;
      const endDate = options.to || end;

      message = await getStockEventHistory(symbol,startDate,endDate,null,null);
      break;

    }
    case '/stock':
      if (!symbol) {
        message = '❗ Nhập mã. Ví dụ: /stock ACB hoặc /stock ACB,VNM';
      } else {
        const symbols = symbol
          .split(',')
          .map(s => s.trim().toUpperCase())
          .filter(Boolean);

        if (symbols.length === 1) {
          // 👉 giữ logic cũ
          message = await getStockPrice(symbols[0]);
        } else {
          // 👉 nhiều mã
          message = await getStockListPrice(symbols);
        }
      }
      break;

    case '/my_list':
      const list = await getMyStockList(chatId);

      if (!list.length) {
        message = '❗ Danh sách trống';
      } else {
        message = await getStockListPrice(list);
      }
      break;

    case '/list_stock': {
      message = await getListStock(chatId, text, username);
      break;

    }

    case '/list': {
      message = await getList(chatId, text, username);
      break;

    }

    case '/group_ml': {
      message = await calPortfolioAllocation(chatId);
      console.log("Message ml " + message);
      break;

    }

    case '/buy': {
      message = await handleBuyCommand(chatId, text, username);
      break;

    }

    case '/edit': {
      message = await handleEditCommand(chatId, text);
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

function getDateRange() {
  const now = new Date();
  const threeYearsAgo = new Date(now);
  threeYearsAgo.setFullYear(now.getFullYear() - 3);

  const format = (date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  return {
    startDate: format(threeYearsAgo),
    endDate: format(now)
  };
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
  /buy -s &lt;mã_cp&gt; -p &lt;giá&gt; -m &lt;khối_lượng_giao_dịch&gt;
       (-t &lt;thời_gian&gt; format yyyy-MM-dd)
       (-fee &lt;phí_giao_dịch&gt;)
       (-af &lt;phí_khác&gt;)
       (-type &lt;BUY|SELL&gt;) (default: BUY)

/edit
→ Thực hiện giao dịch mua/bán cổ phiếu
Cú pháp:
  /edit -id &lt;id&gt; (-s &lt;mã_cp&gt;) (-p &lt;giá&gt;)
       (-m &lt;khối_lượng_giao_dịch&gt;)
       (-t &lt;thời_gian&gt; format yyyy-MM-dd)
       (-fee &lt;phí_giao_dịch&gt;)
       (-af &lt;phí_khác&gt;)
       (-type &lt;BUY|SELL&gt;)

/pl (-s &lt;mã_cp&gt;)
→ Tính toán lời/lỗ
Ví dụ: /pl -s ACB

/list (-s &lt;mã_cp&gt;)
→ Xem danh mục giao dịch

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

/my_list
→ Kiểm tra các danh mục cổ phiếu hiện hữu

/vnindex
→ Lấy chỉ số vnindex
`;
}