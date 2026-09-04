 "use strict";


const VEDAS_EDITOR = {

    editor: null,

    textarea: null,

    language: null

};


/* =========================================================
   MODE MAP
========================================================= */

function getCodeMirrorMode(language) {

    switch (language) {

        case "python":
            return "python";

        case "c":
            return "text/x-csrc";

        case "cpp":
            return "text/x-c++src";

        case "java":
            return "text/x-java";

        case "javascript":
            return "javascript";

        case "web":
            return "htmlmixed";

        default:
            return "python";
    }

}


/* =========================================================
   UPDATE MODE
========================================================= */

function updateCodeMirrorMode() {

    if (!VEDAS_EDITOR.editor) {
        return;
    }

    const language =
        VEDAS_EDITOR.language
            ? VEDAS_EDITOR.language.value
            : "python";


    VEDAS_EDITOR.editor.setOption(
        "mode",
        getCodeMirrorMode(language)
    );


    VEDAS_EDITOR.editor.setOption(
        "lineWrapping",
        language === "web"
    );


    VEDAS_EDITOR.editor.refresh();

}


/* =========================================================
   UPDATE THEME
========================================================= */

function updateCodeMirrorTheme() {

    if (!VEDAS_EDITOR.editor) {
        return;
    }

    const dark =
        document.body.classList.contains("dark");


    VEDAS_EDITOR.editor.setOption(
        "theme",
        dark
            ? "material-darker"
            : "default"
    );


    VEDAS_EDITOR.editor.refresh();

}


/* =========================================================
   SYNCHRONIZE EDITOR → TEXTAREA
========================================================= */

function syncEditorToTextarea() {

    if (!VEDAS_EDITOR.editor) {
        return;
    }

    VEDAS_EDITOR.editor.save();

}


/* =========================================================
   SYNCHRONIZE TEXTAREA → EDITOR
========================================================= */

function syncTextareaToEditor() {

    if (
        !VEDAS_EDITOR.editor ||
        !VEDAS_EDITOR.textarea
    ) {
        return;
    }

    const textareaValue =
        VEDAS_EDITOR.textarea.value;

    const editorValue =
        VEDAS_EDITOR.editor.getValue();


    if (textareaValue !== editorValue) {

        VEDAS_EDITOR.editor.setValue(
            textareaValue
        );

    }

}


/* =========================================================
   INITIALIZE CODEMIRROR
========================================================= */

function initializeCodeMirror() {

    VEDAS_EDITOR.textarea =
        document.getElementById("code");

    VEDAS_EDITOR.language =
        document.getElementById("language");


    if (!VEDAS_EDITOR.textarea) {

        console.error(
            "VEDAS Editor: #code not found."
        );

        return;
    }


    if (
        typeof CodeMirror === "undefined"
    ) {

        console.error(
            "VEDAS Editor: CodeMirror unavailable."
        );

        return;
    }


    if (VEDAS_EDITOR.editor) {
        return;
    }


    VEDAS_EDITOR.editor =
        CodeMirror.fromTextArea(
            VEDAS_EDITOR.textarea,
            {

                mode:
                    getCodeMirrorMode(
                        VEDAS_EDITOR.language
                            ? VEDAS_EDITOR.language.value
                            : "python"
                    ),

                theme:
                    document.body.classList.contains("dark")
                        ? "material-darker"
                        : "default",

                lineNumbers: true,

                lineWrapping: false,

                indentUnit: 4,

                tabSize: 4,

                indentWithTabs: false,

                autofocus: true,

                matchBrackets: true,

                autoCloseBrackets: true,

                styleActiveLine: true,

                viewportMargin: Infinity,

                extraKeys: {

                    "Tab": function(cm) {

                        cm.replaceSelection(
                            "    ",
                            "end"
                        );

                    }

                }

            }
        );


    VEDAS_EDITOR.editor.on(
        "change",
        function() {

            syncEditorToTextarea();

        }
    );


    updateCodeMirrorMode();

    syncEditorToTextarea();


    console.log(
        "VEDAS CodeMirror Engine v6.1 ready."
    );

}


/* =========================================================
   LANGUAGE CHANGE
========================================================= */

function handleEditorLanguageChange() {

    updateCodeMirrorMode();

}


/* =========================================================
   THEME OBSERVER
========================================================= */

function observeEditorTheme() {

    const observer =
        new MutationObserver(
            function(mutations) {

                for (
                    const mutation
                    of mutations
                ) {

                    if (
                        mutation.type === "attributes" &&
                        mutation.attributeName === "class"
                    ) {

                        updateCodeMirrorTheme();

                    }

                }

            }
        );


    observer.observe(
        document.body,
        {
            attributes: true,
            attributeFilter: ["class"]
        }
    );

}


/* =========================================================
   PUBLIC EDITOR API
     
   ONLY CodeMirror operations belong here.
========================================================= */

window.VEDASEditor = {

    getEditor: function() {

        return VEDAS_EDITOR.editor;

    },


    getCode: function() {

        if (VEDAS_EDITOR.editor) {

            return VEDAS_EDITOR.editor.getValue();

        }


        if (VEDAS_EDITOR.textarea) {

            return VEDAS_EDITOR.textarea.value;

        }


        return "";

    },


    setCode: function(value) {

        const code =
            String(value ?? "");


        if (VEDAS_EDITOR.editor) {

            VEDAS_EDITOR.editor.setValue(
                code
            );

            syncEditorToTextarea();

            return;

        }


        if (VEDAS_EDITOR.textarea) {

            VEDAS_EDITOR.textarea.value =
                code;

        }

    },


    clear: function() {

        this.setCode("");

    },


    save: function() {

        syncEditorToTextarea();

    },


    refresh: function() {

        if (VEDAS_EDITOR.editor) {

            VEDAS_EDITOR.editor.refresh();

        }

    },


    updateMode: function() {

        updateCodeMirrorMode();

    }

};


/* =========================================================
   START
========================================================= */

function initializeVEDASEditor() {

    initializeCodeMirror();

    observeEditorTheme();


    if (VEDAS_EDITOR.language) {

        VEDAS_EDITOR.language.addEventListener(
            "change",
            handleEditorLanguageChange
        );

    }


    setTimeout(
        function() {

            syncTextareaToEditor();

            updateCodeMirrorMode();

        },
        0
    );

}


if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeVEDASEditor,
        {
            once: true
        }
    );

}

else {

    initializeVEDASEditor();

}

