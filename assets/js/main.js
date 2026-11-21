/* Odontofar · interacción y movimiento */
(() => {
  const WA = '573223784921';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const waLink = (text) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
  const phone = () => window.matchMedia('(max-width: 899px)').matches;

  if (!hasGsap || reduce) root.classList.remove('motion-ok');
  else window.__ofReady = true;

  /* ---------- menú del celular ---------- */
  const menuBtn = $('[data-menu-btn]');
  const menu = $('[data-menu]');
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Cerrar' : 'Menú';
    document.body.classList.toggle('menu-open', open);
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
  }
  menuBtn && menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu && $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu && !menu.hidden) setMenu(false); });

  /* ---------- barra fija y botón de WhatsApp ---------- */
  const bar = $('[data-bar]');
  const waFloat = $('[data-wa-float]');
  const hero = $('.hero');
  const foot = $('.foot');
  let pastHero = false, footIn = false;
  const paintBars = () => {
    bar && bar.classList.toggle('is-visible', pastHero);
    waFloat && waFloat.classList.toggle('is-visible', pastHero && !footIn);
    if (bar) { bar.setAttribute('aria-hidden', String(!pastHero)); $$('a', bar).forEach((a) => a.tabIndex = pastHero ? 0 : -1); }
  };
  if ('IntersectionObserver' in window) {
    hero && new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; paintBars(); }, { rootMargin: '-120px 0px 0px 0px' }).observe(hero);
    foot && new IntersectionObserver(([e]) => { footIn = e.isIntersecting; paintBars(); }, { rootMargin: '0px 0px -20% 0px' }).observe(foot);
  }

  /* ---------- videos: solo corren a la vista ---------- */
  const vids = $$('video[data-autoplay]');
  vids.forEach((v) => { v.muted = true; v.setAttribute('muted', ''); });
  if (!reduce && 'IntersectionObserver' in window) {
    const vio = new IntersectionObserver((es) => es.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) { const p = v.play(); p && p.catch(() => {}); } else v.pause();
    }), { threshold: 0.15 });
    vids.forEach((v) => vio.observe(v));
  }

  /* ---------- miedómetro ---------- */
  const LEVELS = [
    {
      name: 'Pánico total',
      title: 'Tranquilo: empezamos por conversar.',
      text: 'La primera cita es una valoración gratis. Miramos tus dientes, te explicamos lo que vemos y tú decides. Ese día no hacemos nada que no quieras.',
      list: ['Primero hablamos, después revisamos', 'Te explicamos cada paso antes de hacerlo', 'Vamos a tu ritmo, con mucha paciencia'],
      wa: 'Hola Odontofar, me da muchísimo miedo el odontólogo. Quiero una valoración gratis y que me expliquen todo con calma.',
    },
    {
      name: 'Bastante',
      title: 'Normal: a muchos de nuestros pacientes les pasaba.',
      text: 'Por eso la doctora te explica cada procedimiento antes de empezar, te cuenta qué vas a sentir y te hace preguntas en el camino. Nadie te va a regañar por los años sin venir.',
      list: ['Te explicamos cada paso antes de hacerlo', 'Vamos a tu ritmo, con paciencia', 'La valoración es gratis y sin compromiso'],
      wa: 'Hola Odontofar, me da bastante miedo el odontólogo. Quiero agendar una valoración gratis y que me expliquen todo.',
    },
    {
      name: 'Un poquito',
      title: 'Entonces ya hiciste la mitad del camino.',
      text: 'Ven a la valoración, mira tus opciones y el precio, y decide sin presión. Si no necesitas un tratamiento, te lo decimos.',
      list: ['Te decimos qué necesitas y qué no', 'Precio claro antes de empezar', 'Pagos a cuotas con Sistecrédito o Addi'],
      wa: 'Hola Odontofar, me da un poquito de miedo, pero quiero agendar mi valoración gratis.',
    },
    {
      name: 'Cero, vengo feliz',
      title: 'Así nos gusta. ¿Qué quieres cambiar?',
      text: 'Diseño de sonrisa, microdiseño, bordes estéticos o blanqueamiento: en la valoración te mostramos qué te queda mejor con tu cara.',
      list: ['Diseño y microdiseño de sonrisa', 'Blanqueamiento en tres sesiones', 'Limpieza profunda y controles'],
      wa: 'Hola Odontofar, quiero cambiar mi sonrisa. ¿Me ayudan a agendar mi valoración gratis?',
    },
  ];
  const miedo = $('[data-miedo]');
  if (miedo) {
    const range = $('[data-miedo-range]', miedo);
    const barEl = $('[data-meter-bar]', miedo);
    const faces = $$('.face', miedo);
    const ticks = $$('[data-level]', miedo);
    const box = $('[data-answer]', miedo);
    const tEl = $('[data-answer-title]', miedo);
    const xEl = $('[data-answer-text]', miedo);
    const lEl = $('[data-answer-list]', miedo);
    const wEl = $('[data-answer-wa]', miedo);
    let cur = -1;
    const setLevel = (n, { quiet = false } = {}) => {
      n = Math.max(0, Math.min(3, Number(n)));
      if (n === cur) return;
      cur = n;
      const L = LEVELS[n];
      miedo.dataset.level = String(n);
      range.value = String(n);
      range.setAttribute('aria-valuetext', L.name);
      barEl && barEl.style.setProperty('--fill', `${(n / 3) * 100}%`);
      faces.forEach((f) => f.classList.toggle('is-on', Number(f.dataset.face) === n));
      ticks.forEach((t) => t.setAttribute('aria-pressed', String(Number(t.dataset.level) === n)));
      tEl.textContent = L.title;
      xEl.textContent = L.text;
      lEl.innerHTML = L.list.map((i) => `<li>${i}</li>`).join('');
      wEl.href = waLink(L.wa);
      if (!quiet && !reduce) { box.classList.remove('is-swap'); void box.offsetWidth; box.classList.add('is-swap'); }
      if (!quiet && hasGsap && !reduce) {
        const m = $('[data-mascot]', miedo);
        gsap.fromTo(m, { scale: 0.94 }, { scale: 1, duration: 0.6, ease: 'back.out(3)', transformOrigin: '50% 60%' });
      }
    };
    range.addEventListener('input', () => setLevel(range.value));
    ticks.forEach((t) => t.addEventListener('click', () => setLevel(t.dataset.level)));
    setLevel(1, { quiet: true });
  }

  /* ---------- antes y después ---------- */
  const CASES = {
    micro: { name: 'Microdiseño + blanqueamiento', fact: 'Forma y color', note: 'Microdiseño y blanqueamiento: forma y color en armonía, con resultado natural.', alt: 'microdiseño y blanqueamiento' },
    corona: { name: 'Corona + diseño natural', fact: 'Tono a la medida', note: 'Una corona dental que se confunde con los demás dientes: elegimos tono, forma y textura para esta sonrisa.', alt: 'corona dental mimetizada y diseño de sonrisa natural' },
    natural: { name: 'Diseño de sonrisa natural', fact: 'Sin verse falso', note: 'Un diseño hecho a su estilo: más armonía, sin perder la naturalidad ni la frescura.', alt: 'diseño de sonrisa natural' },
    bordes: { name: 'Cuatro bordes estéticos', fact: 'Cuatro dientes', note: 'Cuatro bordes estéticos personalizados: se corrige la forma sin tocar el resto de la sonrisa.', alt: 'cuatro bordes estéticos' },
    digital: { name: 'Diseño de sonrisa digital', fact: 'Planeado a tu cara', note: 'Un diseño de sonrisa digital: se planea primero en foto y luego se lleva a la boca.', alt: 'diseño de sonrisa digital' },
  };
  const cmp = $('[data-compare]');
  let cmpTouched = false;
  if (cmp) {
    const r = $('[data-cmp-range]', cmp);
    cmp.__set = (v) => { cmp.style.setProperty('--pos', `${v}%`); };
    r.addEventListener('input', () => { cmpTouched = true; cmp.__set(r.value); });
    r.addEventListener('pointerdown', () => { cmpTouched = true; });
    const before = $('[data-cmp-before]', cmp);
    const after = $('[data-cmp-after]', cmp);
    const photo = $('[data-case-photo]');
    const noteEl = $('[data-case-note]');
    const PHOTO_ALT = {
      micro: 'Paciente mostrando en su celular la foto de su sonrisa con microdiseño',
      corona: 'Sonrisa con la corona dental ya integrada',
      natural: 'Paciente con suéter rojo y su diseño de sonrisa natural',
      bordes: 'Paciente sonriendo después de sus bordes estéticos',
      digital: 'Paciente sonriendo después de su diseño de sonrisa digital',
    };
    $$('[data-case]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.case;
      const c = CASES[id];
      if (!c) return;
      $$('[data-case]').forEach((x) => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', String(on)); });
      before.src = `assets/img/caso-${id}-antes.webp`;
      after.src = `assets/img/caso-${id}-despues.webp`;
      after.alt = `Después: ${c.alt}`;
      if (photo) { photo.src = `assets/img/retrato-${id}.webp`; photo.alt = PHOTO_ALT[id]; }
      noteEl.textContent = c.note;
      cmp.classList.remove('is-swapping'); void cmp.offsetWidth; cmp.classList.add('is-swapping');
      r.value = 50; cmp.__set(50);
    }));
  }

  /* ---------- tratamientos: la frase activa avanza con el scroll ---------- */
  const trat = $('[data-trat]');
  if (trat && 'IntersectionObserver' in window) {
    const items = $$('[data-trat-item]', trat);
    const pairs = $$('[data-trat-pair]', trat);
    const marks = $$('[data-trat-mark]', trat);
    const descEl = $('[data-trat-desc]', trat);
    let tCur = 0;
    const setT = (i) => {
      if (i === tCur || i < 0) return;
      tCur = i;
      items.forEach((it, k) => it.classList.toggle('is-active', k === i));
      pairs.forEach((p, k) => p.classList.toggle('is-active', k === i));
      if (descEl) {
        descEl.textContent = items[i].dataset.desc;
        if (!reduce) { descEl.classList.remove('is-swap'); void descEl.offsetWidth; descEl.classList.add('is-swap'); }
      }
    };
    const tio = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) setT(marks.indexOf(e.target));
    }), { rootMargin: '-50% 0px -50% 0px' });
    marks.forEach((m) => tio.observe(m));
  }

  /* ---------- el nombre del pie, al ancho ---------- */
  const footWord = $('[data-fit-foot]');
  function fitFoot() {
    if (!footWord) return;
    const inner = footWord.firstElementChild;
    const box = footWord.parentElement;
    const cs = getComputedStyle(box);
    const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    footWord.style.fontSize = '100px';
    const w = inner.getBoundingClientRect().width;
    footWord.style.fontSize = `${Math.floor(((100 * avail) / w) * 0.985)}px`;
  }
  fitFoot();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitFoot);
  let rT;
  window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { fitFoot(); hasGsap && ScrollTrigger.refresh(); }, 140); });

  /* ---------- sin GSAP o con movimiento reducido: todo queda quieto y visible ---------- */
  if (!hasGsap || reduce) { root.classList.remove('motion-ok'); return; }

  /* ================= movimiento (GSAP) ================= */
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      lenis.scrollTo(t, { offset: 0, duration: 1.4 });
      history.replaceState(null, '', id);
    }));
  }

  // firma: cada línea del titular sube desde su línea base
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.fromTo('.hero__in', { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 0.95, stagger: 0.11 }, 0.1)
    .fromTo('[data-hero-photo]', { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'power4.inOut' }, 0.05)
    .fromTo('[data-hero-photo] video', { scale: 1.16 }, { scale: 1, duration: 1.8, ease: 'power3.out' }, 0.1)
    .fromTo('[data-hero-fade]', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out', clearProps: 'transform' }, 0.55)
    .fromTo('.nav > *', { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.06, clearProps: 'transform' }, 0.5);

  // la foto del hero deriva al salir
  gsap.to('.hero__tall', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__land', { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Entradas: el contenido solo se oculta en el instante en que su entrada va a sonar.
  function onApproach(el, prep, play) {
    if (!el) return;
    let prepared = false, played = false;
    const doPrep = () => { if (!prepared) { prepared = true; prep(); } };
    const io1 = new IntersectionObserver(([e]) => { if (e.isIntersecting) { doPrep(); io1.disconnect(); } }, { rootMargin: '0px 0px 25% 0px' });
    const io2 = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !played) { played = true; doPrep(); play(); io2.disconnect(); io1.disconnect(); }
    }, { rootMargin: '0px 0px -8% 0px' });
    io1.observe(el); io2.observe(el);
  }

  // encabezado, texto, lista: en cascada
  $$('[data-reveal]').forEach((block) => {
    const single = block.matches('p, h2, blockquote') || block.children.length === 0;
    const kids = single ? [block] : [...block.children];
    onApproach(block,
      () => gsap.set(kids, { y: 26, opacity: 0 }),
      () => gsap.to(kids, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' }));
  });

  // las fotos se abren de abajo hacia arriba
  $$('[data-clip]').forEach((w) => {
    const box = $('.ph', w) || w;
    const img = $('img', w);
    onApproach(w,
      () => { gsap.set(box, { clipPath: 'inset(100% 0 0 0)' }); img && gsap.set(img, { scale: 1.16 }); },
      () => {
        const t = gsap.timeline();
        t.to(box, { clipPath: 'inset(0% 0 0 0)', duration: 1.15, ease: 'power4.inOut' });
        img && t.to(img, { scale: 1, duration: 1.6, ease: 'power3.out' }, 0.1);
        const cap = $('.cap', w);
        cap && t.fromTo(cap, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.6);
      });
  });

  // las fotos grandes derivan un poco con el scroll
  $$('[data-drift] img').forEach((img) => {
    gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('.intro__ph .ph').forEach((ph, i) => {
    gsap.fromTo(ph, { y: 40 + i * 20 }, { y: -40 - i * 20, ease: 'none', scrollTrigger: { trigger: ph, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // miedómetro: la mascota entra saludando
  onApproach($('.miedo__mascot'),
    () => gsap.set('.miedo__mascot', { rotate: -14, scale: 0.8, opacity: 0, transformOrigin: '50% 80%' }),
    () => gsap.to('.miedo__mascot', { rotate: 0, scale: 1, opacity: 1, duration: 1.2, ease: 'elastic.out(1, .55)' }));

  // antes y después: la línea se mueve sola una vez
  if (cmp) {
    const o = { v: 50 };
    onApproach(cmp, () => {}, () => {
      if (cmpTouched) return;
      gsap.timeline({ delay: 0.3, onUpdate: () => { if (!cmpTouched) cmp.__set(o.v.toFixed(1)); } })
        .to(o, { v: 22, duration: 1.1, ease: 'power3.inOut' })
        .to(o, { v: 80, duration: 1.4, ease: 'power3.inOut' })
        .to(o, { v: 50, duration: 1, ease: 'power3.inOut' });
    });
  }

  onApproach($('.casos__list'),
    () => gsap.set($$('.casos__list > *, .casos__names li'), { y: 22, opacity: 0 }),
    () => gsap.to($$('.casos__list > *, .casos__names li'), { y: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: 'power3.out', clearProps: 'transform' }));
  onApproach($('.tooth'),
    () => gsap.set('.tooth__mask, .tooth__line', { scale: 0.86, opacity: 0, transformOrigin: '50% 50%' }),
    () => gsap.to('.tooth__mask, .tooth__line', { scale: 1, opacity: 1, duration: 1.2, ease: 'power4.out', clearProps: 'transform,opacity' }));
  onApproach($('.casos__fact'),
    () => gsap.set('.casos__fact > *', { y: 20, opacity: 0 }),
    () => gsap.to('.casos__fact > *', { y: 0, opacity: 1, duration: 0.9, stagger: 0.1, delay: 0.3, ease: 'power3.out', clearProps: 'transform' }));

  // tratamientos: el título entra al fijarse la escena
  onApproach($('.trat__center'),
    () => gsap.set(['.trat__title', '.trat__item'], { y: 24, opacity: 0 }),
    () => gsap.to(['.trat__title', '.trat__item'], { y: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: 'power3.out', clearProps: 'transform' }));

  // somos: el título se asienta mientras pasan las fotos
  gsap.fromTo('.somos__title', { scale: 1.08 }, { scale: 0.96, ease: 'none', scrollTrigger: { trigger: '.somos', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  $$('.somos__p figcaption').forEach((fc) => onApproach(fc,
    () => gsap.set(fc.children, { y: 16, opacity: 0 }),
    () => gsap.to(fc.children, { y: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: 'power3.out', clearProps: 'transform' })));

  // opiniones: la foto se acerca, la cita sube
  gsap.fromTo('.op__hero img', { scale: 1.14 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.op__hero', start: 'top bottom', end: 'bottom top', scrub: true } });
  onApproach($('.op__quote'),
    () => gsap.set(['.op__quote p', '.op__who'], { y: 30, opacity: 0 }),
    () => gsap.to(['.op__quote p', '.op__who'], { y: 0, opacity: 1, duration: 1.1, stagger: 0.12, ease: 'power3.out', clearProps: 'transform' }));

  // pie: el nombre crece hasta llenar el ancho
  gsap.fromTo('.foot__word', { scale: 0.9, transformOrigin: '0% 100%' }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.faq', start: 'bottom bottom', end: 'bottom top', scrub: true } });

  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fitFoot(); ScrollTrigger.refresh(); });
})();
