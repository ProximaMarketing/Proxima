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
    if (progress) progress.style.width = (scrollable > 0 ? window.scrollY / scrollable * 100 : 0) + "%";
    if (header) header.classList.toggle("scrolled", window.scrollY > 18);
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollUI);
      ticking = true;
    }
  }, { passive: true });
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