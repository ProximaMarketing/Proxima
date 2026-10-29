(() => {
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress");
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  const form = document.querySelector("#applicationForm");
  const submitButton = document.querySelector("#submitButton");
  const status = document.querySelector("#formStatus");
  const currentYear = document.querySelector("#currentYear");
  const scriptUrl = "https://script.google.com/macros/s/AKfycbwdbsCxqpj2l8xlcs9AzkHiYH5txcJfg3VkHI2OePnEGVMVXFUKAOvr6iWX_pkd1NA/exec";

  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  let ticking = false;
  const updateScrollUI = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const scrollRatio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    if (progress) progress.style.width = (scrollRatio * 100) + "%";
    if (header) header.classList.toggle("scrolled", window.scrollY > 18);
    syncPlanetFromScroll();
    updateSolarSystem();
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollUI);
      ticking = true;
    }
  }, { passive: true });
  const solarSystem = document.querySelector("#solarSystem");
  const planetLinks = Array.from(document.querySelectorAll(".planet-link"));
  const solarStatus = document.querySelector("#solarStatus");
  const solarChapterNumber = document.querySelector("#solarChapterNumber");
  const mobileKeyLinks = Array.from(document.querySelectorAll(".solar-key-link"));
  planetLinks.forEach(link => {
    const body = link.querySelector(".planet-body");
    if (body) body.addEventListener("animationend", event => {
      if (event.animationName === "planet-arrival") link.classList.remove("is-zooming");
    });
  });
  const journeySections = planetLinks.map(link => ({
    link,
    id: link.dataset.target,
    target: document.getElementById(link.dataset.target),
    label: link.querySelector(".planet-label")?.textContent.trim() || "Subject area"
  })).filter(item => item.target);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const solarGuide = document.querySelector(".solar-guide");
  const briefing = document.querySelector("#solarBriefing");
  const briefingIndex = document.querySelector("#solarBriefingIndex");
  const briefingTitle = document.querySelector("#solarBriefingTitle");
  const briefingCopy = document.querySelector("#solarBriefingCopy");
  const briefingMeta = document.querySelector("#solarBriefingMeta");
  const chapterContent = {
    approach: { title: "A direction of your own.", copy: "Identity, content and release strategy, connected around what makes you different.", meta: "A clear direction · A connected plan" },
    identity: { title: "Artist identity", copy: "Clarify what makes you distinct, then give it a consistent creative direction.", meta: "Positioning · Visual direction" },
    release: { title: "Release strategy", copy: "Plan the build-up, release and follow-through before the moment arrives.", meta: "Planning · Campaign structure" },
    content: { title: "Content direction", copy: "Build content around your sound, not the algorithm of the week.", meta: "Creative direction · Content" },
    audience: { title: "Audience development", copy: "Find the people your music speaks to and give them a reason to stay.", meta: "Discovery · Audience growth" },
    process: { title: "Find the signal. Follow it forward.", copy: "We listen to your music, find the focus, build a practical plan, then learn and evolve with you.", meta: "Listen · Focus · Plan · Evolve" }
  };
  let activePlanetIndex = -1;

  const updateSolarSystem = () => {
    if (!solarSystem) return;
    // The selected planet is always brought to the same focal point.
    // Rotation changes once per chapter, so the orbit glides instead of jittering with every scroll tick.
    const rotation = activePlanetIndex < 0
      ? 0
      : 90 - activePlanetIndex * 360 / Math.max(1, planetLinks.length);
    solarSystem.style.setProperty("--solar-rotation", rotation + "deg");
    const orbitRadius = Math.min(solarSystem.clientWidth, solarSystem.clientHeight) * 0.365;
    planetLinks.forEach((link, index) => {
      const angle = (index / planetLinks.length) * Math.PI * 2 - Math.PI / 2 + rotation * Math.PI / 180;
      link.style.setProperty("--x", (Math.cos(angle) * orbitRadius).toFixed(2) + "px");
      link.style.setProperty("--y", (Math.sin(angle) * orbitRadius * 0.82).toFixed(2) + "px");
      link.classList.toggle("label-left", Math.cos(angle) < -0.18);
    });
  };
  window.addEventListener("resize", updateScrollUI, { passive: true });

  const setActivePlanet = id => {
    const index = journeySections.findIndex(item => item.id === id);
    if (index < 0) return;
    const changed = activePlanetIndex !== index;
    activePlanetIndex = index;
    journeySections.forEach((item, itemIndex) => {
      const isActive = itemIndex === index;
      item.link.classList.toggle("is-active", isActive);
      if (isActive) item.link.setAttribute("aria-current", "location");
      else item.link.removeAttribute("aria-current");
    });
    mobileKeyLinks.forEach(link => {
      if (link.dataset.target === id) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    if (solarStatus) solarStatus.textContent = "Exploring: " + journeySections[index].label;
    if (solarChapterNumber) solarChapterNumber.textContent = String(index + 1).padStart(2, "0");
    const content = chapterContent[id];
    if (content && briefing && briefingTitle && briefingCopy && briefingMeta) {
      if (changed) {
        briefing.hidden = true;
        void briefing.offsetWidth;
      }
      briefing.hidden = false;
      briefingTitle.textContent = content.title;
      briefingCopy.textContent = content.copy;
      briefingMeta.textContent = content.meta;
      if (briefingIndex) briefingIndex.textContent = String(index + 1).padStart(2, "0") + " / 06";
    }
    if (solarGuide) {
      solarGuide.classList.add("has-active-planet");
      solarGuide.classList.remove("is-ended");
    }
    document.body.classList.remove("journey-complete");
    updateSolarSystem();
    if (changed && !reducedMotion) {
      const link = journeySections[index].link;
      link.classList.remove("is-zooming");
      void link.offsetWidth;
      link.classList.add("is-zooming");
    }
  };

  const endPlanetJourney = () => {
    document.body.classList.add("journey-complete");
    if (solarGuide) solarGuide.classList.add("is-ended");
  };

  if (briefing) briefing.hidden = true;
  if (solarGuide) solarGuide.classList.remove("has-active-planet");
  let pendingNavigationId = null;
  let pendingNavigationDirection = null;
  const travelToPlanet = id => {
    const target = document.getElementById(id);
    if (!target) return;
    const targetDocumentTop = target.getBoundingClientRect().top + window.scrollY;
    pendingNavigationId = id;
    pendingNavigationDirection = targetDocumentTop > window.scrollY + 1 ? "down" : targetDocumentTop < window.scrollY - 1 ? "up" : "here";
    setActivePlanet(id);
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };
  planetLinks.forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    travelToPlanet(link.dataset.target);
  }));
  mobileKeyLinks.forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    travelToPlanet(link.dataset.target);
  }));
  const cancelPendingNavigation = () => {
    pendingNavigationId = null;
    pendingNavigationDirection = null;
  };
  window.addEventListener("wheel", cancelPendingNavigation, { passive: true });
  window.addEventListener("touchmove", cancelPendingNavigation, { passive: true });

  const clearActivePlanet = () => {
    activePlanetIndex = -1;
    journeySections.forEach(item => {
      item.link.classList.remove("is-active", "is-zooming");
      item.link.removeAttribute("aria-current");
    });
    mobileKeyLinks.forEach(link => link.removeAttribute("aria-current"));
    if (briefing) briefing.hidden = true;
    if (solarGuide) solarGuide.classList.remove("has-active-planet", "is-ended");
    document.body.classList.remove("journey-complete");
    if (solarStatus) solarStatus.textContent = "Scroll to travel between worlds.";
    if (solarChapterNumber) solarChapterNumber.textContent = "01";
    updateSolarSystem();
  };

  const syncPlanetFromScroll = () => {
    if (!journeySections.length) return;
    const switchLine = window.scrollY + window.innerHeight * 0.32;
    const topOf = target => target.getBoundingClientRect().top + window.scrollY;
    const fitTarget = document.getElementById("fit");
    const fitTop = fitTarget ? topOf(fitTarget) : Number.POSITIVE_INFINITY;

    if (pendingNavigationId) {
      const pendingTarget = document.getElementById(pendingNavigationId);
      const targetViewportTop = pendingTarget ? pendingTarget.getBoundingClientRect().top : 0;
      if (pendingTarget && pendingNavigationDirection === "down" && targetViewportTop > window.innerHeight * 0.32) return;
      if (pendingTarget && pendingNavigationDirection === "up" && targetViewportTop < 0) return;
      pendingNavigationId = null;
      pendingNavigationDirection = null;
    }

    // Process is the final planet. Once the following artist-fit chapter arrives, hand over to the normal page.
    if (switchLine >= fitTop) {
      endPlanetJourney();
      return;
    }

    if (switchLine < topOf(journeySections[0].target)) {
      if (activePlanetIndex !== -1 || document.body.classList.contains("journey-complete")) clearActivePlanet();
      return;
    }

    let selectedIndex = 0;
    for (let i = 1; i < journeySections.length; i += 1) {
      if (topOf(journeySections[i].target) <= switchLine) selectedIndex = i;
      else break;
    }

    if (
      selectedIndex !== activePlanetIndex ||
      document.body.classList.contains("journey-complete") ||
      (solarGuide && solarGuide.classList.contains("is-ended"))
    ) {
      setActivePlanet(journeySections[selectedIndex].id);
    }
  };

  updateSolarSystem();
  updateScrollUI();

  const closeMenu = () => {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  };
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      menuToggle.setAttribute("aria-label", willOpen ? "Close navigation" : "Open navigation");
      nav.classList.toggle("is-open", willOpen);
      document.body.classList.toggle("menu-open", willOpen);
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  if (!form || !submitButton || !status) return;
  const setStatus = (message, kind) => {
    status.textContent = message;
    status.className = "form-status is-visible " + (kind === "success" ? "is-success" : "is-error");
  };
  const clearStatus = () => {
    status.textContent = "";
    status.className = "form-status";
  };
  const requiredFields = Array.from(form.querySelectorAll("[required]"));
  requiredFields.forEach(field => {
    field.addEventListener("input", () => {
      field.removeAttribute("aria-invalid");
      if (field.checkValidity()) clearStatus();
    });
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    clearStatus();
    requiredFields.forEach(field => field.removeAttribute("aria-invalid"));
    const invalid = requiredFields.find(field => !field.checkValidity());
    if (invalid) {
      invalid.setAttribute("aria-invalid", "true");
      invalid.reportValidity();
      setStatus("Please check the highlighted required fields and try again.", "error");
      invalid.focus();
      return;
    }

    const originalButton = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = "<span>Sending application…</span><span aria-hidden=\"true\">···</span>";
    submitButton.setAttribute("aria-busy", "true");
    try {
      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: new URLSearchParams(new FormData(form)),
        redirect: "follow"
      });
      if (!response.ok) throw new Error("The application service returned an error.");
      const result = await response.json();
      if (result && result.success === true) {
        form.reset();
        setStatus("Application received. Thank you for telling us about your project. We aim to respond within 3–5 business days.", "success");
        status.focus();
      } else {
        throw new Error("The application service did not confirm receipt.");
      }
    } catch (error) {
      console.error("PROXIMA application submission:", error);
      setStatus("We couldn’t confirm that your application was received. Your information may not have been sent. Please try again shortly. If this keeps happening, let us know through the channel you used to find PROXIMA.", "error");
      status.focus();
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButton;
      submitButton.removeAttribute("aria-busy");
    }
  });
})();