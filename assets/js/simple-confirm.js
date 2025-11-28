/**
 * Simple Confirm Dialog
 */
window.SimpleConfirm = function(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999999;display:flex;align-items:center;justify-content:center';
    
    const dialog = document.createElement('div');
    dialog.style.cssText = 'background:#1a1a1a;border:3px solid #00F5FF;border-radius:15px;padding:2rem;max-width:400px;text-align:center;box-shadow:0 0 50px rgba(0,245,255,0.5)';
    
    const text = document.createElement('p');
    text.textContent = message;
    text.style.cssText = 'color:#fff;font-size:1rem;margin-bottom:2rem;font-family:Arial,sans-serif';
    
    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display:flex;gap:1rem;justify-content:center';
    
    const btnCancel = document.createElement('button');
    btnCancel.textContent = 'CANCELAR';
    btnCancel.style.cssText = 'padding:0.8rem 1.5rem;background:#333;color:#fff;border:2px solid #666;border-radius:8px;cursor:pointer;font-size:0.9rem';
    btnCancel.onclick = () => {
        document.body.removeChild(overlay);
    };
    
    const btnConfirm = document.createElement('button');
    btnConfirm.textContent = 'ACEPTAR';
    btnConfirm.style.cssText = 'padding:0.8rem 1.5rem;background:#00F5FF;color:#000;border:none;border-radius:8px;cursor:pointer;font-weight:bold;font-size:0.9rem';
    btnConfirm.onclick = () => {
        document.body.removeChild(overlay);
        onConfirm();
    };
    
    btnContainer.appendChild(btnCancel);
    btnContainer.appendChild(btnConfirm);
    dialog.appendChild(text);
    dialog.appendChild(btnContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
};
