/* ================================================================
   script.js — Portfolio Alex Dev
   Funcionalidades:
     1. Canvas con cuadrícula tech tipo circuito PCB (fondo animado)
     2. Navbar: efecto scroll + hamburger menú móvil
     3. Animaciones de entrada (Intersection Observer)
     4. Cerrar menú al hacer click en link
   ================================================================ */

"use strict";

/* ----------------------------------------------------------------
   1. CANVAS — CUADRÍCULA TIPO CIRCUITO PCB
   Dibuja una cuadrícula con nodos, trazos de conexión y pulsos
   de luz que viajan por las líneas, imitando una PCB tech.
   ---------------------------------------------------------------- */

(function initCircuitCanvas() {

  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");

  /* Color primario del tema */
  const COLOR = "rgba(13, 89, 242,";   /* Se le añade opacidad al usarlo */
  const CELL = 50;                     /* Tamaño de cada celda de la cuadrícula */
  const NODE_R = 2.2;                    /* Radio de los nodos en intersecciones */

  /* Array de pulsos que viajan por las líneas */
  let pulses = [];

  /* Dimensiones del canvas */
  let W, H, cols, rows;

  /* Ajusta el canvas al tamaño de la ventana */
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cols = Math.ceil(W / CELL) + 1;
    rows = Math.ceil(H / CELL) + 1;
  }

  /* Crea un pulso nuevo en posición aleatoria de la cuadrícula */
  function spawnPulse() {
    /* Dirección: horizontal (0) o vertical (1) */
    const horiz = Math.random() > 0.5;
    if (horiz) {
      /* Pulso horizontal: parte de columna 0, fila aleatoria */
      pulses.push({
        x: 0,
        y: Math.floor(Math.random() * rows) * CELL,
        dx: 1.5 + Math.random() * 1.5,
        dy: 0,
        len: 60 + Math.random() * 80,   /* Longitud de la estela */
        life: 1,                          /* Opacidad (1 = lleno) */
      });
    } else {
      /* Pulso vertical: parte de fila 0, columna aleatoria */
      pulses.push({
        x: Math.floor(Math.random() * cols) * CELL,
        y: 0,
        dx: 0,
        dy: 1.5 + Math.random() * 1.5,
        len: 60 + Math.random() * 80,
        life: 1,
      });
    }
  }

  /* Dibuja un frame del canvas */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* --- 1a. Líneas de la cuadrícula --- */
    ctx.strokeStyle = `${COLOR} 0.07)`;
    ctx.lineWidth = 0.8;

    /* Líneas verticales */
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL, 0);
      ctx.lineTo(c * CELL, H);
      ctx.stroke();
    }

    /* Líneas horizontales */
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL);
      ctx.lineTo(W, r * CELL);
      ctx.stroke();
    }

    /* --- 1b. Nodos en intersecciones (puntos donde se cruzan las líneas) --- */
    ctx.fillStyle = `${COLOR} 0.25)`;
    /* Solo dibuja 1 de cada 3 intersecciones para efecto PCB disperso */
    for (let c = 0; c <= cols; c++) {
      for (let r = 0; r <= rows; r++) {
        if ((c + r) % 3 === 0) {
          ctx.beginPath();
          ctx.arc(c * CELL, r * CELL, NODE_R, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    /* --- 1c. Nodos destacados (círculos con borde luminoso en cruces especiales) --- */
    ctx.strokeStyle = `${COLOR} 0.4)`;
    ctx.lineWidth = 1;
    for (let c = 0; c <= cols; c++) {
      for (let r = 0; r <= rows; r++) {
        if ((c * 3 + r * 7) % 17 === 0) {
          ctx.beginPath();
          ctx.arc(c * CELL, r * CELL, NODE_R + 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    /* --- 1d. Pulsos de luz que viajan por las líneas --- */
    pulses = pulses.filter(p => {
      /* Avanzar posición del pulso */
      p.x += p.dx;
      p.y += p.dy;

      /* Reducir vida gradualmente cuando sale del canvas */
      const offscreen = p.x > W + p.len || p.y > H + p.len;
      if (offscreen) return false;  /* Eliminar pulso */

      /* Dibujar la estela degradada del pulso */
      const grad = ctx.createLinearGradient(
        p.x - p.dx * p.len, p.y - p.dy * p.len,  /* Inicio de estela */
        p.x, p.y                                   /* Punta del pulso */
      );

      /* Gradiente: transparente → azul brillante → blanco en la punta */
      grad.addColorStop(0, `${COLOR} 0)`);
      grad.addColorStop(0.6, `${COLOR} 0.4)`);
      grad.addColorStop(0.85, `rgba(80, 150, 255, 0.7)`);
      grad.addColorStop(1, `rgba(180, 220, 255, 0.9)`);

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.moveTo(p.x - p.dx * p.len, p.y - p.dy * p.len);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      /* Punto brillante en la cabeza del pulso */
      ctx.beginPath();
      ctx.fillStyle = `rgba(160, 210, 255, 0.9)`;
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();

      return true;  /* Mantener el pulso */
    });
  }

  /* Contador de frames para controlar la frecuencia de spawn */
  let frameCount = 0;

  /* Bucle de animación principal */
  function loop() {
    draw();
    frameCount++;

    /* Crear un nuevo pulso cada ~50 frames (aprox. cada 0.8s a 60fps) */
    if (frameCount % 50 === 0 && pulses.length < 15) {
      spawnPulse();
    }

    requestAnimationFrame(loop);
  }

  /* Inicializar */
  resize();
  window.addEventListener("resize", resize);

  /* Lanzar algunos pulsos iniciales */
  for (let i = 0; i < 5; i++) spawnPulse();

  loop();

})();


/* ----------------------------------------------------------------
   2. NAVBAR — Efecto de scroll y menú hamburguesa
   ---------------------------------------------------------------- */

(function initNavbar() {

  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");

  /* Cambiar estilo de navbar al hacer scroll */
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      /* Navbar más opaco al desplazarse */
      navbar.style.borderBottomColor = "rgba(13, 89, 242, 0.35)";
      navbar.style.boxShadow = "0 4px 30px rgba(0,0,0,0.4)";
    } else {
      /* Navbar transparente en la parte superior */
      navbar.style.borderBottomColor = "";
      navbar.style.boxShadow = "";
    }
  });

  /* Toggle del menú móvil */
  hamburger.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    /* Cambiar icono del botón según estado */
    hamburger.querySelector(".material-symbols-outlined").textContent =
      isOpen ? "close" : "menu";
  });

  /* Cerrar menú móvil al hacer click en un link */
  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      hamburger.querySelector(".material-symbols-outlined").textContent = "menu";
    });
  });

})();


/* ----------------------------------------------------------------
   3. ANIMACIONES DE ENTRADA — Intersection Observer
   Agrega clase "visible" a los elementos con clase "reveal"
   cuando entran en el viewport, disparando la animación CSS.
   ---------------------------------------------------------------- */

(function initRevealAnimations() {

  /* Agregar clase "reveal" a los elementos que queremos animar */
  const selectors = [
    "#hero .badge",
    "#hero .hero-title",
    "#hero .hero-sub",
    "#hero .hero-actions",
    ".glass-card",
    ".tech-chip",
    ".project-card",
    ".timeline-card",
    ".section-header",
    ".projects-header",
    ".about-text h2",
    ".about-text p",
    ".about-text .stats-grid",
    ".section-label",
  ];

  /* Seleccionar todos los elementos y marcarlos */
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.classList.add("reveal");
    });
  });

  /* Configuración del observer */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          /* Pequeño delay escalonado para efecto cascada */
          const delay = (entry.target.dataset.delay || 0) + i * 60;
          setTimeout(() => {
            entry.target.classList.add("visible");
          }, delay);
          /* Dejar de observar el elemento una vez revelado */
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,        /* 12% del elemento visible para disparar */
      rootMargin: "0px 0px -40px 0px",  /* Margen negativo abajo */
    }
  );

  /* Observar todos los elementos marcados */
  document.querySelectorAll(".reveal").forEach(el => {
    observer.observe(el);
  });

})();


/* ----------------------------------------------------------------
   4. SMOOTH SCROLL — para los links del navbar
   Aunque CSS scroll-behavior: smooth está activo, esto garantiza
   compatibilidad con todos los navegadores.
   ---------------------------------------------------------------- */

(function initSmoothScroll() {

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;  /* Ignorar links vacíos */

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();

      /* Calcular posición restando altura de la navbar */
      const navbarH = document.getElementById("navbar").offsetHeight;
      const top = targetEl.getBoundingClientRect().top + window.scrollY - navbarH;

      window.scrollTo({ top, behavior: "smooth" });
    });
  });

})();


/* ----------------------------------------------------------------
   5. BOTÓN "VIEW PROJECTS" del hero — Scroll a sección proyectos
   ---------------------------------------------------------------- */

(function initHeroButtons() {

  /* Botón "View Projects" */
  const btnGhost = document.querySelector(".hero-actions .btn-ghost");
  if (btnGhost) {
    btnGhost.addEventListener("click", () => {
      const projects = document.getElementById("projects");
      if (!projects) return;
      const navbarH = document.getElementById("navbar").offsetHeight;
      const top = projects.getBoundingClientRect().top + window.scrollY - navbarH;
      window.scrollTo({ top, behavior: "smooth" });
    });
  }

  /* Botón "Download CV" — aquí puedes cambiar el href real */
  const btnCV = document.querySelector(".btn-primary");
  if (btnCV) {
    btnCV.addEventListener("click", () => {
      /* Simulación: en producción se reemplaza con la URL real del CV */
      alert("CV disponible próximamente 🚀");
    });
  }

})();


/* ----------------------------------------------------------------
   6. EFECTO CURSOR personalizado (halo azul que sigue al mouse)
   ---------------------------------------------------------------- */

(function initCursorGlow() {

  const glow = document.createElement("div");
  glow.id = "cursor-glow";

  /* Estilos inline para el halo */
  Object.assign(glow.style, {
    position: "fixed",
    pointerEvents: "none",
    zIndex: "9999",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(13,89,242,0.08) 0%, transparent 70%)",
    transform: "translate(-50%, -50%)",
    transition: "left 0.12s ease, top 0.12s ease",
    left: "-999px",
    top: "-999px",
  });

  document.body.appendChild(glow);

  /* Seguir el cursor */
  document.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });

  /* Ocultar al salir de la ventana */
  document.addEventListener("mouseleave", () => {
    glow.style.left = "-999px";
    glow.style.top = "-999px";
  });

})();


/* ----------------------------------------------------------------
   BOTÓN DE IDIOMA — EN / ES
   Lee los atributos data-en y data-es de cada elemento
   y cambia el textContent al hacer click en el botón.
   ---------------------------------------------------------------- */
(function initLangToggle() {

  const btn = document.getElementById("langToggle");
  if (!btn) return;

  /* Estado inicial: inglés */
  let currentLang = "en";

  /* Referencias a los spans del botón para resaltar el activo */
  const spanEN = btn.querySelector(".lang-en");
  const spanES = btn.querySelector(".lang-es");

  btn.addEventListener("click", () => {

    /* Alternar idioma */
    currentLang = currentLang === "en" ? "es" : "en";

    /* Actualizar el resaltado visual del botón EN / ES */
    if (currentLang === "es") {
      spanEN.classList.remove("accent");
      spanES.classList.add("accent");
    } else {
      spanEN.classList.add("accent");
      spanES.classList.remove("accent");
    }

    /* Recorrer TODOS los elementos que tengan data-en y data-es
       y cambiar su textContent al idioma activo */
    document.querySelectorAll("[data-en][data-es]").forEach(el => {
      el.textContent = el.dataset[currentLang];
    });
  });

})();