// ============================================================================
// VEDAS 8085 - INSTRUCTION SET MANUAL REFERENCE MODULE (instructionReferenceEngine.js)
// ============================================================================

const OP_REFERENCE_DATA = {
    "MVI": { size: "2 Bytes", flags: "None", details: "Move Immediate 8-bit data into a target register or memory location." },
    "MOV": { size: "1 Byte",  flags: "None", details: "Copy data bytes directly from a source register location to a destination register." },
    "LXI": { size: "3 Bytes", flags: "None", details: "Load an immediate 16-bit double-byte data word straight into a targeted Register Pair." },
    "ADD": { size: "1 Byte",  flags: "All",  details: "Add register or memory contents to Accumulator. Modifies arithmetic flags." },
    "SUB": { size: "1 Byte",  flags: "All",  details: "Subtract register or memory data from Accumulator. Modifies arithmetic flags." },
    "STA": { size: "3 Bytes", flags: "None", details: "Store Accumulator contents directly to a designated 16-bit absolute memory location." },
    "LDA": { size: "3 Bytes", flags: "None", details: "Load Accumulator directly with an 8-bit data byte read from a specific 16-bit address." },
    "PUSH": { size: "1 Byte", flags: "None", details: "Push 16-bit data from register pair onto stack memory. Decrements Stack Pointer by 2." },
    "POP": { size: "1 Byte",  flags: "PSW",  details: "Pop top 16-bit contents from stack back into register pair. Increments Stack Pointer by 2." },
    "CALL": { size: "3 Bytes", flags: "None", details: "Unconditional Subroutine Branch. Pushes current PC to stack and jumps." },
    "RET": { size: "1 Byte",  flags: "None", details: "Return from Subroutine. Pops saved execution pointer from stack back into PC." },
    "HLT": { size: "1 Byte",  flags: "None", details: "Halt CPU execution clock. Freezes cycle timers and stops all operations clean." }
};

function displayStandaloneModal(title, embeddedHTML) {
    let overlay = document.getElementById('engineModalOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'engineModalOverlay';
        overlay.style.cssText = "position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 99999; backdrop-filter: blur(4px); font-family: sans-serif;";
        document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
        <div style="background: #0a0a0a; border: 1px solid #333; border-radius: 6px; width: min(520px, 90vw); padding: 22px; box-shadow: 0 20px 80px rgba(0,0,0,1);">
            <h2 style="margin: 0 0 16px; color: #4cc9f0; font-size: 16px; font-family: monospace; text-transform: uppercase;">${title}</h2>
            <div style="color: #aaa; font-size: 13px;">${embeddedHTML}</div>
            <button id="closeEngineModalBtn" style="margin-top: 16px; background: #111; border: 1px solid #333; color: #e5e5e5; border-radius: 4px; padding: 8px 12px; cursor: pointer; font-size: 11px;">Close Reference</button>
        </div>
    `;
    overlay.style.display = 'flex';
    document.getElementById('closeEngineModalBtn').onclick = () => overlay.style.display = 'none';
}

document.addEventListener("DOMContentLoaded", () => {
    let refBtn = document.getElementById('ref');
    if (refBtn) {
        refBtn.onclick = (e) => {
            e.preventDefault();
            let rows = Object.entries(OP_REFERENCE_DATA).map(([op, data]) => `
                <tr style="border-bottom: 1px solid #1a1a1a; font-family: monospace; font-size: 12px;">
                    <td style="padding: 8px 4px; color: #4cc9f0; font-weight: bold;">${op}</td>
                    <td style="padding: 8px 4px; color: #ff9f43;">${data.size}</td>
                    <td style="padding: 8px 4px; color: #a9e34b;">${data.flags}</td>
                    <td style="padding: 8px 4px; color: #aaa; font-size: 11px; line-height: 1.4;">${data.details}</td>
                </tr>
            `).join('');

            let tableHTML = `
                <div style="max-height: 300px; overflow-y: auto; border: 1px solid #222; background: #050505;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="background: #0f0f0f; color: #888; font-size: 11px; border-bottom: 1px solid #222;">
                            <tr><th style="padding: 6px;">MNEMONIC</th><th style="padding: 6px;">SIZE</th><th style="padding: 6px;">FLAGS</th><th style="padding: 6px;">OPERATION SUMMARY</th></tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            `;
            displayStandaloneModal("8085 ISA Instruction Set Manual", tableHTML);
        };
    }
});
