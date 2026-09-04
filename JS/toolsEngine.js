"use strict";

/*
============================================================
 VEDAS TOOLS ENGINE v7.0
============================================================

RESPONSIBLE FOR:

✓ Tools dropdown
✓ Clear Editor
✓ Clear Terminal
✓ Developer Console
✓ Diagnostics
✓ Settings
✓ Reload Code Lab

DOES NOT:

✗ Format Code
✗ Connect to FormatEngine
✗ Initialize CodeMirror
✗ Configure CodeMirror
✗ Execute programs
✗ Compile programs
✗ Manage files
✗ Manage projects
============================================================
*/


const ToolsEngine = {

    menu: null,
    button: null,
    dropdown: null,
    initialized: false,


    /* ========================================================
       INITIALIZE
    ======================================================== */

    init() {

        if (this.initialized) {
            return;
        }


        this.menu =
            document.querySelector(
                ".toolsMenu"
            );


        if (!this.menu) {

            console.warn(
                "VEDAS ToolsEngine: .toolsMenu not found."
            );

            return;
        }


        /*
        Your actual HTML uses:

            <button
                class="menuItem"
                id="toolsTitleMenuButton"
            >

        Therefore do NOT search for .menuButton.
        */

        this.button =
            this.menu.querySelector(
                "#toolsTitleMenuButton"
            );


        /*
        Fallback in case the ID changes later.
        */

        if (!this.button) {

            this.button =
                this.menu.querySelector(
                    ".menuItem"
                );

        }


        this.dropdown =
            this.menu.querySelector(
                ".dropdownMenu"
            );


        if (!this.button) {

            console.warn(
                "VEDAS ToolsEngine: Tools button not found."
            );

            return;
        }


        if (!this.dropdown) {

            console.warn(
                "VEDAS ToolsEngine: Tools dropdown not found."
            );

            return;
        }


        this.bindEvents();


        this.initialized =
            true;


        console.log(
            "VEDAS ToolsEngine v7.0 ready."
        );

    },


    /* ========================================================
       EVENTS
    ======================================================== */

    bindEvents() {

        /*
        --------------------------------------------------------
        TOOLS BUTTON
        --------------------------------------------------------
        */

        this.button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();


                this.menu.classList.toggle(
                    "open"
                );

            }
        );


        /*
        --------------------------------------------------------
        DROPDOWN ITEMS
        --------------------------------------------------------
        */

        this.dropdown.addEventListener(
            "click",
            event => {

                const item =
                    event.target.closest(
                        ".dropdownItem"
                    );


                if (!item) {
                    return;
                }


                event.preventDefault();

                event.stopPropagation();


                const action =
                    item.dataset.action;


                if (action) {

                    this.execute(
                        action
                    );

                }


                this.close();

            }
        );


        /*
        --------------------------------------------------------
        OUTSIDE CLICK
        --------------------------------------------------------
        */

        document.addEventListener(
            "click",
            event => {

                if (
                    !this.menu.contains(
                        event.target
                    )
                ) {

                    this.close();

                }

            }
        );


        /*
        --------------------------------------------------------
        ESCAPE
        --------------------------------------------------------
        */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape"
                ) {

                    this.close();

                }

            }
        );

    },


    /* ========================================================
       OPEN
    ======================================================== */

    open() {

        if (!this.menu) {
            return;
        }


        this.menu.classList.add(
            "open"
        );

    },


    /* ========================================================
       CLOSE
    ======================================================== */

    close() {

        if (!this.menu) {
            return;
        }


        this.menu.classList.remove(
            "open"
        );

    },


    /* ========================================================
       TOGGLE
    ======================================================== */

    toggle() {

        if (!this.menu) {
            return;
        }


        this.menu.classList.toggle(
            "open"
        );

    },


    /* ========================================================
       ACTION ROUTER
    ======================================================== */

    execute(action) {

        switch (action) {


            /* ------------------------------------------------
               CLEAR EDITOR
            ------------------------------------------------ */

            case "clearEditor":

                this.clearEditor();

                break;


            /* ------------------------------------------------
               CLEAR TERMINAL
            ------------------------------------------------ */

            case "clearTerminal":

                this.clearTerminal();

                break;


            /* ------------------------------------------------
               DEVELOPER CONSOLE
            ------------------------------------------------ */

            case "console":

                this.openConsole();

                break;


            /* ------------------------------------------------
               DIAGNOSTICS
            ------------------------------------------------ */

            case "diagnostics":

                this.diagnostics();

                break;


            /* ------------------------------------------------
               SETTINGS
            ------------------------------------------------ */

            case "settings":

                this.openSettings();

                break;


            /* ------------------------------------------------
               RELOAD
            ------------------------------------------------ */

            case "reload":

                this.reload();

                break;


            default:

                console.warn(
                    "VEDAS ToolsEngine: Unknown action:",
                    action
                );

        }

    },


    /* ========================================================
       GET EDITOR
    ======================================================== */

    getEditor() {

        /*
        Preferred VEDASEditor API.
        */

        if (
            window.VEDASEditor
        ) {

            return window.VEDASEditor;

        }


        /*
        Legacy fallback.
        */

        if (
            window.editor
        ) {

            return window.editor;

        }


        return null;

    },


    /* ========================================================
       CLEAR EDITOR
    ======================================================== */

    clearEditor() {

        if (
            !window.confirm(
                "Clear the editor?"
            )
        ) {

            return;

        }


        /*
        Use VEDASEditor API first.
        */

        if (
            window.VEDASEditor &&
            typeof window.VEDASEditor.setCode ===
                "function"
        ) {

            window.VEDASEditor.setCode(
                ""
            );


            this.status(
                "EDITOR CLEARED"
            );


            return;

        }


        /*
        CodeMirror compatibility.
        */

        const editor =
            this.getEditor();


        if (
            editor &&
            typeof editor.setValue ===
                "function"
        ) {

            editor.setValue(
                ""
            );


            this.status(
                "EDITOR CLEARED"
            );


            return;

        }


        this.status(
            "EDITOR OFFLINE"
        );

    },


    /* ========================================================
       CLEAR TERMINAL
    ======================================================== */

    clearTerminal() {

        /*
        Preferred CLEngine API.
        */

        if (
            window.CLEngine &&
            typeof window.CLEngine.clearTerminal ===
                "function"
        ) {

            window.CLEngine.clearTerminal();


            this.status(
                "TERMINAL CLEARED"
            );


            return;

        }


        /*
        Current Code Lab terminal.
        */

        const terminal =
            document.getElementById(
                "terminalOutput"
            );


        if (terminal) {

            terminal.textContent =
                "";


            this.status(
                "TERMINAL CLEARED"
            );


            return;

        }


        /*
        Compatibility fallback.
        */

        const appTerminal =
            document.getElementById(
                "appTerminalLog"
            );


        if (appTerminal) {

            appTerminal.textContent =
                "";


            this.status(
                "TERMINAL CLEARED"
            );


            return;

        }


        this.status(
            "TERMINAL NOT FOUND"
        );

    },


    /* ========================================================
       DEVELOPER CONSOLE
    ======================================================== */

    openConsole() {

        let box =
            document.getElementById(
                "vedasDeveloperConsole"
            );


        /*
        Existing console.
        */

        if (box) {

            box.hidden =
                !box.hidden;


            return;

        }


        /*
        Create console.
        */

        box =
            document.createElement(
                "div"
            );


        box.id =
            "vedasDeveloperConsole";


        box.innerHTML = `

            <div class="vedasConsoleHeader">

                <strong>
                    VEDAS DEVELOPER CONSOLE
                </strong>


                <button
                    type="button"
                    id="closeVedasConsole"
                >

                    ✕

                </button>

            </div>


            <pre id="vedasConsoleOutput">VEDAS Developer Console
Ready.</pre>

        `;


        document.body.appendChild(
            box
        );


        const closeButton =
            document.getElementById(
                "closeVedasConsole"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                () => {

                    box.hidden =
                        true;

                }
            );

        }


        this.consoleLog(
            "Developer console opened."
        );

    },


    /* ========================================================
       CONSOLE LOG
    ======================================================== */

    consoleLog(message) {

        const output =
            document.getElementById(
                "vedasConsoleOutput"
            );


        if (!output) {
            return;
        }


        const time =
            new Date()
                .toLocaleTimeString();


        output.textContent +=
            `\n[${time}] ${message}`;


        output.scrollTop =
            output.scrollHeight;

    },


    /* ========================================================
       DIAGNOSTICS
    ======================================================== */

    diagnostics() {

        const modules = {

            VEDASEditor:
                !!window.VEDASEditor,

            FileEngine:
                !!window.FileEngine,

            ProjectEngine:
                !!window.ProjectEngine,

            EditEngine:
                !!window.EditEngine,

            ViewEngine:
                !!window.ViewEngine,

            CLEngine:
                !!window.CLEngine,

            ToolsEngine:
                true

        };


        let result =
            "VEDAS DIAGNOSTICS\n" +
            "=================\n\n";


        for (
            const name in modules
        ) {

            result +=
                `${name.padEnd(16)} : ${
                    modules[name]
                        ? "ONLINE"
                        : "OFFLINE"
                }\n`;

        }


        console.log(
            result
        );


        this.openConsole();


        const output =
            document.getElementById(
                "vedasConsoleOutput"
            );


        if (output) {

            output.textContent =
                result;

        }


        this.status(
            "DIAGNOSTICS COMPLETE"
        );

    },


    /* ========================================================
       SETTINGS
    ======================================================== */

    openSettings() {

        alert(
            "VEDAS Settings\n\n" +
            "Settings system will be added here."
        );


        this.status(
            "SETTINGS"
        );

    },


    /* ========================================================
       RELOAD
    ======================================================== */

    reload() {

        if (
            !window.confirm(
                "Reload VEDAS Code Lab?"
            )
        ) {

            return;

        }


        window.location.reload();

    },


    /* ========================================================
       STATUS
    ======================================================== */

    status(message) {

        /*
        CLEngine status API.
        */

        if (
            window.CLEngine &&
            typeof window.CLEngine.setStatus ===
                "function"
        ) {

            window.CLEngine.setStatus(
                message
            );


            return;

        }


        /*
        Fallback status element.
        */

        const status =
            document.getElementById(
                "status"
            );


        if (status) {

            status.textContent =
                message;


            return;

        }


        console.log(
            "VEDAS TOOLS:",
            message
        );

    }

};


/* ============================================================
   START
============================================================ */

function initializeToolsEngine() {

    ToolsEngine.init();

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeToolsEngine,
        {
            once: true
        }
    );

}
else {

    initializeToolsEngine();

}


/* ============================================================
   GLOBAL API
============================================================ */

window.ToolsEngine =
    ToolsEngine;


/*
============================================================
 VEDAS TOOLS ENGINE v7.0
 READY
============================================================
*/