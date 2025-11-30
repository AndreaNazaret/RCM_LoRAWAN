// --- LOGIC: SLIDE NAVIGATION ---
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('dots');

// Inicializar Dots (Puntos de navegación)
slides.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = `w-3 h-3 rounded-full transition-all duration-300 cursor-pointer hover:bg-blue-400 ${idx === 0 ? 'bg-blue-600 scale-125' : 'bg-slate-300'}`;
    dot.onclick = () => showSlide(idx); // Permitir clic en los puntos
    dotsContainer.appendChild(dot);
});
const dots = dotsContainer.querySelectorAll('div');

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

    dots.forEach((dot, idx) => {
        dot.className = `w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'bg-blue-600 w-6' : 'bg-slate-300'}`;
    });

    // Disparar animaciones específicas por slide
    if (currentSlide === 3) startChirpAnimation();
}

function nextSlide() { showSlide(currentSlide + 1); }
function prevSlide() { showSlide(currentSlide - 1); }

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextSlide();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevSlide();
});
showSlide(0);

// --- SLIDE 2: INTRO CARD TOGGLE ---
function toggleIntroDetails(element) {
    const details = element.querySelector('.details');
    const symbol = element.querySelector('span');

    // Cerrar otros
    document.querySelectorAll('.intro-card .details').forEach(d => {
        if (d !== details) d.classList.add('hidden');
    });
    document.querySelectorAll('.intro-card span').forEach(s => {
        if (s !== symbol) s.innerText = "+";
    });

    if (details.classList.contains('hidden')) {
        details.classList.remove('hidden');
        symbol.innerText = "-";
    } else {
        details.classList.add('hidden');
        symbol.innerText = "+";
    }
}

// --- SLIDE 4: CHIRP ANIMATION ---
const chirpCanvas = document.getElementById('chirpCanvas');
const chirpCtx = chirpCanvas.getContext('2d');
let chirpTime = 0;
let animationFrameId;

function startChirpAnimation() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    // Ajustar resolución
    const dpr = window.devicePixelRatio || 1;
    const rect = chirpCanvas.getBoundingClientRect();
    chirpCanvas.width = rect.width * dpr;
    chirpCanvas.height = rect.height * dpr;
    chirpCtx.scale(dpr, dpr);

    function draw() {
        if (currentSlide !== 3) return; // Parar si no estamos en el slide

        chirpCtx.clearRect(0, 0, rect.width, rect.height);
        chirpCtx.fillStyle = '#0f172a'; // Fondo oscuro
        chirpCtx.fillRect(0, 0, rect.width, rect.height);

        chirpCtx.strokeStyle = '#38bdf8'; // Cyan
        chirpCtx.lineWidth = 3;
        chirpCtx.beginPath();

        const width = rect.width;
        const height = rect.height;

        // Dibujar varios Chirps
        for (let i = 0; i < 3; i++) {
            let offset = (chirpTime + i * 100) % width;
            // Simular subida de frecuencia lineal
            for (let x = 0; x < width / 3; x++) {
                let gx = offset + x;
                if (gx > width) continue;

                let progress = x / (width / 3);
                let freq = 2 + progress * 30; // Frecuencia sube
                let y = height / 2 + Math.sin(x * freq * 0.1) * (height / 3);

                if (x === 0) chirpCtx.moveTo(gx, y); else chirpCtx.lineTo(gx, y);
            }
        }

        chirpCtx.stroke();
        chirpTime += 2;
        animationFrameId = requestAnimationFrame(draw);
    }
    draw();
}

// --- SLIDE 5: STACK INFO ---
const stackData = {
    lorawan: {
        title: "Capa MAC (LoRaWAN)",
        desc: "Define el protocolo de red. Se encarga de la estructura de paquetes, la encriptación (AES), la gestión de clases (A, B, C) y el Adaptive Data Rate (ADR). Es la inteligencia que permite gestionar miles de nodos."
    },
    lora: {
        title: "Capa Física (LoRa)",
        desc: "Es puramente radio. Utiliza modulación CSS (Chirp Spread Spectrum) para enviar bits a larga distancia resistiendo el ruido. No sabe nada de direcciones IP, ni de seguridad, ni de ACK. Solo envía chirps."
    }
};

function showStackInfo(id) {
    const data = stackData[id];
    document.getElementById('stack-title').innerText = data.title;
    document.getElementById('stack-desc').innerText = data.desc;
    document.getElementById('stack-info-panel').classList.add('border-l-8', id === 'lorawan' ? 'border-blue-600' : 'border-orange-600');
}

// --- SLIDE 7: NET SIM ---
function startNetSim() {
    const p = document.getElementById('sim-packet');
    p.classList.remove('packet-animate');
    void p.offsetWidth; // Trigger reflow
    p.classList.add('packet-animate');
}

// --- SLIDE 8: FRAME EXPLORER DATA ---
const frameData = {
    preamble: {
        title: "Preámbulo",
        size: "Variable (ej. 8 símbolos)",
        layer: "Física (LoRa)",
        desc: "Secuencia de chirps para sincronizar el receptor. No contiene datos, solo sirve para decir '¡Despierta, viene un mensaje!'.",
        color: "border-slate-500"
    },
    phdr: {
        title: "Physical Header (PHDR)",
        size: "Variable",
        layer: "Física",
        desc: "Indica el Coding Rate y la longitud del payload físico. Incluye un CRC propio para asegurar que la cabecera se leyó bien.",
        color: "border-slate-600"
    },
    mhdr: {
        title: "MAC Header (MHDR)",
        size: "1 Byte",
        layer: "MAC",
        desc: "Indica el tipo de mensaje: Join Request (unirse), Data Uplink (subida), Data Downlink (bajada) o Proprietary.",
        color: "border-yellow-600"
    },
    devaddr: {
        title: "Device Address (DevAddr)",
        size: "4 Bytes",
        layer: "MAC",
        desc: "Dirección temporal (no única mundialmente) que identifica al dispositivo en la red actual. Cambia si haces un nuevo Join.",
        color: "border-emerald-600"
    },
    fctrl: {
        title: "Frame Control (FCtrl)",
        size: "1 Byte",
        layer: "MAC",
        desc: "Bits de control para ADR (Adaptive Data Rate), ACK (Confirmación) y FPending (si hay más datos esperando en el server).",
        color: "border-emerald-500"
    },
    fcnt: {
        title: "Frame Counter (FCnt)",
        size: "2 Bytes",
        layer: "MAC",
        desc: "Contador incremental. Vital para la seguridad: evita 'Replay Attacks'. Si el servidor recibe un contador anterior, descarta el paquete.",
        color: "border-emerald-700"
    },
    fport: {
        title: "FPort",
        size: "1 Byte",
        layer: "MAC / App",
        desc: "Puerto lógico. Si es 0: Comandos MAC (configuración). Si es 1-223: Datos de usuario. Define qué clave (NwkSKey o AppSKey) se usa para descifrar.",
        color: "border-purple-600"
    },
    payload: {
        title: "FRM Payload",
        size: "Variable (hasta ~242B)",
        layer: "Aplicación",
        desc: "Tus datos (Temperatura, GPS, etc.). Está **encriptado** con la AppSKey. El operador de red transporta esto pero NO puede leerlo.",
        color: "border-blue-600"
    },
    mic: {
        title: "Message Integrity Code",
        size: "4 Bytes",
        layer: "MAC",
        desc: "Firma digital calculada con la NwkSKey. Garantiza que nadie ha modificado el mensaje en el aire (Integridad) y autentica al emisor.",
        color: "border-red-600"
    }
};

function showFrameInfo(id) {
    const data = frameData[id];
    const card = document.getElementById('frame-detail-card');

    // Update Text
    document.getElementById('frame-title').innerText = data.title;
    document.getElementById('frame-title').className = `text-3xl font-bold mb-4 ${data.color.replace('border', 'text')}`;
    document.getElementById('frame-size').innerText = `Tamaño: ${data.size}`;
    document.getElementById('frame-layer').innerText = `Capa: ${data.layer}`;
    document.getElementById('frame-desc').innerText = data.desc;

    // Visual Feedback
    card.className = `absolute inset-0 bg-white rounded-xl shadow-lg border-l-8 ${data.color} p-8 transition-all duration-300`;
}

// --- SLIDE 9: CLASSES TIMELINE RENDERER ---
function renderTimeline(type) {
    const container = document.getElementById('timeline-elements');
    const desc = document.getElementById('class-description');
    container.innerHTML = ''; // Limpiar

    let elements = [];
    let descriptionText = "";

    if (type === 'A') {
        descriptionText = "<strong>Clase A (Obligatoria):</strong> El dispositivo duerme siempre. Envía un dato (Uplink) y solo entonces abre dos ventanas cortas (RX1 y RX2) para escuchar. Si el servidor no responde ahí, tiene que esperar al siguiente Uplink. <strong>Máxima eficiencia de batería.</strong>";

        elements = [
            { type: 'tx', left: 10, width: 10, text: 'Uplink (TX)' },
            { type: 'wait', left: 20, width: 10, text: 'Delay' },
            { type: 'rx', left: 30, width: 5, text: 'RX1' },
            { type: 'wait', left: 35, width: 10, text: 'Delay' },
            { type: 'rx', left: 45, width: 5, text: 'RX2' },
            { type: 'sleep', left: 50, width: 40, text: 'SLEEP (Dormido)' }
        ];
    } else if (type === 'B') {
        descriptionText = "<strong>Clase B (Beacon):</strong> Igual que la A, pero abre ventanas de recepción extra (Ping Slots) en momentos programados. Se sincroniza con una señal 'Beacon' que envía el Gateway cada 128 segundos.";

        elements = [
            { type: 'beacon', left: 5, width: 2, text: 'B' },
            { type: 'rx', left: 20, width: 5, text: 'Ping' },
            { type: 'rx', left: 40, width: 5, text: 'Ping' },
            { type: 'tx', left: 60, width: 10, text: 'Uplink' },
            { type: 'rx', left: 75, width: 5, text: 'RX1' },
            { type: 'rx', left: 85, width: 5, text: 'RX2' }
        ];
    } else {
        descriptionText = "<strong>Clase C (Continuo):</strong> El receptor está SIEMPRE abierto, excepto cuando transmite. Latencia mínima para recibir comandos, pero consume mucha batería. Requiere alimentación externa.";

        elements = [
            { type: 'rx-long', left: 0, width: 40, text: 'RX Continuo' },
            { type: 'tx', left: 40, width: 10, text: 'TX' },
            { type: 'rx-long', left: 50, width: 50, text: 'RX Continuo' }
        ];
    }

    desc.innerHTML = descriptionText;

    // Dibujar elementos
    elements.forEach((el, index) => {
        const div = document.createElement('div');
        div.className = 'timeline-box';
        div.style.left = el.left + '%';
        div.style.width = el.width + '%';
        div.innerText = el.text;
        div.style.animationDelay = (index * 0.1) + 's';

        if (el.type === 'tx') div.className += ' bg-green-500 z-20 top-[15%] h-[70%]'; // Transmitir es alto
        if (el.type === 'rx') div.className += ' bg-blue-500 top-[30%] h-[40%]';
        if (el.type === 'rx-long') div.className += ' bg-blue-200 text-blue-800 border border-blue-400 top-[35%] h-[30%]';
        if (el.type === 'beacon') div.className += ' bg-purple-600 top-[10%] h-[80%]';
        if (el.type === 'wait') div.className += ' text-slate-400 bg-transparent shadow-none font-normal';
        if (el.type === 'sleep') div.className += ' bg-slate-200 text-slate-500 top-[40%] h-[20%]';

        container.appendChild(div);
    });
}

// --- BACKGROUND PARTICLES ---
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
let width, height;
let particles = [];

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    bgCanvas.width = width;
    bgCanvas.height = height;
}
window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 2;
        this.alpha = Math.random() * 0.5;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.reset();
    }
    draw() {
        bgCtx.fillStyle = `rgba(148, 163, 184, ${this.alpha})`;
        bgCtx.beginPath();
        bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        bgCtx.fill();
    }
}

for (let i = 0; i < 60; i++) particles.push(new Particle());

function animateBg() {
    bgCtx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateBg);
}
animateBg();