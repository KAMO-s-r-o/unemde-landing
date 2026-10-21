import AOS from "aos";
import { DEFAULT_LANG, LANGS } from "../i18n/config";

let listenersBound = false;
let aosReady = false;
const journeyTimers: number[] = [];
const shotTimers: number[] = [];

function clearTimers(ids: number[]) {
  for (const id of ids) window.clearInterval(id);
  ids.length = 0;
}

function pathSegFromLocation(): string {
  return window.location.pathname.replace(/^\/(kk|en)(?=\/|$)/, "").replace(/^\//, "").replace(/\/$/, "");
}

function clientLocalePath(locale: string, pathSeg: string): string {
  if (locale === DEFAULT_LANG) return pathSeg ? `/${pathSeg}` : "/";
  return pathSeg ? `/${locale}/${pathSeg}` : `/${locale}`;
}

/** Header may persist across same-locale navigations — refresh lang URLs for the current page. */
function syncLangSwitchHrefs() {
  const pathSeg = pathSegFromLocation();
  document.querySelectorAll<HTMLAnchorElement>("#langMenu [data-lang]").forEach((a) => {
    const lang = a.dataset.lang;
    if (!lang || !(LANGS as readonly string[]).includes(lang)) return;
    a.setAttribute("href", clientLocalePath(lang, pathSeg));
  });
}

function syncActiveNav() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll("#navLinks a, footer nav a").forEach((link) => {
    const href = (link.getAttribute("href") ?? "").split("#")[0].replace(/\/$/, "") || "/";
    const current = href === path;
    if (current) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function closeNavMenu() {
  document.getElementById("navLinks")?.removeAttribute("data-open");
  document.getElementById("menuBtn")?.setAttribute("aria-expanded", "false");
}

function closeLangMenu() {
  const btn = document.getElementById("langBtn");
  const menu = document.getElementById("langMenu");
  btn?.setAttribute("aria-expanded", "false");
  if (menu) menu.hidden = true;
}

function closeHowSteps() {
  document.querySelectorAll("[data-how-step]").forEach((el) => el.removeAttribute("data-open"));
}

function initAppJourney() {
  clearTimers(journeyTimers);
  document.querySelectorAll<HTMLElement>("[data-app-journey]").forEach((root) => {
    const steps = [...root.querySelectorAll<HTMLElement>("[data-how-step]")];
    if (steps.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isPaused = () => root.matches(":hover, :focus-visible, :focus-within");

    const show = (index: number, smooth = true) => {
      for (const el of steps) el.toggleAttribute("data-open", el === steps[index]);
      const step = steps[index];
      const item = step.closest("li") ?? step;
      const rootBox = root.getBoundingClientRect();
      const itemBox = item.getBoundingClientRect();
      root.scrollTo({
        left: root.scrollLeft + (itemBox.left + itemBox.width / 2) - (rootBox.left + rootBox.width / 2),
        behavior: smooth ? "smooth" : "instant",
      });
    };

    let index = 0;
    show(index, false);

    const id = window.setInterval(() => {
      if (isPaused()) return;
      index = (index + 1) % steps.length;
      show(index);
    }, 2400);
    journeyTimers.push(id);
  });
}

function initShotCarousels() {
  clearTimers(shotTimers);
  document.querySelectorAll<HTMLElement>("[data-shot-carousel]").forEach((root) => {
    const slides = [...root.querySelectorAll<HTMLElement>("[data-shot]")];
    if (slides.length < 2) return;

    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === 0));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let index = 0;
    const isPaused = () => root.matches(":hover, :focus-visible, :focus-within");

    const id = window.setInterval(() => {
      if (isPaused()) return;
      slides[index].classList.remove("is-active");
      index = (index + 1) % slides.length;
      slides[index].classList.add("is-active");
    }, 1500);
    shotTimers.push(id);
  });
}

function toggleHowStep(step: HTMLElement) {
  const wasOpen = step.hasAttribute("data-open");
  closeHowSteps();
  if (wasOpen) {
    step.blur();
    return;
  }
  step.setAttribute("data-open", "");
  step.focus();
}

function openLangMenu() {
  const btn = document.getElementById("langBtn");
  const menu = document.getElementById("langMenu");
  if (!menu) return;
  btn?.setAttribute("aria-expanded", "true");
  menu.hidden = false;
  const active =
    menu.querySelector<HTMLElement>('[data-lang][aria-selected="true"]') ?? menu.querySelector("[data-lang]");
  active?.focus();
}

function toggleLangMenu() {
  const menu = document.getElementById("langMenu");
  if (menu?.hidden) openLangMenu();
  else closeLangMenu();
}

function focusLangOption(offset: number) {
  const options = [...document.querySelectorAll<HTMLElement>("#langMenu [data-lang]")];
  if (!options.length) return;
  const index = options.findIndex((el) => el === document.activeElement);
  const next = options[(index + offset + options.length) % options.length];
  next?.focus();
}

function bindListeners() {
  if (listenersBound) return;
  listenersBound = true;

  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    if (target.closest("#langBtn")) {
      toggleLangMenu();
      return;
    }

    const langOption = target.closest<HTMLElement>("#langMenu [data-lang]");
    if (langOption?.dataset.lang) {
      localStorage.setItem("unemde-lang", langOption.dataset.lang);
      closeLangMenu();
      return;
    }

    if (!target.closest("#langSwitch")) closeLangMenu();

    if (target.closest("#menuBtn")) {
      closeLangMenu();
      const links = document.getElementById("navLinks");
      const open = Boolean(links?.toggleAttribute("data-open"));
      document.getElementById("menuBtn")?.setAttribute("aria-expanded", String(open));
      return;
    }

    if (target.closest("#navLinks a")) {
      closeNavMenu();
    } else if (!target.closest("#navLinks")) {
      closeNavMenu();
    }

    const howStep = target.closest<HTMLElement>("[data-how-step]");
    if (howStep) {
      toggleHowStep(howStep);
      return;
    }
    closeHowSteps();

    const faqBtn = target.closest("[data-faq-item] > button");
    if (faqBtn) {
      const item = faqBtn.parentElement;
      if (!item) return;
      const wasOpen = item.hasAttribute("data-open");
      document.querySelectorAll("[data-faq-item]").forEach((el) => el.removeAttribute("data-open"));
      if (!wasOpen) item.setAttribute("data-open", "");
      return;
    }

    const chip = target.closest<HTMLElement>("[data-faq-filter]");
    if (chip) {
      const cat = chip.dataset.faqFilter;
      document.querySelectorAll("[data-faq-filter]").forEach((el) => {
        el.setAttribute("aria-pressed", String(el === chip));
      });
      let visible = 0;
      document.querySelectorAll<HTMLElement>("[data-faq-item]").forEach((item) => {
        const show = cat === "all" || item.dataset.cat === cat;
        item.hidden = !show;
        if (!show) item.removeAttribute("data-open");
        if (show) visible += 1;
      });
      const empty = document.getElementById("faqEmpty");
      if (empty) empty.hidden = visible > 0;
    }
  });

  document.addEventListener("keydown", (event) => {
    const menu = document.getElementById("langMenu");
    const open = Boolean(menu && !menu.hidden);

    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeLangMenu();
      document.getElementById("langBtn")?.focus();
      return;
    }

    if (event.key === "Escape") {
      closeNavMenu();
      const focusedStep = document.activeElement?.closest?.("[data-how-step]");
      closeHowSteps();
      if (focusedStep instanceof HTMLElement) focusedStep.blur();
    }

    const howStep = event.target instanceof HTMLElement ? event.target.closest("[data-how-step]") : null;
    if (howStep instanceof HTMLElement && howStep === event.target && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      toggleHowStep(howStep);
      return;
    }

    if (!open) {
      if ((event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") && document.activeElement?.id === "langBtn") {
        event.preventDefault();
        openLangMenu();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusLangOption(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusLangOption(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      document.querySelector<HTMLElement>("#langMenu [data-lang]")?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      const options = document.querySelectorAll<HTMLElement>("#langMenu [data-lang]");
      options[options.length - 1]?.focus();
    }
  });

  window.addEventListener(
    "scroll",
    () => {
      document.getElementById("nav")?.toggleAttribute("data-scrolled", window.scrollY > 8);
    },
    { passive: true },
  );
}

function onPageLoad() {
  syncActiveNav();
  syncLangSwitchHrefs();
  closeLangMenu();
  closeNavMenu();
  bindListeners();
  initShotCarousels();
  initAppJourney();
  if (!aosReady) {
    AOS.init({
      duration: 780,
      easing: "ease-out-cubic",
      offset: 72,
      once: false,
      disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
    aosReady = true;
  } else {
    AOS.refreshHard();
  }
  document.getElementById("nav")?.toggleAttribute("data-scrolled", window.scrollY > 8);
  const hashId = window.location.hash.slice(1);
  if (hashId) document.getElementById(hashId)?.scrollIntoView();
}

document.addEventListener("astro:before-swap", () => {
  clearTimers(journeyTimers);
  clearTimers(shotTimers);
  closeHowSteps();
});

document.addEventListener("astro:page-load", () => {
  onPageLoad();
});
