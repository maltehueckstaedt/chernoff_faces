window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  let mouse = { x: width / 2, y: height / 2 };
  const particles = [];
  const totalParticles = 100;

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = 0;
      this.vy = 0;
      this.speed = 1 + Math.random() * 1;
    }

    update() {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.hypot(dx, dy);

      // kleine chaotische Störung
      this.vx += (Math.random() - 0.5) * 0.5;
      this.vy += (Math.random() - 0.5) * 0.5;

      // Anziehung zur Maus
      if (dist > 10) {
        this.vx += dx / dist * 0.05;
        this.vy += dy / dist * 0.05;
      }

      // Begrenze Geschwindigkeit
      this.vx *= 0.9;
      this.vy *= 0.9;

      this.x += this.vx;
      this.y += this.vy;

      return dist < 25; // "nah genug"
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fill();
    }
  }

  for (let i = 0; i < totalParticles; i++) {
    particles.push(new Particle());
  }

  function updateMousePosition(e) {
    if (e.touches) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    } else {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }
  }

  window.addEventListener("mousemove", updateMousePosition);
  window.addEventListener("touchmove", updateMousePosition, { passive: false });

  let flackernd = false;
  let flackerTimer = 0;

  function flackernUndWeiter() {
    const interval = setInterval(() => {
      document.body.style.backgroundColor =
        document.body.style.backgroundColor === "black" ? "white" : "black";
      flackerTimer++;
      if (flackerTimer > 10) {
        clearInterval(interval);
        window.location.href = "zweite_seite.html";
      }
    }, 100);
  }

  function animate() {
    if (!flackernd) {
      ctx.clearRect(0, 0, width, height);
      let allReached = true;
      for (let p of particles) {
        const reached = p.update();
        if (!reached) allReached = false;
        p.draw();
      }
      if (allReached) {
        flackernd = true;
        flackernUndWeiter();
      } else {
        requestAnimationFrame(animate);
      }
    }
  }

  animate();
});
