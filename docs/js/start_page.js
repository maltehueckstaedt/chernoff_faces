const canvas = document.querySelector('.dust-crosses');
const ctx = canvas.getContext('2d');
const starCanvas = document.querySelector('.star-crosses');
const starCtx = starCanvas.getContext('2d');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const STAR_POINTS = 15;
const STAR_OUTER_RADIUS = 34;
const STAR_INNER_RADIUS = 50;
const STAR_COLOR = '#ff8282';
const STAR_OPACITY = 1;
const STAR_SPIKE_VARIATION = 7;
const STAR_INNER_RADIUS_VARIATION = 4.5;
const STAR_RADIUS_EASING = 0.045;
const STAR_RADIUS_HOLD_MIN = 36;
const STAR_RADIUS_HOLD_MAX = 86;
const TARGET_EASING = 0.035;
const ARRIVAL_DISTANCE = 1.4;
const TARGET_HOLD_MIN = 230;
const TARGET_HOLD_MAX = 340;
const MIN_SPIN = -0.16;
const MAX_SPIN = 0.12;
const CALM_MIN_SPIN = -0.075;
const CALM_MAX_SPIN = 0.075;
const FAST_SPIN_CHANCE = 0.14;
const FAST_SPIN_HOLD_MIN = 16;
const FAST_SPIN_HOLD_MAX = 34;
const SPIN_CHANGE_FORCE = 0.0018;
const FAST_SPIN_BRAKE_FORCE = 0.018;
const SPIN_HOLD_MIN = 190;
const SPIN_HOLD_MAX = 420;
const TEXT_WORDS = ['Click', 'Here!'];
const CONTACT_TEXT_WORDS = ['Write', 'Here!'];
const TEXT_SWITCH_FRAMES = 86;
const TEXT_MORPH_FRAMES = 28;
const MOTHER_TEXT_SWITCH_FRAMES = 113;
const MOTHER_TEXT_MORPH_FRAMES = 37;
const TEXT_COLOR = 'red';
const TEXT_SIZE = 40;
const TEXT_FONTS = [
  'NineSevenTallPixel',
  'Becker',
  'WallauRundgotisch',
  'WashingtonTextAlternates',
];
const MOTHER_TEXT_FONTS = [
  'MotherPotsdam',
  'MotherSemperIdem',
  'MotherWerbedeutsch',
];
const CONTACT_TEXT_FONTS = [
  'ContactBillHicks',
  'ContactBlackSirkka',
  'ContactGermanUnderground',
  'ContactTulpeFraktur',
];
const TEXT_MORPH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!?<>/\\';
const TEXT_WIGGLE_FREQUENCY = 10;
const TEXT_WIGGLE_POSITION = 1.6;
const TEXT_WIGGLE_ROTATION = 0.001;
const TEXT_WIGGLE_SCALE = 0.001;
const BUTTON_SELECTOR = '.oval';
const MOTHER_RANDOM_FONT_SELECTOR = '.mother-random-font';
const MOTHER_TEXT_SIZE = 42;
const MOTHER_TEXT_SEED_OFFSET = 37;
const EXPLAINER_SELECTOR = '.target-explainer';
const EXPLAINER_BUBBLE_SELECTOR = '.target-explainer-bubble';
const EXPLAINER_BOX_SELECTOR = '.target-explainer-box';
const EXPLAINER_SHAPE_SELECTOR = '.target-explainer-shape';
const EXPLAINER_PATH_SELECTOR = '.target-explainer-path';
const CF_LOGO_SELECTOR = '.cf-logo';
const EXPLAINER_BOX_WIDTH = 320;
const EXPLAINER_BOX_MIN_WIDTH = 112;
const EXPLAINER_BOX_MIN_HEIGHT = 56;
const EXPLAINER_TEXT_HIDE_DELAY = 220;
const EXPLAINER_TEXT_REVEAL_DELAY = 440;
const EXPLAINER_TARGET_GAP = 150;
const EXPLAINER_LINE_GAP = 8;
const EXPLAINER_LOGO_CLEARANCE = 16;
const EXPLAINER_FORM_CLEARANCE = 18;
const EXPLAINER_IDLE_JITTER = 6;
const EXPLAINER_IDLE_JITTER_HOLD = 0.34;
const SPEECH_BUBBLE_RADIUS = 28;
const SPEECH_BUBBLE_POINTER_HALF = 22;
const SPEECH_BUBBLE_CORNER_BIAS = 0.72;
const SPEECH_BUBBLE_CENTER_DEAD_ZONE = 0.18;
const VIEWPORT_SAFE_MARGIN = 84;
const STAR_BOX_CLEARANCE = -20;
const EXPLAINER_TEXTS = {
  'Chernoff Faces': 'go home',
  Mother: '...to watch the first short film by Chernoff Faces.',
  Downer: "...to get initial information about the second Chernoff Faces short film. If you liked Mother, you'll love Downer!",
  About: '...to learn everything you need to know about Chernoff Faces.', 
  Contact: '...to contact!',
  'Imprint Text': 'Read Imprint!',
  'Home Button': '...to go home!',
};

let animationFrame = null;
let buttonTargets = [];
let explainerText = null;
let explainerBubble = null;
let explainerBox = null;
let explainerShape = null;
let explainerPath = null;
let explainerTextChangeTimer = null;
let explainerTextRevealTimer = null;
let star = createStar();

if (document.fonts) {
  TEXT_FONTS.forEach((font) => document.fonts.load(`${TEXT_SIZE}px ${font}`));
  MOTHER_TEXT_FONTS.forEach((font) => document.fonts.load(`${MOTHER_TEXT_SIZE}px ${font}`));
  CONTACT_TEXT_FONTS.forEach((font) => document.fonts.load(`${TEXT_SIZE}px ${font}`));
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;

  [canvas, starCanvas].forEach((layerCanvas) => {
    layerCanvas.width = Math.floor(window.innerWidth * ratio);
    layerCanvas.height = Math.floor(window.innerHeight * ratio);
    layerCanvas.style.width = `${window.innerWidth}px`;
    layerCanvas.style.height = `${window.innerHeight}px`;
  });
  [ctx, starCtx].forEach((layerCtx) => layerCtx.setTransform(ratio, 0, 0, ratio, 0, 0));
}

function updateButtonTargets() {
  if (document.body.classList.contains('legal-page') || document.body.classList.contains('contact-page') || document.body.classList.contains('about-page')) {
    buttonTargets = Array.from(document.querySelectorAll('.legal-title, .contact-title, .legal-header .brand'))
      .map(createExplainerTarget)
      .filter(Boolean);
    return;
  }

  buttonTargets = Array.from(document.querySelectorAll(BUTTON_SELECTOR))
    .map(createExplainerTarget)
    .filter(Boolean);
}

function createExplainerTarget(element) {
  const rect = element.getBoundingClientRect();

  if (rect.width <= 0 || rect.height <= 0) {
    return null;
  }

  return {
    buttonCenterX: rect.left + rect.width / 2,
    buttonLeft: rect.left,
    buttonRight: rect.right,
    buttonTop: rect.top,
    buttonBottom: rect.bottom,
    isTopButton: element.dataset.explainerPlacement === 'above'
      ? false
      : element.dataset.explainerPlacement === 'below'
        ? true
        : rect.top < window.innerHeight / 2,
    label: element.dataset.explainerLabel || getButtonLabel(element),
  };
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
    outerRadius: STAR_OUTER_RADIUS,
    outerRadiusTarget: STAR_OUTER_RADIUS,
    innerRadius: STAR_INNER_RADIUS,
    innerRadiusTarget: STAR_INNER_RADIUS,
    radiusTimer: 0,
    moodTimer: 90,
    fastSpinActive: false,
    targetIndex: 0,
    activeLabel: '',
    holdTimer: 0,
    textTimer: 0,
    textFont: TEXT_FONTS[0],
    textNextFont: TEXT_FONTS[1] || TEXT_FONTS[0],
    textWordIndex: -1,
    motherFont: MOTHER_TEXT_FONTS[0],
    motherNextFont: MOTHER_TEXT_FONTS[1] || MOTHER_TEXT_FONTS[0],
    motherCycle: Math.floor(Math.random() * MOTHER_TEXT_SWITCH_FRAMES),
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function getRandomTextFont() {
  const fonts = document.body.classList.contains('contact-page') ? CONTACT_TEXT_FONTS : TEXT_FONTS;
  return fonts[Math.floor(Math.random() * fonts.length)];
}

function getRandomMotherTextFont() {
  return MOTHER_TEXT_FONTS[Math.floor(Math.random() * MOTHER_TEXT_FONTS.length)];
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

function drawTextLayer(renderCtx, word, alpha, yOffset = 0, scale = 1) {
  renderCtx.save();
  renderCtx.globalAlpha *= alpha;
  renderCtx.translate(0, yOffset);
  renderCtx.scale(scale, scale);
  renderCtx.fillText(word, 0, 0);
  renderCtx.restore();
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
    if (star.fastSpinActive || Math.random() > FAST_SPIN_CHANCE) {
      star.fastSpinActive = false;
      star.spinTarget = CALM_MIN_SPIN + Math.random() * (CALM_MAX_SPIN - CALM_MIN_SPIN);
      star.moodTimer = SPIN_HOLD_MIN + Math.floor(Math.random() * (SPIN_HOLD_MAX - SPIN_HOLD_MIN));
    } else {
      star.fastSpinActive = true;
      star.spinTarget = MIN_SPIN + Math.random() * (MAX_SPIN - MIN_SPIN);
      star.moodTimer = FAST_SPIN_HOLD_MIN + Math.floor(Math.random() * (FAST_SPIN_HOLD_MAX - FAST_SPIN_HOLD_MIN));
    }
  }

  star.spin += (star.spinTarget - star.spin) * SPIN_CHANGE_FORCE;
  if (!star.fastSpinActive && Math.abs(star.spin) > CALM_MAX_SPIN) {
    star.spin += (star.spinTarget - star.spin) * FAST_SPIN_BRAKE_FORCE;
  }
  star.spin = clamp(star.spin, MIN_SPIN, MAX_SPIN);
}

function updateStarRadii() {
  star.radiusTimer -= 1;

  if (star.radiusTimer <= 0) {
    star.outerRadiusTarget = STAR_OUTER_RADIUS + randomRange(-STAR_INNER_RADIUS_VARIATION, STAR_INNER_RADIUS_VARIATION);
    star.innerRadiusTarget = STAR_INNER_RADIUS + randomRange(-STAR_SPIKE_VARIATION, STAR_SPIKE_VARIATION);
    star.radiusTimer = STAR_RADIUS_HOLD_MIN + Math.floor(Math.random() * (STAR_RADIUS_HOLD_MAX - STAR_RADIUS_HOLD_MIN));
  }

  star.outerRadius += (star.outerRadiusTarget - star.outerRadius) * STAR_RADIUS_EASING;
  star.innerRadius += (star.innerRadiusTarget - star.innerRadius) * STAR_RADIUS_EASING;
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

  explainerText.classList.remove('target-explainer--hidden');

  if (target.label === star.activeLabel) {
    positionExplainer(target);
    return;
  }

  star.activeLabel = target.label;
  setExplainerCopy(target);
}

function setExplainerCopy(target) {
  if (explainerTextChangeTimer) {
    clearTimeout(explainerTextChangeTimer);
    explainerTextChangeTimer = null;
  }

  if (explainerTextRevealTimer) {
    clearTimeout(explainerTextRevealTimer);
    explainerTextRevealTimer = null;
  }

  explainerBox.classList.remove('target-explainer-box--visible');

  explainerTextChangeTimer = window.setTimeout(() => {
    explainerBox.innerHTML = EXPLAINER_TEXTS[target.label] || target.label;
    positionExplainer(target);

    explainerTextRevealTimer = window.setTimeout(() => {
      explainerBox.classList.add('target-explainer-box--visible');
      explainerTextRevealTimer = null;
    }, EXPLAINER_TEXT_REVEAL_DELAY);

    explainerTextChangeTimer = null;
  }, EXPLAINER_TEXT_HIDE_DELAY);
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
  const boxWidth = getExplainerBoxWidth();
  const boxHeight = getExplainerBoxHeight(boxWidth);
  const safeMargin = Math.min(VIEWPORT_SAFE_MARGIN, Math.max(16, (window.innerWidth - boxWidth) / 2));
  const targetBoxLeft = target.buttonCenterX - boxWidth / 2;
  let boxTop;

  if (target.isTopButton) {
    boxTop = target.buttonBottom + getExplainerTargetGap(target);
  } else {
    boxTop = target.buttonTop - getExplainerTargetGap(target) - boxHeight;
  }

  const logoAwareBox = getLogoAwareBoxPosition(targetBoxLeft, safeMargin, boxWidth, boxHeight, boxTop);
  const formAwareBox = getContactFormAwareBoxPosition(target, logoAwareBox.left, logoAwareBox.top, safeMargin, boxWidth, boxHeight);
  const faqAwareBox = getFaqGridAwareBoxPosition(formAwareBox.left, formAwareBox.top, safeMargin, boxWidth, boxHeight);
  const boxLeft = clamp(
    faqAwareBox.left,
    safeMargin,
    window.innerWidth - boxWidth - safeMargin,
  );
  boxTop = clamp(
    faqAwareBox.top,
    16,
    window.innerHeight - boxHeight - 16,
  );
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

function getExplainerIdleDrift() {
  const time = performance.now() / 1000;
  const step = Math.floor(time / EXPLAINER_IDLE_JITTER_HOLD);

  return {
    x: seededNoise(step + 21) * EXPLAINER_IDLE_JITTER,
    y: seededNoise(step + 22) * EXPLAINER_IDLE_JITTER * 0.72,
  };
}

function getSpeechBubbleShape(target, boxLeft, boxTop, boxWidth, boxHeight) {
  const radius = Math.min(SPEECH_BUBBLE_RADIUS, boxHeight / 2, boxWidth / 2);
  const pointerHalf = Math.min(SPEECH_BUBBLE_POINTER_HALF, boxWidth / 5);
  const tipX = target.buttonCenterX - boxLeft;
  const tipY = (target.isTopButton
    ? target.buttonBottom + EXPLAINER_LINE_GAP
    : target.buttonTop - EXPLAINER_LINE_GAP) - boxTop;
  const baseCenter = getSpeechBubblePointerBaseCenter(target, tipX, boxWidth, radius, pointerHalf);
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

function getSpeechBubblePointerBaseCenter(target, tipX, boxWidth, radius, pointerHalf) {
  const minBaseCenter = radius + pointerHalf;
  const maxBaseCenter = boxWidth - radius - pointerHalf;
  const centeredBase = clamp(tipX, minBaseCenter, maxBaseCenter);
  const viewportCenter = window.innerWidth / 2;
  const viewportSide = clamp((target.buttonCenterX - viewportCenter) / viewportCenter, -1, 1);
  const deadZone = SPEECH_BUBBLE_CENTER_DEAD_ZONE;

  if (Math.abs(viewportSide) <= deadZone) {
    return centeredBase;
  }

  const sideProgress = (Math.abs(viewportSide) - deadZone) / (1 - deadZone);
  const cornerBase = viewportSide < 0 ? minBaseCenter : maxBaseCenter;
  const bias = clamp(sideProgress * SPEECH_BUBBLE_CORNER_BIAS, 0, 1);

  return centeredBase + (cornerBase - centeredBase) * bias;
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

function getExplainerTargetGap() {
  return EXPLAINER_TARGET_GAP;
}

function getFaqGridAwareBoxPosition(boxLeft, boxTop, safeMargin, boxWidth, boxHeight) {
  const grid = document.querySelector('.faq-grid');

  if (!grid) {
    return { left: boxLeft, top: boxTop };
  }

  const gridRect = getPaddedRect(grid.getBoundingClientRect(), EXPLAINER_FORM_CLEARANCE);
  const boxRect = {
    left: boxLeft,
    right: boxLeft + boxWidth,
    top: boxTop,
    bottom: boxTop + boxHeight,
  };

  if (!rectsOverlap(boxRect, gridRect)) {
    return { left: boxLeft, top: boxTop };
  }

  const candidates = [
    { left: boxLeft, top: gridRect.top - boxHeight },
    { left: gridRect.left - boxWidth, top: boxTop },
    { left: gridRect.right, top: boxTop },
    { left: boxLeft, top: gridRect.bottom },
  ]
    .map((candidate) => ({
      left: clamp(candidate.left, safeMargin, window.innerWidth - boxWidth - safeMargin),
      top: clamp(candidate.top, 16, window.innerHeight - boxHeight - 16),
    }))
    .filter((candidate, index, items) => (
      items.findIndex((item) => item.left === candidate.left && item.top === candidate.top) === index
    ));

  return candidates.find((candidate) => !rectsOverlap({
    left: candidate.left,
    right: candidate.left + boxWidth,
    top: candidate.top,
    bottom: candidate.top + boxHeight,
  }, gridRect)) || { left: boxLeft, top: boxTop };
}

function getContactFormAwareBoxPosition(target, boxLeft, boxTop, safeMargin, boxWidth, boxHeight) {
  const form = document.querySelector('.contact-form');

  if (!form) {
    return { left: boxLeft, top: boxTop };
  }

  const formRect = getPaddedRect(form.getBoundingClientRect(), EXPLAINER_FORM_CLEARANCE);
  const boxRect = {
    left: boxLeft,
    right: boxLeft + boxWidth,
    top: boxTop,
    bottom: boxTop + boxHeight,
  };

  if (!rectsOverlap(boxRect, formRect)) {
    return { left: boxLeft, top: boxTop };
  }

  const candidates = [
    { left: boxLeft, top: formRect.top - boxHeight },
    { left: formRect.left - boxWidth, top: boxTop },
    { left: formRect.right, top: boxTop },
    { left: boxLeft, top: formRect.bottom },
  ]
    .map((candidate) => ({
      left: clamp(candidate.left, safeMargin, window.innerWidth - boxWidth - safeMargin),
      top: clamp(candidate.top, 16, window.innerHeight - boxHeight - 16),
    }))
    .filter((candidate, index, items) => (
      items.findIndex((item) => item.left === candidate.left && item.top === candidate.top) === index
    ));

  return candidates.find((candidate) => !rectsOverlap({
    left: candidate.left,
    right: candidate.left + boxWidth,
    top: candidate.top,
    bottom: candidate.top + boxHeight,
  }, formRect)) || { left: boxLeft, top: boxTop };
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
  const probe = explainerBox.cloneNode(true);

  probe.style.position = 'fixed';
  probe.style.left = '-9999px';
  probe.style.top = '0';
  probe.style.width = `${boxWidth}px`;
  probe.style.height = 'auto';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  document.body.appendChild(probe);
  const measuredHeight = Math.ceil(probe.scrollHeight);
  probe.remove();

  return Math.max(measuredHeight || 92, EXPLAINER_BOX_MIN_HEIGHT);
}

function getExplainerBoxWidth() {
  const maxWidth = Math.min(EXPLAINER_BOX_WIDTH, window.innerWidth - 32);
  const probe = explainerBox.cloneNode(true);

  probe.style.position = 'fixed';
  probe.style.left = '-9999px';
  probe.style.top = '0';
  probe.style.width = 'auto';
  probe.style.height = 'auto';
  probe.style.whiteSpace = 'nowrap';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  document.body.appendChild(probe);
  const measuredWidth = Math.ceil(probe.scrollWidth);
  probe.remove();

  return clamp(measuredWidth || maxWidth, Math.min(EXPLAINER_BOX_MIN_WIDTH, maxWidth), maxWidth);
}

function getStarTarget(target) {
  if (!explainerBox) {
    return {
      x: target.buttonCenterX,
      y: target.isTopButton ? target.buttonBottom : target.buttonTop,
    };
  }

  const layout = getExplainerLayout(target);
  const starRadius = Math.max(
    STAR_OUTER_RADIUS + STAR_INNER_RADIUS_VARIATION,
    STAR_INNER_RADIUS + STAR_SPIKE_VARIATION,
  );
  const viewportMargin = starRadius + 4;
  const boxOffset = starRadius + STAR_BOX_CLEARANCE;
  const centerY = layout.boxTop + layout.boxHeight / 2;
  const centerX = layout.boxLeft + layout.boxWidth / 2;
  const leftTarget = {
    x: layout.boxLeft - boxOffset,
    y: centerY,
  };
  const rightTarget = {
    x: layout.boxLeft + layout.boxWidth + boxOffset,
    y: centerY,
  };
  const topTarget = {
    x: centerX,
    y: layout.boxTop - boxOffset,
  };
  const bottomTarget = {
    x: centerX,
    y: layout.boxTop + layout.boxHeight + boxOffset,
  };
  const verticalTargets = target.isTopButton
    ? [bottomTarget, topTarget]
    : [topTarget, bottomTarget];
  const candidates = [leftTarget, rightTarget, ...verticalTargets];
  const visibleTarget = candidates.find((candidate) => (
    candidate.x >= viewportMargin
    && candidate.x <= window.innerWidth - viewportMargin
    && candidate.y >= viewportMargin
    && candidate.y <= window.innerHeight - viewportMargin
  )) || candidates[candidates.length - 1];

  return {
    x: clamp(visibleTarget.x, viewportMargin, window.innerWidth - viewportMargin),
    y: clamp(visibleTarget.y, viewportMargin, window.innerHeight - viewportMargin),
  };
}

function getPageStarColor() {
  return document.body.classList.contains('legal-page') ? '#fff' : STAR_COLOR;
}

function getPageTextColor() {
  return document.body.classList.contains('legal-page') ? '#111' : TEXT_COLOR;
}

function getPageTextWords() {
  if (star.activeLabel === 'Contact') {
    return CONTACT_TEXT_WORDS;
  }

  return document.body.classList.contains('legal-page') ? ['Read', 'Here!'] : TEXT_WORDS;
}

function drawStarShape(offsetX = 0, offsetY = 0, color = getPageStarColor()) {
  starCtx.save();
  starCtx.translate(star.x + offsetX, star.y + offsetY);
  starCtx.rotate(star.rotation);
  starCtx.globalAlpha = STAR_OPACITY;
  starCtx.fillStyle = color;
  starCtx.strokeStyle = color;
  starCtx.lineWidth = 1;
  starCtx.lineJoin = 'round';

  starCtx.beginPath();
  for (let i = 0; i < STAR_POINTS * 2; i += 1) {
    const radius = i % 2 === 0 ? star.outerRadius : star.innerRadius;
    const angle = (i / (STAR_POINTS * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (i === 0) {
      starCtx.moveTo(x, y);
    } else {
      starCtx.lineTo(x, y);
    }
  }
  starCtx.closePath();
  starCtx.fill();
  starCtx.stroke();
  starCtx.restore();
}

function drawStar() {
  drawStarShape();
}

function drawWigglyMorphText({
  renderCtx = ctx,
  x,
  y,
  word,
  nextWord,
  font,
  nextFont,
  timer,
  size,
  seedOffset = 0,
  switchFrames = TEXT_SWITCH_FRAMES,
  morphFrames = TEXT_MORPH_FRAMES,
}) {
  const cycleFrame = timer % switchFrames;
  const morphStart = switchFrames - morphFrames;
  const isMorphing = cycleFrame >= morphStart;
  const morphProgress = isMorphing ? smoothstep((cycleFrame - morphStart) / morphFrames) : 0;
  const time = timer / 60;
  const wiggleX = wiggle(time, TEXT_WIGGLE_FREQUENCY, TEXT_WIGGLE_POSITION, 1 + seedOffset);
  const wiggleY = wiggle(time, TEXT_WIGGLE_FREQUENCY, TEXT_WIGGLE_POSITION, 2 + seedOffset);
  const wiggleRotation = wiggle(time, TEXT_WIGGLE_FREQUENCY, TEXT_WIGGLE_ROTATION, 3 + seedOffset);
  const wiggleScale = 1 + wiggle(time, TEXT_WIGGLE_FREQUENCY, TEXT_WIGGLE_SCALE, 4 + seedOffset);

  renderCtx.save();
  renderCtx.translate(x + wiggleX, y + wiggleY);
  renderCtx.rotate(wiggleRotation);
  renderCtx.scale(wiggleScale, wiggleScale);
  renderCtx.fillStyle = getPageTextColor();
  renderCtx.textAlign = 'center';
  renderCtx.textBaseline = 'middle';

  if (isMorphing) {
    const scrambleText = getScrambleText(word, nextWord, morphProgress, timer);
    renderCtx.font = `${size}px ${font}, monospace`;
    drawTextLayer(renderCtx, word, 1 - morphProgress, -morphProgress * 3, 1 + morphProgress * 0.05);
    renderCtx.font = `${size}px ${nextFont}, monospace`;
    drawTextLayer(renderCtx, scrambleText, 0.78, wiggle(time, 18, 1.2, 9 + seedOffset), 1);
    drawTextLayer(renderCtx, nextWord, morphProgress, (1 - morphProgress) * 3, 0.95 + morphProgress * 0.05);
  } else {
    renderCtx.font = `${size}px ${font}, monospace`;
    renderCtx.fillText(word, 0, 0);
  }

  renderCtx.restore();
}

function drawStarText() {
  const textWords = getPageTextWords();
  const wordIndex = Math.floor(star.textTimer / TEXT_SWITCH_FRAMES) % textWords.length;
  const nextWordIndex = (wordIndex + 1) % textWords.length;

  if (wordIndex !== star.textWordIndex) {
    star.textWordIndex = wordIndex;
    star.textFont = star.textNextFont;
    star.textNextFont = getRandomTextFont();
  }

  drawWigglyMorphText({
    renderCtx: starCtx,
    x: star.x,
    y: star.y,
    word: textWords[wordIndex],
    nextWord: textWords[nextWordIndex],
    font: star.textFont,
    nextFont: star.textNextFont,
    timer: star.textTimer,
    size: TEXT_SIZE,
  });

  star.textTimer += 1;
}

function drawMotherText() {
  const motherButton = document.querySelector(MOTHER_RANDOM_FONT_SELECTOR);

  if (!motherButton) {
    return;
  }

  const rect = motherButton.getBoundingClientRect();
  const cycleFrame = star.motherCycle % MOTHER_TEXT_SWITCH_FRAMES;

  if (cycleFrame === 0) {
    star.motherFont = star.motherNextFont;
    star.motherNextFont = getRandomMotherTextFont();
  }

  drawWigglyMorphText({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    word: 'Mother',
    nextWord: 'Mother',
    font: star.motherFont,
    nextFont: star.motherNextFont,
    timer: star.motherCycle,
    size: MOTHER_TEXT_SIZE,
    seedOffset: MOTHER_TEXT_SEED_OFFSET,
    switchFrames: MOTHER_TEXT_SWITCH_FRAMES,
    morphFrames: MOTHER_TEXT_MORPH_FRAMES,
  });

  star.motherCycle += 1;
}

function animate() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  starCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  updateSpin();
  updateStarRadii();
  moveBetweenButtons();
  updateExplainerText();
  star.rotation += star.spin;
  drawMotherText();
  drawStar();
  drawStarText();

  animationFrame = requestAnimationFrame(animate);
}

function start() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  if (explainerTextChangeTimer) {
    clearTimeout(explainerTextChangeTimer);
    explainerTextChangeTimer = null;
  }

  if (explainerTextRevealTimer) {
    clearTimeout(explainerTextRevealTimer);
    explainerTextRevealTimer = null;
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
    starCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    drawStar();
    return;
  }

  animate();
}

window.addEventListener('resize', start);
prefersReducedMotion.addEventListener('change', start);

start();
