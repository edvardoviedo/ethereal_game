// Clase para objetos celestes (enemigos)
class CelestialObject {
    constructor(x, y, type = 'asteroid') {
        this.x = x;
        this.y = y;
        this.type = type; // 'asteroid', 'planet', 'crystal', 'void'
        this.originalX = x;
        this.originalY = y;
        
        // Propiedades básicas según el tipo
        this.setupByType();
        
        // Propiedades de movimiento
        this.vx = random(-2, 2);
        this.vy = random(1, 3);
        this.rotation = 0;
        this.rotationSpeed = random(-0.05, 0.05);
        
        // Propiedades de combate
        this.maxHealth = this.health;
        this.lastShot = 0;
        this.shootInterval = random(2000, 4000);
        
        // Efectos visuales
        this.glowIntensity = 1;
        this.glowDirection = 1;
        this.animationFrame = 0;
        this.particles = [];
        this.aura = [];
        
        // Propiedades de movimiento especial
        this.movementPattern = this.getMovementPattern();
        this.patternTime = 0;
        
        // Estado
        this.isDestroyed = false;
        this.deathAnimation = 0;
        
        this.createAura();
    }
    
    setupByType() {
        switch (this.type) {
            case 'asteroid':
                this.radius = random(20, 35);
                this.health = 2;
                this.points = 100;
                this.color = '139, 69, 19'; // Marrón
                this.speed = random(1, 2);
                this.canShoot = false;
                break;
                
            case 'planet':
                this.radius = random(30, 50);
                this.health = 4;
                this.points = 250;
                this.color = '65, 105, 225'; // Azul real
                this.speed = random(0.5, 1.5);
                this.canShoot = true;
                break;
                
            case 'crystal':
                this.radius = random(15, 25);
                this.health = 1;
                this.points = 150;
                this.color = '186, 85, 211'; // Orquídea medio
                this.speed = random(2, 3);
                this.canShoot = false;
                this.isPowerUp = true;
                break;
                
            case 'void':
                this.radius = random(25, 40);
                this.health = 3;
                this.points = 300;
                this.color = '75, 0, 130'; // Índigo
                this.speed = random(1, 2);
                this.canShoot = true;
                this.hasSpecialAbility = true;
                break;
                
            default:
                this.setupByType.call(this, 'asteroid');
        }
    }
    
    getMovementPattern() {
        const patterns = ['straight', 'sine', 'spiral', 'zigzag'];
        return patterns[randomInt(0, patterns.length - 1)];
    }
    
    update(deltaTime, canvasWidth, canvasHeight, playerX, playerY) {
        if (this.isDestroyed) {
            this.deathAnimation += deltaTime;
            return this.deathAnimation < 1000; // Animación de muerte dura 1 segundo
        }
        
        this.updateMovement(deltaTime);
        this.updateShooting(deltaTime, playerX, playerY);
        this.updateEffects(deltaTime);
        this.updateParticles();
        
        // Verificar si está fuera de los límites
        if (this.y > canvasHeight + this.radius + 50) {
            return false; // Marcar para eliminación
        }
        
        return true;
    }
    
    updateMovement(deltaTime) {
        this.patternTime += deltaTime;
        
        // Aplicar patrón de movimiento
        switch (this.movementPattern) {
            case 'straight':
                // Movimiento recto hacia abajo
                break;
                
            case 'sine':
                this.vx = Math.sin(this.patternTime * 0.002) * 2;
                break;
                
            case 'spiral':
                const spiralRadius = 30;
                this.vx = Math.cos(this.patternTime * 0.003) * spiralRadius * 0.1;
                break;
                
            case 'zigzag':
                if (Math.floor(this.patternTime / 1000) % 2 === 0) {
                    this.vx = this.speed;
                } else {
                    this.vx = -this.speed;
                }
                break;
        }
        
        // Actualizar posición
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        
        // Mantener dentro de los límites horizontales
        if (this.x < this.radius) {
            this.x = this.radius;
            this.vx = Math.abs(this.vx);
        } else if (this.x > 800 - this.radius) { // Asumiendo ancho de canvas
            this.x = 800 - this.radius;
            this.vx = -Math.abs(this.vx);
        }
    }
    
    updateShooting(deltaTime, playerX, playerY) {
        if (!this.canShoot || this.isDestroyed) return;
        
        const now = Date.now();
        if (now - this.lastShot > this.shootInterval) {
            this.lastShot = now;
            this.shootInterval = random(2000, 4000); // Nuevo intervalo aleatorio
            
            // Crear proyectil hacia el jugador
            if (playerX !== undefined && playerY !== undefined) {
                return new EnemyProjectile(this.x, this.y, playerX, playerY);
            }
        }
        
        return null;
    }
    
    updateEffects(deltaTime) {
        this.animationFrame += deltaTime;
        
        // Actualizar intensidad del brillo
        this.glowIntensity += this.glowDirection * 0.01;
        if (this.glowIntensity >= 1.3) {
            this.glowDirection = -1;
        } else if (this.glowIntensity <= 0.7) {
            this.glowDirection = 1;
        }
        
        // Crear partículas ambientales
        if (Math.random() < 0.1) {
            this.createAmbientParticle();
        }
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.life -= particle.decay;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.size *= 0.99;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            return particle.life > 0;
        });
        
        this.aura = this.aura.filter(particle => {
            particle.angle += particle.speed;
            particle.life -= 0.005;
            return particle.life > 0;
        });
    }
    
    createAura() {
        for (let i = 0; i < 8; i++) {
            this.aura.push({
                angle: (Math.PI * 2 * i) / 8,
                distance: this.radius + random(10, 20),
                speed: random(0.01, 0.03),
                life: 1,
                size: random(2, 4),
                color: this.color
            });
        }
    }
    
    createAmbientParticle() {
        this.particles.push({
            x: this.x + random(-this.radius, this.radius),
            y: this.y + random(-this.radius, this.radius),
            vx: random(-1, 1),
            vy: random(-1, 1),
            life: 1,
            decay: random(0.01, 0.03),
            size: random(1, 3),
            color: this.color
        });
    }
    
    takeDamage(damage = 1) {
        this.health -= damage;
        
        // Crear partículas de impacto
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.x + random(-this.radius, this.radius),
                y: this.y + random(-this.radius, this.radius),
                vx: random(-3, 3),
                vy: random(-3, 3),
                life: 1,
                decay: random(0.03, 0.06),
                size: random(2, 5),
                color: '255, 255, 0' // Amarillo para impacto
            });
        }
        
        if (this.health <= 0) {
            this.destroy();
            return true; // Destruido
        }
        
        return false; // Dañado pero no destruido
    }
    
    destroy() {
        this.isDestroyed = true;
        this.deathAnimation = 0;
        
        // Crear explosión de partículas
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = random(3, 8);
            
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: random(0.02, 0.04),
                size: random(3, 8),
                color: this.color
            });
        }
    }
    
    draw(ctx) {
        if (this.isDestroyed) {
            this.drawDeathAnimation(ctx);
            return;
        }
        
        ctx.save();
        
        // Dibujar aura
        this.aura.forEach(particle => {
            const x = this.x + Math.cos(particle.angle) * particle.distance;
            const y = this.y + Math.sin(particle.angle) * particle.distance;
            
            ctx.save();
            ctx.globalAlpha = particle.life * 0.3;
            ctx.fillStyle = `rgba(${particle.color}, ${particle.life})`;
            ctx.beginPath();
            ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        
        // Dibujar partículas ambientales
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = `rgba(${particle.color}, ${particle.life})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        
        // Dibujar brillo
        createGlowEffect(ctx, this.x, this.y, this.radius * 2, this.color, this.glowIntensity);
        
        // Dibujar el objeto principal
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        this.drawByType(ctx);
        
        ctx.restore();
        
        // Dibujar barra de vida si está dañado
        if (this.health < this.maxHealth) {
            this.drawHealthBar(ctx);
        }
    }
    
    drawByType(ctx) {
        switch (this.type) {
            case 'asteroid':
                this.drawAsteroid(ctx);
                break;
            case 'planet':
                this.drawPlanet(ctx);
                break;
            case 'crystal':
                this.drawCrystal(ctx);
                break;
            case 'void':
                this.drawVoid(ctx);
                break;
        }
    }
    
    drawAsteroid(ctx) {
        // Forma irregular de asteroide
        ctx.fillStyle = `rgba(${this.color}, 0.8)`;
        ctx.strokeStyle = `rgba(${this.color}, 1)`;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        const points = 8;
        for (let i = 0; i < points; i++) {
            const angle = (Math.PI * 2 * i) / points;
            const radiusVariation = this.radius * (0.7 + Math.sin(angle * 3) * 0.3);
            const x = Math.cos(angle) * radiusVariation;
            const y = Math.sin(angle) * radiusVariation;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Detalles del asteroide
        ctx.fillStyle = `rgba(${this.color}, 0.5)`;
        for (let i = 0; i < 3; i++) {
            const x = random(-this.radius * 0.5, this.radius * 0.5);
            const y = random(-this.radius * 0.5, this.radius * 0.5);
            const size = random(3, 8);
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawPlanet(ctx) {
        // Planeta con anillos
        ctx.fillStyle = `rgba(${this.color}, 0.9)`;
        ctx.strokeStyle = `rgba(${this.color}, 1)`;
        ctx.lineWidth = 2;
        
        // Cuerpo del planeta
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Anillos
        ctx.strokeStyle = `rgba(${this.color}, 0.6)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * 1.5, this.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Detalles de superficie
        ctx.fillStyle = `rgba(${this.color}, 0.4)`;
        for (let i = 0; i < 4; i++) {
            const x = random(-this.radius * 0.7, this.radius * 0.7);
            const y = random(-this.radius * 0.7, this.radius * 0.7);
            const size = random(5, 12);
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawCrystal(ctx) {
        // Cristal con forma de diamante
        ctx.fillStyle = `rgba(${this.color}, 0.7)`;
        ctx.strokeStyle = `rgba(${this.color}, 1)`;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(this.radius * 0.7, 0);
        ctx.lineTo(0, this.radius);
        ctx.lineTo(-this.radius * 0.7, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Brillo interno
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Facetas del cristal
        ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(0, this.radius);
        ctx.moveTo(-this.radius * 0.7, 0);
        ctx.lineTo(this.radius * 0.7, 0);
        ctx.stroke();
    }
    
    drawVoid(ctx) {
        // Objeto del vacío con efecto de distorsión
        ctx.fillStyle = `rgba(${this.color}, 0.6)`;
        ctx.strokeStyle = `rgba(${this.color}, 1)`;
        ctx.lineWidth = 3;
        
        // Múltiples círculos concéntricos
        for (let i = 0; i < 3; i++) {
            const radius = this.radius * (0.3 + i * 0.35);
            const alpha = 0.8 - i * 0.2;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        
        // Centro oscuro
        ctx.fillStyle = `rgba(0, 0, 0, 0.8)`;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Efecto de distorsión
        ctx.strokeStyle = `rgba(${this.color}, 0.3)`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6;
            const x1 = Math.cos(angle) * this.radius * 0.6;
            const y1 = Math.sin(angle) * this.radius * 0.6;
            const x2 = Math.cos(angle) * this.radius * 1.2;
            const y2 = Math.sin(angle) * this.radius * 1.2;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }
    
    drawHealthBar(ctx) {
        const barWidth = this.radius * 2;
        const barHeight = 4;
        const barY = this.y - this.radius - 15;
        
        ctx.save();
        
        // Fondo de la barra
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth, barHeight);
        
        // Barra de vida
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = `rgba(${255 * (1 - healthPercent)}, ${255 * healthPercent}, 0, 0.8)`;
        ctx.fillRect(this.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
        
        // Borde
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - barWidth / 2, barY, barWidth, barHeight);
        
        ctx.restore();
    }
    
    drawDeathAnimation(ctx) {
        const progress = this.deathAnimation / 1000;
        
        // Dibujar partículas de explosión
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life * (1 - progress);
            ctx.fillStyle = `rgba(${particle.color}, ${particle.life})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        
        // Efecto de flash
        if (progress < 0.2) {
            ctx.save();
            ctx.globalAlpha = (0.2 - progress) / 0.2;
            createGlowEffect(ctx, this.x, this.y, this.radius * 4, '255, 255, 255', 2);
            ctx.restore();
        }
    }
    
    // Verificar colisión con otro objeto
    checkCollision(other) {
        return checkCollision(this, other);
    }
    
    // Obtener recompensa al ser destruido
    getReward() {
        const reward = { points: this.points };
        
        if (this.isPowerUp) {
            const powerUpTypes = ['rapidFire', 'shield', 'multiShot', 'health'];
            reward.powerUp = powerUpTypes[randomInt(0, powerUpTypes.length - 1)];
        }
        
        return reward;
    }
}

