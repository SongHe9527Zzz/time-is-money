/**
 * Poster generation via html2canvas and Web Share API.
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
      // Populate poster data
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

      if (qrImg) {
        const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data='
          + encodeURIComponent(window.location.href);
        qrImg.src = qrUrl;
      }

      ShareEngine.drawPosterBg();

      poster.style.top = '0';
      poster.style.left = '0';
      poster.style.zIndex = '100';

      if (qrImg && qrImg.src) {
        await new Promise((resolve) => {
          if (qrImg.complete) { resolve(); return; }
          qrImg.onload = resolve;
          qrImg.onerror = resolve;
          setTimeout(resolve, 3000);
        });
      }
      await new Promise(r => setTimeout(r, 200));

      const canvas = await html2canvas(poster, {
        backgroundColor: '#060606',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'time-is-money.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Time is Money - 我的时间价值',
          text: '我的时间价值 ¥' + secondRate.toFixed(4) + '/秒，你也来测测？',
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'Time is Money - 我的时间价值',
          text: '我的时间价值 ¥' + secondRate.toFixed(4) + '/秒，你也来测测？',
          url: window.location.href,
        });
      } else {
        const link = document.createElement('a');
        link.download = 'time-is-money.png';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        ShareEngine.showToast('分享失败，请重试');
      }
    }

    poster.style.top = '-9999px';
    poster.style.left = '-9999px';
    poster.style.zIndex = '';
  }

  static drawPosterBg() {
    const canvas = document.getElementById('poster-canvas-bg');
    if (!canvas) return;
    canvas.width = 375;
    canvas.height = 667;
    const ctx = canvas.getContext('2d');

    const topGrad = ctx.createRadialGradient(187, 120, 10, 187, 120, 350);
    topGrad.addColorStop(0, 'rgba(212, 175, 55, 0.06)');
    topGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, 375, 667);

    const botGrad = ctx.createRadialGradient(187, 580, 10, 187, 580, 250);
    botGrad.addColorStop(0, 'rgba(212, 175, 55, 0.04)');
    botGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, 0, 375, 667);

    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 375;
      const y = Math.random() * 667;
      const r = Math.random() * 1.2 + 0.3;
      const alpha = Math.random() * 0.25 + 0.05;
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
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(function () { toast.classList.add('hidden'); }, 2000);
  }
}
