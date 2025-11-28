/**
 * Wizard Manager - Ahorcado Bíblico Third Wave
 */

class WizardManager {
    constructor() {
        this.teams = [];
        this.palabras = null;
        this.config = {
            mode: 'equipos',
            difficulty: 'normal',
            wordType: 'mezclado',
            soundEnabled: true,
            roundsToWin: 5,
            testWord: null,
            hangmanStyle: 'emoji'
        };
        this.teamColors = [
            { name: 'Púrpura', hex: '#9D00FF', emoji: '💜' },
            { name: 'Cyan', hex: '#00F5FF', emoji: '💙' },
            { name: 'Rosa', hex: '#FF1493', emoji: '💗' },
            { name: 'Verde', hex: '#39FF14', emoji: '💚' },
            { name: 'Naranja', hex: '#FF6B00', emoji: '🧡' },
            { name: 'Amarillo', hex: '#FFD700', emoji: '💛' }
        ];
    }

    async init() {
        await this.loadPalabras();
        this.bindEvents();
        this.initDefaultTeams();
        this.populateTestWords();
    }

    async loadPalabras() {
        try {
            const response = await fetch(`${ABTW.pluginUrl}palabras.json`);
            this.palabras = await response.json();
        } catch (error) {
            console.error('Error loading palabras:', error);
        }
    }

    populateTestWords() {
        const select = document.getElementById('abtw-test-word');
        if (!select || !this.palabras) return;

        const allWords = [];
        Object.keys(this.palabras).forEach(difficulty => {
            ['personas', 'libros', 'conceptos'].forEach(category => {
                this.palabras[difficulty][category].forEach(item => {
                    allWords.push({
                        palabra: item.palabra,
                        pista: item.pista,
                        difficulty,
                        category
                    });
                });
            });
        });

        select.innerHTML = '<option value="">-- Selecciona una palabra --</option>' +
            allWords.map((item, index) => 
                `<option value="${index}">${item.palabra} (${item.category} - ${item.difficulty})</option>`
            ).join('');

        this.allWords = allWords;
    }

    bindEvents() {
        // Mode selection
        document.querySelectorAll('input[name="modo"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.config.mode = e.target.value;
                this.toggleTeamsConfig();
                this.toggleTestConfig();
                window.ABTWSoundManager.playClick();
            });
        });

        // Test word selection
        document.getElementById('abtw-test-word')?.addEventListener('change', (e) => {
            const index = parseInt(e.target.value);
            if (!isNaN(index) && this.allWords) {
                this.config.testWord = this.allWords[index];
            }
            window.ABTWSoundManager.playClick();
        });

        // Add team button
        document.getElementById('abtw-add-team')?.addEventListener('click', () => {
            this.addTeam();
            window.ABTWSoundManager.playClick();
        });

        // Difficulty
        document.getElementById('abtw-difficulty')?.addEventListener('change', (e) => {
            this.config.difficulty = e.target.value;
            window.ABTWSoundManager.playClick();
        });

        // Word type
        document.getElementById('abtw-word-type')?.addEventListener('change', (e) => {
            this.config.wordType = e.target.value;
            window.ABTWSoundManager.playClick();
        });

        // Hangman style
        document.getElementById('abtw-hangman-style')?.addEventListener('change', (e) => {
            this.config.hangmanStyle = e.target.value || 'emoji';
            window.ABTWSoundManager.playClick();
        });

        // Sound toggle
        document.getElementById('abtw-sound-toggle')?.addEventListener('change', (e) => {
            this.config.soundEnabled = e.target.checked;
            window.ABTWSoundManager.setEnabled(e.target.checked);
            if (e.target.checked) window.ABTWSoundManager.playClick();
        });

        // Rounds
        document.getElementById('abtw-rounds')?.addEventListener('change', (e) => {
            this.config.roundsToWin = parseInt(e.target.value) || 5;
        });

        // Start game
        document.getElementById('abtw-start-game')?.addEventListener('click', () => {
            this.startGame();
        });
    }

    toggleTeamsConfig() {
        const teamsConfig = document.getElementById('abtw-teams-config');
        if (this.config.mode === 'equipos') {
            teamsConfig.style.display = 'block';
        } else {
            teamsConfig.style.display = 'none';
        }
    }

    toggleTestConfig() {
        const testConfig = document.getElementById('abtw-test-config');
        if (this.config.mode === 'test') {
            testConfig.style.display = 'block';
        } else {
            testConfig.style.display = 'none';
        }
    }

    initDefaultTeams() {
        this.addTeam('GANG GIRLS', this.teamColors[0].hex);
        this.addTeam('WARRIORS', this.teamColors[1].hex);
        this.toggleTeamsConfig();
    }

    addTeam(name = '', color = null) {
        if (this.teams.length >= 4) {
            window.ABTWToast?.alert('⚠️ LÍMITE ALCANZADO', 'Máximo 4 equipos permitidos');
            return;
        }

        const teamColor = color || this.teamColors[this.teams.length % this.teamColors.length].hex;
        const team = {
            id: Date.now(),
            name: name || `Equipo ${this.teams.length + 1}`,
            color: teamColor,
            score: 0
        };

        this.teams.push(team);
        this.renderTeams();
    }

    async removeTeam(teamId) {
        if (this.teams.length <= 2) {
            window.ABTWToast?.alert('⚠️ MÍNIMO REQUERIDO', 'Se necesitan al menos 2 equipos');
            return;
        }
        this.teams = this.teams.filter(t => t.id !== teamId);
        this.renderTeams();
        window.ABTWSoundManager.playClick();
    }

    updateTeam(teamId, field, value) {
        const team = this.teams.find(t => t.id === teamId);
        if (team) {
            team[field] = value;
        }
    }

    renderTeams() {
        const container = document.getElementById('abtw-teams-list');
        if (!container) return;

        container.innerHTML = this.teams.map(team => `
            <div class="abtw-team-item" data-team-id="${team.id}">
                <input type="text" 
                       value="${team.name}" 
                       placeholder="Nombre del equipo"
                       data-field="name"
                       maxlength="20">
                <input type="color" 
                       value="${team.color}"
                       data-field="color">
                <button type="button" class="abtw-remove-team">✕</button>
            </div>
        `).join('');

        // Bind team events
        container.querySelectorAll('.abtw-team-item').forEach(item => {
            const teamId = parseInt(item.dataset.teamId);
            
            item.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', (e) => {
                    this.updateTeam(teamId, e.target.dataset.field, e.target.value);
                    window.ABTWSoundManager.playClick();
                });
            });

            item.querySelector('.abtw-remove-team')?.addEventListener('click', () => {
                this.removeTeam(teamId);
            });
        });
    }

    async startGame() {
        // Validate test mode
        if (this.config.mode === 'test' && !this.config.testWord) {
            await window.ABTWToast?.alert('⚠️ PALABRA REQUERIDA', 'Debes seleccionar una palabra para el modo TEST');
            return;
        }

        // Validate teams
        if (this.config.mode === 'equipos') {
            const emptyNames = this.teams.filter(t => !t.name.trim());
            if (emptyNames.length > 0) {
                await window.ABTWToast?.alert('⚠️ NOMBRES REQUERIDOS', 'Todos los equipos deben tener nombre');
                return;
            }
        }

        window.ABTWSoundManager.playVictory();

        // Pass config to game
        const gameConfig = {
            ...this.config,
            teams: this.config.mode === 'equipos' ? this.teams : []
        };

        // Initialize game
        if (window.ABTWGameManager) {
            window.ABTWGameManager.init(gameConfig);
        }

        // Switch screens
        document.getElementById('abtw-wizard')?.classList.remove('active');
        document.getElementById('abtw-game')?.classList.add('active');
    }

    reset() {
        this.teams = [];
        this.config = {
            mode: 'equipos',
            difficulty: 'normal',
            wordType: 'mezclado',
            soundEnabled: true,
            roundsToWin: 5
        };
        this.initDefaultTeams();
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.ABTWWizardManager = new WizardManager();
    window.ABTWWizardManager.init();
    window.ABTWSoundManager.init(true);
});
