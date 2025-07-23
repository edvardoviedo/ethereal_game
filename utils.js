// Funciones de utilidad para el juego

// Detectar colisiones entre dos objetos circulares
function checkCollision(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.radius + obj2.radius);
}

// Generar número aleatorio entre min y max
function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Generar entero aleatorio entre min y max
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Calcular distancia entre dos puntos
function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

// Normalizar ángulo entre 0 y 2π
function normalizeAngle(angle) {
    while (angle < 0) angle += Math.PI * 2;
    while (angle >= Math.PI * 2) angle -= Math.PI * 2;
    return angle;
}

// Interpolar entre dos valores
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

// Limitar valor entre min y max
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Crear partículas de explosión
function createExplosionParticles(x, y, count = 10) {
    const particles = [];
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: random(-5, 5),
            vy: random(-5, 5),
            life: 1.0,
            decay: random(0.02, 0.05),
            color: `hsl(${random(0, 60)}, 100%, ${random(50, 100)}%)`,
            size: random(2, 6)
        });
    }
    return particles;
}

// Detectar si es dispositivo móvil
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
}

// Reproducir sonido con control de volumen
function playSound(audioElement, volume = 1.0) {
    if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.volume = volume;
        audioElement.play().catch(e => console.log('Error reproduciendo sonido:', e));
    }
}

// Crear efecto de brillo
function createGlowEffect(ctx, x, y, radius, color, intensity = 1) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${color}, ${0.8 * intensity})`);
    gradient.addColorStop(0.5, `rgba(${color}, ${0.4 * intensity})`);
    gradient.addColorStop(1, `rgba(${color}, 0)`);
    
    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    ctx.restore();
}

// Generar color aleatorio etéreo
function getEtherealColor() {
    const colors = [
        '138, 43, 226',  // Violeta
        '75, 0, 130',    // Índigo
        '0, 191, 255',   // Azul cielo
        '127, 255, 212', // Aguamarina
        '255, 20, 147',  // Rosa profundo
        '255, 215, 0',   // Dorado
        '50, 205, 50'    // Verde lima
    ];
    return colors[randomInt(0, colors.length - 1)];
}

// Crear estrellas de fondo
function createStars(count, width, height) {
    const stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: random(0, width),
            y: random(0, height),
            size: random(0.5, 2),
            brightness: random(0.3, 1),
            twinkleSpeed: random(0.01, 0.03)
        });
    }
    return stars;
}

// Animar estrellas
function animateStars(stars) {
    stars.forEach(star => {
        star.brightness += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;
        star.brightness = clamp(star.brightness, 0.3, 1);
    });
}

// Dibujar estrellas
function drawStars(ctx, stars) {
    ctx.save();
    stars.forEach(star => {
        ctx.globalAlpha = star.brightness;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
}

// Guardar puntuación máxima en localStorage
function saveHighScore(score) {
    const currentHigh = getHighScore();
    if (score > currentHigh) {
        localStorage.setItem('cosmicEtherealHighScore', score.toString());
        return true;
    }
    return false;
}

// Obtener puntuación máxima de localStorage
function getHighScore() {
    return parseInt(localStorage.getItem('cosmicEtherealHighScore') || '0');
}

