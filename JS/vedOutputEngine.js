/* =========================================================
   VED OUTPUT ENGINE - CHAT & SIDEBAR ROUTING ONLY
========================================================= */
"use strict";

console.log("vedOutputEngine.js: VED Output Router Engine Loaded.");

const VedOutputEngine = (() => {

    const appendMessageToChatWindow = (roleLabel, messageContentText) => {
        const chatContainerBox = document.getElementById("ved-chat");
        if (!chatContainerBox) return;

        const rowWrapper = document.createElement("div");
        rowWrapper.style.marginBottom = "12px";
        rowWrapper.style.borderBottom = "1px solid #1a1a1a";
        rowWrapper.style.paddingBottom = "6px";

        const labelBadge = document.createElement("strong");
        labelBadge.style.color = roleLabel === "YOU" ? "#007bff" : "#55d187";
        labelBadge.textContent = `${roleLabel}: `;

        const textBody = document.createElement("span");
        textBody.style.color = "#dfdfdf";
        textBody.textContent = messageContentText;

        rowWrapper.appendChild(labelBadge);
        rowWrapper.appendChild(textBody);
        chatContainerBox.appendChild(rowWrapper);
        
        chatContainerBox.scrollTop = chatContainerBox.scrollHeight;
    };

    const triggerAIQueryRequest = async () => {
        const context = VedInputEngine.collect();
        const verification = VedInputEngine.validate(context);

        if (!verification.isValid) {
            appendMessageToChatWindow("SYSTEM", verification.errorMessage);
            return;
        }

        const askButtonNode = document.getElementById("ved-ask-btn");
        const sidebarCodePreviewTextarea = document.getElementById("AI_code");

        if (askButtonNode) {
            askButtonNode.disabled = true;
            askButtonNode.innerText = "THINKING...";
        }

        appendMessageToChatWindow("YOU", context.userQuestion);

        // Fetch AI Response
        const queryResponsePayload = await VedAIEngine.ask(context);

        // Explanations go cleanly to chat logs
        if (queryResponsePayload.explanation) {
            appendMessageToChatWindow("VED AI", queryResponsePayload.explanation);
        }

        // Code streams cleanly to the isolated sidebar code box textarea
        if (sidebarCodePreviewTextarea) {
            if (queryResponsePayload.code) {
                sidebarCodePreviewTextarea.value = queryResponsePayload.code;
            } else {
                sidebarCodePreviewTextarea.value = "// No script generations extracted from payload.";
            }
        }

        // Restore control element defaults
        if (askButtonNode) {
            askButtonNode.disabled = false;
            askButtonNode.innerText = "ASK AI";
        }
        
        const questionInputBox = document.getElementById("ved-question");
        if (questionInputBox) questionInputBox.value = "";
    };

    const registerEngineListeners = () => {
        const askButtonNode = document.getElementById("ved-ask-btn");
        if (askButtonNode) askButtonNode.addEventListener("click", triggerAIQueryRequest);
    };

    return { initialize: registerEngineListeners };
})();

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", VedOutputEngine.initialize);
} else {
    VedOutputEngine.initialize();
}
