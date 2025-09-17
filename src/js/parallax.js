document.addEventListener("DOMContentLoaded", () => {
  const parallaxEl = document.querySelector("[data-parallax]");

  if (parallaxEl) {
    window.addEventListener("scroll", () => {
      const scrollPosition = window.scrollY;
      parallaxEl.style.transform = `translateY(${scrollPosition * 0.3}px)`;
    });
  }
});
