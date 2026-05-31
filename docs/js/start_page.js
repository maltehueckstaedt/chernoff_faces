const canvas = document.querySelector('.dust-crosses');
const ctx = canvas.getContext('2d');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const STAR_POINTS = 20;
const STAR_OUTER_RADIUS = 44;
const STAR_INNER_RADIUS = 60;
const STAR_COLOR = '#ff8282';
const STAR_OPACITY = 1;
const TARGET_EASING = 0.035;
const ARRIVAL_DISTANCE = 1.4;
const TARGET_HOLD_MIN = 95;
const TARGET_HOLD_MAX = 170;
const TARGET_OFFSET_X = 18;
const TARGET_OFFSET_Y = -18;
const TOP_BUTTON_OFFSET_X = -18;
const TOP_BUTTON_OFFSET_Y = 30;
const LOWER_LEFT_TARGETS = ['Chernoff Faces', 'Mother', 'Downer'];
const MIN_SPIN = -0.555;
const MAX_SPIN = 0.955;
const SPIN_CHANGE_FORCE = 0.0025;
const TEXT_WORDS = ['Click', 'Here!'];
const TEXT_SWITCH_FRAMES = 86;
const TEXT_MORPH_FRAMES = 28;
const TEXT_COLOR = 'red';
const TEXT_SIZE = 40;
const TEXT_FONT = 'NineSevenTallPixel';
const TEXT_MORPH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!?<>/\\';
const TEXT_WIGGLE_FREQUENCY = 10;
const TEXT_WIGGLE_POSITION = 1.6;
const TEXT_WIGGLE_ROTATION = 0.001;
const TEXT_WIGGLE_SCALE = 0.001;
const BUTTON_SELECTOR = '.oval';
const EXPLAINER_SELECTOR = '.hero-copy-text';
const EXPLAINER_TEXTS = {
  'Chernoff Faces': 'Animated marks, loose projects, and strange little interfaces.',
  Mother: 'Mother gathers current image and sound experiments.',
  Downer: 'Downer points toward slower, darker project material.',
  'LOCAL FIST': 'Local Fist is the rough local signal.',
  Contact: 'For messages, requests, and possible collaborations.',
  Close: 'A small exit sign with no real exit yet.',
};

let animationFrame = null;
let buttonTargets = [];
let explainerText = null;
let star = createStar();

if (document.fonts) {
  document.fonts.load(`${TEXT_SIZE}px ${TEXT_FONT}`);
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;

  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function updateButtonTargets() {
  buttonTargets = Array.from(document.querySelectorAll(BUTTON_SELECTOR)).map((element) => {
    const rect = element.getBoundingClientRect();
    const margin = Math.max(STAR_OUTER_RADIUS, STAR_INNER_RADIUS);
    const label = getButtonLabel(element);
    const useLowerLeft = LOWER_LEFT_TARGETS.includes(label);
    const targetX = useLowerLeft ? rect.left + TOP_BUTTON_OFFSET_X : rect.right + TARGET_OFFSET_X;
    const targetY = useLowerLeft ? rect.bottom + TOP_BUTTON_OFFSET_Y : rect.top + TARGET_OFFSET_Y;

    return {
      x: clamp(targetX, margin, window.innerWidth - margin),
      y: clamp(targetY, margin, window.innerHeight - margin),
      label,
    };
  });
}

function getButtonLabel(element) {
  const text = element.textContent.replace(/\s+/g, ' ').trim();
  return text === '×' ? 'Close' : text;
}

function createStar() {
  const firstTarget = buttonTargets[0] || {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.5,
  };

  return {
    x: firstTarget.x,
    y: firstTarget.y,
    rotation: Math.random() * Math.PI * 2,
    spin: -0.025 + Math.random() * 0.05,
    spinTarget: -0.04 + Math.random() * 0.08,
    moodTimer: 90,
    targetIndex: 0,
    activeLabel: '',
    holdTimer: 0,
    textTimer: 0,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(value) {
  return value * value * (3 - 2 * value);
}

function seededNoise(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

function wiggle(time, frequency, amplitude, seed) {
  const frame = time * frequency;
  const current = Math.floor(frame);
  const blend = smoothstep(frame - current);
  const a = seededNoise(current + seed * 97.31);
  const b = seededNoise(current + 1 + seed * 97.31);

  return (a + (b - a) * blend) * amplitude;
}

function drawTextLayer(word, alpha, yOffset = 0, scale = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(0, yOffset);
  ctx.scale(scale, scale);
  ctx.fillText(word, 0, 0);
  ctx.restore();
}

function getScrambleText(fromWord, toWord, progress, frame) {
  const length = Math.max(fromWord.length, toWord.length);
  let text = '';

  for (let i = 0; i < length; i += 1) {
    const fromChar = fromWord[i] || '';
    const toChar = toWord[i] || '';
    const letterProgress = clamp((progress - i / length * 0.35) / 0.65, 0, 1);

    if (letterProgress < 0.18) {
      text += fromChar || toChar;
    } else if (letterProgress > 0.82) {
      text += toChar || fromChar;
    } else {
      const noiseIndex = Math.abs(Math.floor(seededNoise(frame + i * 19.17) * TEXT_MORPH_CHARS.length));
      text += TEXT_MORPH_CHARS[noiseIndex % TEXT_MORPH_CHARS.length];
    }
  }

  return text;
}

function updateSpin() {
  star.moodTimer -= 1;

  if (star.moodTimer <= 0) {
    star.spinTarget = MIN_SPIN + Math.random() * (MAX_SPIN - MIN_SPIN);
    star.moodTimer = 70 + Math.floor(Math.random() * 150);
  }

  star.spin += (star.spinTarget - star.spin) * SPIN_CHANGE_FORCE;
  star.spin = clamp(star.spin, MIN_SPIN, MAX_SPIN);
}

function moveBetweenButtons() {
  if (buttonTargets.length === 0) {
    return;
  }

  const target = buttonTargets[star.targetIndex % buttonTargets.length];
  const dx = target.x - star.x;
  const dy = target.y - star.y;
  const distance = Math.hypot(dx, dy);

  if (distance <= ARRIVAL_DISTANCE) {
    star.x = target.x;
    star.y = target.y;

    if (star.holdTimer <= 0) {
      star.holdTimer = TARGET_HOLD_MIN + Math.floor(Math.random() * (TARGET_HOLD_MAX - TARGET_HOLD_MIN));
    }

    star.holdTimer -= 1;

    if (star.holdTimer <= 0) {
      star.targetIndex = (star.targetIndex + 1) % buttonTargets.length;
    }

    return;
  }

  star.x += dx * TARGET_EASING;
  star.y += dy * TARGET_EASING;
}

function updateExplainerText() {
  if (!explainerText || buttonTargets.length === 0) {
    return;
  }

  const target = buttonTargets[star.targetIndex % buttonTargets.length];

  if (!target || target.label === star.activeLabel) {
    return;
  }

  star.activeLabel = target.label;
  explainerText.classList.add('is-changing');

  window.setTimeout(() => {
    explainerText.textContent = EXPLAINER_TEXTS[target.label] || target.label;
    explainerText.classList.remove('is-changing');
  }, 160);
}

function drawStar() {
  ctx.save();
  ctx.translate(star.x, star.y);
  ctx.rotate(star.rotation);
  ctx.globalAlpha = STAR_OPACITY;
  ctx.fillStyle = STAR_COLOR;
  ctx.strokeStyle = STAR_COLOR;
  ctx.lineWidth = 1;
  ctx.lineJoin = 'round';

  ctx.beginPath();
  for (let i = 0; i < STAR_POINTS * 2; i += 1) {
    const radius = i % 2 === 0 ? STAR_OUTER_RADIUS : STAR_INNER_RADIUS;
    const angle = (i / (STAR_POINTS * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawStarText() {
  const cycleFrame = star.textTimer % TEXT_SWITCH_FRAMES;
  const wordIndex = Math.floor(star.textTimer / TEXT_SWITCH_FRAMES) % TEXT_WORDS.length;
  const nextWordIndex = (wordIndex + 1) % TEXT_WORDS.length;
  const word = TEXT_WORDS[wordIndex];
  const nextWord = TEXT_WORDS[nextWordIndex];
  const morphStart = TEXT_SWITCH_FRAMES - TEXT_MORPH_FRAMES;
  const isMorphing = cycleFrame >= morphStart;
  const morphProgress = isMorphing ? smoothstep((cycleFrame - morphStart) / TEXT_MORPH_FRAMES) : 0;
  const time = star.textTimer / 60;
  const wiggleX = wiggle(time, TEXT_WIGGLE_FREQUENCY, TEXT_WIGGLE_POSITION, 1);
  const wiggleY = wiggle(time, TEXT_WIGGLE_FREQUENCY, TEXT_WIGGLE_POSITION, 2);
  const wiggleRotation = wiggle(time, TEXT_WIGGLE_FREQUENCY, TEXT_WIGGLE_ROTATION, 3);
  const wiggleScale = 1 + wiggle(time, TEXT_WIGGLE_FREQUENCY, TEXT_WIGGLE_SCALE, 4);

  ctx.save();
  ctx.translate(star.x + wiggleX, star.y + wiggleY);
  ctx.rotate(wiggleRotation);
  ctx.scale(wiggleScale, wiggleScale);
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = `${TEXT_SIZE}px ${TEXT_FONT}, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (isMorphing) {
    const scrambleText = getScrambleText(word, nextWord, morphProgress, star.textTimer);
    drawTextLayer(word, 1 - morphProgress, -morphProgress * 3, 1 + morphProgress * 0.05);
    drawTextLayer(scrambleText, 0.78, wiggle(time, 18, 1.2, 9), 1);
    drawTextLayer(nextWord, morphProgress, (1 - morphProgress) * 3, 0.95 + morphProgress * 0.05);
  } else {
    ctx.fillText(word, 0, 0);
  }

  ctx.restore();

  star.textTimer += 1;
}

function animate() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  updateSpin();
  moveBetweenButtons();
  updateExplainerText();
  star.rotation += star.spin;
  drawStar();
  drawStarText();

  animationFrame = requestAnimationFrame(animate);
}

function start() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  resizeCanvas();
  updateButtonTargets();
  explainerText = document.querySelector(EXPLAINER_SELECTOR);
  star = createStar();
  updateExplainerText();

  if (prefersReducedMotion.matches) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    drawStar();
    return;
  }

  animate();
}

window.addEventListener('resize', start);
prefersReducedMotion.addEventListener('change', start);

start();
