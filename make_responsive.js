const fs = require('fs');
const path = require('path');

const files = ['about.html', 'attractions.html', 'gallery.html', 'contact.html'];

const appendCSS = `
    /* Hamburger button */
    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      gap: 5px;
      cursor: pointer;
      background: none;
      border: none;
      padding: 6px;
      border-radius: 6px;
      transition: background .18s;
    }

    .hamburger:hover {
      background: rgba(255,255,255,0.1); /* safe hover for dark navbars */
    }

    .hamburger span {
      display: block;
      width: 22px;
      height: 2px;
      background: currentColor; /* adapts to dark or light navbar text */
      border-radius: 2px;
      transition: transform .3s, opacity .3s;
      transform-origin: center;
    }

    .hamburger.open span:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }

    .hamburger.open span:nth-child(2) {
      opacity: 0;
    }

    .hamburger.open span:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }

    /* Mobile nav drawer */
    .mobile-nav {
      display: none;
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      z-index: 998;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      flex-direction: column;
      padding: 16px;
      gap: 4px;
      transform: translateY(-10px);
      opacity: 0;
      transition: transform .25s, opacity .25s;
    }

    .mobile-nav.open {
      display: flex;
      transform: translateY(0);
      opacity: 1;
    }

    .mobile-nav a {
      font-size: 0.95rem;
      font-weight: 500;
      color: #1e1209;
      padding: 12px 16px;
      border-radius: 8px;
      transition: background .18s;
      text-decoration: none;
    }

    .mobile-nav a:hover,
    .mobile-nav a.active {
      background: #f2ede8;
      color: #7a3b10;
    }

    .mobile-nav a.moto-anchor {
      background: #1a9a7a;
      color: #fff;
      border-radius: 8px;
      font-weight: 600;
      margin-top: 6px;
      text-align: center;
    }

    .mobile-nav a.moto-anchor:hover {
      background: #22b890;
    }

    /* Overlay when mobile menu open */
    .nav-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 997;
      background: rgba(0, 0, 0, .3);
      backdrop-filter: blur(2px);
    }

    .nav-overlay.open {
      display: block;
    }

    /* ══ RESPONSIVE BREAKPOINTS ══ */
    @media (max-width: 900px) {
      .nav-links {
        display: none !important;
      }
      .hamburger {
        display: flex;
        color: inherit;
      }
    }
`;

const appendJS = `
  <script>
    /* ══ HAMBURGER MENU ══ */
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    const navOverlay = document.getElementById('navOverlay');

    function toggleMenu(open) {
      if(hamburger) {
        hamburger.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', open);
      }
      if(navOverlay) navOverlay.classList.toggle('open', open);
      if(mobileNav) {
        if (open) {
          mobileNav.classList.add('open');
        } else {
          mobileNav.classList.remove('open');
        }
      }
    }

    if(hamburger) {
      hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.contains('open');
        toggleMenu(!isOpen);
      });
    }

    if(navOverlay) {
      navOverlay.addEventListener('click', () => toggleMenu(false));
    }

    if(mobileNav) {
      // Close mobile nav when a link is clicked
      mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
      });
    }
  </script>
</body>`;

files.forEach(file => {
  const filepath = path.join(__dirname, file);
  if (!fs.existsSync(filepath)) return;
  
  let content = fs.readFileSync(filepath, 'utf8');

  // Check if already modified
  if(content.includes('id="hamburger"')) {
    console.log(file + ' is already responsive.');
    return;
  }

  // 1. Inject CSS right before </style>
  content = content.replace('</style>', appendCSS + '\n  </style>');

  // 2. Inject hamburger button into <nav class="navbar"> right before </nav>
  //    and append the mobile-nav overlay HTML
  const hamburgerHTML = \`
    <!-- Hamburger (mobile) -->
    <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false" style="color: #fff">
      <span></span><span></span><span></span>
    </button>
  </nav>

  <!-- Mobile overlay -->
  <div class="nav-overlay" id="navOverlay"></div>

  <!-- Mobile nav drawer -->
  <nav class="mobile-nav" id="mobileNav">
    <a href="index (1).html" \${file === 'index.html' ? 'class="active"' : ''}>🏠 Home</a>
    <a href="about.html" \${file === 'about.html' ? 'class="active"' : ''}>📖 About</a>
    <a href="attractions.html" \${file === 'attractions.html' ? 'class="active"' : ''}>🗺️ Attractions</a>
    <a href="gallery.html" \${file === 'gallery.html' ? 'class="active"' : ''}>🖼️ Gallery</a>
    <a href="contact.html" \${file === 'contact.html' ? 'class="active"' : ''}>✉️ Contact</a>
    <a href="index (1).html#motourism" class="moto-anchor">🏍️ Motourism</a>
  </nav>\`;

  content = content.replace('</nav>', hamburgerHTML);

  // 3. Inject JS right before </body>
  content = content.replace('</body>', appendJS);

  fs.writeFileSync(filepath, content);
  console.log('Processed ' + file);
});
