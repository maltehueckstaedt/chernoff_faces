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
// SUN BUTTON: ROTATION + JUMP
// -----------------------------

gsap.to("#sun-shape", {
  rotation: 360,
  duration: 8,
  repeat: -1,
  ease: "linear",
  transformOrigin: "50% 50%"
});

function randomJump() {
  const x = gsap.utils.random(-20, -10);
  const y = gsap.utils.random(-30, -10);
  const delay = gsap.utils.random(0.5, 2.5);

  gsap.to("#sun-button", {
    x, y,
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

const fonts = ["'PopRumKiwi-Telop', sans-serif", "'TannenbergFett'"];
const words = ["Open\nMenu", "x", "Click\nHere"];
const sunLabel = document.getElementById("sun-label");

function renderLabel(text) {
  sunLabel.innerHTML = "";
  text.split("\n").forEach(line => {
    const lineDiv = document.createElement("div");
    lineDiv.style.display = "flex";
    lineDiv.style.justifyContent = "center";

    line.split("").forEach(char => {
      const span = document.createElement("span");
      span.classList.add("menu-letter");
      span.textContent = char;
      span.style.fontFamily = fonts[0];
      span.style.fontSize = "18px";
      lineDiv.appendChild(span);
    });

    sunLabel.appendChild(lineDiv);
  });

  applyAnimation();
}

function applyAnimation() {
  sunLabel.querySelectorAll("div").forEach(line => {
    Array.from(line.children).forEach(letter => {
      const useFraktur = Math.random() < 0.4;
      letter.style.fontFamily = useFraktur ? fonts[1] : fonts[0];
      letter.style.fontSize = useFraktur ? "35px" : "28px";
      letter.style.top = useFraktur ? "-5px" : "0px";
      letter.style.position = "relative";

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
// BUTTON-HOVER: ROTATION
// -----------------------------

document.querySelectorAll('.button-wrapper button').forEach(button => {
  const char = button.querySelector('.button-char');
  let rotationTween = null;

  button.addEventListener('mouseenter', () => {
    if (rotationTween) rotationTween.kill();

    rotationTween = gsap.to(button, {
      rotation: '+=360',
      duration: 2,
      repeat: -1,
      ease: 'linear',
      transformOrigin: '50% 50%',
      onUpdate: () => {
        const currentRotation = gsap.getProperty(button, 'rotation');
        gsap.set(char, { rotation: -currentRotation });
      }
    });

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

    gsap.to(button, {
      rotation: 0,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: () => {
        const currentRotation = gsap.getProperty(button, 'rotation');
        gsap.set(char, { rotation: -currentRotation });
      }
    });

    if (button.id !== 'about-button') {
      gsap.to(button, {
        backgroundColor: 'transparent',
        color: '#aaff55',
        duration: 0.2,
        ease: 'power1.in'
      });
    }
  });
});

// -----------------------------
// SUN HOVER-EFFEKT
// -----------------------------

const sunButton = document.getElementById('sun-button');
const sunShape = document.getElementById('sun-shape');
const sunPath = document.querySelector('#sun-shape path');

gsap.set(sunShape, { scale: 1.5, transformOrigin: '50% 50%' });

sunButton.addEventListener('mouseenter', () => {
  gsap.to(sunPath, {
    fill: '#ffd455',
    duration: 0.2,
    ease: 'power1.out'
  });

  gsap.to(sunShape, {
    scale: 1.7,
    duration: 0.2,
    ease: 'power1.out'
  });
});

sunButton.addEventListener('mouseleave', () => {
  gsap.to(sunPath, {
    fill: '#aaff55',
    duration: 0.2,
    ease: 'power1.in'
  });

  gsap.to(sunShape, {
    scale: 1.5,
    duration: 0.2,
    ease: 'power1.in'
  });
});



// -----------------------------
// ABOUT BUTTON TRANSITION
// -----------------------------

const aboutBtn = document.getElementById("about-button");
const aboutChar = aboutBtn.querySelector(".button-char");

aboutBtn.addEventListener("click", () => {
  gsap.set(aboutBtn, {
    backgroundColor: "#aaff55",
    color: "#000000",
    zIndex: 9999,
    position: "absolute",
    pointerEvents: "none"
  });

  gsap.set(aboutChar, { color: "#000000" });

  const aboutWrapper = aboutBtn.closest(".button-wrapper");
  const aboutLabel = aboutWrapper.querySelector(".label");

  const elementsToFade = Array.from(document.querySelectorAll("#iphone-frame .button-wrapper, #chernoff, #faces, #sun-button, #sun-label, #inner-outline"))
    .filter(el => el !== aboutWrapper);

  gsap.to(elementsToFade, {
    opacity: 0,
    pointerEvents: "none",
    duration: 0.5,
    ease: "power1.out"
  });

  if (aboutLabel) {
    gsap.to(aboutLabel, {
      opacity: 0,
      duration: 0.3,
      ease: "power1.out"
    });
  }

  const rect = aboutBtn.getBoundingClientRect();
  const targetX = window.innerWidth / 2 - rect.left - rect.width / 2;
  const targetY = window.innerHeight / 2 - rect.top - rect.height / 2;

  gsap.to(aboutBtn, {
    x: targetX,
    y: targetY,
    duration: 0.6,
    ease: "power2.out",
    onComplete: () => {
      gsap.to(aboutChar, {
        opacity: 0,
        duration: 0.3,
        ease: "sine.inOut"
      });

      gsap.to(aboutBtn, {
        scale: 40,
        duration: 1.0,
        ease: "power2.inOut",
        delay: 0.1,
        onComplete: () => {
          window.location.href = "about.html";
        }
      });
    }
  });
});

 
