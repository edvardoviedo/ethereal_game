// Archivo principal - Inicialización del juego
let game;
let animationId;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupUI();
});

function initializeGame() {
    const canvas = document.getElementById('gameCanvas');
    
    // Configurar canvas según el dispositivo
    if (window.innerWidth <= 768) {
        // Móvil: usar toda la pantalla disponible
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight * 0.85; // 85% de la altura
    } else {
        // Desktop: tamaño fijo
        canvas.width = 1200;
        canvas.height = 675;
    }
    
    // Crear instancia del juego
    game = new Game(canvas);
    
    // Mostrar controles móviles si es necesario
    if (game.isMobile) {
        document.getElementById('mobileControls').classList.remove('hidden');
        setupMobileControls();
    }
    
    // Iniciar loop de renderizado
    startGameLoop();
}

function setupUI() {
    // Botón de inicio
    document.getElementById('startButton').addEventListener('click', () => {
        hideScreen('startScreen');
        showScreen('gameHUD');
        game.startGame();
    });
    
    // Botón de pausa
    document.getElementById('pauseButton').addEventListener('click', () => {
        if (game.state === 'playing') {
            game.pauseGame();
            showScreen('pauseScreen');
        }
    });
    
    // Botón de continuar
    document.getElementById('resumeButton').addEventListener('click', () => {
        hideScreen('pauseScreen');
        game.resumeGame();
    });
    
    // Botón de reiniciar desde pausa
    document.getElementById('restartButton').addEventListener('click', () => {
        hideScreen('pauseScreen');
        hideScreen('gameHUD');
        showScreen('startScreen');
        game.state = 'menu';
    });
    
    // Botón de jugar de nuevo
    document.getElementById('playAgainButton').addEventListener('click', () => {
        hideScreen('gameOverScreen');
        showScreen('gameHUD');
        game.startGame();
    });
    
    // Mostrar puntuación máxima en pantalla de inicio
    updateHighScoreDisplay();
}

function setupMobileControls() {
    const joystick = document.getElementById('joystick');
    const joystickKnob = document.getElementById('joystickKnob');
    const fireButton = document.getElementById('fireButton');
    
    let joystickActive = false;
    let joystickCenter = { x: 0, y: 0 };
    
    // Configurar joystick
    joystick.addEventListener('touchstart', (e) => {
        e.preventDefault();
        joystickActive = true;
        
        const rect = joystick.getBoundingClientRect();
        joystickCenter.x = rect.left + rect.width / 2;
        joystickCenter.y = rect.top + rect.height / 2;
        
        updateJoystick(e.touches[0]);
    });
    
    joystick.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (joystickActive) {
            updateJoystick(e.touches[0]);
        }
    });
    
    joystick.addEventListener('touchend', (e) => {
        e.preventDefault();
        joystickActive = false;
        resetJoystick();
    });
    
    function updateJoystick(touch) {
        const dx = touch.clientX - joystickCenter.x;
        const dy = touch.clientY - joystickCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 30; // Radio del joystick
        
        let knobX = dx;
        let knobY = dy;
        
        if (distance > maxDistance) {
            knobX = (dx / distance) * maxDistance;
            knobY = (dy / distance) * maxDistance;
        }
        
        joystickKnob.style.transform = `translate(-50%, -50%) translate(${knobX}px, ${knobY}px)`;
        
        // Actualizar controles del juego
        if (game && game.player) {
            const normalizedX = knobX / maxDistance;
            const normalizedY = knobY / maxDistance;
            
            // Simular teclas presionadas
            game.keys = {};
            if (Math.abs(normalizedX) > 0.2) {
                if (normalizedX > 0) game.keys['KeyD'] = true;
                else game.keys['KeyA'] = true;
            }
            if (Math.abs(normalizedY) > 0.2) {
                if (normalizedY > 0) game.keys['KeyS'] = true;
                else game.keys['KeyW'] = true;
            }
        }
    }
    
    function resetJoystick() {
        joystickKnob.style.transform = 'translate(-50%, -50%)';
        if (game) {
            game.keys = {};
        }
    }
    
    // Configurar botón de disparo
    fireButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        fireButton.style.transform = 'scale(0.95)';
        if (game && game.state === 'playing') {
            game.handleShooting();
        }
    });
    
    fireButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        fireButton.style.transform = 'scale(1)';
    });
    
    // Prevenir scroll en dispositivos móviles
    document.body.addEventListener('touchstart', (e) => {
        if (e.target === canvas) {
            e.preventDefault();
        }
    }, { passive: false });
    
    document.body.addEventListener('touchend', (e) => {
        if (e.target === canvas) {
            e.preventDefault();
        }
    }, { passive: false });
    
    document.body.addEventListener('touchmove', (e) => {
        if (e.target === canvas) {
            e.preventDefault();
        }
    }, { passive: false });
}

function startGameLoop() {
    function gameLoop(currentTime) {
        // Actualizar juego
        if (game) {
            game.update(currentTime);
            game.draw();
        }
        
        // Verificar estado del juego para mostrar pantallas
        if (game && game.state === 'gameOver') {
            if (!document.getElementById('gameOverScreen').classList.contains('hidden')) {
                // Ya se está mostrando la pantalla de game over
            } else {
                hideScreen('gameHUD');
                showScreen('gameOverScreen');
            }
        }
        
        // Continuar el loop
        animationId = requestAnimationFrame(gameLoop);
    }
    
    // Iniciar el loop
    animationId = requestAnimationFrame(gameLoop);
}

function showScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('hidden');
    }
}

function hideScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('hidden');
    }
}

function updateHighScoreDisplay() {
    const highScore = getHighScore();
    // Actualizar en pantalla de inicio si hay un elemento para ello
    const highScoreElement = document.querySelector('.high-score-display');
    if (highScoreElement) {
        highScoreElement.textContent = `Mejor puntuación: ${highScore}`;
    }
}

// Funciones de utilidad para el manejo de pantalla completa
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Error al entrar en pantalla completa:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Manejo de visibilidad de la página
document.addEventListener('visibilitychange', () => {
    if (document.hidden && game && game.state === 'playing') {
        game.pauseGame();
        showScreen('pauseScreen');
    }
});

// Manejo de errores de audio
window.addEventListener('error', (e) => {
    if (e.target.tagName === 'AUDIO') {
        console.log('Error cargando audio:', e.target.src);
    }
});

// Prevenir zoom en dispositivos móviles
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
});

document.addEventListener('gestureend', (e) => {
    e.preventDefault();
});

// Configuración adicional para PWA (Progressive Web App)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Registrar service worker si está disponible
        // navigator.serviceWorker.register('/sw.js');
    });
}

// Funciones de debug (solo en desarrollo)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugGame = {
        getGame: () => game,
        addScore: (points) => game && game.addScore(points),
        setLevel: (level) => game && (game.level = level),
        godMode: () => {
            if (game && game.player) {
                game.player.health = 999;
                game.player.maxHealth = 999;
            }
        },
        spawnEnemy: (type) => {
            if (game) {
                const enemy = new CelestialObject(game.width / 2, 50, type || 'asteroid');
                game.enemies.push(enemy);
            }
        }
    };
    
    console.log('🎮 Cosmic Ethereal - Modo Debug Activado');
    console.log('Usa window.debugGame para acceder a funciones de debug');
}

// Exportar funciones principales para uso externo si es necesario
window.CosmicEthereal = {
    start: initializeGame,
    toggleFullscreen: toggleFullscreen
};



// Función para redimensionar el canvas cuando cambie la orientación o tamaño de ventana
function resizeCanvas() {
    if (!game) return;
    
    const canvas = document.getElementById('gameCanvas');
    
    if (window.innerWidth <= 768) {
        // Móvil: ajustar al tamaño de la ventana
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight * 0.85;
        
        // Actualizar dimensiones del juego
        game.width = canvas.width;
        game.height = canvas.height;
        
        // Reposicionar jugador si está fuera de los límites
        if (game.player) {
            game.player.x = Math.min(game.player.x, game.width - 50);
            game.player.y = Math.min(game.player.y, game.height - 50);
        }
    } else {
        // Desktop: mantener tamaño fijo
        canvas.width = 1200;
        canvas.height = 675;
        game.width = canvas.width;
        game.height = canvas.height;
    }
}

// Escuchar cambios de orientación y redimensionamiento
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    setTimeout(resizeCanvas, 100); // Pequeño delay para que se complete el cambio
});

