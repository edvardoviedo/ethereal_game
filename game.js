// Clase principal del juego
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Estados del juego
        this.state = 'menu'; // 'menu', 'playing', 'paused', 'gameOver'
        this.score = 0;
        this.highScore = getHighScore();
        this.level = 1;
        this.lives = 3;
        
        // Objetos del juego
        this.player = new Player(this.width / 2, this.height - 100, canvas);
        this.projectiles = [];
        this.enemies = [];
        this.particles = [];
        this.stars = createStars(100, this.width, this.height);
        this.powerUps = [];
        
        // Control de tiempo
        this.lastTime = 0;
        this.deltaTime = 0;
        this.gameTime = 0;
        
        // Spawning de enemigos
        this.lastEnemySpawn = 0;
        this.enemySpawnRate = 2000; // milisegundos
        this.enemyTypes = ['asteroid', 'planet', 'crystal', 'void'];
        
        // Efectos especiales
        this.screenShake = 0;
        this.backgroundOffset = 0;
        
        // Audio
        this.sounds = {};
        this.musicPlaying = false;
        
        // Controles
        this.keys = {};
        this.mousePos = null;
        this.isMobile = isMobile();
        this.touchControls = {
            joystick: { active: false, x: 0, y: 0 },
            fire: false
        };
        
        // Configuración de dificultad
        this.difficulty = {
            enemySpeed: 1,
            enemySpawnRate: 1,
            enemyHealth: 1,
            projectileSpeed: 1
        };
        
        this.setupEventListeners();
        this.loadAudio();
        this.resize();
    }
    
    setupEventListeners() {
        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Controles especiales
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.state === 'playing') {
                    this.handleShooting();
                }
            }
            
            if (e.code === 'Escape' || e.code === 'KeyP') {
                if (this.state === 'playing') {
                    this.pauseGame();
                } else if (this.state === 'paused') {
                    this.resumeGame();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Eventos de mouse/touch
        this.canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handlePointerUp(e));
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handlePointerDown(e.touches[0]);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handlePointerMove(e.touches[0]);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handlePointerUp(e);
        });
        
        // Redimensionamiento
        window.addEventListener('resize', () => this.resize());
    }
    
    loadAudio() {
        // Cargar efectos de sonido
        audioManager.loadSound('laser', 'assets/audio/laser_shot.mp3');
        audioManager.loadSound('explosion', 'assets/audio/explosion.mp3');
        audioManager.loadSound('powerUp', 'assets/audio/power_up.mp3');
        
        // Cargar música de fondo
        audioManager.loadSound('background', 'assets/audio/background_music.mp3', true);
    }
    
    resize() {
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Mantener aspect ratio 16:9
        const targetRatio = 16 / 9;
        let newWidth = containerRect.width;
        let newHeight = containerRect.height;
        
        if (newWidth / newHeight > targetRatio) {
            newWidth = newHeight * targetRatio;
        } else {
            newHeight = newWidth / targetRatio;
        }
        
        this.canvas.width = Math.min(newWidth, 1200);
        this.canvas.height = Math.min(newHeight, 675);
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Reposicionar jugador si es necesario
        if (this.player) {
            this.player.canvas = this.canvas;
            this.player.x = Math.min(this.player.x, this.width - this.player.radius);
            this.player.y = Math.min(this.player.y, this.height - this.player.radius);
        }
        
        // Recrear estrellas
        this.stars = createStars(100, this.width, this.height);
    }
    
    handlePointerDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        
        if (this.state === 'playing') {
            this.mousePos = { x, y };
            
            if (this.isMobile) {
                // Verificar si tocó el botón de disparo
                const fireButton = document.getElementById('fireButton');
                if (fireButton && this.isPointInFireButton(x, y)) {
                    this.touchControls.fire = true;
                    this.handleShooting();
                } else {
                    // Control de movimiento
                    this.touchControls.joystick.active = true;
                }
            } else {
                this.handleShooting();
            }
        }
    }
    
    handlePointerMove(e) {
        if (!this.mousePos) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        
        this.mousePos = { x, y };
    }
    
    handlePointerUp(e) {
        this.mousePos = null;
        this.touchControls.joystick.active = false;
        this.touchControls.fire = false;
    }
    
    isPointInFireButton(x, y) {
        const buttonX = this.width - 60;
        const buttonY = this.height - 60;
        const buttonRadius = 40;
        
        const dx = x - buttonX;
        const dy = y - buttonY;
        return Math.sqrt(dx * dx + dy * dy) < buttonRadius;
    }
    
    handleShooting() {
        if (this.state !== 'playing') return;
        
        const newProjectiles = this.player.shoot();
        this.projectiles.push(...newProjectiles);
        
        if (newProjectiles.length > 0) {
            audioManager.playLaserSound();
        }
    }
    
    startGame() {
        this.state = 'playing';
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameTime = 0;
        
        // Resetear objetos
        this.player.reset(this.width / 2, this.height - 100);
        this.projectiles = [];
        this.enemies = [];
        this.particles = [];
        this.powerUps = [];
        
        // Resetear dificultad
        this.difficulty = {
            enemySpeed: 1,
            enemySpawnRate: 1,
            enemyHealth: 1,
            projectileSpeed: 1
        };
        
        this.enemySpawnRate = 1500;
        this.lastEnemySpawn = 0;
        
        // Iniciar música
        audioManager.enableAudio();
        if (!this.musicPlaying) {
            audioManager.playMusic();
            this.musicPlaying = true;
        }
        
        this.updateHUD();
    }
    
    pauseGame() {
        if (this.state === 'playing') {
            this.state = 'paused';
            audioManager.pauseMusic();
        }
    }
    
    resumeGame() {
        if (this.state === 'paused') {
            this.state = 'playing';
            if (this.musicPlaying) {
                audioManager.playMusic();
            }
        }
    }
    
    gameOver() {
        this.state = 'gameOver';
        
        // Parar música
        audioManager.stopMusic();
        this.musicPlaying = false;
        
        // Guardar puntuación máxima
        const isNewHighScore = saveHighScore(this.score);
        this.highScore = getHighScore();
        
        // Actualizar UI
        document.getElementById('finalScore').textContent = `Puntuación: ${this.score}`;
        document.getElementById('highScore').textContent = `Mejor puntuación: ${this.highScore}`;
        
        if (isNewHighScore) {
            document.getElementById('highScore').style.color = '#ffd700';
            document.getElementById('highScore').textContent += ' ¡NUEVO RÉCORD!';
        }
    }
    
    update(currentTime) {
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.state !== 'playing') return;
        
        this.gameTime += this.deltaTime;
        
        // Actualizar dificultad
        this.updateDifficulty();
        
        // Actualizar objetos
        this.player.update(this.deltaTime, this.keys, this.mousePos, this.isMobile);
        this.updateProjectiles();
        this.updateEnemies();
        this.updateParticles();
        this.spawnEnemies();
        
        // Verificar colisiones
        this.checkCollisions();
        
        // Actualizar efectos
        this.updateEffects();
        
        // Verificar condiciones de juego
        if (this.player.health <= 0) {
            this.gameOver();
        }
        
        this.updateHUD();
    }
    
    updateDifficulty() {
        const minutes = this.gameTime / 60000;
        
        // Incrementar dificultad gradualmente
        this.difficulty.enemySpeed = 1 + minutes * 0.1;
        this.difficulty.enemySpawnRate = Math.max(0.3, 1 - minutes * 0.05);
        this.difficulty.enemyHealth = 1 + Math.floor(minutes / 2);
        
        // Actualizar tasa de spawn
        this.enemySpawnRate = Math.max(500, 2000 * this.difficulty.enemySpawnRate);
        
        // Actualizar nivel
        const newLevel = Math.floor(minutes) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.addScore(500); // Bonus por nivel
        }
    }
    
    updateProjectiles() {
        this.projectiles = this.projectiles.filter(projectile => {
            const alive = projectile.update(this.deltaTime, this.width, this.height, 
                                          this.player.x, this.player.y);
            return alive;
        });
    }
    
    updateEnemies() {
        this.enemies = this.enemies.filter(enemy => {
            const alive = enemy.update(this.deltaTime, this.width, this.height, 
                                     this.player.x, this.player.y);
            
            // Agregar proyectiles enemigos
            const enemyProjectile = enemy.updateShooting(this.deltaTime, this.player.x, this.player.y);
            if (enemyProjectile) {
                this.projectiles.push(enemyProjectile);
            }
            
            return alive;
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.life -= particle.decay;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.size *= 0.99;
            return particle.life > 0;
        });
        
        animateStars(this.stars);
    }
    
    spawnEnemies() {
        const now = Date.now();
        if (now - this.lastEnemySpawn > this.enemySpawnRate) {
            this.lastEnemySpawn = now;
            
            // Elegir tipo de enemigo basado en el nivel
            let enemyType = this.enemyTypes[randomInt(0, this.enemyTypes.length - 1)];
            
            // Ajustar probabilidades según el nivel
            if (this.level < 3 && enemyType === 'void') {
                enemyType = 'asteroid';
            }
            if (this.level < 2 && enemyType === 'planet') {
                enemyType = Math.random() < 0.5 ? 'asteroid' : 'crystal';
            }
            
            const x = random(50, this.width - 50);
            const y = -50;
            
            const enemy = new CelestialObject(x, y, enemyType);
            
            // Aplicar modificadores de dificultad
            enemy.health *= this.difficulty.enemyHealth;
            enemy.maxHealth = enemy.health;
            enemy.speed *= this.difficulty.enemySpeed;
            enemy.vy *= this.difficulty.enemySpeed;
            
            this.enemies.push(enemy);
        }
    }
    
    checkCollisions() {
        // Proyectiles del jugador vs enemigos
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (projectile.owner !== 'player') continue;
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (enemy.isDestroyed) continue;
                
                if (projectile.checkCollision(enemy)) {
                    // Crear partículas de impacto
                    const impactParticles = projectile.explode();
                    this.particles.push(...impactParticles);
                    
                    // Dañar enemigo
                    const destroyed = enemy.takeDamage(1);
                    
                    if (destroyed) {
                        const reward = enemy.getReward();
                        this.addScore(reward.points);
                        
                        if (reward.powerUp) {
                            this.spawnPowerUp(enemy.x, enemy.y, reward.powerUp);
                        }
                        
                        audioManager.playExplosionSound(enemy.radius / 30);
                        this.screenShake = 10;
                        
                        // Crear partículas de explosión
                        const explosionParticles = createExplosionParticles(enemy.x, enemy.y, 15);
                        this.particles.push(...explosionParticles);
                    }
                    
                    // Remover proyectil
                    this.projectiles.splice(i, 1);
                    break;
                }
            }
        }
        
        // Proyectiles enemigos vs jugador
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (projectile.owner !== 'enemy') continue;
            
            if (projectile.checkCollision(this.player)) {
                const damaged = this.player.takeDamage();
                
                if (damaged) {
                    this.lives = this.player.health;
                    this.screenShake = 15;
                    
                    // Crear partículas de impacto
                    const impactParticles = createExplosionParticles(this.player.x, this.player.y, 10);
                    this.particles.push(...impactParticles);
                }
                
                // Remover proyectil
                this.projectiles.splice(i, 1);
            }
        }
        
        // Enemigos vs jugador
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (enemy.isDestroyed) continue;
            
            if (enemy.checkCollision(this.player)) {
                const damaged = this.player.takeDamage();
                
                if (damaged) {
                    this.lives = this.player.health;
                    this.screenShake = 20;
                }
                
                // Destruir enemigo también
                enemy.destroy();
                
                // Crear partículas de colisión
                const collisionParticles = createExplosionParticles(enemy.x, enemy.y, 12);
                this.particles.push(...collisionParticles);
            }
        }
        
        // Power-ups vs jugador
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            
            if (powerUp.checkCollision(this.player)) {
                this.collectPowerUp(powerUp);
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    spawnPowerUp(x, y, type) {
        // Implementar power-ups como objetos especiales
        const powerUp = {
            x, y, type,
            radius: 15,
            vx: 0,
            vy: 2,
            life: 1,
            animationFrame: 0,
            checkCollision: function(other) {
                return checkCollision(this, other);
            }
        };
        
        this.powerUps.push(powerUp);
    }
    
    collectPowerUp(powerUp) {
        switch (powerUp.type) {
            case 'rapidFire':
                this.player.activatePowerUp('rapidFire');
                break;
            case 'shield':
                this.player.activatePowerUp('shield');
                break;
            case 'multiShot':
                this.player.activatePowerUp('multiShot');
                break;
            case 'health':
                this.player.heal();
                this.lives = this.player.health;
                break;
        }
        
        audioManager.playPowerUpSound();
        this.addScore(50);
        
        // Crear partículas de recolección
        const collectParticles = createExplosionParticles(powerUp.x, powerUp.y, 8);
        this.particles.push(...collectParticles);
    }
    
    updateEffects() {
        // Reducir screen shake
        if (this.screenShake > 0) {
            this.screenShake *= 0.9;
            if (this.screenShake < 0.1) {
                this.screenShake = 0;
            }
        }
        
        // Actualizar offset del fondo
        this.backgroundOffset += 0.5;
        if (this.backgroundOffset > this.height) {
            this.backgroundOffset = 0;
        }
    }
    
    addScore(points) {
        this.score += points;
    }
    
    updateHUD() {
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('livesValue').textContent = this.lives;
    }
    
    draw() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Aplicar screen shake
        if (this.screenShake > 0) {
            this.ctx.save();
            this.ctx.translate(
                random(-this.screenShake, this.screenShake),
                random(-this.screenShake, this.screenShake)
            );
        }
        
        // Dibujar fondo
        this.drawBackground();
        
        if (this.state === 'playing' || this.state === 'paused') {
            // Dibujar objetos del juego
            this.drawGameObjects();
        }
        
        // Restaurar transformación si había screen shake
        if (this.screenShake > 0) {
            this.ctx.restore();
        }
        
        // Dibujar efectos de pantalla completa
        this.drawScreenEffects();
    }
    
    drawBackground() {
        // Gradiente de fondo
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a0a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#1a1a3a');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Dibujar estrellas
        drawStars(this.ctx, this.stars);
        
        // Efecto de nebulosa
        this.drawNebula();
    }
    
    drawNebula() {
        const nebulaGradient = this.ctx.createRadialGradient(
            this.width * 0.3, this.height * 0.2, 0,
            this.width * 0.3, this.height * 0.2, this.width * 0.8
        );
        nebulaGradient.addColorStop(0, 'rgba(138, 43, 226, 0.1)');
        nebulaGradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.05)');
        nebulaGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.fillStyle = nebulaGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawGameObjects() {
        // Dibujar partículas de fondo
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = `rgba(${particle.color}, ${particle.life})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        
        // Dibujar enemigos
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        
        // Dibujar proyectiles
        this.projectiles.forEach(projectile => projectile.draw(this.ctx));
        
        // Dibujar power-ups
        this.powerUps.forEach(powerUp => this.drawPowerUp(powerUp));
        
        // Dibujar jugador
        this.player.draw(this.ctx);
    }
    
    drawPowerUp(powerUp) {
        powerUp.animationFrame += 16;
        powerUp.y += powerUp.vy;
        
        this.ctx.save();
        
        // Brillo pulsante
        const pulse = 0.8 + Math.sin(powerUp.animationFrame * 0.01) * 0.3;
        createGlowEffect(this.ctx, powerUp.x, powerUp.y, powerUp.radius * 3, getEtherealColor(), pulse);
        
        // Dibujar power-up
        this.ctx.fillStyle = `rgba(${getEtherealColor()}, 0.8)`;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Símbolo del power-up
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        let symbol = '?';
        switch (powerUp.type) {
            case 'rapidFire': symbol = 'R'; break;
            case 'shield': symbol = 'S'; break;
            case 'multiShot': symbol = 'M'; break;
            case 'health': symbol = '+'; break;
        }
        
        this.ctx.fillText(symbol, powerUp.x, powerUp.y);
        
        this.ctx.restore();
        
        // Remover si sale de pantalla
        if (powerUp.y > this.height + powerUp.radius) {
            const index = this.powerUps.indexOf(powerUp);
            if (index > -1) {
                this.powerUps.splice(index, 1);
            }
        }
    }
    
    drawScreenEffects() {
        // Efecto de viñeta
        const vignette = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, Math.max(this.width, this.height) * 0.8
        );
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        
        this.ctx.fillStyle = vignette;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
}

