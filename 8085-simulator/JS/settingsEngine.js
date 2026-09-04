// ============================================================================
// COMPONENT 4: ⚙ ADJUSTABLE CLOCK LOOP DELAY SCHEDULER (settingsEngine.js)
// ============================================================================
let microProcessorClockDelay = 0; 

document.getElementById('settings').onclick = (e) => {
    e.preventDefault();
    let configHTML = `
        <div style="font-family:monospace; color:#eee; font-size:12px; padding:4px 0;">
            <label style="display:block; margin-bottom:8px; color:var(--cyan); font-weight:bold; letter-spacing:0.5px;">SIMULATED CLOCK FREQUENCY DELAY</label>
            <div style="display:flex; align-items:center; gap:14px; margin-bottom:10px;">
                <input type="range" id="clockThrottlerBar" min="0" max="1000" step="100" value="${microProcessorClockDelay}" style="flex:1; accent-color:var(--cyan); cursor:pointer; height:4px;">
                <span id="delayLabelMonitor" style="color:var(--lime); font-weight:bold; width:60px; text-align:right;">${microProcessorClockDelay} ms</span>
            </div>
            <small style="color:var(--muted); display:block; line-height:1.4;">Injects an explicit hardware wait delay between step ticks. Slows down execution cycles so you can watch registry state tables transition line-by-line visually.</small>
        </div>
    `;
    if (typeof openModal === 'function') {
        openModal('Workbench Simulator Parameter Dashboard', configHTML);
        
        document.getElementById('clockThrottlerBar').oninput = (ev) => {
            microProcessorClockDelay = parseInt(ev.target.value);
            document.getElementById('delayLabelMonitor').textContent = microProcessorClockDelay + " ms";
        };
    }
};

document.addEventListener("DOMContentLoaded", () => {
    let runElement = document.getElementById('run');
    if (runElement && typeof step === 'function') {
        let baseRunLogic = runElement.onclick;
        
        runElement.onclick = async function() {
            // Overwrite run execution processing only if a slow clock delay slider parameter is active
            if (microProcessorClockDelay > 0) {
                let safetyCounterLimit = 0;
                if(document.getElementById('error')) document.getElementById('error').textContent = '';
                
                while (!halted && safetyCounterLimit++ < 10000) {
                    step();
                    // Force temporary background event loops to tick
                    await new Promise(done => setTimeout(done, microProcessorClockDelay));
                }
                if (safetyCounterLimit >= 10000 && document.getElementById('error')) {
                    document.getElementById('error').textContent = 'Execution safety limit reached — possible infinite loop.';
                }
            } else {
                if (baseRunLogic) baseRunLogic.apply(this, arguments);
            }
        };
    }
});
