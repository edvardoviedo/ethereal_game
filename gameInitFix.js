// Archivo para solucionar problemas de inicialización del juego
// Este archivo asegura que el juego se inicialice correctamente

// Función para forzar la inicialización del juego si hay problemas
function forceGameInitialization() {
    console.log('🔧 Forzando inicialización del juego...');
    
    // Verificar que todas las dependencias estén cargadas
    if (typeof Game === 'undefined') {
        console.error('❌ Clase Game no encontrada');
        return false;
    }
    
    if (typeof audioManager === 'undefined') {
        console.error('❌ AudioManager no encontrado');
        return false;
    }
    
    if (typeof particleSystem === 'undefined') {
        console.error('❌ ParticleSystem no encontrado');
        return false;
    }
    
    // Verificar que el canvas exista
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('❌ Canvas no encontrado');
        return false;
    }
    
    // Si el juego no existe o no está funcionando, recrearlo
    if (!window.game || window.game.state === 'error') {
        console.log('🎮 Recreando instancia del juego...');
        window.game = new Game(canvas);
        
        // Configurar controles móviles si es necesario
        if (window.game.isMobile) {
            document.getElementById('mobileControls').classList.remove('hidden');
        }
    }
    
    // Verificar que el spawn de enemigos funcione
    if (window.game && window.game.state === 'playing') {
        // Reducir la tasa de spawn inicial para testing
        window.game.enemySpawnRate = 1000; // 1 segundo en lugar de 2
        window.game.lastEnemySpawn = 0; // Resetear para spawn inmediato
        
        console.log('✅ Juego inicializado correctamente');
        console.log('📊 Estado:', window.game.state);
        console.log('⏱️ Tasa de spawn:', window.game.enemySpawnRate);
    }
    
    return true;
}

// Función para diagnosticar problemas del juego
function diagnoseGame() {
    console.log('🔍 Diagnóstico del juego:');
    console.log('- Game existe:', typeof window.game !== 'undefined');
    console.log('- Estado del juego:', window.game?.state);
    console.log('- Número de enemigos:', window.game?.enemies?.length || 0);
    console.log('- Último spawn:', window.game?.lastEnemySpawn || 0);
    console.log('- Tasa de spawn:', window.game?.enemySpawnRate || 0);
    console.log('- Tiempo actual:', Date.now());
    console.log('- Tiempo desde último spawn:', Date.now() - (window.game?.lastEnemySpawn || 0));
    
    if (window.game && window.game.enemies) {
        window.game.enemies.forEach((enemy, index) => {
            console.log(`- Enemigo ${index}:`, {
                x: enemy.x,
                y: enemy.y,
                type: enemy.type,
                health: enemy.health
            });
        });
    }
}

// Función para testear el spawn de enemigos
function testEnemySpawn() {
    if (!window.game) {
        console.error('❌ Juego no inicializado');
        return;
    }
    
    console.log('🧪 Testeando spawn de enemigos...');
    
    // Crear enemigos de prueba
    const enemyTypes = ['asteroid', 'crystal', 'planet', 'void'];
    
    enemyTypes.forEach((type, index) => {
        const x = 100 + (index * 150);
        const y = -50 - (index * 100);
        const enemy = new CelestialObject(x, y, type);
        window.game.enemies.push(enemy);
        console.log(`✅ Enemigo ${type} creado en (${x}, ${y})`);
    });
    
    console.log(`📊 Total de enemigos: ${window.game.enemies.length}`);
}

// Función para resetear el juego completamente
function resetGame() {
    console.log('🔄 Reseteando juego...');
    
    if (window.game) {
        window.game.enemies = [];
        window.game.projectiles = [];
        window.game.particles = [];
        window.game.powerUps = [];
        window.game.score = 0;
        window.game.lives = 3;
        window.game.level = 1;
        window.game.gameTime = 0;
        window.game.lastEnemySpawn = 0;
        window.game.enemySpawnRate = 1000; // Spawn más rápido para testing
        
        if (window.game.player) {
            window.game.player.reset(window.game.width / 2, window.game.height - 100);
        }
        
        window.game.updateHUD();
        console.log('✅ Juego reseteado');
    }
}

// Auto-diagnóstico al cargar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('🚀 Ejecutando auto-diagnóstico...');
        diagnoseGame();
        
        // Si hay problemas, intentar solucionarlos
        if (!window.game || window.game.enemies.length === 0) {
            console.log('⚠️ Problemas detectados, aplicando correcciones...');
            forceGameInitialization();
        }
    }, 2000);
});

// Exponer funciones para debugging
window.gameDebug = {
    diagnose: diagnoseGame,
    forceInit: forceGameInitialization,
    testSpawn: testEnemySpawn,
    reset: resetGame,
    spawnEnemy: (type = 'asteroid') => {
        if (window.game) {
            const enemy = new CelestialObject(
                Math.random() * window.game.width,
                -50,
                type
            );
            window.game.enemies.push(enemy);
            console.log(`✅ Enemigo ${type} spawneado`);
        }
    }
};

console.log('🛠️ GameInitFix cargado. Usa window.gameDebug para debugging.');

