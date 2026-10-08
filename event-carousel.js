(() => {
  const config = window.REBEL_EVENTS;
  const grid = document.getElementById("events-grid");
  if (!config || !grid) return;
  const safeUrl = value => {
    try {
      const url = new URL(value, window.location.href);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch { return ""; }
  };
  for (const event of config.events.filter(event => event.visible !== false)) {
    const card = document.createElement("article");
    card.className = "event-card";
    const img = document.createElement("img");
    img.className = "event-img";
    img.src = safeUrl(event.image);
    img.alt = event.title;
    img.loading = "lazy";
    const title = document.createElement("h2");
    title.className = "event-name";
    title.textContent = event.title;
    const waitlist = event.status === "waitlist";
    const url = safeUrl(event.url || (waitlist ? config.waitlistUrl : config.bookUrl));
    const action = document.createElement(url ? "a" : "button");
    action.className = "event-action";
    action.textContent = waitlist ? "JOIN WAITLIST" : "BOOK";
    if (url) {
      action.href = url;
      action.target = "_blank";
      action.rel = "noopener noreferrer";
      action.setAttribute("aria-label", action.textContent + " — " + event.title);
    } else {
      action.type = "button";
      action.disabled = true;
    }
    card.append(img, title, action);
    if (!url) {
      const note = document.createElement("p");
      note.className = "event-note";
      note.textContent = waitlist ? "Waitlist opening soon." : "Booking opening soon.";
      card.append(note);
    }
    grid.append(card);
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const move = direction => {
    const card = grid.firstElementChild;
    if (!card) return;
    const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(grid).gap);
    const max = grid.scrollWidth - grid.clientWidth;
    const next = grid.scrollLeft + direction * step;
    grid.scrollTo({left: next > max + 2 ? 0 : next < -2 ? max : next, behavior: reduced.matches ? "instant" : "smooth"});
  };
  document.getElementById("events-prev").addEventListener("click", () => move(-1));
  document.getElementById("events-next").addEventListener("click", () => move(1));
  grid.addEventListener("keydown", event => {
    if (event.target !== grid) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    }
  });
  // Desktop automatically advances one tablet at a time; mobile keeps swipe controls.
  const desktop = window.matchMedia("(min-width: 761px)");
  const carousel = grid.closest(".events");
  let resumeAfter = 0;
  const pauseAfterInteraction = () => { resumeAfter = Date.now() + 7000; };
  for (const eventName of ["pointerdown", "wheel", "keydown"]) {
    carousel.addEventListener(eventName, pauseAfterInteraction, {passive: true});
  }
  window.setInterval(() => {
    if (!desktop.matches || reduced.matches || document.hidden) return;
    if (Date.now() < resumeAfter || carousel.matches(":hover") || carousel.matches(":focus-within")) return;
    const bounds = carousel.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
    move(1);
  }, 3500);

})();
