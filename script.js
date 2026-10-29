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
    updatePlanetAnnotation();
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
  const annotation = document.querySelector("#planetAnnotation");
  const leaderPath = document.querySelector("#planetLeader");
  const anchorRing = document.querySelector("#planetAnchorRing");
  const anchorDot = document.querySelector("#planetAnchorDot");
  const leaderEnd = document.querySelector("#planetLeaderEnd");
  // Stable but different anchor points make each subject feel individually mapped.
  const anchorProfiles = {
    approach: { desktop: 158, mobile: 72, targetX: .24, targetY: .23 },
    identity: { desktop: 188, mobile: 108, targetX: .76, targetY: .40 },
    release: { desktop: 205, mobile: 58, targetX: .32, targetY: .58 },
    content: { desktop: 169, mobile: 126, targetX: .68, targetY: .31 },
    audience: { desktop: 195, mobile: 91, targetX: .49, targetY: .65 },
    process: { desktop: 216, mobile: 62, targetX: .23, targetY: .77 }
  };
  const chapterContent = {
    approach: { title: "A direction of your own.", copy: "One connected plan for your identity, releases and content — built around what makes your music different.", meta: "01 — Find your direction" },
    identity: { title: "Make your difference recognisable.", copy: "Clarify your sound, story and visual world, so every part of your presence feels unmistakably yours.", meta: "02 — Define your identity" },
    release: { title: "Give every release a reason to travel.", copy: "Turn a release date into a campaign: build anticipation, plan the moments around launch, and keep the story moving afterwards.", meta: "03 — Build release momentum" },
    content: { title: "Make content sound and feel like you.", copy: "Create a repeatable creative direction for short-form content without chasing every trend or starting from a blank page each time.", meta: "04 — Create with intention" },
    audience: { title: "Reach the people who get it.", copy: "Learn what resonates, recognise the signals in your performance, and build a stronger connection with the listeners most likely to stay.", meta: "05 — Grow real connection" },
    process: { title: "Find the signal. Follow it forward.", copy: "Bring the moving parts together, choose the next practical step, then learn from the results and evolve the plan with purpose.", meta: "06 — Learn, refine, repeat" }
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
  const updatePlanetAnnotation = () => {
    if (!annotation || !leaderPath || activePlanetIndex < 0 || !briefing || briefing.hidden ||
        (solarGuide && (solarGuide.classList.contains("is-ended") || !solarGuide.classList.contains("has-active-planet")))) {
      if (annotation) annotation.classList.remove("is-drawn");
      return;
    }

    const current = journeySections[activePlanetIndex];
    const profile = current && anchorProfiles[current.id];
    const body = current && current.link.querySelector(".planet-body");
    if (!profile || !body) return;

    const planet = body.getBoundingClientRect();
    const card = briefing.getBoundingClientRect();
    if (!planet.width || !planet.height || !card.width || !card.height) return;

    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const angle = (mobile ? profile.mobile : profile.desktop) * Math.PI / 180;
    const sx = planet.left + planet.width / 2 + Math.cos(angle) * planet.width * .46;
    const sy = planet.top + planet.height / 2 + Math.sin(angle) * planet.height * .46;
    let tx, ty, path;
    if (mobile) {
      // Land on a different point along the card's top edge for each planet.
      tx = card.left + card.width * profile.targetX;
      ty = card.top + 1;
      const spanY = Math.max(24, ty - sy);
      const c1x = sx + (tx - sx) * .12;
      const c1y = sy + spanY * .58;
      const c2x = tx - (tx - sx) * .12;
      const c2y = ty - spanY * .28;
      path = "M " + sx.toFixed(1) + " " + sy.toFixed(1) +
        " C " + c1x.toFixed(1) + " " + c1y.toFixed(1) +
        ", " + c2x.toFixed(1) + " " + c2y.toFixed(1) +
        ", " + tx.toFixed(1) + " " + ty.toFixed(1);
    } else {
      // On desktop, the annotation connects the planet's left rim to the glass panel's right edge.
      tx = card.right - 1;
      ty = card.top + Math.min(card.height - 26, Math.max(80, card.height * profile.targetY));
      const spanX = Math.max(24, sx - tx);
      const c1x = sx - spanX * .28;
      const c2x = tx + spanX * .24;
      path = "M " + sx.toFixed(1) + " " + sy.toFixed(1) +
        " C " + c1x.toFixed(1) + " " + sy.toFixed(1) +
        ", " + c2x.toFixed(1) + " " + ty.toFixed(1) +
        ", " + tx.toFixed(1) + " " + ty.toFixed(1);
    }

    annotation.setAttribute("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight);
    leaderPath.setAttribute("d", path);
    [[anchorRing, sx, sy], [anchorDot, sx, sy], [leaderEnd, tx, ty]].forEach(([node, x, y]) => {
      if (!node) return;
      node.setAttribute("cx", x.toFixed(1));
      node.setAttribute("cy", y.toFixed(1));
    });
  };

  const animatePlanetAnnotation = () => {
    if (!annotation || !leaderPath) return;
    annotation.classList.remove("is-drawn");
    updatePlanetAnnotation();
    requestAnimationFrame(() => {
      updatePlanetAnnotation();
      annotation.classList.add("is-drawn");
    });
    if (reducedMotion) return;
    const started = performance.now();
    const followTransition = now => {
      updatePlanetAnnotation();
      if (now - started < 820 && activePlanetIndex >= 0) requestAnimationFrame(followTransition);
    };
    requestAnimationFrame(followTransition);
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
    document.body.classList.add("journey-started");
    if (solarGuide) {
      solarGuide.classList.add("has-active-planet");
      solarGuide.classList.remove("is-ended");
    }
    document.body.classList.remove("journey-complete");
    updateSolarSystem();
    updatePlanetAnnotation();
    if (changed) animatePlanetAnnotation();
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
    if (annotation) annotation.classList.remove("is-drawn");
  };

  if (briefing) briefing.hidden = true;
  if (solarGuide) solarGuide.classList.remove("has-active-planet");
  document.querySelectorAll('a[href="#journey"], a[href="#approach"]').forEach(link => {
    link.addEventListener("click", () => document.body.classList.add("journey-started"));
  });
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
    document.body.classList.remove("journey-complete", "journey-started");
    if (solarStatus) solarStatus.textContent = "Scroll to travel between worlds.";
    if (solarChapterNumber) solarChapterNumber.textContent = "01";
    if (annotation) annotation.classList.remove("is-drawn");
    updateSolarSystem();
    updatePlanetAnnotation();
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

    // Begin the hand-off as soon as the next section enters the lower edge of the viewport.
    // This lets the galaxy disappear before the following section's heading reaches the briefing panel.
    const fitViewportTop = fitTarget ? fitTarget.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
    if (fitViewportTop <= window.innerHeight * 0.92) {
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