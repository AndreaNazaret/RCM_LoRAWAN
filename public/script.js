// --- LOGIC ---
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.getElementById('dots');

// Init Dots
slides.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-blue-600 scale-125' : 'bg-slate-300'}`;
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
            slide.style.transform = 'translateY(0) scale(1)';
            slide.style.opacity = '1';
        } else if (idx < currentSlide) {
            slide.classList.remove('active');
            slide.style.transform = 'translateY(-100%) scale(0.9)';
            slide.style.opacity = '0';
        } else {
            slide.classList.remove('active');
            slide.style.transform = 'translateY(100%) scale(0.9)';
            slide.style.opacity = '0';
        }
    });

    dots.forEach((dot, idx) => {
        dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-blue-600 w-4' : 'bg-slate-300'}`;
    });

    if(currentSlide === 3) startChirpAnimation();
}

function nextSlide() { showSlide(currentSlide + 1); }
function prevSlide() { showSlide(currentSlide - 1); }

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextSlide();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevSlide();
});
showSlide(0);

// --- ANIMATIONS ---
const chirpCanvas = document.getElementById('chirpCanvas');
const chirpCtx = chirpCanvas.getContext('2d');
let chirpTime = 0;
function startChirpAnimation() {
    function draw() {
        if (currentSlide !== 3) return;
        chirpCtx.clearRect(0, 0, chirpCanvas.width, chirpCanvas.height);
        chirpCtx.strokeStyle = '#3b82f6';
        chirpCtx.lineWidth = 2;
        chirpCtx.beginPath();
        const width = chirpCanvas.width, height = chirpCanvas.height, amp = 50;
        for (let x = 0; x < width; x++) {
            let freq = 1 + (x/width) * 20; 
            let y = height / 2 + Math.sin(x * freq * 0.05 - chirpTime * 0.1) * amp;
            if (x===0) chirpCtx.moveTo(x, y); else chirpCtx.lineTo(x, y);
        }
        chirpCtx.stroke();
        chirpTime += 2;
        requestAnimationFrame(draw);
    }
    draw();
}

// --- FRAME EXPLORER DATA ---
const frameData = {
    preamble: {
        title: "Preámbulo",
        size: "Variable (ej. 8 símbolos)",
        layer: "Física (LoRa)",
        desc: "Una secuencia de 0s y 1s (o chirps) que sirve para despertar al receptor y sincronizar el reloj antes de que lleguen los datos reales.",
        color: "border-slate-500"
    },
    phdr: {
        title: "Physical Header (PHDR)",
        size: "Variable",
        layer: "Física",
        desc: "Contiene información sobre el tamaño del paquete y el Coding Rate utilizado. Incluye su propio CRC para asegurar que la cabecera es correcta.",
        color: "border-slate-600"
    },
    mhdr: {
        title: "MAC Header (MHDR)",
        size: "1 Byte",
        layer: "MAC (LoRaWAN)",
        desc: "Indica el tipo de mensaje (ej. Join Request, Data Uplink, Data Downlink) y la versión mayor del protocolo LoRaWAN.",
        color: "border-yellow-600"
    },
    devaddr: {
        title: "Device Address (DevAddr)",
        size: "4 Bytes",
        layer: "MAC",
        desc: "La dirección lógica de 32 bits del dispositivo en la red actual. NO es única mundialmente (como el DevEUI), cambia si te unes a otra red.",
        color: "border-emerald-600"
    },
    fctrl: {
        title: "Frame Control (FCtrl)",
        size: "1 Byte",
        layer: "MAC",
        desc: "Controla funciones adaptativas (ADR), confirmaciones (ACK) y si hay más datos pendientes.",
        color: "border-emerald-500"
    },
    fcnt: {
        title: "Frame Counter (FCnt)",
        size: "2 Bytes",
        layer: "MAC",
        desc: "Contador de secuencia. Fundamental para la seguridad: evita ataques de repetición (Replay Attacks). Si el servidor recibe un contador bajo, lo ignora.",
        color: "border-emerald-700"
    },
    fport: {
        title: "FPort",
        size: "1 Byte",
        layer: "MAC / App",
        desc: "Puerto. Si es 0, el contenido son comandos MAC. Si es 1-223, es data de aplicación. Define qué clave se usa para desencriptar.",
        color: "border-purple-600"
    },
    payload: {
        title: "FRM Payload",
        size: "Variable (hasta ~240B)",
        layer: "Aplicación",
        desc: "Tus datos reales (temperatura, GPS, etc.). Está **encriptado** con la AppSKey, por lo que el operador de red no puede leerlo, solo tú.",
        color: "border-blue-600"
    },
    mic: {
        title: "Message Integrity Code (MIC)",
        size: "4 Bytes",
        layer: "MAC",
        desc: "Firma digital calculada con la NwkSKey. Garantiza que el mensaje no ha sido modificado en el aire y que quien lo envía tiene la clave correcta.",
        color: "border-red-600"
    }
};

function showFrameInfo(id) {
    const data = frameData[id];
    const card = document.getElementById('frame-detail-card');
    
    // Update Text
    document.getElementById('frame-title').innerText = data.title;
    document.getElementById('frame-title').className = `text-2xl font-bold mb-2 ${data.color.replace('border', 'text')}`;
    document.getElementById('frame-size').innerText = `Tamaño: ${data.size}`;
    document.getElementById('frame-layer').innerText = `Capa: ${data.layer}`;
    document.getElementById('frame-desc').innerText = data.desc;

    // Visual Feedback
    card.className = `absolute inset-0 bg-white rounded-xl shadow-lg border-l-8 ${data.color} p-6 transition-all duration-300`;
}

// --- STACK INFO ---
const stackData = {
    app: { title: "Capa de Aplicación", desc: "Aquí viven tus datos. Sensores descodificados, dashboards y lógica de negocio. Utiliza la AppSKey para leer el contenido que viaja seguro." },
    lorawan: { title: "LoRaWAN (MAC / Red)", desc: "Protocolo de Red. Define las reglas del tráfico: quién habla, cuándo, cómo se une a la red (Join), las clases (A, B, C) y la seguridad (encriptación)." },
    lora: { title: "LoRa (Física)", desc: "Modulación de Radio. Es el método físico de enviar bits usando 'Chirps'. Ofrece gran alcance y resistencia al ruido, pero no sabe nada de redes o usuarios." }
};

function showStackInfo(id) {
    const data = stackData[id];
    document.getElementById('stack-title').innerText = data.title;
    document.getElementById('stack-desc').innerText = data.desc;
}

// --- NET SIM ---
function startNetSim() {
    const p = document.getElementById('sim-packet');
    p.classList.remove('packet-animate');
    void p.offsetWidth;
    p.classList.add('packet-animate');
}

// --- CLASSES ---
function showClass(type) {
        const c = document.getElementById('timeline-content');
        c.innerHTML = '';
        if (type === 'A') {
        c.innerHTML = '<div class="absolute top-[40%] left-[10%] w-20 h-12 bg-green-500 text-white flex items-center justify-center text-xs font-bold rounded shadow-lg">Uplink</div><div class="absolute top-[40%] left-[30%] w-10 h-12 bg-blue-500 text-white flex items-center justify-center text-xs font-bold rounded opacity-50">RX1</div>';
        } else if (type === 'B') {
        c.innerHTML = '<div class="absolute top-[40%] left-[5%] w-10 h-12 bg-purple-500 text-white text-[10px] flex items-center justify-center font-bold rounded">Beacon</div><div class="absolute top-[40%] left-[15%] w-20 h-12 bg-green-500 text-white flex items-center justify-center text-xs font-bold rounded shadow-lg">Uplink</div><div class="absolute top-[40%] left-[55%] w-10 h-12 bg-purple-300 text-white flex items-center justify-center text-xs font-bold rounded border-2 border-purple-500">Ping</div>';
        } else {
            c.innerHTML = '<div class="absolute top-[40%] left-[10%] w-20 h-12 bg-green-500 text-white flex items-center justify-center text-xs font-bold rounded shadow-lg z-10">Uplink</div><div class="absolute top-[45%] left-0 w-full h-8 bg-blue-200 text-blue-800 flex items-center justify-end pr-4 text-xs font-bold opacity-50">RX CONTINUO</div>';
        }
}
showClass('A');

// --- BG ---
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
let width, height;
let particles = [];
function resize() { width=window.innerWidth; height=window.innerHeight; bgCanvas.width=width; bgCanvas.height=height; }
window.addEventListener('resize', resize); resize();
class Particle { constructor(){this.x=Math.random()*width;this.y=Math.random()*height;this.vx=(Math.random()-0.5)*0.5;this.vy=(Math.random()-0.5)*0.5;this.size=Math.random()*2;} update(){this.x+=this.vx;this.y+=this.vy;if(this.x<0)this.x=width;if(this.x>width)this.x=0;} draw(){bgCtx.fillStyle='#94a3b8';bgCtx.beginPath();bgCtx.arc(this.x,this.y,this.size,0,Math.PI*2);bgCtx.fill();}}
for(let i=0;i<50;i++)particles.push(new Particle());
function animateBg(){ bgCtx.clearRect(0,0,width,height); particles.forEach(p=>{p.update();p.draw();}); requestAnimationFrame(animateBg);}
animateBg();