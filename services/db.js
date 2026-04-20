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

// cập nhật giao dịch
export async function updateTransaction(id, chatId, payload) {
    const updateData = {};

    if (payload.symbol !== undefined) updateData.symbol = payload.symbol;
    if (payload.price !== undefined) updateData.price = payload.price;
    if (payload.qty !== undefined) updateData.quantity = payload.qty;
    if (payload.fee !== undefined) updateData.fee = payload.fee;
    if (payload.add_fee !== undefined) updateData.addition_fee = payload.add_fee;
    if (payload.date_time !== undefined) updateData.transaction_date = payload.date_time;
    if (payload.type !== undefined) updateData.type = payload.type;

    console.log("id ",id)
    const { data, error } = await supabase
        .from('portfolio')
        .update(updateData)
        .eq('id', Number(id))
        .eq('chat_id', chatId) // 🔥 thêm lại cái này
        .select()
        // .single()
        ;

    if (error) {
        console.error('❌ DB ERROR:', error);
        throw new Error(`DB update failed: ${error.message}`);
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
export async function getTransactionById(chatId, id) {
    const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('chat_id', chatId)
        .eq('id', id)
        .order('created_at', { ascending: true });

    if (error) {
        console.error(error);
        return [];
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

export async function getAllTransactions(chatId, symbol) {
    let query = supabase
        .from('portfolio')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

    if (symbol) {
        query = query.eq('symbol', symbol.toUpperCase());
    }
    const { data, error } = await query;

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

