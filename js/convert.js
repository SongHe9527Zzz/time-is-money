/**
 * Real-world item conversion data.
 * All prices in CNY. The conversion engine maps accumulated money
 * to relatable items for the ticker display.
 */
const ITEMS = [
  { name: '杯白开水', price: 0.5, emoji: '💧', unit: '杯' },
  { name: '根棒棒糖', price: 1, emoji: '🍭', unit: '根' },
  { name: '包辣条', price: 3, emoji: '🌶️', unit: '包' },
  { name: '瓶可乐', price: 3.5, emoji: '🥤', unit: '瓶' },
  { name: '个茶叶蛋', price: 2, emoji: '🥚', unit: '个' },
  { name: '杯瑞幸', price: 12, emoji: '☕', unit: '杯' },
  { name: '杯奶茶', price: 18, emoji: '🧋', unit: '杯' },
  { name: '杯星巴克', price: 32, emoji: '☕', unit: '杯' },
  { name: '顿麦当劳', price: 38, emoji: '🍔', unit: '顿' },
  { name: '张电影票', price: 50, emoji: '🎬', unit: '张' },
  { name: '顿海底捞', price: 200, emoji: '🍲', unit: '顿' },
  { name: '支口红', price: 300, emoji: '💄', unit: '支' },
  { name: '双AJ', price: 1200, emoji: '👟', unit: '双' },
  { name: '晚五星酒店', price: 1500, emoji: '🏨', unit: '晚' },
  { name: '台Switch', price: 2000, emoji: '🎮', unit: '台' },
  { name: '台iPhone', price: 8000, emoji: '📱', unit: '台' },
  { name: '张去冰岛的机票', price: 12000, emoji: '✈️', unit: '张' },
  { name: '块劳力士基础款', price: 50000, emoji: '⌚', unit: '块' },
  { name: '辆特斯拉首付', price: 80000, emoji: '🚗', unit: '份' },
  { name: '平米学区房', price: 100000, emoji: '🏠', unit: '平米' },
];

/** Bracket items: only show items whose price is between 0.1x and 10x of current value */
class ConvertEngine {
  static getRelevantItems(currentValue) {
    return ITEMS.filter(
      item => item.price >= currentValue * 0.05 && item.price <= currentValue * 50
    );
  }

  /**
   * Pick a "best" conversion for display.
   * Rotates through items near the current value range.
   */
  static format(currentValue, index = 0) {
    const items = this.getRelevantItems(currentValue);
    if (items.length === 0) {
      // Fallback to USD or BTC if no items match
      const usd = (currentValue / 7.2).toFixed(2);
      return `≈ $${usd} USD`;
    }
    const item = items[index % items.length];
    const count = currentValue / item.price;
    let countStr;
    if (count >= 100) {
      countStr = Math.floor(count).toLocaleString();
    } else if (count >= 10) {
      countStr = count.toFixed(1);
    } else if (count >= 1) {
      countStr = count.toFixed(1);
    } else {
      countStr = count.toFixed(3);
    }
    return `已赚到 ${countStr} ${item.unit}${item.name}`;
  }

  /** Pick a random item for variety in ticker */
  static formatRandom(currentValue) {
    const items = this.getRelevantItems(currentValue);
    if (items.length === 0) {
      const usd = (currentValue / 7.2).toFixed(2);
      return `≈ $${usd} USD`;
    }
    const item = items[Math.floor(Math.random() * items.length)];
    const count = currentValue / item.price;
    let countStr;
    if (count >= 100) countStr = Math.floor(count).toLocaleString();
    else if (count >= 10) countStr = count.toFixed(1);
    else if (count >= 1) countStr = count.toFixed(1);
    else countStr = count.toFixed(3);
    return `已赚到 ${countStr} ${item.unit}${item.name}`;
  }
}
