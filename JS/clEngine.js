"use strict";

/*
============================================================
VEDAS CODE LAB
UNIFIED CL ENGINE v7.1
============================================================

RESPONSIBILITY
------------------------------------------------------------
CLEngine owns:

✓ Complete VEDAS UI
✓ Buttons
✓ Theme
✓ Saved theme
✓ Code / I/O / Site views
✓ Sidebar
✓ Menus
✓ Language selector
✓ Status
✓ Panel status
✓ Terminal
✓ Program input
✓ Run
✓ Stop
✓ Clear
✓ Judge0 execution
✓ Python
✓ C
✓ C++
✓ Java
✓ JavaScript
✓ HTML + CSS + JavaScript
✓ Dynamic welcome message
✓ Example programs
✓ Keyboard shortcuts


EDITOR RESPONSIBILITY
------------------------------------------------------------
VEDASEditor owns CodeMirror.

CLEngine communicates with it ONLY through:

    VEDASEditor.getCode()
    VEDASEditor.setCode()
    VEDASEditor.clear()
    VEDASEditor.refresh()


THIS FILE DOES NOT:

✗ Initialize CodeMirror
✗ Import CodeMirror
✗ Configure CodeMirror
✗ Change CodeMirror mode
✗ Access CodeMirror directly
✗ eval()
✗ Function()


EXECUTION
------------------------------------------------------------
Judge0 CE

https://ce.judge0.com/submissions/

============================================================
*/


/* ============================================================
   CONFIGURATION
============================================================ */

const CL_CONFIG = {

    judge0:
        "https://ce.judge0.com/submissions/",

    timeout:
        40000,

    pollingDelay:
        1000,

    maxPollingAttempts:
        40

};


/* ============================================================
   LANGUAGE DATABASE
============================================================ */

const CL_LANGUAGES = {

    python: {

        id: 71,

        name:
            "Python 3"

    },

    c: {

        id: 50,

        name:
            "C"

    },

    cpp: {

        id: 54,

        name:
            "C++"

    },

    java: {

        id: 62,

        name:
            "Java"

    },

    javascript: {

        id: 63,

        name:
            "JavaScript"

    },

    web: {

        id: null,

        name:
            "HTML + CSS + JS"

    }

};


/* ============================================================
   EXAMPLE PROGRAMS
============================================================ */

const CL_EXAMPLES = {

    python:
`print("Curiosity wants have the way, welcome to Python 3 by VEDAS - CODE LAB.")`,


    c:
`#include <stdio.h>

int main()
{
    printf("Curiosity wants have the way, welcome to C by VEDAS - CODE LAB.");

    return 0;
}`,


    cpp:
`#include <iostream>

int main()
{
    std::cout
        << "Curiosity wants have the way, welcome to C++ by VEDAS - CODE LAB.";

    return 0;
}`,


    java:
`public class Main
{
    public static void main(String[] args)
    {
        System.out.println(
            "Curiosity wants have the way, welcome to Java by VEDAS - CODE LAB."
        );
    }
}`,


    javascript:
`console.log(
    "Curiosity wants have the way, welcome to JavaScript by VEDAS - CODE LAB."
);`,


    web:
`<!DOCTYPE html>

<html>

<head>

<style>

body
{
    font-family: Arial, sans-serif;
    text-align: center;
    padding: 40px;
}

h1
{
    color: #19486E;
}

button
{
    padding: 10px 20px;
    cursor: pointer;
}

</style>

</head>

<body>

<h1>Welcome to VEDAS Web Editor!</h1>

<p>
HTML + CSS + JavaScript are working together.
</p>

<button onclick="hello()">
CLICK ME
</button>

<script>

function hello()
{
    alert("Hello from VEDAS!");
}

</script>

</body>

</html>`


};


/* ============================================================
   CLEngine
============================================================ */

const CLEngine = {


    /* ========================================================
       STATE
    ======================================================== */

    state: {

        running:
            false,

        currentView:
            "code",

        currentLanguage:
            "python",

        darkMode:
            false,

        abortController:
            null

    },


    /* ========================================================
       DOM
    ======================================================== */

    elements: {},


    /* ========================================================
       INITIALIZATION
    ======================================================== */

    init: function()
    {

        this.cacheElements();

        this.initializeState();

        this.bindButtons();

        this.bindLanguage();

        this.bindKeyboard();

        this.loadInitialExample();

        this.updatePanelStatus();

        this.updateView();

        this.setStatus(
            "READY"
        );

        console.log(
            "VEDAS CLEngine v7.1 ready."
        );

    },


    /* ========================================================
       CACHE DOM
    ======================================================== */

    cacheElements: function()
    {

        this.elements = {

            themeButton:
                document.getElementById(
                    "themeButton"
                ),

            clearButton:
                document.getElementById(
                    "clearButton"
                ),

            runButton:
                document.getElementById(
                    "runButton"
                ),

            siteButton:
                document.getElementById(
                    "siteButton"
                ),

            codeButton:
                document.getElementById(
                    "codeButton"
                ),

            ioButton:
                document.getElementById(
                    "ioButton"
                ),

            language:
                document.getElementById(
                    "language"
                ),

            coding:
                document.getElementById(
                    "coding"
                ),

            io:
                document.getElementById(
                    "io"
                ),

            webPreviewArea:
                document.getElementById(
                    "webPreviewArea"
                ),

            webPreview:
                document.getElementById(
                    "webPreview"
                ),

            status:
                document.getElementById(
                    "status"
                ),

            panelStatus:
                document.getElementById(
                    "panelStatus"
                ),

            programInput:
                document.getElementById(
                    "programInput"
                ),

            terminalOutput:
                document.getElementById(
                    "terminalOutput"
                ),

            sideSite:
                document.getElementById(
                    "sideSite"
                ),

            sideItems:
                document.querySelectorAll(
                    ".sideItem"
                ),

            menuItems:
                document.querySelectorAll(
                    ".menuItem"
                )

        };

    },


    /* ========================================================
       INITIAL STATE
    ======================================================== */

    initializeState: function()
    {

        if (
            this.elements.language
        )
        {

            this.state.currentLanguage =
                this.elements.language.value ||
                "python";

        }


        this.state.darkMode =
            document.body.classList.contains(
                "dark"
            );


        this.updateThemeButton();

    },


    /* ========================================================
       BUTTONS
    ======================================================== */

    bindButtons: function()
    {

        if (
            this.elements.themeButton
        )
        {

            this.elements.themeButton
                .addEventListener(
                    "click",
                    () =>
                        this.toggleTheme()
                );

        }


        if (
            this.elements.clearButton
        )
        {

            this.elements.clearButton
                .addEventListener(
                    "click",
                    () =>
                        this.clear()
                );

        }


        if (
            this.elements.runButton
        )
        {

            this.elements.runButton
                .addEventListener(
                    "click",
                    () =>
                        this.run()
                );

        }


        if (
            this.elements.siteButton
        )
        {

            this.elements.siteButton
                .addEventListener(
                    "click",
                    () =>
                        this.showSite()
                );

        }


        if (
            this.elements.codeButton
        )
        {

            this.elements.codeButton
                .addEventListener(
                    "click",
                    () =>
                        this.showCode()
                );

        }


        if (
            this.elements.ioButton
        )
        {

            this.elements.ioButton
                .addEventListener(
                    "click",
                    () =>
                        this.showIO()
                );

        }


        if (
            this.elements.sideSite
        )
        {

            this.elements.sideSite
                .addEventListener(
                    "click",
                    () =>
                        this.showSite()
                );

        }


        this.elements.sideItems
            .forEach(
                item =>
                {

                    item.addEventListener(
                        "click",
                        () =>
                            this.handleSidebar(
                                item
                            )
                    );

                }
            );


        this.elements.menuItems
            .forEach(
                item =>
                {

                    item.addEventListener(
                        "click",
                        () =>
                            this.handleMenu(
                                item
                            )
                    );

                }
            );

    },


    /* ========================================================
       LANGUAGE
    ======================================================== */

    bindLanguage: function()
    {

        if (
            !this.elements.language
        )
        {
            return;
        }


        this.elements.language
            .addEventListener(
                "change",
                () =>
                {

                    this.state.currentLanguage =
                        this.elements.language.value ||
                        "python";


                    this.updatePanelStatus();

                    this.loadLanguageExample();

                    this.setStatus(
                        "READY"
                    );

                }
            );

    },


    /* ========================================================
       KEYBOARD
    ======================================================== */

    bindKeyboard: function()
    {

        document.addEventListener(
            "keydown",
            event =>
            {

                if (
                    event.ctrlKey &&
                    event.key === "Enter"
                )
                {

                    event.preventDefault();

                    this.run();

                }


                if (
                    event.key === "Escape" &&
                    this.state.running
                )
                {

                    this.stop();

                }

            }
        );

    },


    /* ========================================================
       SIDEBAR
    ======================================================== */

    handleSidebar: function(item)
    {

        const side =
            item.dataset.side;


        this.elements.sideItems
            .forEach(
                element =>
                    element.classList.remove(
                        "active"
                    )
            );


        item.classList.add(
            "active"
        );


        switch (side)
        {

            case "code":

                this.showCode();

                break;


            case "project":

                this.setStatus(
                    "PROJECT"
                );

                break;


            case "files":

                this.setStatus(
                    "FILES"
                );

                break;


            case "settings":

                this.setStatus(
                    "SETTINGS"
                );

                break;

        }

    },


    /* ========================================================
       MENUS
    ======================================================== */

    handleMenu: function(item)
    {

        const menu =
            item.dataset.menu;


        const messages = {

            file:
                "FILE",

            edit:
                "EDIT",

            view:
                "VIEW",

            run:
                "RUN",

            tools:
                "TOOLS",

            help:
                "HELP"

        };


        this.setStatus(
            messages[menu] ||
            "READY"
        );

    },


    /* ========================================================
       THEME
    ======================================================== */

    toggleTheme: function()
    {

        this.state.darkMode =
            !this.state.darkMode;


        document.body.classList.toggle(
            "dark",
            this.state.darkMode
        );


        try
        {

            localStorage.setItem(
                "vedas-theme",
                this.state.darkMode
                    ? "dark"
                    : "light"
            );

        }
        catch(error)
        {

            console.warn(
                "VEDAS theme storage unavailable."
            );

        }


        this.updateThemeButton();


        this.refreshEditor();


        this.setStatus(
            this.state.darkMode
                ? "DARK MODE"
                : "LIGHT MODE"
        );

    },


    /* ========================================================
       LOAD SAVED THEME
    ======================================================== */

    loadSavedTheme: function()
    {

        try
        {

            const saved =
                localStorage.getItem(
                    "vedas-theme"
                );


            if (
                saved === "dark"
            )
            {

                this.state.darkMode =
                    true;

                document.body.classList.add(
                    "dark"
                );

            }

            else if (
                saved === "light"
            )
            {

                this.state.darkMode =
                    false;

                document.body.classList.remove(
                    "dark"
                );

            }

        }
        catch(error)
        {

            console.warn(
                "VEDAS saved theme unavailable."
            );

        }


        this.updateThemeButton();

    },


    /* ========================================================
       THEME BUTTON
    ======================================================== */

    updateThemeButton: function()
    {

        const button =
            this.elements.themeButton;


        if (!button)
        {
            return;
        }


        if (
            this.state.darkMode
        )
        {

            button.textContent =
                "☾";

            button.title =
                "Switch to light theme";

        }

        else
        {

            button.textContent =
                "☀";

            button.title =
                "Switch to dark theme";

        }

    },


    /* ========================================================
       LANGUAGE
    ======================================================== */

    getLanguage: function()
    {

        if (
            !this.elements.language
        )
        {

            return "python";

        }


        return (
            this.elements.language.value ||
            "python"
        );

    },


    getLanguageName: function(language)
    {

        const info =
            CL_LANGUAGES[language];


        return info
            ? info.name
            : language;

    },


    /* ========================================================
       WELCOME MESSAGE
    ======================================================== */

    getWelcomeMessage: function(language)
    {

        return (
            "Curiosity wants have the way, " +
            "welcome to " +
            this.getLanguageName(language) +
            " by VEDAS - CODE LAB."
        );

    },


    /* ========================================================
       GET CODE
       
       IMPORTANT:
       No CodeMirror access.
       Only VEDASEditor API.
    ======================================================== */

    getCode: function()
    {

        if (
            window.VEDASEditor &&
            typeof window.VEDASEditor.getCode ===
                "function"
        )
        {

            return String(
                window.VEDASEditor.getCode() ||
                ""
            );

        }


        throw new Error(
            "VEDASEditor is not available."
        );

    },


    /* ========================================================
       SET CODE
    ======================================================== */

    setCode: function(code)
    {

        if (
            !window.VEDASEditor ||
            typeof window.VEDASEditor.setCode !==
                "function"
        )
        {

            throw new Error(
                "VEDASEditor is not available."
            );

        }


        window.VEDASEditor.setCode(
            String(code ?? "")
        );

    },


    /* ========================================================
       GET INPUT
    ======================================================== */

    getInput: function()
    {

        if (
            !this.elements.programInput
        )
        {
            return "";
        }


        return String(
            this.elements.programInput.value ||
            ""
        );

    },


    /* ========================================================
       VALIDATION
    ======================================================== */

    validate: function(
        language,
        code
    )
    {

        if (
            !CL_LANGUAGES[language]
        )
        {

            throw new Error(
                "Unsupported language: " +
                language
            );

        }


        if (
            !String(code).trim()
        )
        {

            throw new Error(
                "Program is empty."
            );

        }

    },


    /* ========================================================
       LOAD INITIAL EXAMPLE
    ======================================================== */

    loadInitialExample: function()
    {

        const language =
            this.getLanguage();


        let code = "";


        try
        {

            code =
                this.getCode();

        }
        catch(error)
        {

            console.warn(
                error.message
            );

            return;

        }


        if (
            code.trim()
        )
        {
            return;
        }


        if (
            CL_EXAMPLES[language]
        )
        {

            this.setCode(
                CL_EXAMPLES[language]
            );

        }

    },


    /* ========================================================
       LOAD LANGUAGE EXAMPLE
    ======================================================== */

    loadLanguageExample: function()
    {

        const language =
            this.getLanguage();


        let code = "";


        try
        {

            code =
                this.getCode();

        }
        catch(error)
        {

            console.warn(
                error.message
            );

            return;

        }


        /*
        Only insert an example when
        the editor is empty.
        */

        if (
            code.trim()
        )
        {
            return;
        }


        if (
            CL_EXAMPLES[language]
        )
        {

            this.setCode(
                CL_EXAMPLES[language]
            );

        }

    },


    /* ========================================================
       PANEL STATUS
    ======================================================== */

    updatePanelStatus: function()
    {

        if (
            !this.elements.panelStatus
        )
        {
            return;
        }


        const language =
            this.getLanguage();


        this.elements.panelStatus.textContent =
            this.getLanguageName(
                language
            );

    },


    /* ========================================================
       STATUS
    ======================================================== */

    setStatus: function(status)
    {

        if (
            this.elements.status
        )
        {

            this.elements.status.textContent =
                String(
                    status
                ).toUpperCase();

        }

    },


    /* ========================================================
       TERMINAL
    ======================================================== */

    writeTerminal: function(
        text,
        type = "normal"
    )
    {

        const terminal =
            this.elements.terminalOutput;


        if (!terminal)
        {
            return;
        }


        terminal.classList.remove(
            "output-success",
            "output-error",
            "output-warning"
        );


        if (
            type === "success"
        )
        {

            terminal.classList.add(
                "output-success"
            );

        }


        if (
            type === "error"
        )
        {

            terminal.classList.add(
                "output-error"
            );

        }


        if (
            type === "warning"
        )
        {

            terminal.classList.add(
                "output-warning"
            );

        }


        terminal.textContent =
            String(
                text ?? ""
            );

    },


    /* ========================================================
       TERMINAL HEADER
    ======================================================== */

    buildTerminalHeader: function(
        language
    )
    {

        return (
            "VEDAS CODE LAB v7.1\n" +
            "Language: " +
            this.getLanguageName(
                language
            ) +
            "\n\n"
        );

    },


    /* ========================================================
       CLEAR
    ======================================================== */

    clear: function()
    {

        if (
            window.VEDASEditor &&
            typeof window.VEDASEditor.clear ===
                "function"
        )
        {

            window.VEDASEditor.clear();

        }


        if (
            this.elements.programInput
        )
        {

            this.elements.programInput.value =
                "";

        }


        if (
            this.elements.webPreview
        )
        {

            this.elements.webPreview.srcdoc =
                "";

        }


        this.writeTerminal(
            "VEDAS CODE LAB v7.1\nReady."
        );


        this.setStatus(
            "CLEARED"
        );

    },


    /* ========================================================
       RUN
    ======================================================== */

    run: async function()
    {

        if (
            this.state.running
        )
        {
            return;
        }


        const language =
            this.getLanguage();


        let code;


        try
        {

            code =
                this.getCode();


            this.validate(
                language,
                code
            );

        }
        catch(error)
        {

            this.writeTerminal(
                error.message,
                "error"
            );


            this.setStatus(
                "ERROR"
            );


            return;

        }


        /*
        --------------------------------------------------------
        WEB
        --------------------------------------------------------
        */

        if (
            language === "web"
        )
        {

            this.runWeb(
                code
            );

            return;

        }


        /*
        --------------------------------------------------------
        JUDGE0
        --------------------------------------------------------
        */

        this.state.running =
            true;


        this.updateRunButton(
            true
        );


        this.showIO();


        this.writeTerminal(

            this.buildTerminalHeader(
                language
            ) +

            this.getWelcomeMessage(
                language
            ) +

            "\n\n" +

            "EXECUTING..."

        );


        this.setStatus(
            "SUBMITTING"
        );


        try
        {

            const result =
                await this.executeJudge0(
                    language,
                    code,
                    this.getInput()
                );


            this.displayResult(
                result,
                language
            );

        }
        catch(error)
        {

            if (
                error &&
                error.name ===
                    "AbortError"
            )
            {

                return;

            }


            this.writeTerminal(

                this.buildTerminalHeader(
                    language
                ) +

                this.getWelcomeMessage(
                    language
                ) +

                "\n\n" +

                "VEDAS EXECUTION ERROR\n" +
                "────────────────────────\n" +

                (
                    error &&
                    error.message
                        ? error.message
                        : String(error)
                ),

                "error"

            );


            this.setStatus(
                "EXECUTION ERROR"
            );


            console.error(
                "VEDAS CLEngine:",
                error
            );

        }
        finally
        {

            this.state.running =
                false;


            this.state.abortController =
                null;


            this.updateRunButton(
                false
            );

        }

    },


    /* ========================================================
       JUDGE0 EXECUTION
    ======================================================== */

    executeJudge0: async function(
        language,
        code,
        input
    )
    {

        const controller =
            new AbortController();


        this.state.abortController =
            controller;


        const timeout =
            setTimeout(
                () =>
                    controller.abort(),
                CL_CONFIG.timeout
            );


        try
        {

            let sourceCode =
                String(code);


            /*
            JavaScript gets a browser-like
            prompt() implementation.
            */

            if (
                language === "javascript"
            )
            {

                sourceCode =
                    this.prepareJavaScript(
                        sourceCode
                    );

            }


            const languageInfo =
                CL_LANGUAGES[
                    language
                ];


            if (
                !languageInfo ||
                languageInfo.id === null
            )
            {

                throw new Error(
                    "This language does not use Judge0."
                );

            }


            this.setStatus(
                "SUBMITTING"
            );


            /*
            ----------------------------------------------------
            POST SUBMISSION
            ----------------------------------------------------
            */

            const response =
                await fetch(

                    CL_CONFIG.judge0 +
                    "?base64_encoded=false&wait=false",

                    {

                        method:
                            "POST",

                        headers:
                        {
                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                            {

                                source_code:
                                    sourceCode,

                                language_id:
                                    languageInfo.id,

                                stdin:
                                    input

                            }),

                        signal:
                            controller.signal

                    }

                );


            if (
                !response.ok
            )
            {

                const text =
                    await response.text();


                throw new Error(

                    "Judge0 submission error: " +
                    response.status +

                    (
                        text
                            ? "\n" + text
                            : ""
                    )

                );

            }


            const submission =
                await response.json();


            if (
                !submission ||
                !submission.token
            )
            {

                throw new Error(
                    "Judge0 did not return a submission token."
                );

            }


            this.setStatus(
                "EXECUTING"
            );


            /*
            ----------------------------------------------------
            POLL
            ----------------------------------------------------
            */

            return await this.pollResult(

                submission.token,

                controller.signal

            );

        }
        finally
        {

            clearTimeout(
                timeout
            );

        }

    },


    /* ========================================================
       POLL JUDGE0
    ======================================================== */

    pollResult: async function(
        token,
        signal
    )
    {

        for (
            let attempt = 0;

            attempt <
            CL_CONFIG.maxPollingAttempts;

            attempt++
        )
        {

            const response =
                await fetch(

                    CL_CONFIG.judge0 +

                    encodeURIComponent(
                        token
                    ) +

                    "?base64_encoded=false",

                    {

                        method:
                            "GET",

                        headers:
                        {
                            "Accept":
                                "application/json"
                        },

                        signal:
                            signal

                    }

                );


            if (
                !response.ok
            )
            {

                const text =
                    await response.text();


                throw new Error(

                    "Judge0 result error: " +
                    response.status +

                    (
                        text
                            ? "\n" + text
                            : ""
                    )

                );

            }


            const result =
                await response.json();


            /*
            Judge0 statuses:

            1 = In Queue
            2 = Processing
            3+ = Finished
            */

            if (
                result.status &&
                Number(
                    result.status.id
                ) > 2
            )
            {

                return result;

            }


            await this.delay(
                CL_CONFIG.pollingDelay,
                signal
            );

        }


        throw new Error(
            "Judge0 execution timed out."
        );

    },


    /* ========================================================
       DELAY
    ======================================================== */

    delay: function(
        milliseconds,
        signal
    )
    {

        return new Promise(
            (resolve, reject) =>
            {

                if (
                    signal &&
                    signal.aborted
                )
                {

                    reject(
                        new DOMException(
                            "Aborted",
                            "AbortError"
                        )
                    );

                    return;

                }


                const timer =
                    setTimeout(
                        resolve,
                        milliseconds
                    );


                if (
                    signal
                )
                {

                    signal.addEventListener(
                        "abort",
                        function()
                        {

                            clearTimeout(
                                timer
                            );


                            reject(
                                new DOMException(
                                    "Aborted",
                                    "AbortError"
                                )
                            );

                        },
                        {
                            once:
                                true
                        }
                    );

                }

            }
        );

    },


    /* ========================================================
       JAVASCRIPT INPUT SUPPORT
    ======================================================== */

    prepareJavaScript: function(
        sourceCode
    )
    {

        const wrapper =

`const fs = require("fs");

const __vedasRawInput =
    fs.readFileSync(
        0,
        "utf8"
    );

const __vedasInput =
    __vedasRawInput.split(/\\r?\\n/);

let __vedasInputIndex = 0;

globalThis.prompt = function(message)
{
    const value =
        __vedasInputIndex <
        __vedasInput.length
            ? __vedasInput[
                __vedasInputIndex
            ]
            : "";

    __vedasInputIndex++;

    process.stdout.write(
        String(message || "") +
        String(value) +
        "\\n"
    );

    return value;
};

`;


        return (
            wrapper +
            "\n" +
            sourceCode
        );

    },


    /* ========================================================
       DISPLAY RESULT
    ======================================================== */

    displayResult: function(
        result,
        language
    )
    {

        const welcome =
            this.getWelcomeMessage(
                language
            );


        const stdout =
            String(
                result.stdout ||
                ""
            );


        const stderr =
            String(
                result.stderr ||
                ""
            );


        const compileOutput =
            String(
                result.compile_output ||
                ""
            );


        const message =
            String(
                result.message ||
                ""
            );


        let terminalText =

            this.buildTerminalHeader(
                language
            ) +

            welcome +

            "\n\n";


        /*
        --------------------------------------------------------
        STANDARD OUTPUT
        --------------------------------------------------------
        */

        if (
            stdout.trim()
        )
        {

            terminalText +=
                stdout.trim();

        }
        else
        {

            terminalText +=
                "(no output)";

        }


        /*
        --------------------------------------------------------
        COMPILATION ERROR
        --------------------------------------------------------
        */

        if (
            compileOutput.trim()
        )
        {

            terminalText +=

                "\n\n" +

                "COMPILATION ERROR\n" +

                "────────────────────────\n" +

                compileOutput.trim();

        }


        /*
        --------------------------------------------------------
        RUNTIME ERROR
        --------------------------------------------------------
        */

        if (
            stderr.trim()
        )
        {

            terminalText +=

                "\n\n" +

                "RUNTIME ERROR\n" +

                "────────────────────────\n" +

                stderr.trim();

        }


        /*
        --------------------------------------------------------
        SYSTEM MESSAGE
        --------------------------------------------------------
        */

        if (
            message.trim()
        )
        {

            terminalText +=

                "\n\n" +

                "SYSTEM MESSAGE\n" +

                "────────────────────────\n" +

                message.trim();

        }


        /*
        --------------------------------------------------------
        JUDGE0 STATUS
        --------------------------------------------------------
        */

        const status =
            result.status &&
            result.status.description
                ? result.status.description
                : "Unknown";


        terminalText +=

            "\n\n[" +
            status +
            "]";


        /*
        --------------------------------------------------------
        OUTPUT TYPE
        --------------------------------------------------------
        */

        let outputType =
            "success";


        if (
            compileOutput.trim() ||
            stderr.trim()
        )
        {

            outputType =
                "error";

        }


        this.writeTerminal(
            terminalText,
            outputType
        );


        /*
        --------------------------------------------------------
        STATUS BAR
        --------------------------------------------------------
        */

        const statusID =
            result.status
                ? Number(
                    result.status.id
                )
                : 0;


        switch (statusID)
        {

            case 3:

                this.setStatus(
                    "PROGRAM COMPLETED"
                );

                break;


            case 4:

                this.setStatus(
                    "WRONG ANSWER"
                );

                break;


            case 5:

                this.setStatus(
                    "TIME LIMIT EXCEEDED"
                );

                break;


            case 6:

                this.setStatus(
                    "COMPILATION ERROR"
                );

                break;


            case 7:

                this.setStatus(
                    "RUNTIME ERROR"
                );

                break;


            case 8:

                this.setStatus(
                    "RUNTIME ERROR"
                );

                break;


            case 9:

                this.setStatus(
                    "RUNTIME ERROR"
                );

                break;


            case 10:

                this.setStatus(
                    "RUNTIME ERROR"
                );

                break;


            case 11:

                this.setStatus(
                    "RUNTIME ERROR"
                );

                break;


            case 12:

                this.setStatus(
                    "RUNTIME ERROR"
                );

                break;


            case 13:

                this.setStatus(
                    "INTERNAL ERROR"
                );

                break;


            case 14:

                this.setStatus(
                    "EXECUTION ERROR"
                );

                break;


            default:

                this.setStatus(
                    status
                );

                break;

        }

    },


    /* ========================================================
       WEB EXECUTION
    ======================================================== */

    /* ============================================================
   WEB EXECUTION
============================================================ */

runWeb: function(code)
{
    const preview =
        this.elements.webPreview;

    if (!preview)
    {
        this.writeTerminal(
            "Web preview element not found.",
            "error"
        );

        this.setStatus(
            "WEB PREVIEW ERROR"
        );

        return;
    }


    try
    {
        /*
        Make sure the complete HTML document
        is rendered inside the iframe.
        */

        preview.srcdoc =
            String(code);


        /*
        Show the Site view.
        */

        this.showSite();


        /*
        Terminal message.
        */

        this.writeTerminal(

            this.buildTerminalHeader(
                "web"
            ) +

            this.getWelcomeMessage(
                "web"
            ) +

            "\n\n" +

            "✓ Web page loaded successfully.",

            "success"

        );


        this.setStatus(
            "WEB PAGE RUNNING"
        );

    }

    catch(error)
    {
        this.writeTerminal(

            "VEDAS WEB EXECUTION ERROR\n" +
            "────────────────────────\n" +
            String(
                error &&
                error.message
                    ? error.message
                    : error
            ),

            "error"

        );


        this.setStatus(
            "WEB ERROR"
        );

    }

},


    /* ========================================================
       STOP
    ======================================================== */

    stop: function()
    {

        if (
            this.state.abortController
        )
        {

            try
            {

                this.state.abortController.abort();

            }
            catch(error)
            {

                console.warn(
                    "VEDAS stop failed:",
                    error
                );

            }

        }


        this.state.abortController =
            null;


        this.state.running =
            false;


        this.updateRunButton(
            false
        );


        this.setStatus(
            "STOPPED"
        );


        if (
            this.elements.terminalOutput
        )
        {

            this.elements.terminalOutput.textContent +=

                "\n\n" +
                "Execution stopped.";

        }

    },


    /* ========================================================
       RUN BUTTON
    ======================================================== */

    updateRunButton: function(
        running
    )
    {

        const button =
            this.elements.runButton;


        if (!button)
        {
            return;
        }


        if (
            running
        )
        {

            button.disabled =
                true;

            button.classList.add(
                "running"
            );

            button.textContent =
                "● RUNNING";

        }
        else
        {

            button.disabled =
                false;

            button.classList.remove(
                "running"
            );

            button.textContent =
                "▶ RUN";

        }

    },


    /* ========================================================
       CODE VIEW
    ======================================================== */

    showCode: function()
    {

        this.state.currentView =
            "code";


        if (
            this.elements.coding
        )
        {

            this.elements.coding.hidden =
                false;

        }


        if (
            this.elements.io
        )
        {

            this.elements.io.hidden =
                true;

        }


        if (
            this.elements.webPreviewArea
        )
        {

            this.elements.webPreviewArea.hidden =
                true;

        }


        this.updateToolbar(
            "code"
        );


        this.refreshEditor();


        this.setStatus(
            "READY"
        );

    },


    /* ========================================================
       I/O VIEW
    ======================================================== */

    showIO: function()
    {

        this.state.currentView =
            "io";


        if (
            this.elements.coding
        )
        {

            this.elements.coding.hidden =
                true;

        }


        if (
            this.elements.io
        )
        {

            this.elements.io.hidden =
                false;

        }


        if (
            this.elements.webPreviewArea
        )
        {

            this.elements.webPreviewArea.hidden =
                true;

        }


        this.updateToolbar(
            "io"
        );


        this.setStatus(
            "I/O"
        );

    },


    /* ========================================================
       SITE VIEW
    ======================================================== */

    showSite: function()
{
    this.state.currentView =
        "site";


    if (this.elements.coding)
    {
        this.elements.coding.hidden =
            false;
    }


    if (this.elements.io)
    {
        this.elements.io.hidden =
            true;
    }


    if (this.elements.webPreviewArea)
    {
        this.elements.webPreviewArea.hidden =
            false;
    }


    this.updateToolbar(
        "site"
    );


    this.refreshEditor();

},


    /* ========================================================
       TOOLBAR
    ======================================================== */

    updateToolbar: function(
        view
    )
    {

        const buttons = [

            this.elements.siteButton,

            this.elements.codeButton,

            this.elements.ioButton

        ];


        buttons.forEach(
            button =>
            {

                if (
                    button
                )
                {

                    button.classList.remove(
                        "active"
                    );

                }

            }
        );


        if (
            view === "site" &&
            this.elements.siteButton
        )
        {

            this.elements.siteButton
                .classList.add(
                    "active"
                );

        }


        if (
            view === "code" &&
            this.elements.codeButton
        )
        {

            this.elements.codeButton
                .classList.add(
                    "active"
                );

        }


        if (
            view === "io" &&
            this.elements.ioButton
        )
        {

            this.elements.ioButton
                .classList.add(
                    "active"
                );

        }

    },


    /* ========================================================
       VIEW
    ======================================================== */

    updateView: function()
    {

        switch (
            this.state.currentView
        )
        {

            case "site":

                this.showSite();

                break;


            case "io":

                this.showIO();

                break;


            default:

                this.showCode();

                break;

        }

    },


    /* ========================================================
       EDITOR REFRESH
       
       ONLY communication with VEDASEditor.
    ======================================================== */

    refreshEditor: function()
    {

        if (
            window.VEDASEditor &&
            typeof window.VEDASEditor.refresh ===
                "function"
        )
        {

            setTimeout(
                () =>
                    window.VEDASEditor.refresh(),
                0
            );

        }

    },


    /* ========================================================
       PUBLIC EXECUTE API
       
       Kept for compatibility if another part
       of VEDAS calls CLEngine.execute().
    ======================================================== */

    execute: function()
    {

        return this.run();

    },


    /* ========================================================
       PUBLIC CLEAR API
    ======================================================== */

    clearEditor: function()
    {

        this.clear();

    },


    /* ========================================================
       STATE
    ======================================================== */

    getState: function()
    {

        return {

            running:
                this.state.running,

            currentView:
                this.state.currentView,

            currentLanguage:
                this.state.currentLanguage,

            darkMode:
                this.state.darkMode

        };

    }

};


/* ============================================================
   INITIALIZATION
============================================================ */

function initializeVEDAS()
{

    CLEngine.loadSavedTheme();

    CLEngine.init();

}


/* ============================================================
   START
============================================================ */

if (
    document.readyState ===
    "loading"
)
{

    document.addEventListener(
        "DOMContentLoaded",
        initializeVEDAS,
        {
            once:
                true
        }
    );

}
else
{

    initializeVEDAS();

}


/* ============================================================
   GLOBAL
============================================================ */

window.CLEngine =
    CLEngine;


/*
============================================================
VEDAS CODE LAB
UNIFIED CL ENGINE v7.1
READY
============================================================
*/