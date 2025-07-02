// -----------------------------
// TEXTANIMATION FÜR HEADLINE
// -----------------------------

const effects = [
  { y: -100 }, { x: -100 }, { y: 100 }, { x: 100 },
  { rotation: 720, scale: 0 },
  { scale: 0.2 },
  { rotation: -360, y: -50 }
];

function animateText(text, containerId, startDelay = 0) {
  const container = document.getElementById(containerId);
  const chars = [];

  text.split("").forEach((char, i) => {
    const span = document.createElement("span");
    span.textContent = char;
    span.classList.add("char");
    container.appendChild(span);

    const effect = effects[i % effects.length];
    gsap.set(span, effect);

    gsap.to(span, {
      opacity: 1,
      x: 0, y: 0, scale: 1, rotation: 0,
      delay: startDelay + Math.random() * 1.2,
      duration: 0.8,
      ease: "power3.out",
      onComplete: () => {
        chars.push(span);
        if (chars.length === text.length && containerId === "faces") startGlitch();
      }
    });
  });
}

function startGlitch() {
  gsap.timeline({ repeat: -1, repeatDelay: 2 })
    .to(".container", { opacity: 0.3, duration: 0.05, y: -1 })
    .to(".container", { opacity: 1, duration: 0.08, y: 1 })
    .to(".container", { opacity: 0.6, duration: 0.04, x: 2 })
    .to(".container", { opacity: 1, duration: 0.1, x: 0, y: 0 });
}

animateText("CHERNOFF", "chernoff");
animateText("FACES", "faces", 0.2);

// -----------------------------
// MENÜBUTTON ANIMATIONEN
// -----------------------------

gsap.set(".button-wrapper", { y: 50, opacity: 0 });

const menuVisible = { state: false };

document.getElementById("sun-button").addEventListener("click", () => {
  const buttons = document.querySelectorAll(".button-wrapper");

  if (!menuVisible.state) {
    buttons.forEach(btn => {
      gsap.to(btn, {
        y: 0,
        opacity: 1,
        delay: Math.random() * 0.8,
        duration: 0.4,
        ease: "back.out(1.7)"
      });
    });
  } else {
    gsap.to(".button-wrapper", {
      y: 50,
      opacity: 0,
      duration: 0.3,
      ease: "back.in(1.7)"
    });
  }

  menuVisible.state = !menuVisible.state;
});

// -----------------------------
// SUN BUTTON: ENDLOSROTATION
// -----------------------------

gsap.to("#sun-shape", {
  rotation: 360,
  duration: 8,
  repeat: -1,
  ease: "linear",
  transformOrigin: "50% 50%"
});

// -----------------------------
// SUN BUTTON: SPRUNGBEWEGUNG
// -----------------------------

function randomJump() {
  const x = gsap.utils.random(-20, -10);
  const y = gsap.utils.random(-30, -10);
  const delay = gsap.utils.random(0.5, 2.5);

  gsap.to("#sun-button", {
    x,
    y,
    duration: 0.2,
    ease: "power1.inOut",
    delay,
    onComplete: randomJump
  });
}

randomJump();

// -----------------------------
// DYNAMISCHER LABEL-TEXT
// -----------------------------

const fonts = [
  "'PopRumKiwi-Telop', sans-serif",
  "'TannenbergFett'"
];

const words = ["Open\nMenu", "x", "Click\nHere"];
const sunLabel = document.getElementById("sun-label");

function renderLabel(text) {
  sunLabel.innerHTML = "";
  const lines = text.split("\n");

  lines.forEach(line => {
    const lineDiv = document.createElement("div");
    lineDiv.style.display = "flex";
    lineDiv.style.justifyContent = "center";

    line.split("").forEach(char => {
      const span = document.createElement("span");
      span.classList.add("menu-letter");
      span.textContent = char;
      span.style.fontFamily = fonts[0]; // Standard: Aftermath
      span.style.fontSize = '18px';
      lineDiv.appendChild(span);
    });

    sunLabel.appendChild(lineDiv);
  });

  applyAnimation();
}

function applyAnimation() {
  const lines = sunLabel.querySelectorAll("div");

  lines.forEach(line => {
    const letters = Array.from(line.children);
    if (letters.length === 0) return;

    letters.forEach(letter => {
      // Zufällig Tannenberg oder Standard-Font
      const useFraktur = Math.random() < 0.4; // z. B. 40 % Fraktur
      if (useFraktur) {
        letter.style.fontFamily = fonts[1]; // Tannenberg
        letter.style.fontSize = '25px';
        letter.style.position = 'relative';
        letter.style.top = '-5px'; // optisch angleichen
      } else {
        letter.style.fontFamily = fonts[0]; // Aftermath
        letter.style.fontSize = '18px';
        letter.style.top = '0px';
      }

      // Buchstaben leicht vibrieren
      function animateLetter() {
        gsap.to(letter, {
          x: gsap.utils.random(-0.1, 0.1),
          y: gsap.utils.random(-0.1, 0.1),
          duration: 0.05,
          onComplete: animateLetter
        });
      }
      animateLetter();
    });
  });
}


// -----------------------------
// TEXTWECHSEL IM SONNENLABEL
// -----------------------------

let currentWord = "Menu";

function cycleText() {
  let next;
  do {
    next = words[Math.floor(Math.random() * words.length)];
  } while (next === currentWord);

  currentWord = next;
  renderLabel(next);
  setTimeout(cycleText, 4000);
}

renderLabel("Menu");
cycleText();

// -----------------------------
// BUTTON-HOVER: ENDLOSROTATION NUR FÜR BUTTONS
// -----------------------------

const buttons = document.querySelectorAll('.button-wrapper button');

buttons.forEach(button => {
  let rotationTween = null;

  button.addEventListener('mouseenter', () => {
    // Kill alte Rotation
    if (rotationTween) rotationTween.kill();

    // Start Rotation
    rotationTween = gsap.to(button, {
      rotation: '+=360',
      duration: 2,
      repeat: -1,
      ease: 'linear',
      transformOrigin: '50% 50%'
    });

    // Farbe füllen und Text schwarz
    gsap.to(button, {
      backgroundColor: '#aaff55',
      color: '#000000',
      duration: 0.2,
      ease: 'power1.out'
    });
  });

button.addEventListener('mouseleave', () => {
  if (rotationTween) {
    rotationTween.kill();
    rotationTween = null;
  }

  // Rotation sanft zurücksetzen
  gsap.to(button, {
    rotation: 0,
    duration: 0.6,
    ease: 'power2.out'
  });

  // Farbe zurücksetzen
  gsap.to(button, {
    backgroundColor: 'transparent',
    color: '#aaff55',
    duration: 0.2,
    ease: 'power1.in'
  });
});

});

const sunButton = document.getElementById('sun-button');
const sunShape = document.querySelector('#sun-shape path');

sunButton.addEventListener('mouseenter', () => {
  gsap.to(sunShape, {
    fill: 'rgb(255, 176, 102)',
    duration: 0.2,
    ease: 'power1.out'
  });
});

sunButton.addEventListener('mouseleave', () => {
  gsap.to(sunShape, {
    fill: '#ff6955', // ursprüngliche Farbe
    duration: 0.2,
    ease: 'power1.in'
  });
});



