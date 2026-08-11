/* ============================================================
   DEEPOWUD — main.js · v20260518
   IIFE pattern — sin ES modules — compatible con file:// y CDN
   ============================================================ */
(function () {
  "use strict";

  /* ----- Utilidad: envuelve cada init en try/catch ----- */
  function safe(fn, name) {
    try { fn(); }
    catch (e) { console.warn("[Deepowud:" + name + "]", e); }
  }

  /* ======================================================
     1. NAVBAR — transparente → sólido al hacer scroll
     ====================================================== */
  function initNavbar() {
    var navbar   = document.getElementById("navbar");
    var toggle   = document.getElementById("navToggle");
    var navLinks = document.getElementById("navLinks");

    if (!navbar) return;

    /* Scroll: añade clase .scrolled */
    function onScroll() {
      if (window.scrollY > 60) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* Hamburger mobile */
    if (toggle && navLinks) {
      toggle.addEventListener("click", function () {
        var isOpen = navLinks.classList.toggle("open");
        toggle.classList.toggle("active", isOpen);
        toggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    /* Cierra el menú al hacer clic en un link (mobile) */
    var links = navLinks ? navLinks.querySelectorAll("a.nav-link") : [];
    links.forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        toggle && toggle.classList.remove("active");
        toggle && toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ======================================================
     2. DROPDOWN "Empresa"
     ====================================================== */
  function initDropdown() {
    var trigger   = document.getElementById("dropdownTrigger");
    var menu      = document.getElementById("dropdownMenu");
    var container = trigger ? trigger.closest(".nav-item-dropdown") : null;

    if (!trigger || !menu || !container) return;

    function open() {
      container.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
    }
    function close() {
      container.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
    }
    function toggle() {
      container.classList.contains("open") ? close() : open();
    }

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      toggle();
    });

    /* Cierra al hacer clic fuera */
    document.addEventListener("click", function (e) {
      if (!container.contains(e.target)) close();
    });

    /* Cierra con Escape */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ======================================================
     3. MODAL BROCHURE
     ====================================================== */
  function initBrochureModal() {
    var openBtn   = document.getElementById("openBrochureBtn");
    var modal     = document.getElementById("brochureModal");
    var backdrop  = document.getElementById("modalBackdrop");
    var closeBtn  = document.getElementById("closeModal");
    var frame     = document.getElementById("brochureFrame");

    if (!openBtn || !modal || !backdrop) return;

    var pdfSrc = "assets/docs/brochure.pdf";
    var loaded = false;

    function openModal() {
      /* Carga el PDF solo una vez */
      if (!loaded && frame) {
        frame.src = pdfSrc;
        loaded = true;
      }
      modal.classList.add("open");
      backdrop.classList.add("open");
      document.body.style.overflow = "hidden";

      /* Cierra el dropdown */
      var dropdown = document.getElementById("dropdownTrigger");
      if (dropdown) {
        var container = dropdown.closest(".nav-item-dropdown");
        if (container) container.classList.remove("open");
      }
    }

    function closeModal() {
      modal.classList.remove("open");
      backdrop.classList.remove("open");
      document.body.style.overflow = "";
    }

    openBtn.addEventListener("click", openModal);
    if (closeBtn)  closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", closeModal);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }

  /* ======================================================
     4. SCROLL SUAVE PARA ANCHORS
     ====================================================== */
  function initSmoothScroll() {
    document.addEventListener("click", function (e) {
      var anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navOffset = 80;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - navOffset,
        behavior: "smooth"
      });
    });
  }

  /* ======================================================
     5. REVEAL ON SCROLL (IntersectionObserver)
     ====================================================== */
  function initReveals() {
    var elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var isRepeatable = entry.target.classList.contains("reveal-blur") ||
                           entry.target.classList.contains("reveal-scale");
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          if (!isRepeatable) io.unobserve(entry.target);
        } else if (isRepeatable) {
          entry.target.classList.remove("is-visible");
        }
      });
    }, { threshold: 0.04, rootMargin: "0px 0px -4% 0px" });

    elements.forEach(function (el, i) {
      /* Escalonado suave */
      el.style.transitionDelay = (i % 6) * 80 + "ms";
      io.observe(el);
    });

    /* Safety: a los 6s revela cualquier elemento aún oculto */
    setTimeout(function () {
      elements.forEach(function (el) {
        if (!el.classList.contains("is-visible") &&
            el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
        }
      });
    }, 6000);
  }

  /* ======================================================
     6. COUNTERS (estadísticas Acerca De)
     ====================================================== */
  function initCounters() {
    var counters = document.querySelectorAll("[data-count-to]");
    if (!counters.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el  = entry.target;
        var end = parseInt(el.getAttribute("data-count-to"), 10);
        var dur = 1400;
        var start = performance.now();

        function step(now) {
          var progress = Math.min((now - start) / dur, 1);
          var ease = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(ease * end);
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { io.observe(el); });
  }

  /* ======================================================
     7. FORMULARIO DE CONTACTO (FormSubmit AJAX)
     ====================================================== */
  function initContactForm() {
    var form        = document.getElementById("contactForm");
    var submitBtn   = document.getElementById("submitBtn");
    var success     = document.getElementById("formSuccess");
    var error       = document.getElementById("formError");
    var chipsGroup  = document.getElementById("chipsGroup");
    var chipsInput  = document.getElementById("fproductos");
    var chipsError  = document.getElementById("chipsError");
    var policyChk   = document.getElementById("fdatos");
    var policyError = document.getElementById("policyError");
    var policyLink  = document.getElementById("openPoliticaFromForm");

    if (!form) return;

    /* ── Chips toggle ───────────────────────────────────── */
    if (chipsGroup) {
      chipsGroup.addEventListener("click", function(e) {
        var chip = e.target.closest(".chip");
        if (!chip) return;
        chip.classList.toggle("selected");
        var selected = Array.from(chipsGroup.querySelectorAll(".chip.selected"))
                            .map(function(c) { return c.dataset.value; });
        if (chipsInput) chipsInput.value = selected.join(", ");
        if (chipsError) chipsError.style.display = selected.length ? "none" : "none";
      });
    }

    /* ── Checkbox habilita/deshabilita botón ────────────── */
    if (policyChk) {
      policyChk.addEventListener("change", function() {
        submitBtn.disabled = !policyChk.checked;
        if (policyError) policyError.style.display = "none";
      });
    }

    /* ── Link política desde el formulario ──────────────── */
    if (policyLink) {
      policyLink.addEventListener("click", function() {
        var openBtn = document.getElementById("openPoliticaBtn");
        if (openBtn) openBtn.click();
      });
    }

    /* ── Envío ──────────────────────────────────────────── */
    form.addEventListener("submit", function(e) {
      e.preventDefault();

      /* Validar chips */
      var selectedChips = chipsInput ? chipsInput.value : "";
      if (!selectedChips) {
        if (chipsError) chipsError.style.display = "block";
        chipsGroup && chipsGroup.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      /* Validar checkbox política */
      if (!policyChk || !policyChk.checked) {
        if (policyError) policyError.style.display = "block";
        return;
      }

      /* Validar campos nativos */
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      /* Estado enviando */
      var btnText    = submitBtn.querySelector(".btn-text");
      var btnSending = submitBtn.querySelector(".btn-sending");
      submitBtn.disabled  = true;
      if (btnText)    btnText.style.display    = "none";
      if (btnSending) btnSending.style.display = "inline";
      if (success)    success.style.display    = "none";
      if (error)      error.style.display      = "none";

      var formData = {
        name:      form.querySelector('[name="name"]')     ? form.querySelector('[name="name"]').value     : "",
        empresa:   form.querySelector('[name="empresa"]')  ? form.querySelector('[name="empresa"]').value  : "",
        email:     form.querySelector('[name="email"]')    ? form.querySelector('[name="email"]').value    : "",
        phone:     form.querySelector('[name="phone"]')    ? form.querySelector('[name="phone"]').value    : "",
        productos: selectedChips,
        cantidad:  form.querySelector('[name="cantidad"]') ? form.querySelector('[name="cantidad"]').value : "",
        message:   form.querySelector('[name="message"]')  ? form.querySelector('[name="message"]').value  : "",
        politica_aceptada: "Sí"
      };

      /* ── Registro de consentimiento (Ley 1581/2012) ─────
         Obtiene IP del visitante y guarda en localStorage   */
      function saveConsent(ip) {
        var record = {
          timestamp:         new Date().toISOString(),
          ip:                ip || "desconocida",
          politica_aceptada: true,
          nombre:            formData.name,
          email:             formData.email,
          empresa:           formData.empresa,
          telefono:          formData.phone
        };
        try {
          var log = JSON.parse(localStorage.getItem("depowud_consent_log") || "[]");
          log.push(record);
          localStorage.setItem("depowud_consent_log", JSON.stringify(log));
        } catch(err) { /* storage no disponible */ }
        formData._consent_timestamp = record.timestamp;
        formData._consent_ip        = record.ip;
      }

      function sendForm(ip) {
        saveConsent(ip);
        fetch("https://formsubmit.co/ajax/contacto@depowud.com", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(formData)
        })
        .then(function(res) { return res.json(); })
        .then(function(json) {
          if (json.success === "true" || json.success === true) {
            if (success) success.style.display = "block";
            form.reset();
            /* Limpiar chips visualmente */
            if (chipsGroup) chipsGroup.querySelectorAll(".chip.selected").forEach(function(c){ c.classList.remove("selected"); });
            if (chipsInput) chipsInput.value = "";
          } else {
            if (error) error.style.display = "block";
          }
        })
        .catch(function() { if (error) error.style.display = "block"; })
        .finally(function() {
          submitBtn.disabled = !policyChk.checked;
          if (btnText)    btnText.style.display    = "inline";
          if (btnSending) btnSending.style.display = "none";
        });
      }

      /* Intenta obtener IP; si falla en 2s continúa igual */
      var ipTimeout = setTimeout(function() { sendForm(null); }, 2000);
      fetch("https://api.ipify.org?format=json")
        .then(function(r) { return r.json(); })
        .then(function(d) { clearTimeout(ipTimeout); sendForm(d.ip); })
        .catch(function()  { clearTimeout(ipTimeout); sendForm(null); });
    });
  }

  /* ======================================================
     8. SCROLL ACTIVO EN NAVBAR (resalta sección actual)
     ====================================================== */
  function initActiveNav() {
    var sections = document.querySelectorAll("section[id], footer[id]");
    var navLinks = document.querySelectorAll(".nav-link[href^='#']");
    if (!sections.length || !navLinks.length) return;

    function update() {
      var scrollY = window.scrollY + 100;
      var current = "";
      sections.forEach(function (sec) {
        if (sec.offsetTop <= scrollY) current = sec.id;
      });
      navLinks.forEach(function (link) {
        var href = link.getAttribute("href").replace("#", "");
        link.classList.toggle("active-link", href === current);
      });
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ======================================================
     9. HERO LOCK — congela las animaciones de entrada del hero
        para que el word-cycle nunca las vuelva a disparar
     ====================================================== */
  function initHeroLock() {
    var els = document.querySelectorAll(
      '.hero-kicker, .hero-title, .hero-sub, .hero-ctas, .hero-scroll'
    );
    /* La animación más tardía termina a los ~1.8 s (delay 1s + dur 0.8s).
       A los 2.2 s les quitamos animation y fijamos el estado final. */
    setTimeout(function () {
      els.forEach(function (el) {
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
        el.style.animation = 'none';
      });
    }, 2200);
  }

  /* ======================================================
     10. WORD CYCLE — palabra giratoria en el hero
     ====================================================== */
  function initWordCycle() {
    var words   = ['Confiable.', 'Eficiente.', 'Sin Igual.'];
    var idx     = 0;
    var el      = document.getElementById('wordCycle');
    if (!el) return;

    var wrapper = el.parentElement;

    /* Fija el ancho del wrapper al ancho real de "Certificada"
       (la palabra más larga) para que ningún cambio desplace el layout */
    function lockWidth() {
      var prev = el.textContent;
      el.textContent = 'Confiable.';   /* mide con punto — igual que el resto */
      var w = el.getBoundingClientRect().width;
      if (w > 0) wrapper.style.minWidth = w + 'px';
      el.textContent = prev;             /* restaura el texto que había */
    }
    lockWidth();

    /* Recalcula si la ventana cambia de tamaño (font-size es responsive) */
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(lockWidth, 150);
    });

    function swap() {
      el.classList.remove('anim-in');
      el.classList.add('anim-out');

      setTimeout(function () {
        idx = (idx + 1) % words.length;
        el.textContent = words[idx];
        el.classList.remove('anim-out');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            el.classList.add('anim-in');
          });
        });
      }, 320);
    }

    /* Primera rotación a los 3.5 s, luego cada 3.5 s */
    setInterval(swap, 3500);
  }

  /* ======================================================
     10. HOVER CARDS — elevación suave (sin JS, es CSS)
         Solo registramos el listener de la imagen del hero
         para añadir un leve parallax interno
     ====================================================== */
  function initHeroParallax() {
    var heroEl = document.querySelector(".hero-video") || document.querySelector(".hero-img img");
    if (!heroEl) return;
    if (window.matchMedia("(max-width: 768px)").matches) return;

    window.addEventListener("scroll", function () {
      var shift = window.scrollY * 0.25;
      heroEl.style.transform = "translateY(" + shift + "px) scale(1.04)";
    }, { passive: true });
  }

  /* ======================================================
     BOOT
     ====================================================== */
  function boot() {
    safe(initNavbar,       "initNavbar");
    safe(initDropdown,     "initDropdown");
    safe(initBrochureModal,"initBrochureModal");
    safe(initSmoothScroll, "initSmoothScroll");
    safe(initReveals,      "initReveals");
    safe(initCounters,     "initCounters");
    safe(initContactForm,  "initContactForm");
    safe(initActiveNav,    "initActiveNav");
    safe(initHeroLock,     "initHeroLock");
    safe(initWordCycle,    "initWordCycle");
    safe(initHeroParallax, "initHeroParallax");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
