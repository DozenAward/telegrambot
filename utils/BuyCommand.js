export class BuyCommand {
    constructor(options) {
        this.symbol = options.s?.toUpperCase();
        this.quantity = Number(options.m);
        this.price = Number(options.p);
        this.time = options.t || new Date().toISOString();
        this.fee = Number(options.fee || 0);
        this.af = Number(options.af || 0);
        // ✅ thêm type
        this.type = (options.type || 'BUY').toUpperCase();
    }

    validate() {
        if (!this.symbol) {
            throw new Error('Thiếu mã cổ phiếu (-s)');
        } else if (!this.price) {
            throw new Error('Thiếu giá mua cổ phiếu (-p)');
        } else if (!this.quantity) {
            throw new Error('Thiếu khối lượng mua cổ phiếu (-m)');
        } if (!['BUY', 'SELL'].includes(this.type)) {
            throw new Error('Type không hợp lệ (BUY | SELL)');
        }
    }
}