const canvas = document.querySelector('.dust-crosses');
const ctx = canvas.getContext('2d');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const STAR_POINTS = 20;
const STAR_OUTER_RADIUS = 44;
const STAR_INNER_RADIUS = 60;
const STAR_COLOR = '#ff8282';
const STAR_OPACITY = 1;
const STAR_PULSE_RADIUS = 4.5;
const STAR_PULSE_SPEED = 0.055;
const STAR_SPIKE_VARIATION = 5;
const STAR_SPIKE_VARIATION_SPEED = 0.038;
const TARGET_EASING = 0.035;
const ARRIVAL_DISTANCE = 1.4;
const TARGET_HOLD_MIN = 230;
const TARGET_HOLD_MAX = 340;
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
const EXPLAINER_SELECTOR = '.target-explainer';
const EXPLAINER_BUBBLE_SELECTOR = '.target-explainer-bubble';
const EXPLAINER_BOX_SELECTOR = '.target-explainer-box';
const EXPLAINER_SHAPE_SELECTOR = '.target-explainer-shape';
const EXPLAINER_PATH_SELECTOR = '.target-explainer-path';
const CF_LOGO_SELECTOR = '.cf-logo';
const EXPLAINER_BOX_WIDTH = 320;
const EXPLAINER_GAP_MIN = 50;
const EXPLAINER_GAP_MAX = 150;
const EXPLAINER_LINE_GAP = 8;
const EXPLAINER_LOGO_CLEARANCE = 16;
const SPEECH_BUBBLE_RADIUS = 28;
const SPEECH_BUBBLE_POINTER_HALF = 22;
const VIEWPORT_SAFE_MARGIN = 84;
const STAR_BOX_CLEARANCE = -20;
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
let explainerBubble = null;
let explainerBox = null;
let explainerShape = null;
let explainerPath = null;
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
    const label = getButtonLabel(element);

    return {
      buttonCenterX: rect.left + rect.width / 2,
      buttonTop: rect.top,
      buttonBottom: rect.bottom,
      isTopButton: rect.top < window.innerHeight / 2,
      explainerGap: EXPLAINER_GAP_MIN + Math.random() * (EXPLAINER_GAP_MAX - EXPLAINER_GAP_MIN),
      label,
    };
  });
}

function getButtonLabel(element) {
  const text = element.textContent.replace(/\s+/g, ' ').trim();
  return text === '×' ? 'Close' : text;
}

function createStar() {
  const firstTarget = buttonTargets[0]
    ? getStarTarget(buttonTargets[0])
    : {
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
  const starTarget = getStarTarget(target);
  const dx = starTarget.x - star.x;
  const dy = starTarget.y - star.y;
  const distance = Math.hypot(dx, dy);

  if (distance <= ARRIVAL_DISTANCE) {
    star.x = starTarget.x;
    star.y = starTarget.y;

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
  if (!explainerText || !explainerBubble || !explainerBox || !explainerShape || !explainerPath || buttonTargets.length === 0) {
    return;
  }

  const target = buttonTargets[star.targetIndex % buttonTargets.length];

  if (!target) {
    return;
  }

  if (!explainerBox.textContent) {
    explainerBox.textContent = EXPLAINER_TEXTS[target.label] || target.label;
  }

  positionExplainer(target);
  explainerText.classList.remove('target-explainer--hidden');

  if (target.label === star.activeLabel) {
    return;
  }

  star.activeLabel = target.label;
  explainerText.classList.add('target-explainer--changing');
  positionExplainer(target);
  window.setTimeout(() => {
    explainerBox.textContent = EXPLAINER_TEXTS[target.label] || target.label;
    positionExplainer(target);
    explainerText.classList.remove('target-explainer--changing');
  }, 160);
}

function positionExplainer(target) {
  const layout = getExplainerLayout(target);

  explainerBubble.style.width = `${layout.boxWidth}px`;
  explainerBubble.style.height = `${layout.boxHeight}px`;
  explainerBubble.style.left = `${layout.boxLeft}px`;
  explainerBubble.style.top = `${layout.boxTop}px`;
  explainerBox.style.width = `${layout.boxWidth}px`;
  explainerBox.style.height = `${layout.boxHeight}px`;
  explainerShape.style.left = `${layout.shapeLeft}px`;
  explainerShape.style.top = `${layout.shapeTop}px`;
  explainerShape.style.width = `${layout.shapeWidth}px`;
  explainerShape.style.height = `${layout.shapeHeight}px`;
  explainerShape.setAttribute('viewBox', layout.shapeViewBox);
  explainerPath.setAttribute('d', layout.bubblePath);
}

function getExplainerLayout(target) {
  const boxWidth = Math.min(EXPLAINER_BOX_WIDTH, window.innerWidth - 32);
  const boxHeight = getExplainerBoxHeight(boxWidth);
  const safeMargin = Math.min(VIEWPORT_SAFE_MARGIN, Math.max(16, (window.innerWidth - boxWidth) / 2));
  const targetBoxLeft = target.buttonCenterX - boxWidth / 2;
  let boxTop;

  if (target.isTopButton) {
    boxTop = target.buttonBottom + target.explainerGap;
  } else {
    boxTop = target.buttonTop - target.explainerGap - boxHeight;
  }

  const logoAwareBox = getLogoAwareBoxPosition(targetBoxLeft, safeMargin, boxWidth, boxHeight, boxTop);
  const boxLeft = logoAwareBox.left;
  boxTop = logoAwareBox.top;
  const bubbleShape = getSpeechBubbleShape(target, boxLeft, boxTop, boxWidth, boxHeight);

  return {
    boxLeft,
    boxTop,
    boxWidth,
    boxHeight,
    shapeLeft: bubbleShape.left,
    shapeTop: bubbleShape.top,
    shapeWidth: bubbleShape.width,
    shapeHeight: bubbleShape.height,
    shapeViewBox: bubbleShape.viewBox,
    bubblePath: bubbleShape.path,
  };
}

function getSpeechBubbleShape(target, boxLeft, boxTop, boxWidth, boxHeight) {
  const radius = Math.min(SPEECH_BUBBLE_RADIUS, boxHeight / 2, boxWidth / 2);
  const pointerHalf = Math.min(SPEECH_BUBBLE_POINTER_HALF, boxWidth / 5);
  const tipX = target.buttonCenterX - boxLeft;
  const tipY = (target.isTopButton
    ? target.buttonBottom + EXPLAINER_LINE_GAP
    : target.buttonTop - EXPLAINER_LINE_GAP) - boxTop;
  const baseCenter = clamp(tipX, radius + pointerHalf, boxWidth - radius - pointerHalf);
  const baseLeft = baseCenter - pointerHalf;
  const baseRight = baseCenter + pointerHalf;
  const viewLeft = Math.min(0, tipX) - 4;
  const viewTop = Math.min(0, tipY) - 4;
  const viewRight = Math.max(boxWidth, tipX) + 4;
  const viewBottom = Math.max(boxHeight, tipY) + 4;
  const viewBox = `${viewLeft} ${viewTop} ${viewRight - viewLeft} ${viewBottom - viewTop}`;
  const shapeBounds = {
    left: viewLeft,
    top: viewTop,
    width: viewRight - viewLeft,
    height: viewBottom - viewTop,
    viewBox,
  };

  if (target.isTopButton) {
    return {
      ...shapeBounds,
      path: [
      `M ${radius} 0`,
      `L ${baseLeft} 0`,
      `L ${tipX} ${tipY}`,
      `L ${baseRight} 0`,
      `L ${boxWidth - radius} 0`,
      `Q ${boxWidth} 0 ${boxWidth} ${radius}`,
      `L ${boxWidth} ${boxHeight - radius}`,
      `Q ${boxWidth} ${boxHeight} ${boxWidth - radius} ${boxHeight}`,
      `L ${radius} ${boxHeight}`,
      `Q 0 ${boxHeight} 0 ${boxHeight - radius}`,
      `L 0 ${radius}`,
      `Q 0 0 ${radius} 0`,
      'Z',
      ].join(' '),
    };
  }

  return {
    ...shapeBounds,
    path: [
    `M ${radius} 0`,
    `L ${boxWidth - radius} 0`,
    `Q ${boxWidth} 0 ${boxWidth} ${radius}`,
    `L ${boxWidth} ${boxHeight - radius}`,
    `Q ${boxWidth} ${boxHeight} ${boxWidth - radius} ${boxHeight}`,
    `L ${baseRight} ${boxHeight}`,
    `L ${tipX} ${tipY}`,
    `L ${baseLeft} ${boxHeight}`,
    `L ${radius} ${boxHeight}`,
    `Q 0 ${boxHeight} 0 ${boxHeight - radius}`,
    `L 0 ${radius}`,
    `Q 0 0 ${radius} 0`,
    'Z',
    ].join(' '),
  };
}

function getLogoAwareBoxPosition(targetBoxLeft, safeMargin, boxWidth, boxHeight, boxTop) {
  const boxLeft = clamp(targetBoxLeft, safeMargin, window.innerWidth - boxWidth - safeMargin);
  const logo = document.querySelector(CF_LOGO_SELECTOR);

  if (!logo) {
    return { left: boxLeft, top: boxTop };
  }

  const logoRect = getPaddedRect(logo.getBoundingClientRect(), EXPLAINER_LOGO_CLEARANCE);
  const boxRect = {
    left: boxLeft,
    right: boxLeft + boxWidth,
    top: boxTop,
    bottom: boxTop + boxHeight,
  };

  if (!rectsOverlap(boxRect, logoRect)) {
    return { left: boxLeft, top: boxTop };
  }

  const horizontalCandidates = [
    logoRect.left - boxWidth,
    logoRect.right,
    boxLeft,
  ]
    .map((left) => clamp(left, safeMargin, window.innerWidth - boxWidth - safeMargin))
    .filter((left, index, items) => items.indexOf(left) === index);

  const freeLeft = horizontalCandidates
    .filter((left) => !rectsOverlap({ ...boxRect, left, right: left + boxWidth }, logoRect))
    .sort((a, b) => Math.abs(a - targetBoxLeft) - Math.abs(b - targetBoxLeft))[0];

  if (freeLeft !== undefined) {
    return { left: freeLeft, top: boxTop };
  }

  const verticalCandidates = [
    logoRect.top - boxHeight,
    logoRect.bottom,
    boxTop,
  ]
    .map((top) => clamp(top, 16, window.innerHeight - boxHeight - 16))
    .filter((top, index, items) => items.indexOf(top) === index);

  const freeTop = verticalCandidates
    .filter((top) => !rectsOverlap({ ...boxRect, top, bottom: top + boxHeight }, logoRect))
    .sort((a, b) => Math.abs(a - boxTop) - Math.abs(b - boxTop))[0];

  return { left: boxLeft, top: freeTop ?? boxTop };
}

function getPaddedRect(rect, padding) {
  return {
    left: rect.left - padding,
    right: rect.right + padding,
    top: rect.top - padding,
    bottom: rect.bottom + padding,
  };
}

function rectsOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function getExplainerBoxHeight(boxWidth) {
  const previousWidth = explainerBox.style.width;
  const previousHeight = explainerBox.style.height;

  explainerBox.style.width = `${boxWidth}px`;
  explainerBox.style.height = 'auto';
  const measuredHeight = Math.ceil(explainerBox.scrollHeight);
  explainerBox.style.width = previousWidth;
  explainerBox.style.height = previousHeight;

  return measuredHeight || 92;
}

function getStarTarget(target) {
  if (!explainerBox) {
    return {
      x: target.buttonCenterX,
      y: target.isTopButton ? target.buttonBottom : target.buttonTop,
    };
  }

  const layout = getExplainerLayout(target);
  const starRadius = Math.max(STAR_OUTER_RADIUS, STAR_INNER_RADIUS) + STAR_PULSE_RADIUS + STAR_SPIKE_VARIATION;
  const margin = starRadius + STAR_BOX_CLEARANCE;
  const leftX = layout.boxLeft - starRadius - STAR_BOX_CLEARANCE;
  const rightX = layout.boxLeft + layout.boxWidth + starRadius + STAR_BOX_CLEARANCE;
  const x = leftX >= margin ? leftX : rightX;
  const y = layout.boxTop + layout.boxHeight / 2;

  return {
    x: clamp(x, margin, window.innerWidth - margin),
    y: clamp(y, margin, window.innerHeight - margin),
  };
}

function drawStar() {
  const pulse = Math.sin(star.textTimer * STAR_PULSE_SPEED) * STAR_PULSE_RADIUS;

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
    const baseRadius = i % 2 === 0 ? STAR_OUTER_RADIUS : STAR_INNER_RADIUS;
    const spikeVariation = Math.sin(star.textTimer * STAR_SPIKE_VARIATION_SPEED + i * 0.9) * STAR_SPIKE_VARIATION;
    const radius = baseRadius + pulse + spikeVariation;
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
  explainerBubble = document.querySelector(EXPLAINER_BUBBLE_SELECTOR);
  explainerBox = document.querySelector(EXPLAINER_BOX_SELECTOR);
  explainerShape = document.querySelector(EXPLAINER_SHAPE_SELECTOR);
  explainerPath = document.querySelector(EXPLAINER_PATH_SELECTOR);
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
