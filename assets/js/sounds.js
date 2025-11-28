/**
 * Sound Manager - Ahorcado Bíblico Third Wave
 */

class SoundManager {
    constructor() {
        this.enabled = true;
        this.sounds = {};
        this.audioContext = null;
        this.bgm = null;
    }

    init(enabled = true) {
        this.enabled = enabled;
        
        // Create AudioContext on user interaction
        if (this.enabled && !this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    /**
     * Generate beep sound programmatically
     */
    playBeep(frequency = 440, duration = 100, type = 'sine') {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration / 1000);
    }

    /**
     * Play click sound
     */
    playClick() {
        this.playBeep(800, 50, 'square');
    }

    /**
     * Play correct letter sound
     */
    playCorrect() {
        this.playBeep(1200, 150, 'sine');
        setTimeout(() => this.playBeep(1600, 150, 'sine'), 100);
    }

    /**
     * Play wrong letter sound
     */
    playWrong() {
        this.playBeep(200, 300, 'sawtooth');
    }

    /**
     * Play victory sound
     */
    playVictory() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((note, index) => {
            setTimeout(() => this.playBeep(note, 200, 'sine'), index * 150);
        });
    }

    /**
     * Play defeat sound
     */
    playDefeat() {
        const notes = [400, 350, 300, 250];
        notes.forEach((note, index) => {
            setTimeout(() => this.playBeep(note, 300, 'triangle'), index * 200);
        });
    }

    /**
     * Toggle sound on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Set sound state
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (enabled && !this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    /**
     * Initialize BGM
     */
    initBGM(url) {
        if (!this.bgm) {
            this.bgm = new Audio(url);
            this.bgm.loop = true;
            this.bgm.volume = 0.3;
        }
    }

    /**
     * Play BGM
     */
    playBGM() {
        if (this.bgm) {
            this.bgm.play().catch(e => console.log('BGM play error:', e));
        }
    }

    /**
     * Stop BGM
     */
    stopBGM() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }
    }

    /**
     * Toggle BGM
     */
    toggleBGM(enabled) {
        if (enabled) {
            this.playBGM();
        } else {
            this.stopBGM();
        }
    }
}

// Export global instance
window.ABTWSoundManager = new SoundManager();
