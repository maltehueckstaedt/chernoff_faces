window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const cssWidth = 390;
  const cssHeight = 844;
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
  const totalParticles = 100;

  class Particle {
    constructor() {
      this.x = Math.random() * cssWidth;
      this.y = Math.random() * cssHeight;
      this.vx = 0;
      this.vy = 0;
      this.speed = 1 + Math.random();
      this.ignoresMouse = Math.random() < 0.15;

      const minSizeRatio = 0.02;
      const maxSizeRatio = 0.01;
      const base = Math.min(cssWidth, cssHeight);
      const sizePx = base * (minSizeRatio + Math.random() * (maxSizeRatio - minSizeRatio));
      this.radius = sizePx / 2;
    }

    update() {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (this.ignoresMouse && dist > 150) {
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

      this.vx *= 0.92;
      this.vy *= 0.92;

      this.x += this.vx;
      this.y += this.vy;

      // Begrenzung innerhalb des sichtbaren Bereichs
      if (this.x < 0) this.x = cssWidth;
      if (this.x > cssWidth) this.x = 0;
      if (this.y < 0) this.y = cssHeight;
      if (this.y > cssHeight) this.y = 0;

      return dist < 20;
    }

draw() {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
  ctx.shadowBlur = this.radius * 2.5;

  ctx.fill();

  // Wichtig: Zurücksetzen, damit andere Zeichen nicht leuchten
  ctx.shadowBlur = 0;
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
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, cssWidth, cssHeight);
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
          if (isNear) reached++;
        }
        p.draw();
      }

      if (reached >= activeFlies * 0.95) {
        flackernd = true;
        flackernUndWeiter();
      } else {
        requestAnimationFrame(animate);
      }
    }
  }

  animate();
});
