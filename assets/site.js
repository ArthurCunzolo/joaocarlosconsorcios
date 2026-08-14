/* ==========================================================================
   CONFIGURAÇÃO — edite aqui
   ========================================================================== */
var CONFIG = {
  /* Número do WhatsApp no formato internacional, apenas dígitos:
     55 (Brasil) + DDD + número. Ex.: 5511996050690 */
  WHATSAPP_NUMBER: "5511996050690",
  WHATSAPP_DISPLAY: "+55 11 99605-0690",
  /* Mensagem padrão dos CTAs */
  WHATSAPP_MESSAGE: "Olá, João Carlos! Vi sua página e gostaria de conversar sobre uma possibilidade de consórcio para meu objetivo."
};

/* ==========================================================================
   WHATSAPP
   ========================================================================== */
function waURL(msg){
  var n = String(CONFIG.WHATSAPP_NUMBER || "").replace(/\D/g,"");
  var t = encodeURIComponent(msg || CONFIG.WHATSAPP_MESSAGE);
  if(!n) return "#";
  return "https://wa.me/" + n + "?text=" + t;
}
function initWhatsApp(){
  var contextual = {
    hero:  CONFIG.WHATSAPP_MESSAGE,
    nav:   CONFIG.WHATSAPP_MESSAGE,
    menu:  CONFIG.WHATSAPP_MESSAGE,
    about: "Olá, João Carlos! Vi sua página e gostaria de conversar sobre planejamento com consórcio.",
    cta:   "Olá, João Carlos! Tenho um objetivo em mente e gostaria de entender as possibilidades de consórcio.",
    faq:   "Olá, João Carlos! Vi sua página e fiquei com uma dúvida sobre consórcio: ",
    final: CONFIG.WHATSAPP_MESSAGE,
    float: CONFIG.WHATSAPP_MESSAGE,
    footer:CONFIG.WHATSAPP_MESSAGE,
    footer2:CONFIG.WHATSAPP_MESSAGE
  };
  document.querySelectorAll(".wa-link").forEach(function(a){
    var k = a.dataset.wa;
    a.setAttribute("href", waURL(contextual[k] || CONFIG.WHATSAPP_MESSAGE));
    a.setAttribute("target","_blank");
    a.setAttribute("rel","noopener");
  });
  var d = document.getElementById("waDisplay");
  if(d && CONFIG.WHATSAPP_DISPLAY) d.textContent = CONFIG.WHATSAPP_DISPLAY;
}

/* ==========================================================================
   ESTADO GLOBAL
   ========================================================================== */
var lenis = null;
var isMobile   = window.matchMedia("(max-width:900px)").matches;
var isTouch    = window.matchMedia("(hover:none)").matches;
var reduced    = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

/* ==========================================================================
   LOADER
   ========================================================================== */
function loaderParticles(){
  var cv = document.getElementById("ldCanvas"); if(!cv || reduced) return;
  var ctx = cv.getContext("2d"), raf;
  function resize(){ cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
  resize(); window.addEventListener("resize", resize, {passive:true});
  var P = Array.from({length: isMobile?32:60}, function(){
    return {x:Math.random()*cv.width, y:Math.random()*cv.height, r:Math.random()*1.3+.15,
            vy:Math.random()*.32+.06, vx:(Math.random()-.5)*.14, a:Math.random()*.4+.05};
  });
  (function draw(){
    ctx.clearRect(0,0,cv.width,cv.height);
    P.forEach(function(p){
      p.y -= p.vy; p.x += p.vx;
      if(p.y < -6){ p.y = cv.height+6; p.x = Math.random()*cv.width; }
      ctx.globalAlpha = p.a*.55;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = Math.random()>.82 ? "#E01E26" : "#F4F4F2";
      ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  })();
  window.__ldStop = function(){ cancelAnimationFrame(raf); };
}

function runLoader(done){
  var ld = document.getElementById("loader");
  if(!ld){ done(); return; }
  if(reduced){ ld.style.display="none"; done(); return; }
  loaderParticles();
  var fill = ld.querySelector(".ld-fill"), pct = ld.querySelector(".ld-pct");
  var obj = {v:0};
  var tl = gsap.timeline({onComplete:function(){
    if(window.__ldStop) window.__ldStop();
    ld.style.display="none";
    done();
  }});
  tl.to(ld.querySelector(".ld-mark"), {opacity:1, y:0, duration:.9, ease:"expo.out"}, 0)
    .fromTo(ld.querySelector(".ld-mark"), {y:16, scale:.94}, {y:0, scale:1, duration:1.1, ease:"expo.out"}, 0)
    .to(ld.querySelector(".ld-name"), {opacity:1, duration:.8, ease:"power2.out"}, .18)
    .to(obj, {v:100, duration:1.5, ease:"power2.inOut", onUpdate:function(){
        var v = Math.round(obj.v);
        fill.style.width = v+"%";
        pct.textContent = v+"%";
      }}, .25)
    .to(ld.querySelector(".ld-in"), {opacity:0, y:-18, duration:.6, ease:"power2.in"}, "+=.12")
    .to(ld, {yPercent:-100, duration:1.05, ease:"expo.inOut"}, "-=.25");
}

/* ==========================================================================
   SMOOTH SCROLL
   ========================================================================== */
function initSmooth(){
  if(reduced || typeof Lenis === "undefined"){
    document.documentElement.style.scrollBehavior = "smooth";
    return;
  }
  lenis = new Lenis({
    duration:1.3,
    easing:function(t){ return Math.min(1, 1.001 - Math.pow(2,-10*t)); },
    smoothWheel:true, wheelMultiplier:.9, touchMultiplier:1.6
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(function(t){ lenis.raf(t*1000); });
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener("click", function(e){
      var href = a.getAttribute("href");
      if(href === "#" || href.length < 2) return;
      var t = null;
      try { t = document.querySelector(href); } catch(_){ return; }
      if(!t) return;
      e.preventDefault();
      lenis.scrollTo(t, {offset:-70, duration:1.5});
    });
  });
}

/* ==========================================================================
   CURSOR
   ========================================================================== */
function initCursor(){
  if(isTouch || isMobile || reduced) return;
  var dot = document.getElementById("cd"), ring = document.getElementById("cr");
  var mx=innerWidth/2, my=innerHeight/2, rx=mx, ry=my;
  document.body.classList.add("cur-on");
  document.addEventListener("mousemove", function(e){
    mx=e.clientX; my=e.clientY;
    dot.style.transform = "translate("+mx+"px,"+my+"px) translate(-50%,-50%)";
  }, {passive:true});
  (function loop(){
    rx += (mx-rx)*.11; ry += (my-ry)*.11;
    ring.style.transform = "translate("+rx+"px,"+ry+"px) translate(-50%,-50%)";
    requestAnimationFrame(loop);
  })();
  document.addEventListener("mouseover", function(e){
    if(e.target.closest("a,button,.clk,input,select,label.chip")) document.body.classList.add("hl");
  });
  document.addEventListener("mouseout", function(e){
    if(e.target.closest("a,button,.clk,input,select,label.chip")) document.body.classList.remove("hl");
  });
}

/* ==========================================================================
   BOTÕES MAGNÉTICOS
   ========================================================================== */
function initMagnetic(){
  if(isTouch || isMobile || reduced) return;
  document.querySelectorAll(".btn-primary,.btn-lg,#waFloat").forEach(function(btn){
    btn.addEventListener("mousemove", function(e){
      var r = btn.getBoundingClientRect();
      gsap.to(btn, {x:(e.clientX-r.left-r.width/2)*.18, y:(e.clientY-r.top-r.height/2)*.28,
                    duration:.55, ease:"power2.out"});
    });
    btn.addEventListener("mouseleave", function(){
      gsap.to(btn, {x:0, y:0, duration:.8, ease:"elastic.out(1,.5)"});
    });
  });
}

/* ==========================================================================
   HERO
   ========================================================================== */
function initHero(){
  var h1 = document.getElementById("headline");
  if(!h1) return;
  var tl = gsap.timeline({defaults:{ease:"expo.out"}});

  if(typeof SplitType !== "undefined" && !reduced){
    var sp = new SplitType(h1, {types:"lines,words,chars", lineClass:"ln"});
    gsap.set(sp.chars, {yPercent:118, rotateX:-58, transformOrigin:"50% bottom", opacity:0});
    tl.to(sp.chars, {yPercent:0, rotateX:0, opacity:1, duration:1.15,
                     stagger:{amount:.6}, ease:"expo.out"}, .1);
  } else {
    gsap.set(h1,{opacity:0});
    tl.to(h1,{opacity:1,duration:.9},.1);
  }
  tl.add(function(){ h1.classList.add("done"); }, .85)
    .to(".hero-eyebrow", {opacity:1, y:0, duration:.9}, 0)
    .fromTo(".hero-eyebrow", {y:14}, {y:0, duration:.9}, 0)
    .to(".hero-sub", {opacity:1, y:0, duration:1}, .55)
    .fromTo(".hero-sub", {y:22}, {y:0, duration:1}, .55)
    .to(".hero-actions", {opacity:1, y:0, duration:1}, .72)
    .fromTo(".hero-actions", {y:22}, {y:0, duration:1}, .72)
    .to(".hero-scroll", {opacity:1, duration:1}, .95)
    .fromTo(".hero-media", {scale:1.12, filter:"blur(9px)"},
                           {scale:1, filter:"blur(0px)", duration:2, ease:"expo.out"}, 0);

  /* Parallax do vídeo */
  if(!reduced){
    gsap.to(".hero-media", {
      yPercent:14, ease:"none",
      scrollTrigger:{trigger:"#hero", start:"top top", end:"bottom top", scrub:.6}
    });
    gsap.to(".hero-content", {
      yPercent:-22, opacity:.15, ease:"none",
      scrollTrigger:{trigger:"#hero", start:"top top", end:"bottom top", scrub:.6}
    });
  }

  /* Pausa o vídeo quando fora da viewport (economia de recursos) */
  var v = document.getElementById("heroVideo");
  if(v){
    v.play().catch(function(){});
    if("IntersectionObserver" in window){
      new IntersectionObserver(function(en){
        en.forEach(function(e){ e.isIntersecting ? v.play().catch(function(){}) : v.pause(); });
      }, {threshold:.05}).observe(document.getElementById("hero"));
    }
  }
}

/* ==========================================================================
   TICKER
   ========================================================================== */
function initTicker(){
  var track = document.getElementById("tickerTrack");
  if(!track) return;
  var words = ["Planejamento patrimonial","Imóveis","Veículos","Terrenos","Negócios",
               "Consórcio Ademicon","Atendimento consultivo"];
  function block(){
    var d = document.createElement("div");
    d.className = "ticker-item";
    words.forEach(function(w){
      var s = document.createElement("span"); s.textContent = w; d.appendChild(s);
      var sep = document.createElement("i"); sep.className="sep"; d.appendChild(sep);
    });
    return d;
  }
  track.appendChild(block()); track.appendChild(block()); track.appendChild(block());
  if(reduced) return;
  var w = track.scrollWidth/3;
  gsap.to(track, {x:-w, duration:26, ease:"none", repeat:-1});
}

/* ==========================================================================
   NAV + MENU MOBILE
   ========================================================================== */
function initNav(){
  var nav = document.getElementById("nav");
  ScrollTrigger.create({start:"top -50", end:99999,
    onUpdate:function(s){ nav.classList.toggle("on", s.scroll()>50); }});

  var btn = document.getElementById("menuBtn"), menu = document.getElementById("mobileMenu"), open=false;
  if(!btn || !menu) return;
  function toggle(force){
    open = (typeof force==="boolean") ? force : !open;
    btn.classList.toggle("x", open);
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", String(!open));
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("lock", open);
    if(lenis){ open ? lenis.stop() : lenis.start(); }
  }
  btn.addEventListener("click", function(){ toggle(); });
  menu.querySelectorAll("a").forEach(function(a){
    a.addEventListener("click", function(){ if(open) toggle(false); });
  });
  document.addEventListener("keydown", function(e){ if(e.key==="Escape" && open) toggle(false); });
}

/* ==========================================================================
   PROGRESS BAR + WHATSAPP FLUTUANTE
   ========================================================================== */
function initProgress(){
  var bar = document.getElementById("progress"), wa = document.getElementById("waFloat");
  if(!bar && !wa) return;
  ScrollTrigger.create({
    start:"top top", end:"max",
    onUpdate:function(s){
      if(bar) bar.style.width = (s.progress*100)+"%";
      if(wa) wa.classList.toggle("show", s.scroll() > Math.min(innerHeight*.7, 420));
    }
  });
}

/* ==========================================================================
   REVEALS DE SCROLL
   ========================================================================== */
function initReveals(){
  if(reduced) return;

  /* Títulos com split por linha */
  document.querySelectorAll(".rv-title").forEach(function(el){
    if(typeof SplitType === "undefined"){
      gsap.fromTo(el,{opacity:0,y:26},{opacity:1,y:0,duration:.9,ease:"expo.out",
        scrollTrigger:{trigger:el,start:"top 88%"}});
      return;
    }
    var sp = new SplitType(el, {types:"lines", lineClass:"ln"});
    var inner = sp.lines.map(function(l){
      var span = document.createElement("span");
      span.style.display="block";
      while(l.firstChild) span.appendChild(l.firstChild);
      l.appendChild(span);
      return span;
    });
    gsap.set(inner, {yPercent:112, opacity:0});
    gsap.to(inner, {yPercent:0, opacity:1, duration:1.05, stagger:.075, ease:"expo.out",
      scrollTrigger:{trigger:el, start:"top 87%"}});
  });

  /* Elementos genéricos */
  gsap.utils.toArray(".rv").forEach(function(el,i){
    gsap.to(el, {opacity:1, y:0, duration:.85, ease:"expo.out", delay:(i%4)*.05,
      scrollTrigger:{trigger:el, start:"top 91%"}});
  });

  /* Goals: entrada em stagger com clip */
  if(document.querySelector(".goals-grid")){
    gsap.utils.toArray(".goal").forEach(function(el,i){
      gsap.fromTo(el, {clipPath:"inset(100% 0 0 0)", y:34},
                      {clipPath:"inset(0% 0 0 0)", y:0, duration:1.15, ease:"expo.out", delay:i*.09,
                       scrollTrigger:{trigger:".goals-grid", start:"top 84%"}});
    });
  }

  /* Benefícios: linhas */
  gsap.utils.toArray(".ben").forEach(function(el,i){
    gsap.fromTo(el,{opacity:0,x:-22},{opacity:1,x:0,duration:.85,ease:"expo.out",delay:i*.07,
      scrollTrigger:{trigger:el,start:"top 90%"}});
  });

  /* Parallax do CTA */
  if(document.querySelector(".cta-bg")){
    gsap.to(".cta-bg", {yPercent:12, ease:"none",
      scrollTrigger:{trigger:"#cta", start:"top bottom", end:"bottom top", scrub:.7}});
  }

  /* Story mark parallax sutil */
  if(document.querySelector(".story-mark")){
    gsap.to(".story-mark", {yPercent:-14, ease:"none",
      scrollTrigger:{trigger:"#story", start:"top bottom", end:"bottom top", scrub:.8}});
  }
}

/* ==========================================================================
   COMO FUNCIONA — SCROLL HORIZONTAL PINADO (desktop)
   ========================================================================== */
function initHorizontal(){
  if(reduced || window.matchMedia("(max-width:900px)").matches) return;
  var rail = document.getElementById("howRail");
  var pin  = document.getElementById("howPin");
  var sec  = document.getElementById("how");
  var bar  = document.getElementById("howBar");
  if(!rail || !pin || !sec) return;

  function dist(){
    return Math.max(0, rail.scrollWidth - window.innerWidth + parseFloat(getComputedStyle(rail).paddingLeft));
  }
  gsap.to(rail, {
    x:function(){ return -dist(); },
    ease:"none",
    scrollTrigger:{
      trigger:sec, start:"top top", end:function(){ return "+="+dist(); },
      pin:pin, scrub:.6, anticipatePin:1, invalidateOnRefresh:true,
      onUpdate:function(s){ if(bar) bar.style.width = (s.progress*100)+"%"; }
    }
  });

  gsap.utils.toArray(".step").forEach(function(el,i){
    gsap.fromTo(el, {opacity:.25, y:22}, {opacity:1, y:0, duration:.8, ease:"expo.out", delay:i*.06,
      scrollTrigger:{trigger:sec, start:"top 70%"}});
  });
}

/* ==========================================================================
   FAQ
   ========================================================================== */
function initFAQ(){
  document.querySelectorAll("#faqList .fq").forEach(function(fq){
    var btn = fq.querySelector(".fq-q"), ans = fq.querySelector(".fq-a");
    btn.addEventListener("click", function(){
      var isOpen = fq.classList.contains("open");
      document.querySelectorAll("#faqList .fq.open").forEach(function(o){
        o.classList.remove("open");
        o.querySelector(".fq-a").style.maxHeight = "0px";
        o.querySelector(".fq-q").setAttribute("aria-expanded","false");
      });
      if(!isOpen){
        fq.classList.add("open");
        ans.style.maxHeight = ans.scrollHeight + "px";
        btn.setAttribute("aria-expanded","true");
        setTimeout(function(){ ScrollTrigger.refresh(); }, 720);
      }
    });
  });
  window.addEventListener("resize", function(){
    var o = document.querySelector("#faqList .fq.open");
    if(o) o.querySelector(".fq-a").style.maxHeight = o.querySelector(".fq-a").scrollHeight + "px";
  }, {passive:true});
}

/* ==========================================================================
   PARTÍCULAS DO CTA
   ========================================================================== */
function initCtaCanvas(){
  var cv = document.getElementById("ctaCanvas"); if(!cv || reduced) return;
  var ctx = cv.getContext("2d"), running = false, raf;
  function resize(){ cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
  resize(); window.addEventListener("resize", resize, {passive:true});
  var P = Array.from({length: isMobile?26:58}, function(){
    return {x:Math.random()*1600, y:Math.random()*900, r:Math.random()*1.5+.2,
            vy:Math.random()*.34+.07, vx:(Math.random()-.5)*.18, a:Math.random()*.42+.06};
  });
  function draw(){
    ctx.clearRect(0,0,cv.width,cv.height);
    P.forEach(function(p){
      p.y -= p.vy; p.x += p.vx;
      if(p.y < -8){ p.y = cv.height+8; p.x = Math.random()*cv.width; }
      if(p.x < -8) p.x = cv.width+8; if(p.x > cv.width+8) p.x = -8;
      ctx.globalAlpha = p.a*.5;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = Math.random()>.86 ? "#E01E26" : "#F4F4F2";
      ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  }
  /* Só anima quando a seção está visível */
  var host = document.getElementById("cta") || cv.parentElement;
  if("IntersectionObserver" in window && host){
    new IntersectionObserver(function(en){
      en.forEach(function(e){
        if(e.isIntersecting && !running){ running=true; draw(); }
        else if(!e.isIntersecting && running){ running=false; cancelAnimationFrame(raf); }
      });
    }, {threshold:.02}).observe(host);
  } else { draw(); }
}

/* ==========================================================================
   FORMULÁRIO DE QUALIFICAÇÃO → WHATSAPP
   Não calcula valores. Apenas monta a mensagem e abre a conversa.
   ========================================================================== */
function initForm(){
  var form = document.getElementById("simForm");
  if(!form) return;

  /* Pré-seleção ao clicar num objetivo na seção Goals */
  document.querySelectorAll(".goal[data-goal]").forEach(function(g){
    g.addEventListener("click", function(){
      var v = g.dataset.goal;
      var inp = form.querySelector('input[name="objetivo"][value="'+v+'"]');
      if(inp){ inp.checked = true; }
    });
  });

  form.addEventListener("submit", function(e){
    e.preventDefault();
    var d = new FormData(form);
    var nome    = (d.get("nome")||"").toString().trim();
    var cidade  = (d.get("cidade")||"").toString().trim();
    var msg =
      "Olá, João Carlos! Vi sua página e gostaria de receber uma simulação de consórcio.\n\n" +
      "• Objetivo: " + d.get("objetivo") + "\n" +
      "• Faixa de crédito: " + d.get("faixa") + "\n" +
      "• Quando pretendo começar: " + d.get("prazo") +
      (nome   ? "\n• Nome: " + nome : "") +
      (cidade ? "\n• Cidade: " + cidade : "");
    window.open(waURL(msg), "_blank", "noopener");
  });
}

/* ==========================================================================
   MISC
   ========================================================================== */
function initMisc(){
  var y = document.getElementById("year");
  if(y) y.textContent = new Date().getFullYear();

  /* Destaca o link da página atual na navbar */
  var page = document.body.dataset.page;
  if(page){
    document.querySelectorAll('[data-nav="'+page+'"]').forEach(function(a){
      a.classList.add("active");
    });
  }
}

/* ==========================================================================
   BOOT
   ========================================================================== */
function initPage(){
  initHero();
  initReveals();
  initHorizontal();
  initCursor();
  initMagnetic();
  initProgress();
  ScrollTrigger.refresh();
}

/* Failsafe: se GSAP/ScrollTrigger não carregarem (rede, bloqueio, erro),
   a página deve aparecer completa e utilizável — sem animação, mas sem quebrar. */
function fallbackNoGSAP(){
  var ld = document.getElementById("loader");
  if(ld) ld.style.display = "none";
  document.querySelectorAll(".rv,.rv-b").forEach(function(el){
    el.style.opacity = "1"; el.style.transform = "none"; el.style.filter = "none";
  });
  ["#headline",".hero-eyebrow",".hero-sub",".hero-actions",".hero-scroll"].forEach(function(s){
    var el = document.querySelector(s);
    if(el){ el.style.opacity = "1"; el.style.transform = "none"; }
  });
  var h1 = document.getElementById("headline"); if(h1) h1.classList.add("done");
  document.documentElement.style.scrollBehavior = "smooth";
  var wa = document.getElementById("waFloat"); if(wa) wa.classList.add("show");
  var v = document.getElementById("heroVideo"); if(v) v.play().catch(function(){});
  initWhatsApp(); initMisc(); initFAQ(); initForm();
  /* Nav adaptativa e menu mobile sem GSAP */
  var nav = document.getElementById("nav");
  if(nav) window.addEventListener("scroll", function(){
    nav.classList.toggle("on", window.scrollY > 50);
  }, {passive:true});
  var btn = document.getElementById("menuBtn"), menu = document.getElementById("mobileMenu"), open=false;
  if(btn && menu){
    btn.addEventListener("click", function(){
      open = !open;
      btn.classList.toggle("x", open); menu.classList.toggle("open", open);
      menu.setAttribute("aria-hidden", String(!open));
      btn.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("lock", open);
    });
    menu.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){ if(open) btn.click(); });
    });
  }
}

document.addEventListener("DOMContentLoaded", function(){
  if(typeof gsap === "undefined" || typeof ScrollTrigger === "undefined"){
    fallbackNoGSAP();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  initWhatsApp();
  initMisc();
  initSmooth();
  initNav();
  initTicker();
  initFAQ();
  initForm();
  initCtaCanvas();
  /* Só divide/anima os textos depois das fontes carregarem:
     evita quebras de linha calculadas com métricas da fonte de fallback */
  var fontsReady = (document.fonts && document.fonts.ready)
    ? document.fonts.ready : Promise.resolve();
  var loaderDone = new Promise(function(res){ runLoader(res); });
  Promise.all([fontsReady, loaderDone]).then(initPage);

  /* Rede de segurança: se algo travar, garante que o loader saia */
  setTimeout(function(){
    var ld = document.getElementById("loader");
    if(ld && ld.style.display !== "none" && getComputedStyle(ld).opacity !== "0"){
      ld.style.display = "none";
    }
  }, 6000);
});

/* Recalcula em mudança de orientação/tamanho relevante */
var lastW = window.innerWidth;
window.addEventListener("resize", function(){
  if(Math.abs(window.innerWidth-lastW) > 60){
    lastW = window.innerWidth;
    ScrollTrigger.refresh();
  }
}, {passive:true});
