// ==========================================================================
// PrasoonOS System Core Scripts
// ==========================================================================

let highestZ = 100;
let activeTheme = 'indigo';
let resumeData = {};
let particles = [];
let paletteSelectedIndex = 0;
let paletteItemsList = [];

// ── 1. INITIALIZE SYSTEM ON LOAD ──
document.addEventListener('DOMContentLoaded', () => {
  // Load raw data from script tag
  try {
    const dataText = document.getElementById('resume-data-json').textContent;
    resumeData = JSON.parse(dataText);
  } catch (err) {
    console.error("Failed to parse resume JSON data: ", err);
  }

  // Init Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Start Boot Sequence
  runBootSequence();

  // Initialize Canvas Particles
  initParticles();

  // Start Clock
  startSystemClock();

  // Setup Global Draggable Listeners
  setupDraggableWindows();

  // Render Projects List
  renderProjectsGrid();

  // Bind UI Events
  bindUIEvents();

  // Initialize Battery Monitor
  initBatteryStatus();
});

// ── 2. SYSTEM BOOT LOADER ──
function runBootSequence() {
  const progressFill = document.getElementById('boot-progress');
  const bootLog = document.getElementById('boot-log');
  let progress = 0;
  
  const logSteps = [
    "[  OK  ] Initializing system core...",
    "[  OK  ] Loading modules: GEC_Bharatpur_2024_2028.ko...",
    "[  OK  ] Checking technical requirements...",
    "[  OK  ] Setting up HSL environment variables...",
    "[  OK  ] Setting theme: indigo active...",
    "[  OK  ] Reading user profile: Prasoon_Lawania...",
    "[  OK  ] Launching AI Agents & Q&A models...",
    "[  OK  ] Ready to start desktop session..."
  ];

  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 25) + 15; // 15% to 40% per tick
    if (progress > 100) progress = 100;
    progressFill.style.width = progress + '%';
    
    // Add logs dynamically
    if (progress > 15 && bootLog.children.length < 9) {
      appendBootLog(logSteps[0]);
    }
    if (progress > 30 && bootLog.children.length < 10) {
      appendBootLog(logSteps[1]);
    }
    if (progress > 45 && bootLog.children.length < 11) {
      appendBootLog(logSteps[2]);
    }
    if (progress > 60 && bootLog.children.length < 12) {
      appendBootLog(logSteps[3]);
    }
    if (progress > 75 && bootLog.children.length < 13) {
      appendBootLog(logSteps[4]);
    }
    if (progress > 90 && bootLog.children.length < 14) {
      appendBootLog(logSteps[5]);
      appendBootLog(logSteps[6]);
    }

    if (progress === 100) {
      clearInterval(interval);
      appendBootLog(logSteps[7]);
      setTimeout(() => {
        document.getElementById('boot-screen').style.opacity = '0';
        setTimeout(() => {
          document.getElementById('boot-screen').classList.add('hidden');
          // Show Desktop / Mobile environment
          document.getElementById('desktop-canvas').classList.remove('hidden');
          document.getElementById('mobile-canvas').classList.remove('hidden');
          showNotification("Welcome to PrasoonOS. Press Ctrl+K for search.", "cpu");
          
          // Open about window by default to greet users
          if (window.innerWidth > 768) {
            openWindow('about');
          }
        }, 150); // fast transition hide
      }, 180); // fast transition fade
    }
  }, 35); // tick every 35ms (instantly loads under 200ms!)
}

function appendBootLog(text) {
  const logDiv = document.getElementById('boot-log');
  const d = document.createElement('div');
  d.textContent = text;
  logDiv.appendChild(d);
  logDiv.scrollTop = logDiv.scrollHeight;
}

function rebootSystem() {
  document.getElementById('boot-screen').classList.remove('hidden');
  document.getElementById('boot-screen').style.opacity = '1';
  document.getElementById('desktop-canvas').classList.add('hidden');
  document.getElementById('mobile-canvas').classList.add('hidden');
  document.getElementById('boot-log').innerHTML = "<div>[  OK  ] Re-initializing bootloader modules...</div>";
  runBootSequence();
}

// ── 3. WINDOW CONTROLLER (DESKTOP DRAG & FOCUS) ──
function setupDraggableWindows() {
  const windows = document.querySelectorAll('.window');
  
  windows.forEach(win => {
    // Focus on window click
    win.addEventListener('pointerdown', () => {
      focusWindow(win);
    });
    
    // Window dragging disabled to match full-workspace single-app design
  });
}

function focusWindow(win) {
  if (typeof win === 'string') {
    win = document.getElementById('window-' + win);
  }
  if (!win || win.classList.contains('active-window')) return;

  document.querySelectorAll('.window').forEach(w => w.classList.remove('active-window'));
  win.classList.add('active-window');
  
  highestZ++;
  win.style.zIndex = highestZ;
}

function openWindow(appId) {
  // Close all other open windows first
  document.querySelectorAll('.window').forEach(w => {
    w.classList.add('closed');
  });

  const win = document.getElementById('window-' + appId);
  if (!win) return;

  win.classList.remove('closed');
  win.classList.remove('minimized');
  focusWindow(win);
  showNotification(`Opened application: ${appId}.app`, "folder-open");

  // Lazy-load Google Form iframe if opening contact app
  if (appId === 'contact') {
    const iframe = document.getElementById('contact-google-form');
    if (iframe && (iframe.src === 'about:blank' || !iframe.src || iframe.src === '')) {
      iframe.src = iframe.getAttribute('data-src');
    }
  }

  // Fade out desktop grid icons and bottom dock for a focused workspace
  const desktopIcons = document.querySelector('.desktop-grid');
  if (desktopIcons) desktopIcons.style.opacity = '0';
  const dock = document.querySelector('.dock-container');
  if (dock) dock.style.opacity = '0';
}

function closeWindow(appId) {
  const win = document.getElementById('window-' + appId);
  if (!win) return;
  win.classList.add('closed');

  // Fade back the desktop icons and dock once the window is closed
  const activeWindows = Array.from(document.querySelectorAll('.window')).filter(w => !w.classList.contains('closed'));
  if (activeWindows.length === 0) {
    const desktopIcons = document.querySelector('.desktop-grid');
    if (desktopIcons) desktopIcons.style.opacity = '1';
    const dock = document.querySelector('.dock-container');
    if (dock) dock.style.opacity = '1';
  }
}

function minimizeWindow(appId) {
  const win = document.getElementById('window-' + appId);
  if (!win) return;
  win.classList.add('minimized');
}

function maximizeWindow(appId) {
  const win = document.getElementById('window-' + appId);
  if (!win) return;
  
  win.classList.toggle('maximized');
  focusWindow(win);
}

function toggleResumeTheme() {
  const paper = document.getElementById('resume-paper-doc');
  if (paper) {
    paper.classList.toggle('dark');
  }
}

function printResume() {
  window.print();
}

// Export functions to window scope for HTML inline onclick attributes
window.toggleResumeTheme = toggleResumeTheme;
window.printResume = printResume;

// ── 4. CLOCK SYSTEM ──
function startSystemClock() {
  const clockEl = document.getElementById('system-clock');
  const menuClockEl = document.getElementById('menu-digital-clock');
  const mobClockEl = document.getElementById('mobile-digital-clock');
  
  function updateTime() {
    const now = new Date();
    
    // Time components
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Format components
    const dispHours12 = hours % 12 ? hours % 12 : 12;
    const dispHours24 = hours < 10 ? '0' + hours : hours;
    const dispMinutes = minutes < 10 ? '0' + minutes : minutes;
    const dispSeconds = seconds < 10 ? '0' + seconds : seconds;
    
    // Top-left Desktop Digital Clock (with hours, minutes, and seconds + AM/PM)
    if (menuClockEl) {
      menuClockEl.textContent = `${dispHours12}:${dispMinutes}:${dispSeconds} ${ampm}`;
    }
    
    // Original Top-right Desktop Clock
    if (clockEl) {
      clockEl.textContent = `${dispHours12}:${dispMinutes} ${ampm}`;
    }
    
    // Mobile Top-left Digital Clock (with hours, minutes, and seconds)
    if (mobClockEl) {
      mobClockEl.textContent = `${dispHours24}:${dispMinutes}:${dispSeconds}`;
    }
  }
  
  updateTime();
  setInterval(updateTime, 1000);
}

// ── 5. PROJECTS GRID RENDERER ──
function renderProjectsGrid() {
  const container = document.getElementById('projects-grid-container');
  if (!container || !resumeData.projects) return;

  container.innerHTML = '';
  
  resumeData.projects.forEach(proj => {
    const card = document.createElement('div');
    card.className = `project-card glassmorphic`;
    card.setAttribute('data-category', proj.category);
    
    let linksHTML = '';
    if (proj.id === 'praxa') {
      linksHTML += `<a href="#" onclick="openWindow('ai'); return false;" class="proj-link" title="Ask AI assistant"><i data-lucide="brain-circuit"></i></a>`;
    }
    const repoUrl = proj.github || "https://github.com/prasoonlawania";
    linksHTML += `<a href="${repoUrl}" target="_blank" rel="noopener" class="proj-link" title="View Source Code"><i data-lucide="github"></i></a>`;
    
    const techBadges = proj.tech.map(t => `<span class="tech-tag">${t}</span>`).join('');
    
    card.innerHTML = `
      <div class="project-card-header">
        <span class="project-badge">${proj.tag}</span>
        <div class="project-links">
          ${linksHTML}
        </div>
      </div>
      <h4 class="project-title font-outfit">${proj.title}</h4>
      <p class="project-desc font-inter">${proj.description}</p>
      <div class="project-arch">${proj.architecture}</div>
      <div class="project-tech">
        ${techBadges}
      </div>
    `;

    // Add 3D card tilt listeners
    bindTiltEffect(card);

    container.appendChild(card);
  });

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function filterProjects(cat, btn) {
  // Tabs active logic
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const cards = document.querySelectorAll('.project-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    if (cat === 'all' || cardCat === cat) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

function bindTiltEffect(card) {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    card.style.borderColor = 'var(--accent-light)';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    card.style.borderColor = 'var(--border-color)';
  });
}

// ── 6. COMMAND PALETTE (CTRL + K) ──
function toggleCommandPalette() {
  const modal = document.getElementById('command-palette-modal');
  const input = document.getElementById('palette-search-input');
  
  if (modal.classList.contains('hidden')) {
    modal.classList.remove('hidden');
    input.value = '';
    input.focus();
    renderPaletteResults('');
  } else {
    modal.classList.add('hidden');
  }
}

function renderPaletteResults(query) {
  const container = document.getElementById('palette-results');
  container.innerHTML = '';
  
  const commands = [
    { name: "About Prasoon Lawania", type: "app", id: "about", action: "open", icon: "user" },
    { name: "Featured Projects", type: "app", id: "projects", action: "open", icon: "folder-git-2" },
    { name: "Technical Skills", type: "app", id: "skills", action: "open", icon: "sliders" },
    { name: "AI Assistant", type: "app", id: "ai", action: "open", icon: "brain-circuit" },
    { name: "Now (Learning focus)", type: "app", id: "now", action: "open", icon: "clock" },
    { name: "Contact & Socials", type: "app", id: "contact", action: "open", icon: "mail" },
    { name: "Resume / CV Viewer", type: "app", id: "resume", action: "open", icon: "file-text" },
    { name: "Set Theme Accent: Indigo", type: "theme", id: "indigo", action: "theme", icon: "palette" },
    { name: "Set Theme Accent: Emerald", type: "theme", id: "emerald", action: "theme", icon: "palette" },
    { name: "Set Theme Accent: Crimson", type: "theme", id: "crimson", action: "theme", icon: "palette" },
    { name: "Set Theme Accent: Golden", type: "theme", id: "golden", action: "theme", icon: "palette" },
    { name: "Restart Desktop Session", type: "system", action: "restart", icon: "rotate-ccw" }
  ];

  const filtered = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(query.toLowerCase()) || 
    cmd.type.toLowerCase().includes(query.toLowerCase())
  );

  paletteItemsList = filtered;
  paletteSelectedIndex = 0;

  if (filtered.length === 0) {
    container.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No results found.</div>`;
    return;
  }

  filtered.forEach((cmd, idx) => {
    const div = document.createElement('div');
    div.className = `palette-item ${idx === 0 ? 'selected' : ''}`;
    div.innerHTML = `
      <div class="palette-item-left">
        <i data-lucide="${cmd.icon}"></i>
        <span>${cmd.name}</span>
      </div>
      <span class="palette-item-type">${cmd.type}</span>
    `;
    
    div.addEventListener('click', () => {
      executePaletteAction(cmd);
      toggleCommandPalette();
    });

    container.appendChild(div);
  });

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function executePaletteAction(cmd) {
  if (cmd.action === 'open') {
    if (window.innerWidth <= 768) {
      openMobileApp(cmd.id);
    } else {
      openWindow(cmd.id);
    }
  } else if (cmd.action === 'theme') {
    setAccentTheme(cmd.id);
  } else if (cmd.action === 'resume') {
    downloadResume();
  } else if (cmd.action === 'restart') {
    rebootSystem();
  }
}

// ── 7. RESPONSIVE MOBILE SHEET BINDINGS ──
function openMobileApp(appId) {
  const sheet = document.getElementById('mobile-sheet');
  const overlay = document.getElementById('mobile-sheet-overlay');
  const title = document.getElementById('mobile-sheet-title');
  const body = document.getElementById('mobile-sheet-body');
  
  const win = document.getElementById('window-' + appId);
  if (!win) return;

  const winBody = win.querySelector('.window-body');
  
  // Setup content
  title.textContent = appId.toUpperCase();
  body.innerHTML = winBody.innerHTML;

  // Lazy-load Google Form iframe in mobile drawer if opening contact app
  if (appId === 'contact') {
    const iframe = body.querySelector('#contact-google-form');
    if (iframe && (iframe.src === 'about:blank' || !iframe.src || iframe.src === '')) {
      const mainIframe = document.getElementById('contact-google-form');
      const targetUrl = mainIframe ? mainIframe.getAttribute('data-src') : 'https://docs.google.com/forms/d/e/1FAIpQLSetN9lOjMV5Wb0u5iry90JbvUeeWBEDEMszsVcD289JXoqWAg/viewform?embedded=true';
      iframe.src = targetUrl;
    }
  }
  
  // Display elements
  overlay.classList.remove('hidden');
  sheet.classList.remove('hidden');

  // Trigger special initializers for copied widgets
  if (appId === 'ai') {
    // Bind AI chat send button
    const chatInput = body.querySelector('#ai-chat-input');
    const sendBtn = body.querySelector('#ai-send-btn');
    if (chatInput && sendBtn) {
      sendBtn.addEventListener('click', () => handleAiChatSubmit(chatInput, body.querySelector('#ai-chat-history')));
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAiChatSubmit(chatInput, body.querySelector('#ai-chat-history'));
      });
    }
  } else if (appId === 'contact') {
    const contactForm = body.querySelector('#contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const success = body.querySelector('#contact-success-msg');
        contactForm.classList.add('hidden');
        success.classList.remove('hidden');
        showNotification("Message sent successfully!", "check-circle");
      });
    }
  }

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function closeActiveMobileSheet() {
  document.getElementById('mobile-sheet').classList.add('hidden');
  document.getElementById('mobile-sheet-overlay').classList.add('hidden');
}

// ── 8. SYSTEM CONFIGURATION & THEMING ──
function setAccentTheme(themeName) {
  const body = document.body;
  
  // Remove old themes
  body.classList.remove('theme-indigo', 'theme-emerald', 'theme-crimson', 'theme-golden');
  
  // Add new
  body.classList.add('theme-' + themeName);
  activeTheme = themeName;

  // Toggle active styling buttons inside settings
  document.querySelectorAll('.color-option-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById('btn-theme-' + themeName);
  if (activeBtn) activeBtn.classList.add('active');

  showNotification(`System accent theme updated to: ${themeName}`, "palette");
}

function downloadResume() {
  showNotification("Downloading Prasoon_Resume.pdf...", "download");
  
  const link = document.createElement('a');
  link.href = 'resume.pdf';
  link.download = 'Prasoon_Resume.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification("Resume PDF downloaded successfully.", "file-text");
}

// ── 9. SYSTEM NOTIFICATION SERVICE ──
function showNotification(message, iconName = "bell") {
  const container = document.getElementById('notification-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  
  toast.innerHTML = `
    <div class="toast-icon"><i data-lucide="${iconName}"></i></div>
    <div class="toast-message">${message}</div>
  `;
  
  container.appendChild(toast);
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Remove toast after delay
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// ── 10. BACKGROUND CANVAS PARTICLES (DYNAMIC AURORAL NEBULA FLUID SIMULATION) ──
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  // Attempt to initialize WebGL (WebGL2 with fallback to WebGL1)
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    console.warn("WebGL not supported, falling back to simple canvas gradients");
    initCanvasFallback();
    return;
  }

  // Vertex shader source
  const vsSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // Fragment shader source (premium multi-colored fluid simulation with mouse interaction & vignette)
  const fsSource = `
    #ifdef GL_ES
    precision highp float;
    #endif

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_scroll;
    uniform float u_opacity;

    // Up to 16 mouse trail points
    uniform vec2 u_trail_pos[16];
    uniform vec2 u_trail_vel[16];
    uniform float u_trail_life[16];

    // 2D Hash Helper
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    // 2D Value Noise
    float noise(vec2 p) {
      vec2 ip = floor(p);
      vec2 fp = fract(p);
      fp = fp * fp * (3.0 - 2.0 * fp); // smoothstep interpolation
      
      float a = hash(ip + vec2(0.0, 0.0));
      float b = hash(ip + vec2(1.0, 0.0));
      float c = hash(ip + vec2(0.0, 1.0));
      float d = hash(ip + vec2(1.0, 1.0));
      
      return mix(mix(a, b, fp.x), mix(c, d, fp.x), fp.y);
    }

    // Fractal Brownian Motion (4 octaves)
    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      
      // Scaling coordinate space for detailed fluid structures
      p *= 2.6;
      
      // Parallax scroll vertical displacement
      p.y += u_scroll * 0.16;

      // Apply mouse trail distortions (vortex swirls + velocity push forces)
      for (int i = 0; i < 16; i++) {
        float life = u_trail_life[i];
        if (life <= 0.0) continue;
        
        vec2 m = u_trail_pos[i];
        vec2 vel = u_trail_vel[i];
        
        vec2 toMouse = p - m;
        float d = length(toMouse);
        
        // Swirl / Vortex rotation around segment center
        float swirlStrength = life * 0.55;
        float swirlRadius = 0.65;
        float swirlInfluence = exp(-d * d / (2.0 * swirlRadius * swirlRadius));
        float angle = swirlStrength * swirlInfluence * 8.5;
        
        mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        p = m + rot * toMouse;
        
        // Velocity push advection
        float pushInfluence = exp(-d * d / (2.0 * 0.45 * 0.45));
        p -= vel * life * pushInfluence * 0.18;
      }

      // Base flowing drift time
      float flowTime = u_time * 0.14;

      // Domain Warping for dynamic liquid smoke patterns
      // Warping stage 1
      vec2 q = vec2(
        fbm(p + vec2(0.0, 0.0) + vec2(flowTime * 0.22, flowTime * 0.11)),
        fbm(p + vec2(5.2, 1.3) - vec2(flowTime * 0.14, flowTime * 0.28))
      );

      // Warping stage 2
      vec2 r = vec2(
        fbm(p + 3.0 * q + vec2(1.7, 9.2) + vec2(flowTime * 0.08, -flowTime * 0.04)),
        fbm(p + 3.0 * q + vec2(8.3, 2.8) - vec2(-flowTime * 0.09, flowTime * 0.15))
      );

      // Final domain warped output
      float f = fbm(p + 3.0 * r);

      // Modern company theme colors:
      vec3 cyan = vec3(0.0, 0.9, 1.0);       // Electric Cyan
      vec3 blue = vec3(0.23, 0.51, 0.96);     // Neon Blue
      vec3 purple = vec3(0.55, 0.36, 0.96);   // Purple
      vec3 violet = vec3(0.66, 0.33, 0.97);   // Violet
      vec3 pink = vec3(0.93, 0.28, 0.6);      // Soft Pink
      vec3 emerald = vec3(0.06, 0.73, 0.50);  // Emerald

      // Mix colors organically using warped FBM coordinates
      vec3 col = mix(purple, cyan, f);
      col = mix(col, blue, length(q));
      col = mix(col, violet, r.x);
      col = mix(col, pink, r.y * 0.38);

      // Soft emerald highlights
      float emeraldMix = fbm(p * 1.6 - vec2(flowTime * 0.04));
      if (emeraldMix > 0.62) {
        col = mix(col, emerald, (emeraldMix - 0.62) * 1.8);
      }

      // Soft light bloom glow
      float glow = pow(f, 3.2) * 1.3;
      col += glow * vec3(0.85, 0.92, 1.0) * 0.22;

      // Vignette to fade coordinates out near screen edges
      float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
      vignette = clamp(pow(16.0 * vignette, 0.75), 0.0, 1.0);
      col *= vignette;

      // Deep Black base background (#050505)
      vec3 baseBg = vec3(0.02, 0.02, 0.02);
      vec3 finalCol = mix(baseBg, col, 0.31 * u_opacity); // Subtle 31% opacity for readability

      gl_FragColor = vec4(finalCol, 1.0);
    }
  `;

  // Helper to compile shaders
  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return;

  // Link shader program
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    return;
  }

  // Get uniform locations
  const uResLoc = gl.getUniformLocation(program, "u_resolution");
  const uTimeLoc = gl.getUniformLocation(program, "u_time");
  const uScrollLoc = gl.getUniformLocation(program, "u_scroll");
  const uOpacityLoc = gl.getUniformLocation(program, "u_opacity");
  
  const uTrailPosLoc = gl.getUniformLocation(program, "u_trail_pos");
  const uTrailVelLoc = gl.getUniformLocation(program, "u_trail_vel");
  const uTrailLifeLoc = gl.getUniformLocation(program, "u_trail_life");

  // Create full-screen quad vertex buffer
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0, -1.0,
     1.0, -1.0,
    -1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
     1.0,  1.0,
  ]), gl.STATIC_DRAW);

  const posAttrLoc = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(posAttrLoc);
  gl.vertexAttribPointer(posAttrLoc, 2, gl.FLOAT, false, 0, 0);

  // Resize canvas handler
  function resize() {
    // Render at 1/2 resolution for peak GPU performance
    canvas.width = Math.ceil(window.innerWidth / 2);
    canvas.height = Math.ceil(window.innerHeight / 2);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  // Interactive mouse pointer trails history
  const maxTrail = 16;
  const trail = [];
  let mouseX = 0;
  let mouseY = 0;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let hasMoved = false;

  // Track mouse coordinates
  document.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (!hasMoved) {
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      hasMoved = true;
    }
  });

  // Track touch/mobile coordinates
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      if (!hasMoved) {
        prevMouseX = mouseX;
        prevMouseY = mouseY;
        hasMoved = true;
      }
    }
  }, { passive: true });

  // Uniform arrays
  const trailPos = new Float32Array(maxTrail * 2);
  const trailVel = new Float32Array(maxTrail * 2);
  const trailLife = new Float32Array(maxTrail);

  // Cinematic load opacity
  let opacity = 0.0;
  const startTime = Date.now();
  let scrollOffset = 0;

  // Track scroll position
  window.addEventListener('scroll', () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollOffset = maxScroll > 0 ? window.pageYOffset / maxScroll : 0;
  }, { passive: true });

  function animate() {
    const elapsed = (Date.now() - startTime) / 1000;
    
    // Slow fade-in over 2.5 seconds on load (cinematic reveal)
    if (opacity < 1.0) {
      opacity += 0.008;
      if (opacity > 1.0) opacity = 1.0;
    }

    // Add new mouse point to trail if moved
    if (hasMoved) {
      const dx = mouseX - prevMouseX;
      const dy = mouseY - prevMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > 1.5) {
        // Map viewport coords to normalized coordinate space (-aspect to aspect, -1 to 1)
        const aspect = window.innerWidth / window.innerHeight;
        const normX = ((mouseX / window.innerWidth) - 0.5) * 2.0 * aspect * 1.3;
        const normY = (0.5 - (mouseY / window.innerHeight)) * 2.0 * 1.3;

        const vx = (dx / window.innerWidth) * 2.5 * aspect;
        const vy = -(dy / window.innerHeight) * 2.5;

        // Add to history
        trail.push({
          x: normX,
          y: normY,
          vx: vx,
          vy: vy,
          life: 1.0
        });

        // Cap size
        if (trail.length > maxTrail) {
          trail.shift();
        }
      }
      
      prevMouseX = mouseX;
      prevMouseY = mouseY;
    }

    // Update trail segment lifetimes and drift positions
    for (let i = trail.length - 1; i >= 0; i--) {
      const t = trail[i];
      t.life -= 0.016; // fade out segment over ~1 second
      
      // Drift segment with inertia
      t.x += t.vx * 0.045;
      t.y += t.vy * 0.045;
      
      // Decelerate inertia drift
      t.vx *= 0.96;
      t.vy *= 0.96;

      if (t.life <= 0.0) {
        trail.splice(i, 1);
      }
    }

    // Pack trail data into flat Float32 arrays for GLSL uniforms
    for (let i = 0; i < maxTrail; i++) {
      if (i < trail.length) {
        const t = trail[i];
        trailPos[i * 2] = t.x;
        trailPos[i * 2 + 1] = t.y;
        trailVel[i * 2] = t.vx;
        trailVel[i * 2 + 1] = t.vy;
        trailLife[i] = t.life;
      } else {
        trailPos[i * 2] = 0.0;
        trailPos[i * 2 + 1] = 0.0;
        trailVel[i * 2] = 0.0;
        trailVel[i * 2 + 1] = 0.0;
        trailLife[i] = 0.0;
      }
    }

    // Render WebGL frame
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    // Upload uniforms
    gl.uniform2f(uResLoc, canvas.width, canvas.height);
    gl.uniform1f(uTimeLoc, elapsed);
    gl.uniform1f(uScrollLoc, scrollOffset);
    gl.uniform1f(uOpacityLoc, opacity);

    gl.uniform2fv(uTrailPosLoc, trailPos);
    gl.uniform2fv(uTrailVelLoc, trailVel);
    gl.uniform1fv(uTrailLifeLoc, trailLife);

    // Draw full-screen quad
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(animate);
  }

  animate();
}

function initCanvasFallback() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  
  function animate() {
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw simple flowing radial color gradients
    const time = Date.now() * 0.0002;
    const x = canvas.width / 2 + Math.cos(time) * 100;
    const y = canvas.height / 2 + Math.sin(time) * 100;
    
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 300);
    grad.addColorStop(0, "rgba(139, 92, 246, 0.08)");
    grad.addColorStop(1, "rgba(5, 5, 5, 0)");
    
    ctx.beginPath();
    ctx.arc(x, y, 300, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    
    requestAnimationFrame(animate);
  }
  animate();
}

// ── 11. CLICK EFFECT MANAGER ──
document.addEventListener('click', (e) => {
  const container = document.getElementById('click-effect-container');
  if (!container) return;

  const ripple = document.createElement('div');
  ripple.className = 'click-ripple';
  ripple.style.left = e.pageX + 'px';
  ripple.style.top = e.pageY + 'px';
  
  container.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 400);
});

// ── 12. BIND DOM UI EVENTS ──
function bindUIEvents() {
  // 1. Menu triggers
  const sysMenuBtn = document.getElementById('system-menu-btn');
  const sysDropdown = document.getElementById('system-dropdown');
  const themeDropdown = document.getElementById('theme-dropdown');

  sysMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sysDropdown.classList.toggle('active');
    themeDropdown.classList.remove('active');
  });

  document.addEventListener('click', () => {
    if (sysDropdown) sysDropdown.classList.remove('active');
    if (themeDropdown) themeDropdown.classList.remove('active');
  });

  // Hotkeys (Ctrl+K palette)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggleCommandPalette();
    }
    
    // Esc close command palette
    if (e.key === 'Escape') {
      const palette = document.getElementById('command-palette-modal');
      if (palette && !palette.classList.contains('hidden')) {
        toggleCommandPalette();
      }
    }
  });

  // Search input change palette
  const searchInput = document.getElementById('palette-search-input');
  searchInput.addEventListener('input', (e) => {
    renderPaletteResults(e.target.value);
  });

  // Palette Keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    const list = document.getElementById('palette-results');
    const items = list.querySelectorAll('.palette-item');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[paletteSelectedIndex].classList.remove('selected');
      paletteSelectedIndex = (paletteSelectedIndex + 1) % items.length;
      items[paletteSelectedIndex].classList.add('selected');
      items[paletteSelectedIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[paletteSelectedIndex].classList.remove('selected');
      paletteSelectedIndex = (paletteSelectedIndex - 1 + items.length) % items.length;
      items[paletteSelectedIndex].classList.add('selected');
      items[paletteSelectedIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (paletteItemsList[paletteSelectedIndex]) {
        executePaletteAction(paletteItemsList[paletteSelectedIndex]);
        toggleCommandPalette();
      }
    }
  });

  // Contact form submit handled inline via handleContactSubmit
}

function toggleThemeDropdown(e) {
  e.stopPropagation();
  const themeDropdown = document.getElementById('theme-dropdown');
  themeDropdown.classList.toggle('active');
  
  // Close menu dropdown
  document.getElementById('system-dropdown').classList.remove('active');
}

let googleFormSubmitted = false;

function handleContactSubmit(e) {
  // Do NOT preventDefault, let the form submit natively to the target iframe
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader" class="logo-spinner" style="width: 14px; height: 14px; margin: 0;"></i> Sending...';
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
  
  googleFormSubmitted = true;
}

function handleIframeLoad() {
  if (googleFormSubmitted) {
    const contactForm = document.getElementById('contact-form');
    const successMsg = document.getElementById('contact-success-msg');
    
    if (contactForm) contactForm.classList.add('hidden');
    if (successMsg) successMsg.classList.remove('hidden');
    
    showNotification("Message sent successfully!", "check-circle");
    
    // Reset form fields
    if (contactForm) contactForm.reset();
    
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i data-lucide="send"></i> Send Message';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    googleFormSubmitted = false; // reset state
  }
}

function triggerMailtoFallback(name, email, message) {
  const contactForm = document.getElementById('contact-form');
  const primaryEmail = "plawania05@gmail.com";
  const secondaryEmail = "prasoonlawania@ecbharatpur.ac.in";
  
  const subject = encodeURIComponent("Portfolio OS: Contact Inquiry from " + name);
  const body = encodeURIComponent(
    "Hi Prasoon,\n\n" + 
    message + "\n\n" + 
    "--- \n" + 
    "Sender Name: " + name + "\n" + 
    "Sender Email: " + email
  );
  
  // Launch system mail client
  window.location.href = `mailto:${primaryEmail},${secondaryEmail}?subject=${subject}&body=${body}`;
  
  showNotification("Mail client launched!", "mail");
  if (contactForm) contactForm.classList.add('hidden');
  document.getElementById('contact-success-msg').classList.remove('hidden');
}

// ── 12. REAL-TIME BATTERY STATUS API MANAGER ──
function initBatteryStatus() {
  const deskPercentEl = document.getElementById('desktop-battery-percent');
  const mobPercentEl = document.getElementById('mobile-battery-percent');
  const deskIconEl = document.getElementById('desktop-battery-icon');
  const mobIconEl = document.getElementById('mobile-battery-icon');

  function updateBatteryUI(level, isCharging) {
    const percentStr = Math.round(level * 100) + '%';
    
    // Update text
    if (deskPercentEl) deskPercentEl.textContent = percentStr;
    if (mobPercentEl) mobPercentEl.textContent = percentStr;

    // Determine charging icon names or styling
    let batteryIcon = "battery";
    if (isCharging) {
      batteryIcon = "battery-charging";
    }

    // Lucide icon replacement helper
    function setIconAttr(iconEl, name) {
      if (iconEl) {
        iconEl.setAttribute('data-lucide', name);
        if (typeof lucide !== 'undefined') {
          // Re-trigger icon rebuild for modified icons
          lucide.createIcons();
        }
      }
    }

    if (deskIconEl) setIconAttr(deskIconEl, batteryIcon);
    if (mobIconEl) setIconAttr(mobIconEl, batteryIcon);
  }

  // Hook into browser Battery API
  if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
      // Set initial values
      updateBatteryUI(battery.level, battery.charging);

      // Bind dynamic change listeners
      battery.addEventListener('levelchange', () => {
        updateBatteryUI(battery.level, battery.charging);
      });
      battery.addEventListener('chargingchange', () => {
        updateBatteryUI(battery.level, battery.charging);
      });
    }).catch(err => {
      console.warn("Battery status reading failed:", err);
      updateBatteryUI(0.85, false);
    });
  } else {
    // Non-supported browsers fallback
    updateBatteryUI(0.85, false);
  }
}

// Export functions to window scope
window.handleContactSubmit = handleContactSubmit;
window.handleIframeLoad = handleIframeLoad;
window.triggerMailtoFallback = triggerMailtoFallback;
window.initBatteryStatus = initBatteryStatus;
