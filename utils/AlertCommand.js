export class AlertCommand {
    constructor(options) {
        this.symbol = options.s?.toUpperCase();
        this.price = Number(options.p || options.price);
        this.operator = options.op;
        this.message = options.mess?.trim() || '';
    }

    validate() {
        if (!this.symbol) {
            throw new Error('Thiếu mã cổ phiếu (-s)');
        }

        if (isNaN(this.price)) {
            throw new Error('Giá không hợp lệ (-p)');
        }

        if (!this.operator) {
            throw new Error('Thiếu biểu thức (-op)');
        }

        if (!['>=', '<=', '>', '<'].includes(this.operator)) {
            throw new Error('Biểu thức không hợp lệ (>= | <= | > | <)');
        }
    }
}