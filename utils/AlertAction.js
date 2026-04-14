export class AlertAction {
  constructor(options) {
    this.id = options.id;
    this.state = options.state?.toLowerCase(); // on | off | del
  }

  validateAction() {
    if (!this.id) {
      throw new Error('Thiếu ID alert (-id)');
    }

    if (!['on', 'off', 'del'].includes(this.state)) {
      throw new Error('State phải là on | off | del');
    }
  }
}