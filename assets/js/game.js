/**
 * Game Manager - Ahorcado Bíblico Third Wave
 */

class GameManager {
    constructor() {
        this.config = null;
        this.palabras = null;
        this.currentWord = null;
        this.currentHint = null;
        this.guessedLetters = [];
        this.wrongAttempts = 0;
        this.maxAttempts = 5;
        this.currentTeamIndex = 0;
        this.currentRound = 1;
        this.gameActive = false;
        this.eventsBound = false;
        this.difficultyConfig = {
            muy_facil: { attempts: 7, stages: 7 },
            facil: { attempts: 6, stages: 6 },
            normal: { attempts: 5, stages: 5 },
            dificil: { attempts: 4, stages: 4 },
            extremo: { attempts: 3, stages: 3 }
        };
        this.hangmanStages = ['😊', '😐', '😟', '😨', '😰', '😱', '💀'];
        this.svgCache = {};
    }

    async init(config) {
        this.config = config;
        this.config.hangmanStyle = this.config.hangmanStyle || 'emoji';
        this.maxAttempts = this.difficultyConfig[config.difficulty].attempts;
        this.currentTeamIndex = 0;
        this.currentRound = 1;
        
        // Reset team scores
        if (this.config.teams) {
            this.config.teams.forEach(team => team.score = 0);
        }

        await this.loadPalabras();
        this.bindEvents();
        this.startNewRound();
    }

    async loadPalabras() {
        try {
            const response = await fetch(`${ABTW.pluginUrl}palabras.json`);
            this.palabras = await response.json();
        } catch (error) {
            console.error('Error loading palabras:', error);
            await window.ABTWToast?.alert('❌ ERROR', 'Error al cargar las palabras. Por favor recarga la página.');
        }
    }

    bindEvents() {
        if (this.eventsBound) return;
        
        // Hint button
        document.getElementById('abtw-hint-btn')?.addEventListener('click', () => {
            this.showHint();
        });

        // Exit button
        document.getElementById('abtw-exit-btn')?.addEventListener('click', () => {
            window.SimpleConfirm('¿Seguro que quieres salir del juego?', () => {
                this.exitGame();
            });
        });

        // Continue button (result screen)
        document.getElementById('abtw-continue-btn')?.addEventListener('click', () => {
            this.continueGame();
        });

        // Restart button
        document.getElementById('abtw-restart-btn')?.addEventListener('click', () => {
            this.restartGame();
        });

        // Play again button (winner screen)
        document.getElementById('abtw-play-again-btn')?.addEventListener('click', () => {
            this.restartGame();
        });

        // Config button
        document.getElementById('abtw-config-btn')?.addEventListener('click', () => {
            this.exitGame();
        });
        
        this.eventsBound = true;
    }

    startNewRound() {
        this.guessedLetters = [];
        this.wrongAttempts = 0;
        this.gameActive = true;
        this.selectRandomWord();
        this.renderGame();
        this.createKeyboard();
    }

    selectRandomWord() {
        // Test mode: use selected word
        if (this.config.mode === 'test' && this.config.testWord) {
            this.currentWord = this.normalizeWord(this.config.testWord.palabra.toUpperCase());
            this.currentHint = this.config.testWord.pista;
            return;
        }

        // Normal mode: random word
        const difficulty = this.config.difficulty;
        const wordType = this.config.wordType;
        
        let wordPool = [];
        
        if (wordType === 'mezclado') {
            wordPool = [
                ...this.palabras[difficulty].personas,
                ...this.palabras[difficulty].libros,
                ...this.palabras[difficulty].conceptos
            ];
        } else {
            wordPool = this.palabras[difficulty][wordType];
        }

        const selected = wordPool[Math.floor(Math.random() * wordPool.length)];
        this.currentWord = this.normalizeWord(selected.palabra.toUpperCase());
        this.currentHint = selected.pista;
    }

    normalizeWord(word) {
        return word
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toUpperCase();
    }

    createKeyboard() {
        const keyboard = document.getElementById('abtw-keyboard');
        if (!keyboard) return;

        const letters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
        
        keyboard.innerHTML = letters.map(letter => 
            `<button class="abtw-key" data-letter="${letter}">${letter}</button>`
        ).join('');

        keyboard.querySelectorAll('.abtw-key').forEach(key => {
            key.addEventListener('click', () => {
                this.handleLetterGuess(key.dataset.letter);
            });
        });
    }

    handleLetterGuess(letter) {
        if (!this.gameActive || this.guessedLetters.includes(letter)) return;

        window.ABTWSoundManager.playClick();
        this.guessedLetters.push(letter);

        const key = document.querySelector(`[data-letter="${letter}"]`);
        const normalizedLetter = this.normalizeWord(letter);
        
        if (this.currentWord.includes(normalizedLetter)) {
            key?.classList.add('correct');
            window.ABTWSoundManager.playCorrect();
            this.renderWordDisplay();
            
            if (this.checkWin()) {
                this.endRound(true);
            }
        } else {
            key?.classList.add('wrong');
            window.ABTWSoundManager.playWrong();
            this.wrongAttempts++;
            this.updateHangman();
            this.updateAttempts();
            
            if (this.wrongAttempts >= this.maxAttempts) {
                // Wait to show final hangman stage before ending
                setTimeout(() => this.endRound(false), 1000);
            }
        }

        key?.classList.add('disabled');
    }

    checkWin() {
        return this.currentWord.split('').every(letter => {
            if (letter === ' ') return true;
            return this.guessedLetters.some(g => this.normalizeWord(g) === this.normalizeWord(letter));
        });
    }

    renderGame() {
        this.updateTurnIndicator();
        this.updateAttempts();
        this.updateRoundCounter();
        this.renderWordDisplay();
        this.updateHangman();
        this.renderScoreboard();
    }

    updateTurnIndicator() {
        const indicator = document.querySelector('#abtw-current-team strong');
        if (!indicator) return;

        if (this.config.mode === 'equipos') {
            const team = this.config.teams[this.currentTeamIndex];
            indicator.textContent = team.name.toUpperCase();
            indicator.style.color = team.color;
        } else {
            indicator.textContent = 'JUGADOR';
        }
    }

    updateAttempts() {
        const heartsContainer = document.querySelector('.abtw-hearts');
        if (!heartsContainer) return;

        const remaining = this.maxAttempts - this.wrongAttempts;
        heartsContainer.textContent = '❤️'.repeat(remaining);
    }

    updateRoundCounter() {
        const counter = document.querySelector('#abtw-round-counter span');
        if (!counter) return;

        if (this.config.mode === 'equipos') {
            counter.textContent = `${this.currentRound}/${this.config.roundsToWin}`;
        } else {
            counter.textContent = this.currentRound;
        }
    }

    renderWordDisplay() {
        const display = document.getElementById('abtw-word-display');
        if (!display) return;

        display.innerHTML = this.currentWord.split('').map(letter => {
            if (letter === ' ') {
                return '<div style="width: 30px;"></div>';
            }
            const normalizedLetter = this.normalizeWord(letter);
            const revealed = this.guessedLetters.some(g => this.normalizeWord(g) === normalizedLetter);
            return `<div class="abtw-letter">${revealed ? letter : ''}</div>`;
        }).join('');
    }

    async updateHangman() {
        const hangman = document.getElementById('abtw-hangman');
        if (!hangman) return;

        if (this.config.hangmanStyle === 'emoji') {
            // Map wrong attempts to emoji stages
            const maxAttempts = this.maxAttempts;
            const emojiIndex = Math.floor((this.wrongAttempts / maxAttempts) * (this.hangmanStages.length - 1));
            const stageIndex = Math.min(emojiIndex, this.hangmanStages.length - 1);
            hangman.innerHTML = `<div style="font-size: 8rem;">${this.hangmanStages[stageIndex]}</div>`;
        } else {
            // SVG rendering - EXACTLY like emoji
            const style = this.config.hangmanStyle;
            const svgFile = `hangman-${style}.svg`;
            
            // Load SVG if not cached
            if (!this.svgCache[style]) {
                try {
                    const response = await fetch(`${ABTW.pluginUrl}assets/images/${svgFile}`);
                    this.svgCache[style] = await response.text();
                } catch (error) {
                    console.error('Error loading SVG:', error);
                    hangman.innerHTML = '<div style="font-size: 10rem;">❌</div>';
                    return;
                }
            }

            // Use innerHTML EXACTLY like emoji - insert first
            hangman.innerHTML = `<div style="width: 250px; height: 250px; display: flex; align-items: center; justify-content: center;">${this.svgCache[style]}</div>`;
            
            // NOW manipulate the SVG that's in the DOM
            const svg = hangman.querySelector('svg');
            
            if (svg) {
                // Set SVG to 100% to fit container
                svg.style.width = '100%';
                svg.style.height = '100%';
                
                // Calculate which stages to show
                let stagesToShow = 0;
                if (this.wrongAttempts > 0) {
                    stagesToShow = Math.ceil((this.wrongAttempts / this.maxAttempts) * 8);
                    if (stagesToShow < 1) stagesToShow = 1;
                }

                console.log(`[${style}] wrongAttempts=${this.wrongAttempts}, stagesToShow=${stagesToShow}`);

                // Show/hide stages in the DOM
                for (let i = 0; i <= 8; i++) {
                    const stage = svg.querySelector(`#stage-${i}`);
                    if (stage) {
                        const shouldShow = i <= stagesToShow;
                        stage.style.display = shouldShow ? 'block' : 'none';
                        if (shouldShow) {
                            console.log(`  Stage ${i}: VISIBLE`);
                        }
                    }
                }
            }
        }
    }



    renderScoreboard() {
        const scoreboard = document.getElementById('abtw-scores');
        if (!scoreboard || this.config.mode !== 'equipos') return;

        scoreboard.innerHTML = this.config.teams.map((team, index) => `
            <div class="abtw-score-item ${index === this.currentTeamIndex ? 'active' : ''}"
                 style="border-left: 4px solid ${team.color}">
                <span>${team.name}</span>
                <span style="color: ${team.color}; font-size: 1.2rem;">${team.score}</span>
            </div>
        `).join('');
    }

    async showHint() {
        if (!this.gameActive) return;
        
        window.ABTWSoundManager.playClick();
        
        const confirmed = await window.ABTWToast?.confirm('💡 PISTA', this.currentHint);
        if (confirmed) {
            // Reveal one random unrevealed letter
            const unrevealedLetters = this.currentWord.split('')
                .filter(letter => letter !== ' ' && !this.guessedLetters.some(g => this.normalizeWord(g) === this.normalizeWord(letter)));
            
            if (unrevealedLetters.length > 0) {
                const randomLetter = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
                this.handleLetterGuess(randomLetter);
            }
        }
    }

    endRound(won) {
        this.gameActive = false;

        setTimeout(() => {
            if (won) {
                window.ABTWSoundManager.playVictory();
                if (this.config.mode === 'equipos') {
                    this.config.teams[this.currentTeamIndex].score++;
                }
            } else {
                window.ABTWSoundManager.playDefeat();
            }

            this.showResultScreen(won);
        }, 500);
    }

    showResultScreen(won) {
        const resultTitle = document.getElementById('abtw-result-title');
        const resultWord = document.getElementById('abtw-result-word');
        const nextTurn = document.getElementById('abtw-next-turn');

        if (won) {
            if (this.config.mode === 'equipos') {
                const team = this.config.teams[this.currentTeamIndex];
                resultTitle.textContent = `🎉 ¡${team.name.toUpperCase()} GANA! 🎉`;
                resultTitle.style.color = team.color;
            } else {
                resultTitle.textContent = '🎉 ¡VICTORIA! 🎉';
                resultTitle.style.color = 'var(--color-accent)';
            }
        } else {
            resultTitle.textContent = '😢 PERDISTE 😢';
            resultTitle.style.color = '#ff4444';
        }

        resultWord.textContent = `La palabra era: ${this.currentWord}`;

        // Update scoreboard in result
        this.renderResultScoreboard();

        // Check if game should end
        if (this.shouldEndGame()) {
            this.showWinnerScreen();
            return;
        }

        // Show next turn
        if (this.config.mode === 'equipos') {
            const nextIndex = (this.currentTeamIndex + 1) % this.config.teams.length;
            const nextTeam = this.config.teams[nextIndex];
            nextTurn.textContent = `Siguiente turno: ${nextTeam.name.toUpperCase()}`;
            nextTurn.style.color = nextTeam.color;
        } else {
            nextTurn.textContent = 'Siguiente ronda';
        }

        // Switch screens
        document.getElementById('abtw-game')?.classList.remove('active');
        document.getElementById('abtw-result')?.classList.add('active');
    }

    renderResultScoreboard() {
        const scoreboard = document.getElementById('abtw-result-scores');
        if (!scoreboard || this.config.mode !== 'equipos') return;

        scoreboard.innerHTML = this.config.teams.map(team => `
            <div class="abtw-score-item" style="border-left: 4px solid ${team.color}">
                <span>${team.name}</span>
                <span style="color: ${team.color}; font-size: 1.2rem;">${team.score}</span>
            </div>
        `).join('');
    }

    shouldEndGame() {
        if (this.config.mode !== 'equipos') return false;
        
        const maxScore = Math.max(...this.config.teams.map(t => t.score));
        return maxScore >= this.config.roundsToWin;
    }

    showWinnerScreen() {
        const winnerName = document.getElementById('abtw-winner-name');
        const winnerSubtitle = document.getElementById('abtw-winner-subtitle');
        const finalScores = document.getElementById('abtw-final-scores');

        const winner = this.config.teams.reduce((prev, current) => 
            current.score > prev.score ? current : prev
        );

        winnerName.textContent = `🎊 ${winner.name.toUpperCase()} 🎊`;
        winnerName.style.color = winner.color;
        winnerSubtitle.textContent = 'SON LOS CAMPEONES';

        finalScores.innerHTML = this.config.teams
            .sort((a, b) => b.score - a.score)
            .map((team, index) => `
                <div class="abtw-score-item" style="border-left: 4px solid ${team.color}">
                    <span>${index === 0 ? '🏆 ' : ''}${team.name}</span>
                    <span style="color: ${team.color}; font-size: 1.2rem;">${team.score}</span>
                </div>
            `).join('');

        document.getElementById('abtw-result')?.classList.remove('active');
        document.getElementById('abtw-winner')?.classList.add('active');
    }

    continueGame() {
        window.ABTWSoundManager.playClick();

        // Next team
        if (this.config.mode === 'equipos') {
            this.currentTeamIndex = (this.currentTeamIndex + 1) % this.config.teams.length;
            if (this.currentTeamIndex === 0) {
                this.currentRound++;
            }
        } else {
            this.currentRound++;
        }

        document.getElementById('abtw-result')?.classList.remove('active');
        document.getElementById('abtw-game')?.classList.add('active');
        
        this.startNewRound();
    }

    restartGame() {
        window.ABTWSoundManager.playClick();
        
        // Remove active from all screens
        document.querySelectorAll('.abtw-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show wizard
        document.getElementById('abtw-wizard')?.classList.add('active');
        
        if (window.ABTWWizardManager) {
            window.ABTWWizardManager.reset();
        }
    }

    exitGame() {
        document.querySelectorAll('.abtw-screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById('abtw-wizard')?.classList.add('active');
        if (window.ABTWWizardManager) {
            window.ABTWWizardManager.reset();
        }
    }
}

// Initialize
window.ABTWGameManager = new GameManager();
