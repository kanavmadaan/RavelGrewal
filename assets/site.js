'use strict';
const toggle=document.querySelector('.nav-toggle'),nav=document.getElementById('navlinks');if(toggle&&nav){const close=()=>{toggle.setAttribute('aria-expanded','false');nav.classList.remove('open')};toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));nav.classList.toggle('open',!open)});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));document.addEventListener('keydown',e=>{if(e.key==='Escape')close()})}
document.querySelectorAll('.ticker-toggle').forEach(b=>b.addEventListener('click',()=>{const paused=b.getAttribute('aria-pressed')==='true';b.setAttribute('aria-pressed',String(!paused));b.setAttribute('aria-label',paused?'Pause moving banner':'Resume moving banner');b.textContent=paused?'Ⅱ':'▶'}));document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());const q=new URLSearchParams(location.search);for(const name of ['source','utm_campaign','utm_medium']){const val=q.get(name==='source'?'utm_source':name);if(val)document.querySelectorAll(`input[name="${name}"]`).forEach(el=>el.value=val.slice(0,150))}

const requestedService=q.get('service');const serviceSelect=document.querySelector('select[name="service"]');if(requestedService&&serviceSelect&&Array.from(serviceSelect.options).some(o=>o.value===requestedService)){serviceSelect.value=requestedService;}

// One-time, viewport-triggered reveals across the shared site. No dependencies.
// Keep the content available for keyboard users, reduced motion and no-JS browsers.
(() => {
  if (!('IntersectionObserver' in window) || !('matchMedia' in window)) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches) return;
  const main = document.querySelector('main');
  if (!main) return;
  const targets = new Map();
  const groupSelector = '.paths,.service-grid,.stats,.industry-grid,.solution-grid,.journey-steps,.industry-links,.steps,.faq,.checklist';
  const add = (element, delay = 0) => {
    if (!element || element.matches('.breadcrumbs,.anchor-marker,script,[hidden]')) return;
    targets.set(element, delay);
  };
  const collect = (element) => {
    if (element.matches(groupSelector)) {
      [...element.children].forEach((child, i) => add(child, (i % 3) * 90));
    } else if (element.matches('.hero-grid,.split,.contact-grid,.cta-inner')) {
      [...element.children].forEach((child, i) => add(child, i * 110));
    } else if (element.matches('.wrap')) {
      [...element.children].forEach(collect);
    } else {
      add(element);
    }
  };
  main.querySelectorAll(':scope > section > .wrap').forEach(collect);
  if (!targets.size) return;
  let observer;
  const show = (element, animate = true) => {
    observer?.unobserve(element);
    element.classList.remove('ravel-reveal-pending');
    if (animate && !motion.matches && !element.contains(document.activeElement)) {
      element.classList.add('ravel-reveal-in');
      element.addEventListener('animationend', () => {
        element.classList.remove('ravel-reveal-in');
        element.style.removeProperty('--reveal-delay');
      }, {once:true});
    } else {
      element.classList.remove('ravel-reveal-in');
      element.style.removeProperty('--reveal-delay');
    }
  };
  const releaseAll = () => {
    observer?.disconnect();
    targets.forEach((_, el) => show(el, false));
  };
  try {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) show(entry.target);
      });
    }, {rootMargin:'0px 0px 32px 0px', threshold:0});
    const mobile = matchMedia('(max-width: 560px)').matches;
    targets.forEach((delay, element) => {
      const rect = element.getBoundingClientRect();
      if (!rect.height || rect.bottom <= 0) return;
      // Hero elements already in view stay visible immediately; reveal lower content on scroll.
      if (rect.top < innerHeight) return;
      element.style.setProperty('--reveal-delay', `${mobile ? Math.min(delay, 70) : delay}ms`);
      element.classList.add('ravel-reveal-pending');
      observer.observe(element);
    });
    document.addEventListener('focusin', e => {
      const el = e.target.closest('.ravel-reveal-pending,.ravel-reveal-in');
      if (el) show(el, false);
    });
    const revealAnchor = () => {
      if (!location.hash) return;
      let id;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
      const anchor = document.getElementById(id);
      if (anchor) targets.forEach((_, el) => {
        if (el.contains(anchor) || anchor.contains(el)) show(el, false);
      });
    };
    window.addEventListener('hashchange', revealAnchor);
    revealAnchor();
    window.addEventListener('beforeprint', releaseAll);
    if (motion.addEventListener) motion.addEventListener('change', e => { if (e.matches) releaseAll(); });
    else if (motion.addListener) motion.addListener(e => { if (e.matches) releaseAll(); });
  } catch (error) {
    releaseAll();
  }
})();
