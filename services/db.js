import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);





export async function getActiveAlerts() {
  const { data, error } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('is_active', true);

  if (error) throw new Error(error.message);

  return data;
}

export async function deleteAlert(id) {
  const { error } = await supabase
    .from('price_alerts')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Delete fail: ${error.message}`);
  }

  return true;
}

export async function updateAlertStatus(id, isActive) {
    const { data, error } = await supabase
        .from('price_alerts')
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Update fail: ${error.message}`);
    }

    return data;
}

// thêm cảnh báo
export async function addAlert(chatId, symbol, price, operator, message) {
    const { data, error } = await supabase
        .from('price_alerts')
        .insert([
            {
                chat_id: chatId,
                symbol,
                target_price: price,
                operator: operator,
                message
            }
        ])
        .select()        // 🔥 bắt buộc
        .single();       // 🔥 lấy 1 object luôn
    ;

    if (error) {
        console.error('❌ DB ERROR:', error);

        // 👉 throw lỗi ra ngoài
        throw new Error(`DB insert alert fail: ${error.message}`);
    }

    return data;

}

// thêm giao dịch
export async function addTransaction(chatId, username, symbol, price, qty, fee, add_fee, date_time, type = 'BUY') {
    // console.log('ENV:', process.env.SUPABASE_URL);

    const { data, error } = await supabase
        .from('portfolio')
        .insert([
            {
                chat_id: chatId,
                username,
                symbol,
                price,
                quantity: qty,
                fee,
                addition_fee: add_fee,
                transaction_date: date_time,
                type
            }
        ]);

    if (error) {
        console.error('❌ DB ERROR:', error);

        // 👉 throw lỗi ra ngoài
        throw new Error(`DB insert failed: ${error.message}`);
    }

    return data;
}

export async function getTransactions(chatId, symbol) {
    const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('chat_id', chatId)
        .eq('symbol', symbol)
        .order('created_at', { ascending: true });

    if (error) {
        console.error(error);
        return [];
    }

    return data;
}

export async function getAllTransactions(chatId) {
    const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('chat_id', chatId)
        // .eq('symbol', symbol)
        .order('created_at', { ascending: true });

    if (error) {
        console.error(error);
        return [];
    }

    return data;
}

// lấy dữ liệu
export async function getPosition(chatId, symbol) {
    const { data } = await supabase
        .from('portfolio')
        .select('*')
        .eq('chat_id', chatId)
        .eq('symbol', symbol)
        .single();

    return data;
}

