import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// thêm giao dịch
export async function addTransaction(chatId, symbol, price, qty, type = 'BUY') {
    console.log('ENV:', process.env.SUPABASE_URL);

    const { data, error } = await supabase
        .from('portfolio')
        .insert([
            {
                chat_id: chatId,
                symbol,
                price,
                quantity: qty,
                type
            }
        ]);

    console.log('DB RESULT:', data);
    console.log('DB ERROR:', error);

    return { data, error };
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

