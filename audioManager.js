// Gestor de audio mejorado
class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.masterVolume = 1.0;
        this.sfxVolume = 0.7;
        this.musicVolume = 0.3;
        this.muted = false;
        this.audioContext = null;
        this.initialized = false;
        
        // Pool de sonidos para evitar cortes
        this.soundPools = {};
        this.poolSize = 5;
        
        this.initializeAudioContext();
    }
    
    async initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (error) {
            console.warn('AudioContext no disponible:', error);
        }
    }
    
    async loadSound(name, url, isMusic = false) {
        try {
            if (isMusic) {
                this.music = new Audio(url);
                this.music.loop = true;
                this.music.volume = this.musicVolume * this.masterVolume;
                this.music.preload = 'auto';
                return;
            }
            
            // Crear pool de sonidos para efectos
            this.soundPools[name] = [];
            for (let i = 0; i < this.poolSize; i++) {
                const audio = new Audio(url);
                audio.volume = this.sfxVolume * this.masterVolume;
                audio.preload = 'auto';
                this.soundPools[name].push(audio);
            }
            
            // Mantener referencia principal
            this.sounds[name] = this.soundPools[name][0];
            
        } catch (error) {
            console.warn(`Error cargando sonido ${name}:`, error);
        }
    }
    
    playSound(name, volume = 1.0, pitch = 1.0) {
        if (this.muted || !this.soundPools[name]) return;
        
        // Encontrar un audio disponible en el pool
        const availableAudio = this.soundPools[name].find(audio => 
            audio.paused || audio.ended || audio.currentTime === 0
        );
        
        if (availableAudio) {
            availableAudio.currentTime = 0;
            availableAudio.volume = Math.min(1.0, volume * this.sfxVolume * this.masterVolume);
            
            // Aplicar pitch si es compatible
            if (availableAudio.preservesPitch !== undefined) {
                availableAudio.playbackRate = pitch;
                availableAudio.preservesPitch = false;
            }
            
            availableAudio.play().catch(e => {
                // Silenciar errores de reproducción automática
            });
        }
    }
    
    playMusic() {
        if (this.muted || !this.music) return;
        
        this.music.volume = this.musicVolume * this.masterVolume;
        this.music.play().catch(e => {
            console.log('Error reproduciendo música:', e);
        });
    }
    
    pauseMusic() {
        if (this.music) {
            this.music.pause();
        }
    }
    
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.volume = this.musicVolume * this.masterVolume;
        }
    }
    
    updateAllVolumes() {
        // Actualizar volumen de efectos de sonido
        Object.keys(this.soundPools).forEach(name => {
            this.soundPools[name].forEach(audio => {
                audio.volume = this.sfxVolume * this.masterVolume;
            });
        });
        
        // Actualizar volumen de música
        if (this.music) {
            this.music.volume = this.musicVolume * this.masterVolume;
        }
    }
    
    mute() {
        this.muted = true;
        this.pauseMusic();
    }
    
    unmute() {
        this.muted = false;
    }
    
    // Efectos de sonido especiales
    playLaserSound(intensity = 1.0) {
        const pitch = 0.8 + Math.random() * 0.4; // Variación de pitch
        this.playSound('laser', intensity, pitch);
    }
    
    playExplosionSound(size = 1.0) {
        const volume = Math.min(1.0, 0.6 * size);
        const pitch = 1.0 - (size - 1.0) * 0.2; // Explosiones más grandes = pitch más bajo
        this.playSound('explosion', volume, pitch);
    }
    
    playPowerUpSound() {
        this.playSound('powerUp', 0.8, 1.2); // Pitch más alto para power-ups
    }
    
    // Crear efectos de audio procedurales usando Web Audio API
    createProceduralSound(type, frequency = 440, duration = 0.1) {
        if (!this.audioContext || this.muted) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        switch (type) {
            case 'hit':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.5, this.audioContext.currentTime + duration);
                break;
                
            case 'pickup':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(frequency * 2, this.audioContext.currentTime + duration);
                break;
                
            case 'warning':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                break;
        }
        
        gainNode.gain.setValueAtTime(0.1 * this.sfxVolume * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    // Activar audio después de interacción del usuario
    async enableAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        // Reproducir un sonido silencioso para "despertar" el audio
        Object.keys(this.soundPools).forEach(name => {
            const audio = this.soundPools[name][0];
            if (audio) {
                audio.volume = 0;
                audio.play().then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.volume = this.sfxVolume * this.masterVolume;
                }).catch(() => {});
            }
        });
    }
}

// Instancia global del gestor de audio
const audioManager = new AudioManager();

