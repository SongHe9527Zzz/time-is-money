/**
 * App orchestrator — wires screens, ticker, particles, effects, share.
 */
(function () {
  'use strict';

  // ---- DOM refs ----
  const $ = (sel) => document.querySelector(sel);
  const inputScreen = $('#input-screen');
  const mainScreen = $('#main-screen');
  const salaryInput = $('#salary-input');
  const startBtn = $('#start-btn');
  const moneyInteger = $('#money-integer');
  const moneyDecimal = $('#money-decimal');
  const hourlyRateEl = $('#hourly-rate');
  const minuteRateEl = $('#minute-rate');
  const secondRateEl = $('#second-rate');
  const tickerText = $('#ticker-text');
  const conversionTicker = $('#conversion-ticker');
  const milestonePopup = $('#milestone-popup');
  const longpressOverlay = $('#longpress-overlay');
  const annualProjection = $('#annual-projection');
  const bottomControls = $('#bottom-controls');
  const dailyCard = $('#daily-card');
  const dailyAmount = $('#daily-amount');
  const particlesCanvas = $('#particles-canvas');

  // ---- State ----
  let ticker = null;
  let particles = null;
  let effects = null;
  let lastMoneyValue = 0;
  let tickerIndex = 0;
  let tickerTimer = null;
  let controlsTimer = null;
  let longPressTimer = null;

  // ---- Init ----
  function init() {
    particles = new ParticleSystem(particlesCanvas);
    particles.start();
    effects = new EffectsEngine(particles);

    // Check for saved state
    const saved = loadState();
    if (saved) {
      inputScreen.classList.add('hidden');
      ticker = new MoneyTicker(saved.monthlySalary);
      ticker.restore(saved.monthlySalary, saved.accumulated);
      showMainScreen();
      startTicking();
      requestFullscreen();
      // Show daily card if it's a new day
      if (EffectsEngine.checkDaily()) {
        showDailyCard();
      }
    }

    bindEvents();
    setupFullscreenExitWatch();
    // Enable start button if input has value
    updateStartButton();
  }

  // ---- Persistence ----
  function loadState() {
    try {
      const raw = localStorage.getItem('tim_state');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) { return null; }
  }

  function saveState() {
    if (!ticker) return;
    try {
      localStorage.setItem('tim_state', JSON.stringify({
        monthlySalary: ticker.monthlySalary,
        accumulated: ticker.getValue(),
      }));
    } catch (_) { /* quota exceeded, silently ignore */ }
  }

  // Save state before page unload
  window.addEventListener('beforeunload', () => saveState());
  // Also save periodically
  setInterval(() => saveState(), 5000);

  // ---- Events ----
  function bindEvents() {
    // Input
    salaryInput.addEventListener('input', updateStartButton);
    salaryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && salaryInput.value && parseInt(salaryInput.value) > 0) {
        startApp();
      }
    });

    // Quick buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const salary = parseInt(btn.dataset.salary);
        salaryInput.value = salary;
        updateStartButton();
        // Highlight selected
        document.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });

    // Start button
    startBtn.addEventListener('click', startApp);

    // Main screen: tap to toggle controls
    mainScreen.addEventListener('click', (e) => {
      // Don't toggle if clicking a button or overlay
      if (e.target.closest('button') || e.target.closest('.daily-card') ||
          e.target.closest('.milestone-popup') || e.target.closest('.longpress-overlay')) return;
      toggleControls();
    });

    // Share button
    $('#share-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if (ticker) {
        ShareEngine.share(ticker.salaryPerSecond, ticker.monthlySalary, ticker.salaryPerHour);
      }
    });

    // Reset button
    $('#reset-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      resetApp();
    });

    // Daily share button
    $('#daily-share-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      hideDailyCard();
      if (ticker) {
        ShareEngine.share(ticker.salaryPerSecond, ticker.monthlySalary, ticker.salaryPerHour);
      }
    });

    // Daily close button
    $('#daily-close-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      hideDailyCard();
    });

    // Long press for annual projection
    mainScreen.addEventListener('touchstart', handleTouchStart, { passive: false });
    mainScreen.addEventListener('touchend', handleTouchEnd);
    mainScreen.addEventListener('touchmove', handleTouchMove);
    // Mouse fallback for desktop
    mainScreen.addEventListener('mousedown', handleTouchStart);
    mainScreen.addEventListener('mouseup', handleTouchEnd);
    mainScreen.addEventListener('mouseleave', handleTouchEnd);
  }

  function updateStartButton() {
    const val = salaryInput.value && parseInt(salaryInput.value);
    if (val > 0) {
      startBtn.disabled = false;
      startBtn.textContent = '开始搞钱';
    } else {
      startBtn.disabled = true;
      startBtn.textContent = '输入月薪，开始搞钱';
    }
  }

  // ---- Fullscreen ----
  function requestFullscreen() {
    const el = document.documentElement;
    const fn = el.requestFullscreen || el.webkitRequestFullscreen;
    if (fn) {
      fn.call(el).catch(() => {});
    }
  }

  function lockLandscape() {
    try {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      } else if (screen.lockOrientation) {
        screen.lockOrientation('landscape');
      }
    } catch (_) {}
  }

  let sharePromptEl = null;

  // Show prominent share button when exiting fullscreen
  function setupFullscreenExitWatch() {
    const onFsChange = () => {
      const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isFullscreen && ticker) {
        showSharePrompt();
      } else {
        hideSharePrompt();
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
  }

  function showSharePrompt() {
    if (sharePromptEl) return;
    sharePromptEl = document.createElement('div');
    sharePromptEl.className = 'share-prompt';
    sharePromptEl.innerHTML = `
      <div class="share-prompt-bg"></div>
      <div class="share-prompt-card">
        <div class="share-prompt-icon">📸</div>
        <div class="share-prompt-title">生成你的身价海报</div>
        <div class="share-prompt-sub">带二维码，分享到朋友圈</div>
        <button class="share-prompt-btn" id="share-prompt-btn">立即生成</button>
        <button class="share-prompt-close" id="share-prompt-close">稍后再说</button>
      </div>
    `;
    mainScreen.appendChild(sharePromptEl);

    sharePromptEl.querySelector('#share-prompt-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      hideSharePrompt();
      if (ticker) {
        ShareEngine.share(ticker.salaryPerSecond, ticker.monthlySalary, ticker.salaryPerHour);
      }
    });
    sharePromptEl.querySelector('#share-prompt-close').addEventListener('click', (e) => {
      e.stopPropagation();
      hideSharePrompt();
    });

    try { navigator.vibrate([10, 50, 10]); } catch (_) {}
  }

  function hideSharePrompt() {
    if (sharePromptEl) {
      sharePromptEl.remove();
      sharePromptEl = null;
    }
  }

  // Show fullscreen hint for browsers that support it
  function showFullscreenHint() {
    if (document.fullscreenElement) return;
    const hint = document.createElement('div');
    hint.className = 'fullscreen-hint';
    hint.textContent = '👆 点击进入沉浸模式';
    hint.addEventListener('click', (e) => {
      e.stopPropagation();
      requestFullscreen();
      hint.classList.add('hidden');
    });
    mainScreen.appendChild(hint);
    setTimeout(() => hint.classList.add('hidden'), 5000);
    const onFsChange = () => {
      if (document.fullscreenElement || document.webkitFullscreenElement) hint.remove();
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
  }

  // ---- Screen transitions ----
  function startApp() {
    const val = parseInt(salaryInput.value);
    if (!val || val <= 0) return;

    // Stop existing ticker to prevent double-counting
    if (ticker) ticker.pause();
    ticker = new MoneyTicker(val);

    // Set rate displays
    hourlyRateEl.textContent = '¥' + ticker.salaryPerHour.toFixed(2);
    minuteRateEl.textContent = '¥' + ticker.salaryPerMinute.toFixed(2);
    secondRateEl.textContent = '¥' + ticker.salaryPerSecond.toFixed(4);

    // Transition
    inputScreen.classList.add('hidden');
    showMainScreen();
    startTicking();

    // Immediately go fullscreen + landscape
    requestFullscreen();
    lockLandscape();

    // Haptic
    try { navigator.vibrate(15); } catch (_) {}

    saveState();
  }

  function showMainScreen() {
    mainScreen.classList.remove('hidden');
    // Show controls briefly
    showControls();
  }

  function resetApp() {
    ticker.reset();
    localStorage.removeItem('tim_state');
    mainScreen.classList.add('hidden');
    inputScreen.classList.remove('hidden');
    salaryInput.value = '';
    updateStartButton();
    document.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('selected'));
    hideControls();
    hideDailyCard();
    hideLongPress();
  }

  // ---- Ticking ----
  function startTicking() {
    ticker.start();

    // Show first conversion immediately
    updateTicker(0.01);
    lastMoneyValue = 0;

    ticker.onTick((value) => {
      // Update display
      const formatted = formatMoney(value);
      const prevInteger = moneyInteger.textContent;

      moneyInteger.textContent = formatted.integer;

      // Pulse animation on integer change
      if (prevInteger !== formatted.integer && prevInteger !== '0') {
        moneyInteger.classList.remove('pulse');
        void moneyInteger.offsetWidth; // reflow
        moneyInteger.classList.add('pulse');
      }

      moneyDecimal.textContent = formatted.decimal;

      // Update ticker periodically (every 3s) — trigger first update immediately
      const tickerDelta = value - lastMoneyValue;
      if (tickerDelta >= ticker.salaryPerSecond * 3) {
        updateTicker(value);
        lastMoneyValue = value;
      }

      // Check milestones (use previous update point as baseline)
      if (effects && lastMoneyValue > 0) {
        effects.check(Math.floor(value), Math.floor(lastMoneyValue));
      }
    });

    ticker.onIntegerChange((intVal) => {
      // Subtle haptic on each integer change for "feel"
      if (intVal % 10 === 0 || intVal % 100 === 0) {
        try { navigator.vibrate(3); } catch (_) {}
      }
    });
  }

  function updateTicker(value) {
    if (!tickerText || !conversionTicker) return;
    tickerText.classList.add('fade');
    setTimeout(() => {
      tickerText.textContent = ConvertEngine.formatRandom(value);
      tickerText.classList.remove('fade');
    }, 400);
  }

  // ---- Money formatting ----
  function formatMoney(value) {
    const fixed = value.toFixed(2);
    const parts = fixed.split('.');
    const integer = parseInt(parts[0]).toLocaleString();
    const decimal = '.' + parts[1];
    return { integer, decimal };
  }

  // ---- Controls ----
  function showControls() {
    bottomControls.classList.add('visible');
    if (controlsTimer) clearTimeout(controlsTimer);
    controlsTimer = setTimeout(hideControls, 4000);
  }

  function hideControls() {
    bottomControls.classList.remove('visible');
  }

  function toggleControls() {
    if (bottomControls.classList.contains('visible')) {
      hideControls();
    } else {
      showControls();
      // Small haptic
      try { navigator.vibrate(5); } catch (_) {}
    }
  }

  // ---- Long Press ----
  function handleTouchStart(e) {
    // Prevent long press on buttons
    if (e.target.closest('button') || e.target.closest('.daily-card') ||
        e.target.closest('.milestone-popup')) return;

    if (e.type === 'touchstart') e.preventDefault(); // prevent text selection

    longPressTimer = setTimeout(() => {
      showLongPress();
    }, 500);
  }

  function handleTouchEnd() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    hideLongPress();
  }

  function handleTouchMove() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    hideLongPress();
  }

  function showLongPress() {
    if (!ticker) return;
    const annual = ticker.salaryPerYear;
    annualProjection.textContent = '¥' + annual.toLocaleString();
    longpressOverlay.classList.remove('hidden');
    try { navigator.vibrate(10); } catch (_) {}
  }

  function hideLongPress() {
    longpressOverlay.classList.add('hidden');
  }

  // ---- Daily Card ----
  function showDailyCard() {
    if (!ticker || !dailyCard || !dailyAmount) return;
    const todayEarnings = EffectsEngine.getTodayEarnings(ticker.salaryPerSecond);
    dailyAmount.textContent = '¥' + todayEarnings.toFixed(2);
    dailyCard.classList.remove('hidden');
  }

  function hideDailyCard() {
    if (dailyCard) dailyCard.classList.add('hidden');
  }

  // ---- Service Worker ----
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // ---- Boot ----
  init();
})();
