

gsap.registerPlugin(ScrollTrigger);

const canvas = document.getElementById("hero-lightpass");
const context = canvas.getContext("2d");

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  render();
});

const frameCount = 50;
const currentFrame = index =>
  `images/animation_stereo/${(index + 1).toString().padStart(4, '0')}.png`;

const images = [];
const animation = { frame: 0 };

for (let i = 0; i < frameCount; i++) {
  const img = new Image();
  img.src = currentFrame(i);
  images.push(img);
}
images[0].onload = render;

function render() {
  const index = Math.round(animation.frame);
  const img = images[Math.min(index, frameCount - 1)];
  if (img && img.complete && img.naturalWidth !== 0) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const canvasAspect = canvas.width / canvas.height;
    const imgAspect = img.naturalWidth / img.naturalHeight;

    let drawWidth, drawHeight;
    if (imgAspect > canvasAspect) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgAspect;
    } else {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgAspect;
    }

    const x = (canvas.width - drawWidth) / 2;
    const y = (canvas.height - drawHeight) / 2;
    context.drawImage(img, x, y, drawWidth, drawHeight);
  }
}

gsap.registerPlugin(ScrollTrigger);

gsap.to(stereo, {
  frame: frameCount - 1,
  snap: "frame",
  ease: "none",
  scrollTrigger: {
    trigger: "#scroll-area",
    start: "top top",
    end: "bottom bottom",
    scrub: 0.5,
    scroller: "#scroll-area" // << WICHTIG: das hier!
  },
  onUpdate: render
});

