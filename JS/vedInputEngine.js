/* =========================================================
   VED INPUT ENGINE - CODE CANVAS EXTRACTOR
========================================================= */
"use strict";

console.log("vedInputEngine.js: VED Input Selector Engine Loaded.");

const VedInputEngine = (() => {
    
    const collect = () => {
        const leftWorkspaceTextarea = document.getElementById("code");
        const userPromptQuestionBox = document.getElementById("ved-question");

        return {
            currentCode: leftWorkspaceTextarea ? leftWorkspaceTextarea.value : "",
            userQuestion: userPromptQuestionBox ? userPromptQuestionBox.value.trim() : ""
        };
    };

    const validate = (contextData) => {
        if (!contextData.userQuestion) {
            return { isValid: false, errorMessage: "Please type your instruction query string into the input area first." };
        }
        return { isValid: true, errorMessage: null };
    };

    return { collect, validate };
})();
