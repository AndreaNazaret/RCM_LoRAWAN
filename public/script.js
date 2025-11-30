// --- LOGIC: SLIDE NAVIGATION ---
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('dots');

slides.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = `w-3 h-3 rounded-full transition-all duration-300 cursor-pointer hover:bg-blue-400 ${idx === 0 ? 'bg-blue-600 scale-125' : 'bg-slate-300'}`;
    dot.onclick = () => showSlide(idx);
    dotsContainer.appendChild(dot);
});

function showSlide(index) {
    if (index < 0) index = 0;
    if (index >= slides.length) index = slides.length - 1;
    currentSlide = index;

    slides.forEach((slide, idx) => {
        if (idx === currentSlide) {
            slide.classList.add('active');
            slide.style.opacity = '1';
            slide.style.transform = 'translateY(0)';
        } else {
            slide.classList.remove('active');
            slide.style.opacity = '0';
            slide.style.transform = idx < currentSlide ? 'translateY(-20px)' : 'translateY(20px)';
        }
    });

    const dots = dotsContainer.querySelectorAll('div');
    dots.forEach((dot, idx) => {
        dot.className = `w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'bg-blue-600 w-6' : 'bg-slate-300'}`;
    });

    if (currentSlide === 3) startChirpAnimation();
}

function nextSlide() { showSlide(currentSlide + 1); }
function prevSlide() { showSlide(currentSlide - 1); }

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextSlide();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevSlide();
});
showSlide(0);

// --- INTRO & FLIP CARDS ---
function toggleIntroDetails(element) {
    document.querySelectorAll('.intro-card').forEach(card => {
        if (card !== element) {
            card.classList.remove('open');
            card.querySelector('.toggle-icon').innerText = "+";
        }
    });
    const icon = element.querySelector('.toggle-icon');
    if (element.classList.contains('open')) {
        element.classList.remove('open');
        icon.innerText = "+";
    } else {
        element.classList.add('open');
        icon.innerText = "-";
    }
}

function toggleFlip(id) {
    const card = document.getElementById(id);
    card.classList.toggle('flipped');
}

// --- REALISTIC CHIRP ANIMATION (Up-Chirp) ---
const chirpCanvas = document.getElementById('chirpCanvas');
const chirpCtx = chirpCanvas.getContext('2d');
let timeOffset = 0;
let animationFrameId;

function startChirpAnimation() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    const dpr = window.devicePixelRatio || 1;
    const rect = chirpCanvas.getBoundingClientRect();
    chirpCanvas.width = rect.width * dpr;
    chirpCanvas.height = rect.height * dpr;
    chirpCtx.scale(dpr, dpr);

    function draw() {
        if (currentSlide !== 3) return;

        chirpCtx.clearRect(0, 0, rect.width, rect.height);
        chirpCtx.fillStyle = '#0f172a';
        chirpCtx.fillRect(0, 0, rect.width, rect.height);

        chirpCtx.strokeStyle = '#38bdf8';
        chirpCtx.lineWidth = 2;
        chirpCtx.beginPath();

        const width = rect.width;
        const height = rect.height;
        const amplitude = height * 0.35;
        const centerY = height / 2;
        const symbolDuration = 150;

        for (let x = 0; x < width; x++) {
            let t = (x + timeOffset) % symbolDuration;
            let y = centerY + Math.sin(t * t * 0.005) * amplitude;

            if (x === 0) chirpCtx.moveTo(x, y);
            else chirpCtx.lineTo(x, y);

            if (t < 2) {
                chirpCtx.stroke();
                chirpCtx.beginPath();
                chirpCtx.moveTo(x, y);
            }
        }
        chirpCtx.stroke();
        timeOffset += 1.5;
        animationFrameId = requestAnimationFrame(draw);
    }
    draw();
}

// --- INFO DISPLAYS (STACK) ---
const stackData = {
    lorawan: { title: "Capa MAC (LoRaWAN)", desc: "La capa MAC de LoRaWAN organiza cómo se envían y reciben los mensajes en la red y aplica las reglas de acceso al canal. Gestiona seguridad, clases de dispositivo y funciones como ADR o confirmaciones. Gracias a esta capa, la red mantiene orden, eficiencia y fiabilidad." },
    lora: { title: "Capa Física (LoRa)", desc: "La capa física LoRa utiliza una modulación de chirps que permite transmitir a gran distancia con muy bajo consumo. Es muy resistente al ruido y opera en bandas ISM sin licencia. Además, permite ajustar parámetros como el spreading factor para equilibrar alcance y velocidad." }
};
function showStackInfo(id) {
    document.getElementById('stack-title').innerText = stackData[id].title;
    document.getElementById('stack-desc').innerText = stackData[id].desc;
}

// --- LOGICA DE LA TRAMA (DRILL-DOWN) ---
function revealLayer(layerId) {
    // 1. Mostrar la capa
    const layer = document.getElementById(`layer-${layerId}`);
    layer.classList.remove('hidden');
    layer.classList.add('reveal-animation');

    // 2. Mensaje de contexto
    const cardTitle = document.getElementById('frame-title');
    const cardDesc = document.getElementById('frame-desc');
    const card = document.getElementById('frame-detail-card');

    if (layerId === 'mac') {
        cardTitle.innerText = "Capa MAC Desplegada";
        cardDesc.innerText = "Has desencapsulado el PHY Payload. Ahora puedes ver la cabecera MAC, el MIC de seguridad y el Payload MAC.";
        card.className = "h-full bg-yellow-50 rounded-xl shadow-lg border-l-8 border-yellow-500 p-6 transition-all duration-300";
    } else if (layerId === 'app') {
        cardTitle.innerText = "Capa Aplicación Desplegada";
        cardDesc.innerText = "Has desencapsulado el MAC Payload. Aquí es donde finalmente se encuentra el Payload de usuario (FRM Payload) y los comandos de control (FOpt).";
        card.className = "h-full bg-emerald-50 rounded-xl shadow-lg border-l-8 border-emerald-500 p-6 transition-all duration-300";
    }
}

const frameData = {
    preamble: { title: "Preamble", desc: "Sincronización. Despierta al receptor.", color: "border-slate-500", layer: "PHY" },
    phdr: { title: "PHDR", desc: "Longitud y Coding Rate.", color: "border-slate-600", layer: "PHY" },
    phdr_crc: { title: "PHDR CRC", desc: "Check de errores de la cabecera.", color: "border-slate-600", layer: "PHY" },
    crc: { title: "CRC", desc: "Check de errores de todo el paquete.", color: "border-slate-500", layer: "PHY" },

    mhdr: { title: "MHDR", desc: "Tipo de mensaje (Join, Data, ACK).", color: "border-yellow-500", layer: "MAC" },
    mic: { title: "MIC", desc: "Firma de seguridad (NwkSKey).", color: "border-yellow-500", layer: "MAC" },

    fhdr: { title: "FHDR", desc: "Cabecera de Trama (Dirección, Contador).", color: "border-emerald-600", layer: "FRAME" },
    fport: { title: "FPort", desc: "Puerto (0=MAC, 1+=App).", color: "border-purple-600", layer: "FRAME" },
    frmpayload: { title: "FRM Payload", desc: "Datos de usuario encriptados (AppSKey).", color: "border-blue-600", layer: "APP" }
};

function showFrameInfo(id) {
    const data = frameData[id];
    const cardTitle = document.getElementById('frame-title');
    const cardDesc = document.getElementById('frame-desc');
    const cardLayer = document.getElementById('frame-layer-tag');
    const card = document.getElementById('frame-detail-card');

    cardTitle.innerText = data.title;
    cardDesc.innerText = data.desc;
    cardLayer.innerText = data.layer;

    card.className = `h-full bg-white rounded-xl shadow-lg border-l-8 ${data.color} p-6 transition-all duration-300`;
}

function startNetSim() {
    const p = document.getElementById('sim-packet');
    p.classList.remove('packet-animate');
    void p.offsetWidth;
    p.classList.add('packet-animate');
}

// --- TIMELINE RENDERER ---
function renderTimeline(type) {
    const container = document.getElementById('timeline-elements');
    const desc = document.getElementById('class-description');
    container.innerHTML = '';
    let elements = [];
    if (type === 'A') {
        desc.innerHTML = "<strong>Clase A:</strong> Envía y espera un poco. Máximo ahorro.";
        elements = [{ type: 'tx', left: 10, width: 10, text: 'Uplink' }, { type: 'rx', left: 30, width: 5, text: 'RX1' }, { type: 'rx', left: 45, width: 5, text: 'RX2' }, { type: 'sleep', left: 50, width: 40, text: 'Zzz...' }];
    } else if (type === 'B') {
        desc.innerHTML = "<strong>Clase B:</strong> Escuchas programadas (Pings).";
        elements = [{ type: 'beacon', left: 5, width: 2, text: 'B' }, { type: 'rx', left: 20, width: 5, text: 'Ping' }, { type: 'rx', left: 40, width: 5, text: 'Ping' }, { type: 'tx', left: 60, width: 10, text: 'TX' }];
    } else {
        desc.innerHTML = "<strong>Clase C:</strong> Escucha continua.";
        elements = [{ type: 'rx-long', left: 0, width: 40, text: 'RX...' }, { type: 'tx', left: 40, width: 10, text: 'TX' }, { type: 'rx-long', left: 50, width: 50, text: 'RX...' }];
    }
    elements.forEach((el, index) => {
        const div = document.createElement('div');
        div.className = 'timeline-box';
        div.style.left = el.left + '%';
        div.style.width = el.width + '%';
        div.innerText = el.text;
        div.style.animationDelay = (index * 0.1) + 's';
        if (el.type === 'tx') div.className += ' bg-green-500 z-20 top-[15%] h-[70%]';
        if (el.type === 'rx') div.className += ' bg-blue-500 top-[30%] h-[40%]';
        if (el.type === 'rx-long') div.className += ' bg-blue-200 text-blue-800 border border-blue-400 top-[35%] h-[30%]';
        if (el.type === 'beacon') div.className += ' bg-purple-600 top-[10%] h-[80%]';
        if (el.type === 'sleep') div.className += ' bg-slate-200 text-slate-500 top-[40%] h-[20%]';
        container.appendChild(div);
    });
}

// Background
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
let width, height, particles = [];
function resize() { width = window.innerWidth; height = window.innerHeight; bgCanvas.width = width; bgCanvas.height = height; }
window.addEventListener('resize', resize); resize();
class Particle {
    constructor() { this.reset(); }
    reset() { this.x = Math.random() * width; this.y = Math.random() * height; this.vx = (Math.random() - 0.5) * 0.2; this.vy = (Math.random() - 0.5) * 0.2; this.size = Math.random() * 2; }
    update() { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.reset(); }
    draw() { bgCtx.fillStyle = 'rgba(148,163,184,0.5)'; bgCtx.beginPath(); bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2); bgCtx.fill(); }
}
for (let i = 0; i < 60; i++)particles.push(new Particle());
function animateBg() { bgCtx.clearRect(0, 0, width, height); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animateBg); }
animateBg();

// --- SEGURIDAD ---
const securityState = { nwk: false, app: false };
function toggleKey(type) {
    securityState[type] = !securityState[type];
    const isActive = securityState[type];
    const card = document.getElementById(`key-${type}`);
    if (isActive) card.classList.add('active'); else card.classList.remove('active');
    const ring = document.getElementById(`ring-${type}`);
    const statusIcon = type === 'nwk' ? document.getElementById('status-integrity') : document.getElementById('status-confidentiality');
    if (isActive) { ring.classList.add('active'); statusIcon.classList.add('status-active'); }
    else { ring.classList.remove('active'); statusIcon.classList.remove('status-active'); }
    updateLockState();
}
function updateLockState() {
    const lockIcon = document.getElementById('lock-icon');
    const lockText = document.getElementById('lock-text');
    const lockCircle = document.getElementById('lock-circle');
    if (securityState.nwk && securityState.app) {
        lockIcon.innerText = "🔒"; lockText.innerText = "SEGURO"; lockText.className = "text-green-400 font-bold text-xl uppercase tracking-widest"; lockCircle.classList.add('secure');
    } else {
        lockIcon.innerText = "🔓"; lockText.innerText = "INSEGURO"; lockText.className = "text-red-400 font-bold text-xl uppercase tracking-widest"; lockCircle.classList.remove('secure');
    }
}