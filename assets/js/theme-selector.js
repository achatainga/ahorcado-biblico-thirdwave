/**
 * Theme Selector - Ahorcado Bíblico Third Wave
 */

class ThemeSelector {
    constructor() {
        this.currentTheme = 'cyberpunk';
        this.container = null;
    }

    init() {
        this.container = document.getElementById('abtw-game-container');
        this.bindEvents();
    }

    bindEvents() {
        // Theme card selection
        document.querySelectorAll('.abtw-theme-card').forEach(card => {
            card.addEventListener('click', () => {
                const theme = card.dataset.theme;
                this.selectTheme(theme);
                if (window.ABTWSoundManager) {
                    window.ABTWSoundManager.playClick();
                }
                
                // Wait for animation then proceed to wizard
                setTimeout(() => {
                    this.goToWizard();
                }, 300);
            });
        });

        // Back to themes button
        document.getElementById('abtw-back-to-themes')?.addEventListener('click', () => {
            this.backToThemes();
        });
    }

    selectTheme(theme) {
        this.currentTheme = theme;
        
        // Update container theme
        if (this.container) {
            this.container.setAttribute('data-theme', theme);
        }

        // Update selected card
        document.querySelectorAll('.abtw-theme-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-theme="${theme}"]`)?.classList.add('selected');
    }

    goToWizard() {
        if (window.ABTWSoundManager) {
            window.ABTWSoundManager.playClick();
        }
        
        document.getElementById('abtw-theme-selector')?.classList.remove('active');
        document.getElementById('abtw-wizard')?.classList.add('active');
    }

    getTheme() {
        return this.currentTheme;
    }

    backToThemes() {
        if (window.ABTWSoundManager) {
            window.ABTWSoundManager.playClick();
        }
        
        document.getElementById('abtw-wizard')?.classList.remove('active');
        document.getElementById('abtw-theme-selector')?.classList.add('active');
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.ABTWThemeSelector = new ThemeSelector();
    window.ABTWThemeSelector.init();
});
