// Clase para los proyectiles
class Projectile {
    constructor(x, y, vx, vy, owner = 'player') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.owner = owner; // 'player' o 'enemy'
        this.radius = owner === 'player' ? 3 : 4;
        this.speed = Math.sqrt(vx * vx + vy * vy);
        this.life = 1.0;
        this.maxLife = 1.0;
        this.trail = [];
        this.maxTrailLength = 8;
        
        // Propiedades visuales
        this.color = owner === 'player' ? '0, 255, 255' : '255, 100, 100';
        this.glowIntensity = 1;
        this.animationFrame = 0;
        
        // Efectos especiales
        this.particles = [];
        this.createInitialParticles();
    }
    
    update(deltaTime, canvasWidth, canvasHeight) {
        // Actualizar posición
        this.x += this.vx;
        this.y += this.vy;
        
        // Actualizar trail
        this.updateTrail();
        
        // Actualizar efectos
        this.updateEffects(deltaTime);
        
        // Verificar si está fuera de los límites
        const margin = 50;
        if (this.x < -margin || this.x > canvasWidth + margin ||
            this.y < -margin || this.y > canvasHeight + margin) {
            this.life = 0;
        }
        
        // Reducir vida gradualmente (opcional, para proyectiles que se desvanecen)
        // this.life -= 0.001;
        
        return this.life > 0;
    }
    
    updateTrail() {
        // Agregar posición actual al trail
        this.trail.push({ x: this.x, y: this.y });
        
        // Limitar longitud del trail
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }
    
    updateEffects(deltaTime) {
        this.animationFrame += deltaTime;
        
        // Actualizar intensidad del brillo
        this.glowIntensity = 0.8 + Math.sin(this.animationFrame * 0.01) * 0.3;
        
        // Actualizar partículas
        this.particles = this.particles.filter(particle => {
            particle.life -= 0.03;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.size *= 0.98;
            return particle.life > 0;
        });
        
        // Crear nuevas partículas ocasionalmente
        if (Math.random() < 0.3) {
            this.createTrailParticle();
        }
    }
    
    createInitialParticles() {
        for (let i = 0; i < 3; i++) {
            this.createTrailParticle();
        }
    }
    
    createTrailParticle() {
        this.particles.push({
            x: this.x + random(-2, 2),
            y: this.y + random(-2, 2),
            vx: random(-0.5, 0.5) - this.vx * 0.1,
            vy: random(-0.5, 0.5) - this.vy * 0.1,
            life: 1,
            size: random(1, 3),
            color: this.color
        });
    }
    
    draw(ctx) {
        ctx.save();
        
        // Dibujar partículas del trail
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life * 0.6;
            ctx.fillStyle = `rgba(${particle.color}, ${particle.life})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        
        // Dibujar trail
        if (this.trail.length > 1) {
            ctx.strokeStyle = `rgba(${this.color}, 0.4)`;
            ctx.lineWidth = this.radius;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            
            for (let i = 1; i < this.trail.length; i++) {
                const alpha = i / this.trail.length;
                ctx.globalAlpha = alpha * 0.4;
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            
            ctx.stroke();
        }
        
        // Dibujar brillo del proyectil
        createGlowEffect(ctx, this.x, this.y, this.radius * 4, this.color, this.glowIntensity);
        
        // Dibujar el proyectil principal
        ctx.globalAlpha = 1;
        
        // Núcleo brillante
        ctx.fillStyle = `rgba(${this.color}, 1)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Núcleo interno más brillante
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Efecto de energía pulsante
        if (this.owner === 'player') {
            const pulseRadius = this.radius + Math.sin(this.animationFrame * 0.02) * 2;
            ctx.strokeStyle = `rgba(${this.color}, 0.3)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    // Crear efecto de explosión al impactar
    explode() {
        const particles = [];
        const particleCount = this.owner === 'player' ? 8 : 12;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = random(2, 6);
            
            particles.push({
                x: this.x,
                y: this.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: random(0.02, 0.05),
                size: random(2, 5),
                color: this.color
            });
        }
        
        return particles;
    }
    
    // Verificar colisión con otro objeto
    checkCollision(other) {
        return checkCollision(this, other);
    }
    
    // Obtener información de colisión
    getCollisionInfo() {
        return {
            x: this.x,
            y: this.y,
            radius: this.radius,
            owner: this.owner,
            damage: 1
        };
    }
}

// Clase especializada para proyectiles enemigos
class EnemyProjectile extends Projectile {
    constructor(x, y, targetX, targetY, speed = 4) {
        // Calcular dirección hacia el objetivo
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const vx = (dx / distance) * speed;
        const vy = (dy / distance) * speed;
        
        super(x, y, vx, vy, 'enemy');
        
        // Propiedades específicas de proyectiles enemigos
        this.color = '255, 100, 100';
        this.homingStrength = 0.02;
        this.targetX = targetX;
        this.targetY = targetY;
    }
    
    update(deltaTime, canvasWidth, canvasHeight, playerX, playerY) {
        // Actualizar objetivo si el jugador se ha movido
        if (playerX !== undefined && playerY !== undefined) {
            this.targetX = playerX;
            this.targetY = playerY;
            
            // Aplicar ligero homing hacia el jugador
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                this.vx += (dx / distance) * this.homingStrength;
                this.vy += (dy / distance) * this.homingStrength;
                
                // Limitar velocidad
                const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                const maxSpeed = 6;
                if (currentSpeed > maxSpeed) {
                    this.vx = (this.vx / currentSpeed) * maxSpeed;
                    this.vy = (this.vy / currentSpeed) * maxSpeed;
                }
            }
        }
        
        return super.update(deltaTime, canvasWidth, canvasHeight);
    }
    
    draw(ctx) {
        super.draw(ctx);
        
        // Efecto adicional para proyectiles enemigos
        ctx.save();
        ctx.strokeStyle = `rgba(255, 0, 0, 0.3)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.lineDashOffset = Date.now() * 0.01;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
}

