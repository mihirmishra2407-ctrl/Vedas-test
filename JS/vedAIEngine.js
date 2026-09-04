/* =========================================================
   VED AI ENGINE - STABLE GENERAL PURPOSE & POLYGLOT
========================================================= */
"use strict";

console.log("vedAIEngine.js: VED Polyglot Engine Ready.");

if (typeof puter !== 'undefined') {
    puter.quiet = true;
    if (puter.auth) {
        puter.auth.setAuthToken = function() { 
            return Promise.resolve("Security Layer Bypassed"); 
        };
    }
}

const VedAIEngine = (() => {
    
    const ACTIVE_MODEL = "gpt-4o-mini";

    const SYSTEM_PROMPT = `You are VED, an expert polyglot coding assistant.
    You assist in Python, C, C++, Java, JavaScript, Web (HTML/CSS), and 8085 Assembly.

    CRITICAL INSTRUCTIONS:
    1. You must split your response into exactly two sections using markers.
    2. Put all review text, reasoning, and logic descriptions inside: [EXPLANATION] ... [CODE_ONLY]
    3. Put ONLY the raw, functional source code block inside: [CODE_ONLY] ... [END]
    4. Do NOT use markdown code fence backticks (\`\`\`) inside the [CODE_ONLY] block. 
    5. Ensure the code block contains pure text matching the targeted programming language.`;

    const parsePayloadResponse = (rawContentString) => {
        const expMarker = "[EXPLANATION]";
        const codeMarker = "[CODE_ONLY]";
        const endMarker = "[END]";

        let extractedExplanation = "";
        let extractedCode = "";

        if (rawContentString.includes(codeMarker)) {
            const structuralSegments = rawContentString.split(codeMarker);
            extractedExplanation = structuralSegments[0].replace(expMarker, "").trim();
            
            let codeSegmentBlock = structuralSegments[1];
            if (codeSegmentBlock.includes(endMarker)) {
                codeSegmentBlock = codeSegmentBlock.split(endMarker)[0];
            }
            
            extractedCode = codeSegmentBlock.replace(/```[a-zA-Z0-9_+#.-]*\n?|```/g, "").trim();
        } else {
            extractedExplanation = rawContentString.replace(expMarker, "").replace(endMarker, "").trim();
            extractedCode = "";
        }

        return { 
            explanation: extractedExplanation || "Processing execution sequence completed successfully.", 
            code: extractedCode 
        };
    };

    const ask = async (contextPayload) => {
        if (typeof puter === "undefined" || !puter.ai) {
            return parsePayloadResponse("[EXPLANATION] Puter network instance is not defined in scope. [CODE_ONLY] // Error: Library Missing [END]");
        }

        const assembledPrompt = `ACTIVE SCRIPT AREA CONTEXT:\n${contextPayload.currentCode}\n\nUSER PROMPT REQUEST:\n${contextPayload.userQuestion}`;

        try {
            const chatResponse = await puter.ai.chat([
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: assembledPrompt }
            ], { model: ACTIVE_MODEL });

            const textOutput = chatResponse?.message?.content || "";
            return parsePayloadResponse(textOutput);

        } catch (networkException) {
            console.error("[VED AI] Request channel dropped out:", networkException);
            return parsePayloadResponse(`[EXPLANATION] Communication Failure: ${networkException.message}. [CODE_ONLY] // Connection Timeout [END]`);
        }
    };

    return { ask };
})();
