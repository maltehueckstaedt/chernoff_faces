window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const cssWidth = 383;
  const cssHeight = 634;
  let width, height;

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.width = cssWidth * dpr;
    height = canvas.height = cssHeight * dpr;
    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  let mouse = { x: cssWidth / 2, y: cssHeight / 2 };
  const particles = [];
  const totalParticles = 10;

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  let soundEnabled = false;
  let mouseAttracted = false;

  function playClick(intensity = 0) {
    const now = audioCtx.currentTime;
    const bufferSize = audioCtx.sampleRate * 0.02;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const gain = audioCtx.createGain();
    const volume = 0.05 + intensity * 0.15;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    noise.connect(gain).connect(audioCtx.destination);
    noise.start(now);
    noise.stop(now + 0.02);
  }

  function playGlitchNoise() {
    const now = audioCtx.currentTime;
    const bufferSize = audioCtx.sampleRate * 0.08;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const noise = Math.random() * 2 - 1;
      const glitch = (i % 200 < 20) ? noise * 0.9 : noise * 0.2;
      data[i] = glitch;
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.15, now);

    source.connect(gain).connect(audioCtx.destination);
    source.start(now);
    source.stop(now + 0.08);
  }

  class Particle {
    constructor() {
      this.x = Math.random() * cssWidth;
      this.y = Math.random() * cssHeight;
      this.vx = 0;
      this.vy = 0;
      this.speed = 1 + Math.random();
      this.ignoresMouse = Math.random() < 0.05;

      const minSizeRatio = 0.01;
      const maxSizeRatio = 0.015;
      const base = Math.min(cssWidth, cssHeight);
      const sizePx = base * (minSizeRatio + Math.random() * (maxSizeRatio - minSizeRatio));
      this.radius = sizePx / 2;
    }

    update() {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (this.ignoresMouse || !mouseAttracted || dist > 300) {
        this.vx += (Math.random() - 0.5) * 0.5;
        this.vy += (Math.random() - 0.5) * 0.5;
      } else {
        this.vx += (Math.random() - 0.5) * 0.3;
        this.vy += (Math.random() - 0.5) * 0.3;

        if (dist > 10) {
          this.vx += dx / dist * 0.05;
          this.vy += dy / dist * 0.05;
        }
      }

      for (let other of particles) {
        if (other === this) continue;
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const d = Math.hypot(dx, dy);
        if (d < this.radius * 3) {
          this.vx += dx / d * 0.05;
          this.vy += dy / d * 0.05;
        }
      }

      this.vx *= 0.92;
      this.vy *= 0.92;

      this.x += this.vx;
      this.y += this.vy;

      const padding = this.radius;
      if (this.x < padding) {
        this.x = padding;
        this.vx *= -0.5;
      }
      if (this.x > cssWidth - padding) {
        this.x = cssWidth - padding;
        this.vx *= -0.5;
      }
      if (this.y < padding) {
        this.y = padding;
        this.vy *= -0.5;
      }
      if (this.y > cssHeight - padding) {
        this.y = cssHeight - padding;
        this.vy *= -0.5;
      }

      return dist < 40;
    }

    draw() {
      const glowRadius = this.radius * 8;
      const flicker = 0.6 + Math.random() * 0.1;

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
      gradient.addColorStop(0.05, `rgba(255, 255, 220, ${flicker})`);
      gradient.addColorStop(0.2, `rgba(200, 255, 140, ${flicker * 0.9})`);
      gradient.addColorStop(0.4, `rgba(170, 255, 85, ${flicker * 0.6})`);
      gradient.addColorStop(0.6, `rgba(100, 200, 50, ${flicker * 0.4})`);
      gradient.addColorStop(1.0, `rgba(0, 40, 0, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < totalParticles; i++) {
    particles.push(new Particle());
  }

  function updateMousePosition(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
    } else {
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
  }

  canvas.addEventListener("mousemove", updateMousePosition);
  canvas.addEventListener("touchmove", updateMousePosition, { passive: false });

  let flackernd = false;
  let flackerTimer = 0;

  function flackernUndWeiter() {
    const interval = setInterval(() => {
      const color = flackerTimer % 2 === 0 ? "white" : "black";

      // Clip auf runde Form
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(20, 1);
      ctx.arcTo(cssWidth - 1, 1, cssWidth - 1, cssHeight - 1, 20);
      ctx.arcTo(cssWidth - 1, cssHeight - 1, 1, cssHeight - 1, 20);
      ctx.arcTo(1, cssHeight - 1, 1, 1, 20);
      ctx.arcTo(1, 1, cssWidth - 1, 1, 20);
      ctx.closePath();
      ctx.clip();

      ctx.fillStyle = color;
      ctx.fillRect(0, 0, cssWidth, cssHeight);
      ctx.restore();

      if (soundEnabled) playGlitchNoise();

      flackerTimer++;
      if (flackerTimer > 10) {
        clearInterval(interval);
        window.location.href = "zweite_seite.html";
      }
    }, 100);
  }

  function animate() {
    if (!flackernd) {
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      let reached = 0;
      let activeFlies = 0;

      for (let p of particles) {
        const isNear = p.update();
        if (!p.ignoresMouse) {
          activeFlies++;
          if (mouseAttracted && isNear) reached++;
        }
        p.draw();
      }

      if (soundEnabled) {
        const chance = reached > 0 ? Math.max(0.1, reached / totalParticles) : 0;
        if (Math.random() < chance) {
          playClick(chance);
        }
      }

      if (mouseAttracted && reached >= activeFlies * 0.9) {
        flackernd = true;
        flackernUndWeiter();
      } else {
        requestAnimationFrame(animate);
      }
    }
  }

  animate();

  const sound_on_button = document.getElementById("sound_on_button");
  sound_on_button.addEventListener("click", () => {
    audioCtx.resume().then(() => {
      soundEnabled = true;
      mouseAttracted = true;
      sound_on_button.style.display = "none";
    });
  });
});
