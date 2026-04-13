export class PLCommand {
  constructor(options) {
    this.symbol = options.s?.toUpperCase();
    this.time = options.t || new Date().toISOString();
    this.fee = Number(options.fee || 0);
    this.af = Number(options.af || 0);
  }

  validate() {
    if (!this.symbol) {
      throw new Error('Thiếu mã cổ phiếu (-s)');
    }
  }
}