
  const fromLanding = sessionStorage.getItem("transitionFrom") === "about";
  const aboutBtn = document.querySelector(".button-wrapper:nth-child(1)");
  const button = aboutBtn.querySelector("button");

  if (fromLanding) {
    sessionStorage.removeItem("transitionFrom");

    const rect = aboutBtn.getBoundingClientRect();
    const centerX = window.innerWidth / 2 - rect.width / 2;
    const centerY = window.innerHeight / 2 - rect.height / 2;

    gsap.set(aboutBtn, {
      x: centerX - rect.left,
      y: centerY - rect.top,
      scale: 2,
      opacity: 1
    });

    gsap.to(aboutBtn, {
      x: 0,
      y: 0,
      scale: 1,
      delay: 0.1,
      duration: 0.8,
      ease: "power3.out"
    });

    gsap.fromTo("#content", { opacity: 0 }, {
      opacity: 1,
      delay: 0.5,
      duration: 0.5
    });
  }