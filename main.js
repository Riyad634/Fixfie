(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  var yearEl = document.getElementById("year");
  // var form = document.getElementById("contact-form");
  var toast = document.getElementById("toast");
  var filterButtons = document.querySelectorAll(".filter-btn");
  var cards = document.querySelectorAll(".card[data-category]");
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-nav a[href^="#"]');

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function closeMenu() {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  }

  function openMenu() {
    if (!toggle || !mobileNav) return;
    toggle.setAttribute("aria-expanded", "true");
    mobileNav.classList.add("is-open");
    document.body.classList.add("nav-open");
  }

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  var lightSections = ["about", "work", "proof"];

  function updateHeader() {
    if (!header) return;
    var scrolled = window.scrollY > 24;
    header.classList.toggle("is-scrolled", scrolled);

    var light = false;
    lightSections.forEach(function (id) {
      var section = document.getElementById(id);
      if (!section) return;
      var rect = section.getBoundingClientRect();
      if (rect.top <= 84 && rect.bottom > 84) {
        light = true;
      }
    });
    header.classList.toggle("is-light", light && !scrolled ? true : light);
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach(function (el) {
    observer.observe(el);
  });

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 4200);
  }

  function setFieldError(field, message) {
    var wrap = field.closest(".field");
    var error = wrap ? wrap.querySelector(".error-text") : null;
    if (wrap) wrap.classList.toggle("is-invalid", Boolean(message));
    if (error) error.textContent = message || "";
    field.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  if (form) {
    var fields = {
      name: form.querySelector("#name"),
      email: form.querySelector("#email"),
      company: form.querySelector("#company"),
      industry: form.querySelector("#industry"),
      message: form.querySelector("#message")
    };

    function validateField(input) {
      var value = (input.value || "").trim();
      if (input.hasAttribute("required") && !value) {
        setFieldError(input, "This field is required.");
        return false;
      }
      if (input.type === "email" && value && !isEmail(value)) {
        setFieldError(input, "Enter a valid work email.");
        return false;
      }
      if (input.id === "message" && value.length < 20) {
        setFieldError(input, "Please share at least 20 characters.");
        return false;
      }
      setFieldError(input, "");
      return true;
    }

    Object.keys(fields).forEach(function (key) {
      var input = fields[key];
      if (!input) return;
      input.addEventListener("blur", function () {
        validateField(input);
      });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("is-invalid")) {
          validateField(input);
        }
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var firstInvalid = null;
      var valid = true;

      Object.keys(fields).forEach(function (key) {
        var input = fields[key];
        if (!input) return;
        var ok = validateField(input);
        if (!ok && !firstInvalid) firstInvalid = input;
        valid = valid && ok;
      });

      var status = form.querySelector(".form-status");
      var submit = form.querySelector('button[type="submit"]');

      if (!valid) {
        if (status) {
          status.textContent = "Please correct the highlighted fields.";
          status.className = "form-status error";
        }
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      submit.disabled = true;
      submit.textContent = "Sending...";
      if (status) {
        status.textContent = "";
        status.className = "form-status";
      }

      window.setTimeout(function () {
        submit.disabled = false;
        submit.textContent = "Book a discovery call";
        form.reset();
        Object.keys(fields).forEach(function (key) {
          if (fields[key]) setFieldError(fields[key], "");
        });
        if (status) {
          status.textContent = "Request received. A strategist will reply within one business day.";
          status.className = "form-status success";
        }
        showToast("Discovery request sent. We will reply within one business day.");
      }, 900);
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var category = button.getAttribute("data-filter");
      filterButtons.forEach(function (btn) {
        btn.classList.toggle("is-active", btn === button);
        btn.setAttribute("aria-pressed", btn === button ? "true" : "false");
      });
      cards.forEach(function (card) {
        var match = category === "all" || card.getAttribute("data-category") === category;
        card.hidden = !match;
      });
    });
  });
})();
