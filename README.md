<h1 align="center">
  <img src="https://raw.githubusercontent.com/SongHe9527Zzz/time-is-money/main/favicon.ico" width="32" style="display:none">
  ⏳ Time is Money
</h1>

<p align="center">
  <strong>你的时间，每秒都在印钞。</strong><br>
  输入月薪 → 全屏横屏 → 看着你的身价每秒暴涨。
</p>

<p align="center">
  <img src="https://img.shields.io/badge/炫酷-黑金赛博朋克-black?style=flat-square" alt="style">
  <img src="https://img.shields.io/badge/裂变-朋友圈刷屏-gold?style=flat-square" alt="viral">
  <img src="https://img.shields.io/badge/纯静态-零依赖-darkgreen?style=flat-square" alt="static">
  <a href="https://songhe9527zzz.github.io/time-is-money/"><img src="https://img.shields.io/badge/🚀-立即体验-gold?style=flat-square" alt="demo"></a>
</p>

---

## 🎯 这是什么

你有没有想过——**你摸鱼的每一秒钟，其实都在亏钱？**

打开 Time is Money，输入月薪，手机自动横屏进入全屏沉浸模式。巨大的金色数字在你眼前每秒跳动，配合粒子特效、阶梯震动、里程碑烟花，给你一种"我的时间真的很值钱"的强烈心理暗示。

> "看着数字每秒都在涨，突然觉得加班也没那么难受了。" —— 某用户

---

## 🔥 为什么别人会转发

| 功能 | 心理机制 |
|---|---|
| **每秒跳动的巨大金色数字** | 多巴胺即时反馈，像看股票涨了一样爽 |
| **实物换算 "已赚到 37.5 杯星巴克"** | 抽象数字变具体欲望，截图晒朋友圈 |
| **里程碑烟花 + 手机震动** | 达成 100/1000/10000 时全屏炸裂，忍不住看下一次 |
| **长按偷看年薪投影** | "偷偷看看自己年薪多少" —— 心理快感 |
| **一键生成炫酷海报**（带二维码） | 朋友圈/微博社交货币，别人扫码你也来测 |
| **每日打卡 "今天已赚 ¥XXX"** | 日活钩子，明天还想来 |

---

## 🚀 极速体验

扫码或点击：

<p align="center">
  <a href="https://songhe9527zzz.github.io/time-is-money/">
    <strong>👉 songhe9527zzz.github.io/time-is-money 👈</strong>
  </a>
</p>

用手机打开，点击"开始搞钱"，手机自动横屏全屏。建议**加到主屏幕**获得原生 App 体验。

---

## ⚡ 技术栈

纯 HTML + CSS + 原生 JS，**不依赖任何框架**。

```
time-is-money/
├── index.html        # PWA 入口，全屏沉浸
├── css/style.css     # 黑金主题，横屏布局，动效系统
├── js/
│   ├── app.js        # 主控 + 全屏 API + 交互
│   ├── ticker.js     # rAF 无漂移计时引擎
│   ├── particles.js  # Canvas 金色粒子系统
│   ├── effects.js    # 里程碑烟花 + 震动反馈
│   ├── share.js      # html2canvas 海报生成 + 二维码
│   └── convert.js    # 20 种实物换算引擎
├── manifest.json     # PWA 添加到桌面
└── sw.js             # Service Worker 离线缓存
```

| 能力 | 实现 |
|---|---|
| 计时 | `requestAnimationFrame` + `performance.now()` 无漂移 |
| 粒子 | Canvas 2D，60fps 金色粒子流 + 爆破效果 |
| 海报 | html2canvas 渲染 + QR Server 动态二维码 |
| 全屏 | Fullscreen API + Screen Orientation lock('landscape') |
| 震动 | Navigator.vibrate() 阶梯强度 |
| PWA | manifest + service worker 离线可用 |

---

## 🛠 自己部署

```bash
# 1. 克隆
git clone https://github.com/SongHe9527Zzz/time-is-money.git
cd time-is-money

# 2. 本地预览
python3 -m http.server 8080
# 打开 http://localhost:8080

# 3. 部署到 GitHub Pages
gh repo create time-is-money --public --source=. --push
gh api repos/你的用户名/time-is-money/pages -X POST -f "source[branch]=main"
```

---

## 🤝 欢迎贡献

如果你有更炫的粒子效果、更骚的文案、更好玩的换算物品，欢迎 PR。

也欢迎 Fork 之后改数值玩梗——比如把换算物品改成"奶茶""Switch""爱马仕"。

---

<p align="center">
  <sub>Made with 🤑 by <a href="https://github.com/SongHe9527Zzz">SongHe9527Zzz</a></sub>
</p>
