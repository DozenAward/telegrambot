import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);



// thêm giao dịch
export async function addTransaction(chatId,username, symbol, price, qty, fee ,add_fee, date_time, type = 'BUY') {
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

