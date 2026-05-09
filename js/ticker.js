/**
 * Core money calculation engine.
 * Uses requestAnimationFrame + performance.now() for drift-free timing.
 */
class MoneyTicker {
  constructor(monthlySalary, workDays = 22, workHours = 8) {
    this._setRate(monthlySalary, workDays, workHours);
    this._accumulated = 0;
    this._sessionStart = null;
    this._running = false;
    this._lastInteger = -1;
    this._onTick = null;
    this._onIntegerChange = null;
    this._rafId = null;
  }

  _setRate(monthly, days, hours) {
    this.monthlySalary = monthly;
    this.workDays = days;
    this.workHours = hours;
    this.salaryPerSecond = monthly / days / hours / 3600;
    this.salaryPerMinute = this.salaryPerSecond * 60;
    this.salaryPerHour = this.salaryPerSecond * 3600;
    this.salaryPerYear = monthly * 12;
  }

  /** Restore from persisted state */
  restore(monthlySalary, accumulated, workDays = 22, workHours = 8) {
    this._setRate(monthlySalary, workDays, workHours);
    this._accumulated = accumulated || 0;
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._sessionStart = performance.now();
    this._lastInteger = Math.floor(this._accumulated);
    this._loop();
  }

  pause() {
    this._running = false;
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._accumulated = this.getValue();
  }

  _loop() {
    if (!this._running) return;
    const value = this.getValue();
    if (this._onTick) this._onTick(value);

    const intPart = Math.floor(value);
    if (intPart !== this._lastInteger) {
      this._lastInteger = intPart;
      if (this._onIntegerChange) this._onIntegerChange(intPart);
    }

    this._rafId = requestAnimationFrame(() => this._loop());
  }

  /** Current total value including session accumulation */
  getValue() {
    if (!this._running) return this._accumulated;
    const elapsed = (performance.now() - this._sessionStart) / 1000;
    return this._accumulated + this.salaryPerSecond * elapsed;
  }

  /** Reset session but keep rate */
  reset() {
    this.pause();
    this._accumulated = 0;
    this._lastInteger = -1;
  }

  onTick(fn) { this._onTick = fn; }
  onIntegerChange(fn) { this._onIntegerChange = fn; }
}
