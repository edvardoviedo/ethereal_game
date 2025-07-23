// Clase del jugador (nave espacial)
class Player {
    constructor(x, y, canvas) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.width = 40;
        this.height = 40;
        this.radius = 20;
        this.speed = 5;
        this.health = 3;
        this.maxHealth = 3;
        
        // Propiedades de movimiento
        this.vx = 0;
        this.vy = 0;
        this.acceleration = 0.3;
        this.friction = 0.85;
        
        // Propiedades de disparo
        this.canShoot = true;
        this.shootCooldown = 0;
        this.shootDelay = 200; // milisegundos
        
        // Efectos visuales
        this.angle = 0;
        this.thrustParticles = [];
        this.shieldActive = false;
        this.shieldTime = 0;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        
        // Animación
        this.animationFrame = 0;
        this.glowIntensity = 1;
        this.glowDirection = 1;
        
        // Power-ups
        this.powerUps = {
            rapidFire: { active: false, time: 0, duration: 5000 },
            shield: { active: false, time: 0, duration: 3000 },
            multiShot: { active: false, time: 0, duration: 7000 }
        };
    }
    
    update(deltaTime, keys, mousePos, isMobile) {
        this.handleInput(keys, mousePos, isMobile);
        this.updateMovement();
        this.updateShooting(deltaTime);
        this.updatePowerUps(deltaTime);
        this.updateEffects(deltaTime);
        this.constrainToCanvas();
    }
    
    handleInput(keys, mousePos, isMobile) {
        // Resetear velocidad
        let inputX = 0;
        let inputY = 0;
        
        if (isMobile && mousePos) {
            // Control táctil - mover hacia la posición del toque
            const dx = mousePos.x - this.x;
            const dy = mousePos.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 30) { // Zona muerta
                inputX = (dx / distance) * 0.8;
                inputY = (dy / distance) * 0.8;
            }
        } else {
            // Controles de teclado
            if (keys['ArrowLeft'] || keys['KeyA']) inputX = -1;
            if (keys['ArrowRight'] || keys['KeyD']) inputX = 1;
            if (keys['ArrowUp'] || keys['KeyW']) inputY = -1;
            if (keys['ArrowDown'] || keys['KeyS']) inputY = 1;
        }
        
        // Aplicar aceleración
        this.vx += inputX * this.acceleration;
        this.vy += inputY * this.acceleration;
        
        // Calcular ángulo de rotación basado en la dirección
        if (inputX !== 0 || inputY !== 0) {
            this.angle = Math.atan2(inputY, inputX) + Math.PI / 2;
        }
        
        // Crear partículas de propulsión si se está moviendo
        if (Math.abs(inputX) > 0.1 || Math.abs(inputY) > 0.1) {
            this.createThrustParticles();
        }
    }
    
    updateMovement() {
        // Aplicar fricción
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Limitar velocidad máxima
        const maxSpeed = this.speed;
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > maxSpeed) {
            this.vx = (this.vx / currentSpeed) * maxSpeed;
            this.vy = (this.vy / currentSpeed) * maxSpeed;
        }
        
        // Actualizar posición
        this.x += this.vx;
        this.y += this.vy;
    }
    
    updateShooting(deltaTime) {
        if (this.shootCooldown > 0) {
            this.shootCooldown -= deltaTime;
            if (this.shootCooldown <= 0) {
                this.canShoot = true;
            }
        }
    }
    
    updatePowerUps(deltaTime) {
        Object.keys(this.powerUps).forEach(key => {
            const powerUp = this.powerUps[key];
            if (powerUp.active) {
                powerUp.time -= deltaTime;
                if (powerUp.time <= 0) {
                    powerUp.active = false;
                    powerUp.time = 0;
                }
            }
        });
        
        // Actualizar escudo
        if (this.powerUps.shield.active) {
            this.shieldActive = true;
        } else {
            this.shieldActive = false;
        }
        
        // Actualizar invulnerabilidad temporal
        if (this.invulnerable) {
            this.invulnerabilityTime -= deltaTime;
            if (this.invulnerabilityTime <= 0) {
                this.invulnerable = false;
            }
        }
    }
    
    updateEffects(deltaTime) {
        // Actualizar animación de brillo
        this.glowIntensity += this.glowDirection * 0.02;
        if (this.glowIntensity >= 1.2) {
            this.glowDirection = -1;
        } else if (this.glowIntensity <= 0.8) {
            this.glowDirection = 1;
        }
        
        // Actualizar partículas de propulsión
        this.thrustParticles = this.thrustParticles.filter(particle => {
            particle.life -= 0.05;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.size *= 0.95;
            return particle.life > 0;
        });
        
        this.animationFrame += deltaTime;
    }
    
    constrainToCanvas() {
        const margin = this.radius;
        this.x = clamp(this.x, margin, this.canvas.width - margin);
        this.y = clamp(this.y, margin, this.canvas.height - margin);
    }
    
    shoot() {
        if (!this.canShoot) return [];
        
        const projectiles = [];
        const shootDelay = this.powerUps.rapidFire.active ? this.shootDelay / 3 : this.shootDelay;
        
        if (this.powerUps.multiShot.active) {
            // Disparo múltiple
            for (let i = -1; i <= 1; i++) {
                const angle = this.angle + (i * Math.PI / 6);
                const projectile = new Projectile(
                    this.x + Math.sin(angle) * this.radius,
                    this.y - Math.cos(angle) * this.radius,
                    Math.sin(angle) * 8,
                    -Math.cos(angle) * 8,
                    'player'
                );
                projectiles.push(projectile);
            }
        } else {
            // Disparo normal
            const projectile = new Projectile(
                this.x,
                this.y - this.radius,
                0,
                -8,
                'player'
            );
            projectiles.push(projectile);
        }
        
        this.canShoot = false;
        this.shootCooldown = shootDelay;
        
        return projectiles;
    }
    
    takeDamage() {
        if (this.invulnerable || this.shieldActive) return false;
        
        this.health--;
        this.invulnerable = true;
        this.invulnerabilityTime = 1000; // 1 segundo de invulnerabilidad
        
        return true;
    }
    
    heal() {
        this.health = Math.min(this.health + 1, this.maxHealth);
    }
    
    activatePowerUp(type) {
        if (this.powerUps[type]) {
            this.powerUps[type].active = true;
            this.powerUps[type].time = this.powerUps[type].duration;
        }
    }
    
    createThrustParticles() {
        if (this.thrustParticles.length < 20) {
            const angle = this.angle + Math.PI; // Opuesto a la dirección
            const spread = Math.PI / 4;
            
            for (let i = 0; i < 2; i++) {
                const particleAngle = angle + random(-spread, spread);
                this.thrustParticles.push({
                    x: this.x + Math.sin(particleAngle) * this.radius * 0.8,
                    y: this.y - Math.cos(particleAngle) * this.radius * 0.8,
                    vx: Math.sin(particleAngle) * random(1, 3),
                    vy: -Math.cos(particleAngle) * random(1, 3),
                    life: 1,
                    size: random(2, 4),
                    color: getEtherealColor()
                });
            }
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Efecto de parpadeo si es invulnerable
        if (this.invulnerable && Math.floor(Date.now() / 100) % 2) {
            ctx.globalAlpha = 0.5;
        }
        
        // Dibujar partículas de propulsión
        this.thrustParticles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = `rgba(${particle.color}, ${particle.life})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        
        // Dibujar brillo de la nave
        createGlowEffect(ctx, this.x, this.y, this.radius * 2, getEtherealColor(), this.glowIntensity);
        
        // Dibujar la nave
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Cuerpo principal de la nave
        ctx.fillStyle = '#4a90e2';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(-this.radius * 0.6, this.radius * 0.8);
        ctx.lineTo(0, this.radius * 0.4);
        ctx.lineTo(this.radius * 0.6, this.radius * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Detalles de la nave
        ctx.fillStyle = '#87ceeb';
        ctx.beginPath();
        ctx.moveTo(0, -this.radius * 0.8);
        ctx.lineTo(-this.radius * 0.3, this.radius * 0.2);
        ctx.lineTo(this.radius * 0.3, this.radius * 0.2);
        ctx.closePath();
        ctx.fill();
        
        // Núcleo brillante
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -this.radius * 0.3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Dibujar escudo si está activo
        if (this.shieldActive) {
            this.drawShield(ctx);
        }
    }
    
    drawShield(ctx) {
        ctx.save();
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.6 + Math.sin(Date.now() * 0.01) * 0.3})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = Date.now() * 0.01;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.health = this.maxHealth;
        this.angle = 0;
        this.thrustParticles = [];
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        
        // Resetear power-ups
        Object.keys(this.powerUps).forEach(key => {
            this.powerUps[key].active = false;
            this.powerUps[key].time = 0;
        });
    }
}

