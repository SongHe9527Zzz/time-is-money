/**
 * Poster generation via html2canvas.
 * Shows full-screen overlay for long-press save — no system dialogs.
 */
class ShareEngine {
  static async share(secondRate, monthlySalary, hourlyRate) {
    const poster = document.getElementById('share-poster');
    if (!poster) return;

    if (typeof html2canvas === 'undefined') {
      ShareEngine.showToast('正在加载分享组件，请稍后再试');
      return;
    }

    ShareEngine.showToast('正在生成海报...');

    try {
      const rateEl = document.getElementById('poster-rate');
      const hourlyEl = document.getElementById('poster-hourly');
      const dailyEl = document.getElementById('poster-daily');
      const annualEl = document.getElementById('poster-annual');
      const bragRateEl = document.getElementById('poster-brag-rate');
      const qrImg = document.getElementById('poster-qr-img');
      const dailyRate = secondRate * 3600 * 8;
      const annualRate = monthlySalary * 12;

      if (rateEl) rateEl.textContent = '¥' + secondRate.toFixed(4);
      if (hourlyEl) hourlyEl.textContent = '¥' + hourlyRate.toFixed(2);
      if (dailyEl) dailyEl.textContent = '¥' + dailyRate.toFixed(0);
      if (annualEl) annualEl.textContent = '¥' + (annualRate / 10000).toFixed(1) + '万';
      if (bragRateEl) bragRateEl.textContent = '¥' + secondRate.toFixed(4);

      // Preload QR code
      if (qrImg) {
        const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='
          + encodeURIComponent(window.location.href);
        qrImg.src = qrUrl;
      }

      ShareEngine.drawPosterBg();
      poster.style.top = '0';
      poster.style.left = '0';
      poster.style.zIndex = '100';

      // Wait for QR image
      if (qrImg && qrImg.src) {
        await new Promise(function (resolve) {
          if (qrImg.complete) { resolve(); return; }
          qrImg.onload = resolve;
          qrImg.onerror = resolve;
          setTimeout(resolve, 3000);
        });
      }
      await new Promise(function (r) { setTimeout(r, 300); });

      const canvas = await html2canvas(poster, {
        backgroundColor: '#060606',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      poster.style.top = '-9999px';
      poster.style.left = '-9999px';
      poster.style.zIndex = '';

      // Show overlay for long-press save
      ShareEngine.showPosterOverlay(canvas.toDataURL('image/png'));
    } catch (err) {
      ShareEngine.showToast('生成失败，请重试');
      poster.style.top = '-9999px';
      poster.style.left = '-9999px';
      poster.style.zIndex = '';
    }
  }

  static showPosterOverlay(dataUrl) {
    var overlay = document.getElementById('poster-overlay');
    var img = document.getElementById('poster-overlay-img');
    if (!overlay || !img) return;

    img.src = dataUrl;
    overlay.classList.remove('hidden');

    // Close on button click
    var closeBtn = document.getElementById('poster-overlay-close');
    if (closeBtn) {
      closeBtn.onclick = function (e) {
        e.stopPropagation();
        overlay.classList.add('hidden');
      };
    }

    // Close on background tap (but not on image long-press)
    overlay.onclick = function (e) {
      if (e.target === overlay || e.target.classList.contains('poster-overlay-bg')) {
        overlay.classList.add('hidden');
      }
    };

    try { navigator.vibrate(10); } catch (_) {}
  }

  static drawPosterBg() {
    var canvas = document.getElementById('poster-canvas-bg');
    if (!canvas) return;
    canvas.width = 375;
    canvas.height = 667;
    var ctx = canvas.getContext('2d');

    var topGrad = ctx.createRadialGradient(187, 120, 10, 187, 120, 350);
    topGrad.addColorStop(0, 'rgba(212, 175, 55, 0.06)');
    topGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, 375, 667);

    var botGrad = ctx.createRadialGradient(187, 580, 10, 187, 580, 250);
    botGrad.addColorStop(0, 'rgba(212, 175, 55, 0.04)');
    botGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, 0, 375, 667);

    for (var i = 0; i < 40; i++) {
      var x = Math.random() * 375;
      var y = Math.random() * 667;
      var r = Math.random() * 1.2 + 0.3;
      var alpha = Math.random() * 0.25 + 0.05;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(212, 175, 55, ' + alpha + ')';
      ctx.fill();

      if (Math.random() > 0.7) {
        ctx.beginPath();
        ctx.arc(x, y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212, 175, 55, ' + (alpha * 0.3) + ')';
        ctx.fill();
      }
    }

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(28, 28); ctx.lineTo(28, 80); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(28, 28); ctx.lineTo(80, 28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(347, 28); ctx.lineTo(347, 80); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(347, 28); ctx.lineTo(295, 28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(28, 639); ctx.lineTo(28, 587); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(28, 639); ctx.lineTo(80, 639); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(347, 639); ctx.lineTo(347, 587); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(347, 639); ctx.lineTo(295, 639); ctx.stroke();
  }

  static showToast(msg) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(function () { toast.classList.add('hidden'); }, 2000);
  }
}
