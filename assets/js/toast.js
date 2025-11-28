/**
 * Toast/Popup Manager - Ahorcado Bíblico Third Wave
 */

class ToastManager {
    constructor() {
        this.activeToast = null;
    }

    show(title, message, buttons = []) {
        return new Promise((resolve) => {
            // Remove existing toast
            this.close();

            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'abtw-toast-overlay';

            // Create toast
            const toast = document.createElement('div');
            toast.className = 'abtw-toast';

            toast.innerHTML = `
                <div class="abtw-toast-title">${title}</div>
                <div class="abtw-toast-message">${message}</div>
                <div class="abtw-toast-actions"></div>
            `;

            const actionsContainer = toast.querySelector('.abtw-toast-actions');

            // Default button if none provided
            if (buttons.length === 0) {
                buttons = [{ text: 'OK', primary: true, value: true }];
            }

            // Create buttons
            buttons.forEach(btn => {
                const button = document.createElement('button');
                button.className = `abtw-toast-btn ${btn.primary ? 'primary' : ''}`;
                button.textContent = btn.text;
                button.onclick = () => {
                    window.ABTWSoundManager?.playClick();
                    this.close();
                    resolve(btn.value !== undefined ? btn.value : true);
                };
                actionsContainer.appendChild(button);
            });

            // Add to DOM outside game container
            const container = document.getElementById('abtw-game-container');
            if (container && container.parentElement) {
                container.parentElement.appendChild(overlay);
                container.parentElement.appendChild(toast);
            } else {
                document.body.appendChild(overlay);
                document.body.appendChild(toast);
            }

            this.activeToast = { toast, overlay };

            // Only add overlay click for single button (alerts)
            if (buttons.length === 1) {
                overlay.addEventListener('click', () => {
                    this.close();
                    resolve(false);
                });
            }
        });
    }

    alert(title, message) {
        return this.show(title, message, [
            { text: 'OK', primary: true, value: true }
        ]);
    }

    confirm(title, message) {
        return this.show(title, message, [
            { text: 'CANCELAR', primary: false, value: false },
            { text: 'ACEPTAR', primary: true, value: true }
        ]);
    }

    close() {
        if (this.activeToast) {
            this.activeToast.overlay?.remove();
            this.activeToast.toast?.remove();
            this.activeToast = null;
        }
    }
}

// Export global instance
window.ABTWToast = new ToastManager();
