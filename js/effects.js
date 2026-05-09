/**
 * Milestone fireworks, vibration, and visual celebration effects.
 */
class EffectsEngine {
  constructor(particleSystem) {
    this.ps = particleSystem;
    this._milestones = new Set();
    this._vibrationSupported = 'vibrate' in navigator;
    this._popupTimer = null;
    this._generateMilestones();
  }

  _generateMilestones() {
    // Checkpoints at powers of 10 and nice round numbers
    const bases = [1, 5, 10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000, 5000000, 10000000];
    for (const b of bases) this._milestones.add(b);
  }

  /** Check if we've crossed any milestone since last check */
  check(currentValue, lastCheckedValue = 0) {
    const triggered = [];
    for (const m of this._milestones) {
      if (currentValue >= m && lastCheckedValue < m) {
        triggered.push(m);
      }
    }
    if (triggered.length > 0) {
      // Fire the largest milestone crossed
      const largest = Math.max(...triggered);
      this._fireMilestone(largest);
    }
    return triggered;
  }

  _fireMilestone(amount) {
    // Burst particles from center of screen
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.4;
    this.ps.burst(cx, cy, amount >= 10000 ? 120 : 60);

    // Show popup
    this._showPopup(amount);

    // Haptic feedback
    this._vibrate(amount);
  }

  _showPopup(amount) {
    const popup = document.getElementById('milestone-popup');
    const title = document.getElementById('milestone-title');
    const amountEl = document.getElementById('milestone-amount');

    if (!popup || !title || !amountEl) return;

    const texts = this._getMilestoneText(amount);
    title.textContent = texts.title;
    amountEl.textContent = texts.amount;

    popup.classList.remove('hidden');

    if (this._popupTimer) clearTimeout(this._popupTimer);
    this._popupTimer = setTimeout(() => {
      popup.classList.add('hidden');
    }, 2500);
  }

  _getMilestoneText(amount) {
    if (amount >= 10000000) return { title: '🏆 财富自由！', amount: '¥' + (amount / 10000).toFixed(0) + '万' };
    if (amount >= 1000000) return { title: '💰 百万富翁！', amount: '¥' + (amount / 10000).toFixed(0) + '万' };
    if (amount >= 100000) return { title: '🚀 六位数达成！', amount: '¥' + (amount / 10000).toFixed(1) + '万' };
    if (amount >= 50000) return { title: '💎 半辆小车到手', amount: '¥' + (amount / 10000).toFixed(1) + '万' };
    if (amount >= 10000) return { title: '🎉 第一个万元户！', amount: '¥' + amount.toLocaleString() };
    if (amount >= 5000) return { title: '🌟 半月工资到账', amount: '¥' + amount.toLocaleString() };
    if (amount >= 1000) return { title: '✨ 四位数突破', amount: '¥' + amount.toLocaleString() };
    if (amount >= 500) return { title: '🔔 小目标达成', amount: '¥' + amount.toLocaleString() };
    if (amount >= 100) return { title: '💡 第一桶金碎片', amount: '¥' + amount.toLocaleString() };
    if (amount >= 10) return { title: '🌱 种子正在发芽', amount: '¥' + amount };
    return { title: '🚀 起航！', amount: '¥' + amount };
  }

  _vibrate(amount) {
    if (!this._vibrationSupported) return;
    try {
      if (amount >= 100000) navigator.vibrate([50, 30, 50, 30, 100]);
      else if (amount >= 10000) navigator.vibrate([30, 20, 60]);
      else if (amount >= 1000) navigator.vibrate([20, 15, 40]);
      else if (amount >= 100) navigator.vibrate([15, 10, 25]);
      else navigator.vibrate(10);
    } catch (_) { /* vibration not available */ }
  }

  /** Check if today is a new day compared to last open */
  static checkDaily() {
    const today = new Date().toDateString();
    const last = localStorage.getItem('tim_lastOpenDate');
    if (last !== today) {
      localStorage.setItem('tim_lastOpenDate', today);
      return true;
    }
    return false;
  }

  /** Get today's earnings estimate */
  static getTodayEarnings(secondRate) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const secondsToday = (now - startOfDay) / 1000;
    return secondRate * Math.min(secondsToday, 86400);
  }
}
