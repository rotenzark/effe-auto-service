/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'effe-auto-service', // usato per localStorage lang
    whatsapp: {
      number: '', // nessun WhatsApp dichiarato: si prenota al telefono
      message: '',
      ids: [],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    hours: {
      0: [],
      1: [['08:30', '12:30'], ['14:00', '18:00']],
      2: [['08:30', '12:30'], ['14:00', '18:00']],
      3: [['08:30', '12:30'], ['14:00', '18:00']],
      4: [['08:30', '12:30'], ['14:00', '18:00']],
      5: [['08:30', '12:30'], ['14:00', '18:00']],
      6: [['09:00', '12:30']]
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 1500,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "m.top": "Effe Auto Service, back to the top",
      "m.nav": "Pages of the service book",
      "m.lingua": "Language",
      "m.menu": "Open the menu",
      "m.lightbox": "Enlarged photo",
      "m.chiudi": "Close",
      "i.cosa": "service book",
      "i.skip": "Skip",
      "n.dati": "The garage",
      "n.manutenzione": "Servicing",
      "n.registro": "Logbook",
      "n.usato": "Used cars",
      "n.note": "Reviews",
      "n.orari": "Hours",
      "n.tel": "Call",
      "h.banda": "Service book",
      "h.k": "Multi-brand garage and used cars · Barona",
      "h.t": "Serviced<br>by us.",
      "h.s": "We are a multi-brand garage, in Milan for more than thirty years. Our long-standing customers bring us their cars for servicing; and the used cars we sell, we prepare in the workshop before handing them over.",
      "h.tel": "Call to book",
      "h.usato": "Our used cars",
      "h.voti": "4.7 from 91 Google reviews · 4.8 from 57 on AutoScout24",
      "f.testa": "Service coupons",
      "f.n": "Coupon no.",
      "f.eseguito": "Done",
      "f.t": "Service coupon",
      "f.auto": "Vehicle",
      "f.telaio": "Chassis",
      "f.diagnosi": "Diagnosis",
      "f.manut": "Maintenance",
      "f.piede": "to be handed to the garage",
      "f.completo": "Service book complete: the car is ready for its next owner, too. <a href=\"#usato\">Change of ownership →</a>",
      "f.nota": "In Italian a service is called a \"tagliando\", a coupon: once, at every check-up, the garage tore a coupon out of the car's service book.",
      "f.tasto": "Tear off the 45,000 km coupon",
      "f.dacapo": "Start again",
      "p1.t": "Garage details",
      "p1.rs": "Company name",
      "p1.ind": "Address",
      "p1.tel": "Phone and fax",
      "p1.acc": "At reception",
      "p1.tipo": "Garage",
      "p1.tipov": "multi-brand, experienced with Fiats",
      "p1.da": "In Milan",
      "p1.dav": "for more than thirty years",
      "p1.reg": "Register of car repairers",
      "p1.iva": "VAT number",
      "p1.alt1": "The hanging sign on the street, with the red EFFE Auto Service oval",
      "p1.cap1": "The sign on the street, at number 41",
      "p1.alt2": "The EFFE Auto Service mark: the red double oval with rays and the silhouette of a car",
      "p1.cap2": "Our mark, up close",
      "p2.t": "Servicing schedule",
      "p2.s": "We work on the most common makes. First the diagnosis, also through the car's control unit; then the quote; then the work.",
      "p2.h1": "Job",
      "p2.h2": "What we do",
      "p2.h3": "Notes",
      "p2.r1": "Servicing and maintenance",
      "p2.r1c": "the checks and replacements scheduled for your car",
      "p2.r1n": "for all the most common makes",
      "p2.r2": "Electronic diagnosis",
      "p2.r2c": "\"connecting the control unit to our computer systems\"",
      "p2.r2n": "first the diagnosis, then the quote",
      "p2.r3": "Mechanical repairs",
      "p2.r3c": "multi-brand, with particular experience on Fiats",
      "p2.r4": "Air conditioning",
      "p2.r4c": "diagnosis and repair of the air conditioning",
      "p2.r5": "Courtesy car",
      "p2.r5c": "on request",
      "p2.r5n": "ask for it when you book",
      "p2.r6": "Long-term rental",
      "p2.r6c": "LeasePlan partner garage, today Ayvens",
      "p2.r6n": "for other rental companies, ask us",
      "p2.cit": "\"They take care of the car and become a point of reference over the long run for servicing and assistance.\"",
      "p2.citchi": "Antonio Mascia, Google review",
      "p3.t": "Logbook",
      "p3.s": "A few jobs told by the people who brought them to us, from Google reviews, summed up in our own words.",
      "p3.gt": "A Golf with broken air conditioning, and 38 degrees outside",
      "p3.g1o": "Friday",
      "p3.g1": "The air conditioning breaks down on a trip, in Switzerland. One phone call: an appointment for Monday at 8:30.",
      "p3.g2o": "Monday 8:30",
      "p3.g2": "Reception. We offer her a courtesy car: she doesn't need it, she works nearby.",
      "p3.g3o": "Monday 2 pm",
      "p3.g3": "Diagnosis and quote.",
      "p3.g4o": "Tuesday morning",
      "p3.g4": "The Golf is ready.",
      "p3.cap": "Logbook of jobs, from the reviews",
      "p3.h1": "When",
      "p3.h2": "Car",
      "p3.h3": "Job",
      "p3.h4": "Outcome",
      "p3.r1q": "3 years ago",
      "p3.r1i": "arrived in Milan from Switzerland, it wouldn't start",
      "p3.r1c": "started again for the trip home",
      "p3.r2q": "2 years ago",
      "p3.r2i": "a fault before leaving on a long trip",
      "p3.r2c": "fixed quickly, before leaving",
      "p3.r3q": "8 years ago",
      "p3.r3a": "—",
      "p3.r3i": "a nail in the tyre on Sunday evening, with a trip to Genoa on Monday",
      "p3.r3c": "repaired on Monday, in record time",
      "p3.r4q": "a year ago",
      "p3.r4a": "—",
      "p3.r4i": "\"an unusual problem with the car\"",
      "p3.r4c": "solved in record time",
      "p3.r5q": "7 months ago",
      "p3.r5a": "—",
      "p3.r5i": "a repair",
      "p3.r5c": "in record time, at a reasonable price",
      "p4.t": "Change of ownership",
      "p4.s": "We also sell used cars. Before handing them over we prepare them in the workshop, and we take care of the ownership paperwork. We have delivered them far away, too, as far as Sardinia.",
      "p4.alt1": "A used car from behind in the showroom, with the EFFE Auto Service Srl courtesy plate",
      "p4.cap1": "In the showroom, with the EFFE courtesy plate",
      "p4.l1": "prepared in the workshop before delivery",
      "p4.l2": "change-of-ownership paperwork handled by us",
      "p4.l3": "delivery arranged even far away",
      "p4.voto": "4.8 from 57 reviews on AutoScout24",
      "p4.as24": "The cars available",
      "p4.as24s": "on AutoScout24",
      "p4.andrea": "Ask for Andrea",
      "p4.alt2": "A red used car in the courtyard with the blue doors, with the EFFE courtesy plate",
      "p4.cap2": "In the courtyard with the blue doors",
      "p4.alt3": "The dashboard of one of our used cars: 103,912 kilometres",
      "p4.cap3": "The dashboard of one of our used cars: the kilometres are there to read",
      "p5.t": "Customers' notes",
      "p5.s": "4.7 from 91 reviews on Google and 4.8 from 57 on AutoScout24. Five of them, translated from Italian.",
      "rc.1": "I've known this garage for several years, and they are the most helpful and friendly in all of Milan. I visit several garages for work and I know the car world quite well. Punctual, flexible, always ready to meet you halfway. Recently I had an unusual problem with my car, and they solved it in record time.",
      "rc.f1": "C D · Google · a year ago · 5 stars",
      "rc.2": "For 15 years now I've trusted Andrea with the maintenance of my car. An excellent mechanic and above all an honest one. […] Keep it up, you are rarer and rarer these days!",
      "rc.f2": "Francesco · Google · 5 years ago · 5 stars",
      "rc.3": "Excellent service! They repaired my car in record time and at a reasonable price. The staff were very professional and helpful. My car is like new! I recommend them to everyone.",
      "rc.f3": "Luca Notarstefano · Google · 7 months ago · 5 stars",
      "rc.4": "A perfect buying experience! I bought a Ford Puma from them while being 900 km away. Despite the distance, Andrea made sure at every moment to reassure me, answering every doubt and looking after every detail with great seriousness. Highly recommended!",
      "rc.f4": "Ylenia · AutoScout24 · June 2026",
      "rc.5": "Andrea very kind, very flexible with times and very well informed about the car - they delivered the car serviced by them. really very very accurate and attentive",
      "rc.f5": "Roberta · AutoScout24 · August 2026",
      "rc.piede": "Public reviews on Google and AutoScout24, translated from Italian; «[…]» marks where they were shortened.",
      "p6.t": "Hours and location",
      "p6.zona": "(Barona)",
      "p6.cap": "Opening hours",
      "o.lun": "Monday",
      "o.mar": "Tuesday",
      "o.mer": "Wednesday",
      "o.gio": "Thursday",
      "o.ven": "Friday",
      "o.sab": "Saturday",
      "o.dom": "Sunday",
      "o.chiuso": "closed",
      "p6.tel": "Garage, phone and fax",
      "p6.usato": "Used cars, Andrea",
      "p6.as24": "the cars available",
      "p6.nota": "Booking is recommended. Wheelchair-accessible entrance and parking; cards accepted.",
      "p6.mappa": "Map: Effe Auto Service, Via Ettore Ponti 41, Milan",
      "p6.btn": "Directions",
      "q.t": "Frequently asked questions",
      "q.1": "Which makes do you work on?",
      "q.1r": "The most common ones: we are a multi-brand garage, with particular experience on Fiats.",
      "q.2": "How do I book?",
      "q.2r": "By phone, on +39 02 891 1582. Booking is recommended.",
      "q.3": "Do you have a courtesy car?",
      "q.3r": "On request: ask for it when you book.",
      "q.4": "Do you sell used cars?",
      "q.4r": "Yes. The cars available are on our AutoScout24 profile; for information ask for Andrea, on +39 375 613 0147.",
      "q.5": "Do the used cars go through the workshop?",
      "q.5r": "Yes: before delivery we prepare them in the workshop. Ask Andrea what was done on the car you're interested in.",
      "q.6": "Do you repair long-term rental cars?",
      "q.6r": "We are a LeasePlan partner garage, today Ayvens. For other rental companies, ask us.",
      "q.7": "What are the opening hours?",
      "q.7r": "Monday to Friday from 8:30 to 12:30 and from 2 to 6 pm, Saturday from 9 to 12:30. Closed on Sunday.",
      "z.piva": "VAT no.",
      "z.reg": "Reg. of car repairers",
      "z.usato": "used cars",
      "z.cred": "Demo website made by <a href=\"https://bespokestud.io\" rel=\"noopener\">Bespoke Studio</a> · texts from their website, their AutoScout24 profile and the Google listing (September 2026); public reviews on Google and AutoScout24; photographs from the Google listing and their AutoScout24 profile.",
      "x.nav": "Quick actions",
      "x.chiama": "Call",
      "x.usato": "Used",
      "x.mappa": "Map",
      "x.orari": "Hours"
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  // ── FIRMA «il tagliando si stacca» (#211 Effe Auto Service) ──
  // La pagina dei tagliandi del libretto. Stato finale in HTML (vale senza JS e con reduced-motion): staccati i tagliandi dei
  // 15.000 e dei 30.000 km, con le matrici compilate a penna; attaccato quello dei 45.000. Con GSAP e senza reduced-motion il
  // JS, sotto l'intro, rimette il tagliando dei 30.000 e svuota la sua matrice; a fine intro (o quando la pagina entra in
  // vista) lo strappa: uno strattone, il bordo frastagliato, il tagliando che ruota e cade; la penna compila la matrice.
  // Poi il visitatore stacca quello dei 45.000 (tasto o clic sul tagliando) e il libretto è completo; «Da capo» li rimette.
  var libretto = document.getElementById('libretto');
  var anima = hasGsap && !reducedMotion;
  var introFinita = false;
  var parti = function () {};
  var inVista = function () { return false; };
  if (libretto) {
    var righe = [].slice.call(libretto.querySelectorAll('.riga'));
    var riga2 = righe[1], riga3 = righe[2];
    var tasto = document.getElementById('tagliandoTasto'), daCapo = document.getElementById('tagliandoDaCapo');
    var statoEl = document.getElementById('librettoStato');
    var ultima = null;
    var inglese = function () { return (document.documentElement.lang || 'it').indexOf('en') === 0; };
    var kmDi = function (r) { return r.querySelector('.matrice__km').textContent.trim(); };
    var penna = function (r) { return r.querySelector('.matrice__campo .penna'); };
    var scriviStato = function () {
      if (!ultima) { statoEl.textContent = ''; return; }
      var km = kmDi(ultima), en = inglese();
      var t = en ? km.replace('.', ',') + ' coupon: done.' : 'Tagliando dei ' + km + ': eseguito.';
      if (libretto.classList.contains('is-completo')) t += en ? ' Service book complete.' : ' Libretto completo.';
      statoEl.textContent = t;
    };
    var attacca = function (r) {
      r.classList.remove('is-staccato', 'is-strappando');
      var t = r.querySelector('.tagliando');
      if (hasGsap) { gsap.killTweensOf(t); gsap.set(t, { clearProps: 'all' }); gsap.killTweensOf(penna(r)); }
      penna(r).style.clipPath = '';
    };
    var dopo = function (r) {
      r.classList.remove('is-strappando');
      r.classList.add('is-staccato');
      var t = r.querySelector('.tagliando');
      if (hasGsap) gsap.set(t, { clearProps: 'all' });
      penna(r).style.clipPath = '';
      ultima = r;
      if (r === riga3) { libretto.classList.add('is-completo'); tasto.hidden = true; daCapo.hidden = false; }
      scriviStato();
    };
    var strappa = function (r) {
      if (r.classList.contains('is-staccato') || r.classList.contains('is-strappando')) return;
      if (!anima) { dopo(r); return; }
      var t = r.querySelector('.tagliando'), p = penna(r);
      r.classList.add('is-strappando');
      gsap.set(p, { clipPath: 'inset(0 100% 0 0)' });
      gsap.timeline({ onComplete: function () { dopo(r); } })
        .to(t, { x: 8, rotation: 1.6, duration: 0.14, ease: 'power1.out' })
        .to(t, { x: 5, rotation: 0.8, duration: 0.08, ease: 'power1.in' })
        .to(t, { x: 150, y: 96, rotation: 19, opacity: 0, duration: 0.82, ease: 'power2.in' })
        .to(p, { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'none' }, '-=0.45');
    };
    tasto.addEventListener('click', function () { strappa(riga3); });
    riga3.querySelector('.tagliando').addEventListener('click', function () { strappa(riga3); });
    daCapo.addEventListener('click', function () {
      attacca(riga3); attacca(riga2);
      libretto.classList.remove('is-completo');
      tasto.hidden = false; daCapo.hidden = true;
      ultima = null; scriviStato();
      tasto.focus();
      if (anima) gsap.delayedCall(0.45, function () { strappa(riga2); }); else dopo(riga2);
    });
    document.querySelectorAll('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setTimeout(scriviStato, 0); }); });
    if (anima) {
      // sotto l'intro: il tagliando dei 30.000 è ancora attaccato e la sua matrice è vuota
      attacca(riga2);
      var partita = false;
      parti = function () { if (partita) return; partita = true; gsap.delayedCall(0.35, function () { strappa(riga2); }); };
      inVista = function () { var rr = riga2.getBoundingClientRect(); return rr.top < window.innerHeight * 0.85 && rr.bottom > 0; };
      if (hasST) ScrollTrigger.create({ trigger: riga2, start: 'top 85%', once: true, onEnter: function () { if (introFinita) parti(); } });
    }
  }
  window.bespokeHeroEntrance = function () {
    introFinita = true;
    if (libretto && anima && inVista()) parti();
  };

  // lo stato degli orari anche in «Orari e dove»
  var st1 = document.getElementById('orarioStato'), st2 = document.getElementById('orarioStato2');
  if (st1 && st2) {
    var copiaStato = function () { st2.textContent = st1.textContent; };
    copiaStato();
    new MutationObserver(copiaStato).observe(st1, { childList: true, characterData: true, subtree: true });
  }
})();
