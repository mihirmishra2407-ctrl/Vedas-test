// ============================================================================
// COMPONENT 1: TAB INTERACTION ENGINE (shortCutEngine.js)
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
    // Collect sidebar navigational links
    const sideTreeButtons = document.querySelectorAll('.tree:nth-of-type(1) button');
    
    if (sideTreeButtons.length >= 3) {
        sideTreeButtons.forEach((btn, index) => {
            btn.onclick = (e) => {
                e.preventDefault();
                
                // Toggle active style selections
                sideTreeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                let editorFrame = document.querySelector('.editor');
                let existingViewOverlay = document.getElementById('engineUIOverlay');
                if (existingViewOverlay) existingViewOverlay.remove();
                
                if (index === 0) {
                    // Clicked main.asm -> Reveal code text area canvas block
                    editorFrame.style.display = "grid";
                } else if (index === 1) {
                    // Clicked memory map -> Load live tracking memory map overlay
                    editorFrame.style.display = "none";
                    let overlay = document.createElement('div');
                    overlay.id = 'engineUIOverlay';
                    overlay.style.cssText = "grid-row:2; background:#020202; overflow-y:auto; padding:20px; height:100%; box-sizing:border-box; border-right:1px solid var(--line);";
                    overlay.innerHTML = runMemoryMapCalculation();
                    editorFrame.parentNode.insertBefore(overlay, editorFrame.nextSibling);
                } else if (index === 2) {
                    // Clicked I/O ports -> Load active peripheral port data grid screen
                    editorFrame.style.display = "none";
                    let overlay = document.createElement('div');
                    overlay.id = 'engineUIOverlay';
                    overlay.style.cssText = "grid-row:2; background:#020202; overflow-y:auto; padding:20px; height:100%; box-sizing:border-box; border-right:1px solid var(--line);";
                    overlay.innerHTML = renderHardwareIOPanel();
                    editorFrame.parentNode.insertBefore(overlay, editorFrame.nextSibling);
                }
            };
        });
    }

    // Connect Global Hardware Keyboard Trigger Event Listeners
    window.addEventListener('keydown', (e) => {
        if (['F8', 'F9'].includes(e.key)) e.preventDefault();
        if (e.key === 'F9') document.getElementById('run')?.click();
        if (e.key === 'F8') document.getElementById('step')?.click();
        if (e.key === 'Escape') document.getElementById('stop')?.click();
        if (e.ctrlKey && e.key.toLowerCase() === 'r') {
            e.preventDefault();
            document.getElementById('reset')?.click();
        }
    });
});

// Interactive Workspace Keyboard Shortcut Info Dialog Module
document.getElementById('shortcuts').onclick = (e) => {
    e.preventDefault();
    let modalHTML = `
        <div style="font-family:monospace; font-size:12px; line-height:2; color:#ccc; padding:5px 0;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #222; padding:4px 0;"><span>▶ Run Flow Sequence</span><b style="color:var(--cyan);">[F9]</b></div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #222; padding:4px 0;"><span>▷ Single Line Instruction Step</span><b style="color:var(--cyan);">[F8]</b></div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #222; padding:4px 0;"><span>↻ Reset Computational Registry Nodes</span><b style="color:var(--cyan);">[Ctrl + R]</b></div>
            <div style="display:flex; justify-content:space-between; padding:4px 0;"><span>■ Terminate System Clock Loop (Stop)</span><b style="color:var(--red);">[ESC]</b></div>
        </div>
    `;
    if (typeof openModal === 'function') openModal('IDE Hardware Operation Keyboard Shortcuts', modalHTML);
    else alert("F9: Run | F8: Step | Ctrl+R: Reset | ESC: Stop");
};
