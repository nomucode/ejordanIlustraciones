document.addEventListener("DOMContentLoaded", () => {
  const parallaxEl = document.querySelector("[data-parallax]");

  if (parallaxEl) {
    let ticking = false;
    let lastScrollY = 0;

    const updateParallax = () => {
      parallaxEl.style.transform = `translateY(${lastScrollY * 0.3}px)`;

      ticking = false;
    };

    window.addEventListener("scroll", () => {
      lastScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });
  }

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.2,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".animate-on-scroll").forEach((el) => {
    observer.observe(el);
  });
});
