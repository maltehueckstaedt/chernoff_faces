const canvas = document.querySelector('.dust-crosses');
const ctx = canvas.getContext('2d');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const PARTICLE_COUNT = 35;
const CROSS_SIZE = 7;
const CROSS_OPACITY = 0.86;
const AVOIDANCE_PADDING = 26;
const AVOIDANCE_FORCE = 0.035;
const MOUSE_AVOIDANCE_RADIUS = 120;
const MOUSE_AVOIDANCE_FORCE = 0.18;
const NEIGHBOR_RADIUS = 72;
const SEPARATION_RADIUS = 34;
const SEPARATION_FORCE = 0.075;
const MIN_START_DISTANCE = 38;
const ALIGNMENT_FORCE = 0.012;
const COHESION_FORCE = 0.0008;
const CLUSTER_LIMIT = 5;
const CLUSTER_FORCE = 0.018;
const WANDER_FORCE = 0.012;
const MIN_SPEED = 0.18;
const MAX_SPEED = 0.95;
const OBSTACLE_SELECTOR = 'a, button, .projects-box, .logo-kap, .poch-emblem';

let particles = [];
let animationFrame = null;
let obstacles = [];
let mouse = { x: 0, y: 0, active: false };

function getParticleCount() {
  return PARTICLE_COUNT;
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;

  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function updateObstacles() {
  obstacles = Array.from(document.querySelectorAll(OBSTACLE_SELECTOR)).map((element) => {
    const rect = element.getBoundingClientRect();

    return {
      left: rect.left - AVOIDANCE_PADDING,
      right: rect.right + AVOIDANCE_PADDING,
      top: rect.top - AVOIDANCE_PADDING,
      bottom: rect.bottom + AVOIDANCE_PADDING,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
    };
  });
}

function isInsideObstacle(x, y) {
  return obstacles.some((obstacle) => (
    x > obstacle.left &&
    x < obstacle.right &&
    y > obstacle.top &&
    y < obstacle.bottom
  ));
}

function isTooCloseToParticle(x, y) {
  return particles.some((particle) => (
    Math.hypot(particle.x - x, particle.y - y) < MIN_START_DISTANCE
  ));
}

function createParticle(randomY = true) {
  let x = Math.random() * window.innerWidth;
  let y = randomY ? Math.random() * window.innerHeight : window.innerHeight + CROSS_SIZE;

  for (
    let attempt = 0;
    attempt < 80 && (isInsideObstacle(x, y) || isTooCloseToParticle(x, y));
    attempt += 1
  ) {
    x = Math.random() * window.innerWidth;
    y = randomY ? Math.random() * window.innerHeight : window.innerHeight + CROSS_SIZE;
  }

  return {
    x,
    y,
    size: CROSS_SIZE,
    speedX: -0.35 + Math.random() * 0.7,
    speedY: -0.45 + Math.random() * 0.35,
    rotation: Math.random() * Math.PI,
    spin: -0.012 + Math.random() * 0.024,
    opacity: CROSS_OPACITY,
  };
}

function seedParticles() {
  particles = [];

  for (let i = 0; i < getParticleCount(); i += 1) {
    particles.push(createParticle());
  }
}

function drawCross(particle) {
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.rotation);
  ctx.globalAlpha = particle.opacity;
  ctx.strokeStyle = '#111';
  ctx.lineWidth = Math.max(0.8, particle.size * 0.14);
  ctx.lineCap = 'round';

  const half = particle.size / 2;
  ctx.beginPath();
  ctx.moveTo(-half, -half);
  ctx.lineTo(half, half);
  ctx.moveTo(half, -half);
  ctx.lineTo(-half, half);
  ctx.stroke();
  ctx.restore();
}

function limitSpeed(particle) {
  const speed = Math.hypot(particle.speedX, particle.speedY);

  if (speed > MAX_SPEED) {
    particle.speedX = (particle.speedX / speed) * MAX_SPEED;
    particle.speedY = (particle.speedY / speed) * MAX_SPEED;
  }

  if (speed > 0 && speed < MIN_SPEED) {
    particle.speedX = (particle.speedX / speed) * MIN_SPEED;
    particle.speedY = (particle.speedY / speed) * MIN_SPEED;
  }
}

function steerAwayFromMouse(particle) {
  if (!mouse.active) {
    return;
  }

  const dx = particle.x - mouse.x;
  const dy = particle.y - mouse.y;
  const distance = Math.hypot(dx, dy);

  if (distance === 0 || distance > MOUSE_AVOIDANCE_RADIUS) {
    return;
  }

  const strength = (1 - distance / MOUSE_AVOIDANCE_RADIUS) * MOUSE_AVOIDANCE_FORCE;
  particle.speedX += (dx / distance) * strength;
  particle.speedY += (dy / distance) * strength;
}

function steerLikeSwarm(particle, index) {
  let neighbors = 0;
  let closeNeighbors = 0;
  let averageSpeedX = 0;
  let averageSpeedY = 0;
  let averageX = 0;
  let averageY = 0;
  let separationX = 0;
  let separationY = 0;

  for (let i = 0; i < particles.length; i += 1) {
    if (i === index) {
      continue;
    }

    const other = particles[i];
    const dx = other.x - particle.x;
    const dy = other.y - particle.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0 || distance > NEIGHBOR_RADIUS) {
      continue;
    }

    neighbors += 1;
    averageSpeedX += other.speedX;
    averageSpeedY += other.speedY;
    averageX += other.x;
    averageY += other.y;

    if (distance < SEPARATION_RADIUS) {
      closeNeighbors += 1;
      separationX -= dx / distance;
      separationY -= dy / distance;
    }
  }

  if (neighbors === 0) {
    return;
  }

  averageSpeedX /= neighbors;
  averageSpeedY /= neighbors;
  averageX /= neighbors;
  averageY /= neighbors;

  particle.speedX += (averageSpeedX - particle.speedX) * ALIGNMENT_FORCE;
  particle.speedY += (averageSpeedY - particle.speedY) * ALIGNMENT_FORCE;
  particle.speedX += (averageX - particle.x) * COHESION_FORCE;
  particle.speedY += (averageY - particle.y) * COHESION_FORCE;
  particle.speedX += separationX * SEPARATION_FORCE;
  particle.speedY += separationY * SEPARATION_FORCE;

  if (closeNeighbors > CLUSTER_LIMIT) {
    const pressure = (closeNeighbors - CLUSTER_LIMIT) * CLUSTER_FORCE;
    particle.speedX += separationX * pressure;
    particle.speedY += separationY * pressure;
  }
}

function steerAroundObstacles(particle) {
  for (const obstacle of obstacles) {
    if (
      particle.x < obstacle.left ||
      particle.x > obstacle.right ||
      particle.y < obstacle.top ||
      particle.y > obstacle.bottom
    ) {
      continue;
    }

    const dx = particle.x - obstacle.centerX || 1;
    const dy = particle.y - obstacle.centerY || 1;
    const distance = Math.hypot(dx, dy) || 1;
    const push = AVOIDANCE_FORCE * (1 + (AVOIDANCE_PADDING / distance));

    particle.x += (dx / distance) * push * AVOIDANCE_PADDING;
    particle.y += (dy / distance) * push * AVOIDANCE_PADDING;
    particle.speedX += (dx / distance) * AVOIDANCE_FORCE;
    particle.speedY += (dy / distance) * AVOIDANCE_FORCE;
  }
}

function animate() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = 0; i < particles.length; i += 1) {
    const particle = particles[i];

    steerLikeSwarm(particle, i);
    steerAwayFromMouse(particle);
    steerAroundObstacles(particle);

    particle.speedX += -WANDER_FORCE + Math.random() * WANDER_FORCE * 2;
    particle.speedY += -0.003 + Math.random() * WANDER_FORCE;
    limitSpeed(particle);

    particle.x += particle.speedX;
    particle.y += particle.speedY;
    particle.rotation += particle.spin;

    if (
      particle.y < -particle.size ||
      particle.y > window.innerHeight + particle.size ||
      particle.x < -particle.size ||
      particle.x > window.innerWidth + particle.size
    ) {
      Object.assign(particle, createParticle(particle.y > window.innerHeight));
    }

    drawCross(particle);
  }

  animationFrame = requestAnimationFrame(animate);
}

function start() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  resizeCanvas();
  updateObstacles();
  seedParticles();

  if (prefersReducedMotion.matches) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach(drawCross);
    return;
  }

  animate();
}

window.addEventListener('resize', start);
window.addEventListener('mousemove', (event) => {
  mouse = { x: event.clientX, y: event.clientY, active: true };
});
window.addEventListener('mouseleave', () => {
  mouse.active = false;
});
prefersReducedMotion.addEventListener('change', start);

start();
