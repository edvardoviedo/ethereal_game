// Sistema de partículas mejorado
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 1000;
        this.particlePool = [];
        
        // Pre-crear partículas para el pool
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push(this.createParticle());
        }
    }
    
    createParticle() {
        return {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            life: 1,
            maxLife: 1,
            decay: 0.02,
            size: 2,
            color: '255, 255, 255',
            type: 'default',
            active: false,
            
            // Propiedades adicionales
            angle: 0,
            angularVelocity: 0,
            gravity: 0,
            friction: 1,
            alpha: 1,
            scale: 1,
            scaleVelocity: 0,
            
            // Para efectos especiales
            trail: [],
            maxTrailLength: 5,
            glowIntensity: 1,
            pulseSpeed: 0.02
        };
    }
    
    getParticle() {
        // Buscar partícula inactiva en el pool
        for (let particle of this.particlePool) {
            if (!particle.active) {
                particle.active = true;
                return particle;
            }
        }
        
        // Si no hay partículas disponibles, reutilizar la más antigua
        if (this.particles.length > 0) {
            const oldestParticle = this.particles[0];
            this.resetParticle(oldestParticle);
            return oldestParticle;
        }
        
        return null;
    }
    
    resetParticle(particle) {
        particle.x = 0;
        particle.y = 0;
        particle.vx = 0;
        particle.vy = 0;
        particle.life = 1;
        particle.maxLife = 1;
        particle.decay = 0.02;
        particle.size = 2;
        particle.color = '255, 255, 255';
        particle.type = 'default';
        particle.active = true;
        particle.angle = 0;
        particle.angularVelocity = 0;
        particle.gravity = 0;
        particle.friction = 1;
        particle.alpha = 1;
        particle.scale = 1;
        particle.scaleVelocity = 0;
        particle.trail = [];
        particle.glowIntensity = 1;
        particle.pulseSpeed = 0.02;
    }
    
    // Crear explosión de partículas
    createExplosion(x, y, count = 15, config = {}) {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const particle = this.getParticle();
            if (!particle) break;
            
            const angle = (Math.PI * 2 * i) / count + random(-0.3, 0.3);
            const speed = random(config.minSpeed || 2, config.maxSpeed || 8);
            
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.life = 1;
            particle.maxLife = 1;
            particle.decay = random(0.02, 0.05);
            particle.size = random(config.minSize || 2, config.maxSize || 6);
            particle.color = config.color || getEtherealColor();
            particle.type = 'explosion';
            particle.gravity = config.gravity || 0.1;
            particle.friction = config.friction || 0.98;
            
            particles.push(particle);
        }
        
        this.particles.push(...particles);
        return particles;
    }
    
    // Crear trail de partículas
    createTrail(x, y, vx, vy, config = {}) {
        const particle = this.getParticle();
        if (!particle) return null;
        
        particle.x = x + random(-2, 2);
        particle.y = y + random(-2, 2);
        particle.vx = vx * -0.3 + random(-1, 1);
        particle.vy = vy * -0.3 + random(-1, 1);
        particle.life = 1;
        particle.decay = random(0.03, 0.06);
        particle.size = random(1, 3);
        particle.color = config.color || '100, 200, 255';
        particle.type = 'trail';
        particle.friction = 0.95;
        
        this.particles.push(particle);
        return particle;
    }
    
    // Crear partículas de propulsión
    createThrust(x, y, angle, config = {}) {
        const particle = this.getParticle();
        if (!particle) return null;
        
        const spread = config.spread || Math.PI / 4;
        const particleAngle = angle + random(-spread, spread);
        const speed = random(config.minSpeed || 1, config.maxSpeed || 4);
        
        particle.x = x;
        particle.y = y;
        particle.vx = Math.cos(particleAngle) * speed;
        particle.vy = Math.sin(particleAngle) * speed;
        particle.life = 1;
        particle.decay = random(0.04, 0.08);
        particle.size = random(2, 5);
        particle.color = config.color || getEtherealColor();
        particle.type = 'thrust';
        particle.friction = 0.92;
        particle.scaleVelocity = -0.02;
        
        this.particles.push(particle);
        return particle;
    }
    
    // Crear partículas de brillo
    createSparkle(x, y, config = {}) {
        const particle = this.getParticle();
        if (!particle) return null;
        
        particle.x = x + random(-10, 10);
        particle.y = y + random(-10, 10);
        particle.vx = random(-0.5, 0.5);
        particle.vy = random(-0.5, 0.5);
        particle.life = 1;
        particle.decay = random(0.01, 0.03);
        particle.size = random(1, 3);
        particle.color = config.color || '255, 255, 255';
        particle.type = 'sparkle';
        particle.pulseSpeed = random(0.05, 0.15);
        particle.glowIntensity = random(0.5, 1.5);
        
        this.particles.push(particle);
        return particle;
    }
    
    // Crear partículas de energía
    createEnergyBurst(x, y, targetX, targetY, config = {}) {
        const count = config.count || 8;
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const particle = this.getParticle();
            if (!particle) break;
            
            const dx = targetX - x;
            const dy = targetY - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const speed = random(2, 6);
            
            particle.x = x;
            particle.y = y;
            particle.vx = (dx / distance) * speed + random(-1, 1);
            particle.vy = (dy / distance) * speed + random(-1, 1);
            particle.life = 1;
            particle.decay = random(0.02, 0.04);
            particle.size = random(2, 4);
            particle.color = config.color || getEtherealColor();
            particle.type = 'energy';
            particle.glowIntensity = 2;
            
            particles.push(particle);
        }
        
        this.particles.push(...particles);
        return particles;
    }
    
    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // Actualizar posición
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Aplicar física
            particle.vx *= particle.friction;
            particle.vy *= particle.friction;
            particle.vy += particle.gravity;
            
            // Actualizar propiedades
            particle.life -= particle.decay;
            particle.angle += particle.angularVelocity;
            particle.scale += particle.scaleVelocity;
            particle.scale = Math.max(0.1, particle.scale);
            
            // Actualizar alpha basado en vida
            particle.alpha = particle.life;
            
            // Actualizar efectos especiales según el tipo
            this.updateParticleByType(particle, deltaTime);
            
            // Actualizar trail
            if (particle.trail.length > 0 || particle.type === 'trail') {
                particle.trail.push({ x: particle.x, y: particle.y });
                if (particle.trail.length > particle.maxTrailLength) {
                    particle.trail.shift();
                }
            }
            
            // Remover partícula si ha expirado
            if (particle.life <= 0) {
                particle.active = false;
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateParticleByType(particle, deltaTime) {
        switch (particle.type) {
            case 'sparkle':
                particle.glowIntensity = 1 + Math.sin(Date.now() * particle.pulseSpeed) * 0.5;
                break;
                
            case 'energy':
                particle.size = particle.size * 0.99;
                particle.glowIntensity = particle.life * 2;
                break;
                
            case 'thrust':
                particle.size *= 0.98;
                break;
                
            case 'explosion':
                particle.angularVelocity = random(-0.1, 0.1);
                break;
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        for (const particle of this.particles) {
            if (!particle.active || particle.alpha <= 0) continue;
            
            ctx.save();
            ctx.globalAlpha = particle.alpha;
            
            // Dibujar brillo si es necesario
            if (particle.glowIntensity > 1) {
                createGlowEffect(ctx, particle.x, particle.y, 
                               particle.size * 3, particle.color, particle.glowIntensity);
            }
            
            // Dibujar trail si existe
            if (particle.trail.length > 1) {
                this.drawTrail(ctx, particle);
            }
            
            // Dibujar partícula principal
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.angle);
            ctx.scale(particle.scale, particle.scale);
            
            this.drawParticleByType(ctx, particle);
            
            ctx.restore();
        }
        
        ctx.restore();
    }
    
    drawTrail(ctx, particle) {
        if (particle.trail.length < 2) return;
        
        ctx.strokeStyle = `rgba(${particle.color}, ${particle.alpha * 0.3})`;
        ctx.lineWidth = particle.size * 0.5;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
        
        for (let i = 1; i < particle.trail.length; i++) {
            const alpha = i / particle.trail.length;
            ctx.globalAlpha = alpha * particle.alpha * 0.3;
            ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
        }
        
        ctx.stroke();
    }
    
    drawParticleByType(ctx, particle) {
        ctx.fillStyle = `rgba(${particle.color}, ${particle.alpha})`;
        
        switch (particle.type) {
            case 'sparkle':
                // Dibujar estrella
                this.drawStar(ctx, 0, 0, particle.size, particle.size * 0.5, 4);
                break;
                
            case 'energy':
                // Dibujar diamante
                ctx.beginPath();
                ctx.moveTo(0, -particle.size);
                ctx.lineTo(particle.size, 0);
                ctx.lineTo(0, particle.size);
                ctx.lineTo(-particle.size, 0);
                ctx.closePath();
                ctx.fill();
                break;
                
            default:
                // Círculo por defecto
                ctx.beginPath();
                ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }
    
    drawStar(ctx, x, y, outerRadius, innerRadius, points) {
        ctx.beginPath();
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i * Math.PI) / points;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    clear() {
        this.particles.forEach(particle => {
            particle.active = false;
        });
        this.particles = [];
    }
    
    getParticleCount() {
        return this.particles.length;
    }
}

// Instancia global del sistema de partículas
const particleSystem = new ParticleSystem();

