"use strict";

/*
============================================================
VEDAS CONTROL ENGINE
VERSION: 6.2

RESPONSIBILITY
============================================================

✓ UI
✓ Buttons
✓ Theme
✓ Run request
✓ Clear request
✓ SITE / CODE / I/O
✓ Sidebar
✓ Menu
✓ Status
✓ Panel status
✓ Preview visibility
✓ I/O visibility
✓ Keyboard shortcuts
✓ Communication with CLEngine

DOES NOT
============================================================

✗ Initialize CodeMirror
✗ Configure CodeMirror
✗ Change CodeMirror mode
✗ Execute code
✗ Compile code
✗ Interpret code
✗ Call Judge0
✗ eval()
✗ Function()

EXECUTION FLOW
============================================================

RUN BUTTON
    ↓
ControlEngine.requestRun()
    ↓
window.runCode()
    ↓
CLEngine
    ↓
Judge0
    ↓
result
    ↓
ControlEngine
    ↓
UI

IMPORTANT
============================================================

CLEngine MUST expose:

    window.runCode()

CLEngine is responsible for execution.

ControlEngine is responsible for UI.
============================================================
*/


/*
============================================================
CONTROL ENGINE
============================================================
*/

const ControlEngine = {


    /*
    ========================================================
    STATE
    ========================================================
    */

    state: {

        running: false,

        currentView: "code",

        currentLanguage: "python",

        darkMode: false,

        activeSideItem: "code",

        activeMenu: null

    },


    /*
    ========================================================
    DOM
    ========================================================
    */

    elements: {},


    /*
    ========================================================
    INITIALIZATION
    ========================================================
    */

    init: function() {

        this.cacheElements();

        this.bindButtons();

        this.bindLanguage();

        this.bindSidebar();

        this.bindMenus();

        this.bindKeyboard();

        this.initializeState();

        console.log(
            "VEDAS ControlEngine v6.2 ready."
        );

    },


    /*
    ========================================================
    CACHE DOM
    ========================================================
    */

    cacheElements: function() {

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


    /*
    ========================================================
    INITIAL STATE
    ========================================================
    */

    initializeState: function() {

        if (
            this.elements.language
        ) {

            this.state.currentLanguage =
                this.elements.language.value;

        }


        this.state.darkMode =
            document.body.classList.contains(
                "dark"
            );


        this.updateThemeButton();

        this.updatePanelStatus();

        this.updateView();

        this.setStatus(
            "READY"
        );

    },


    /*
    ========================================================
    BUTTONS
    ========================================================
    */

    bindButtons: function() {

        /*
        ----------------------------------------------------
        THEME
        ----------------------------------------------------
        */

        if (
            this.elements.themeButton
        ) {

            this.elements.themeButton
                .addEventListener(
                    "click",
                    () => {

                        this.toggleTheme();

                    }
                );

        }


        /*
        ----------------------------------------------------
        CLEAR
        ----------------------------------------------------
        */

        if (
            this.elements.clearButton
        ) {

            this.elements.clearButton
                .addEventListener(
                    "click",
                    () => {

                        this.requestClear();

                    }
                );

        }


        /*
        ----------------------------------------------------
        RUN
        ----------------------------------------------------

        ONLY ControlEngine handles
        the visible RUN button.

        CLEngine does NOT attach another
        listener to this button.
        */

        if (
            this.elements.runButton
        ) {

            this.elements.runButton
                .addEventListener(
                    "click",
                    () => {

                        this.requestRun();

                    }
                );

        }


        /*
        ----------------------------------------------------
        SITE
        ----------------------------------------------------
        */

        if (
            this.elements.siteButton
        ) {

            this.elements.siteButton
                .addEventListener(
                    "click",
                    () => {

                        this.showSite();

                    }
                );

        }


        /*
        ----------------------------------------------------
        CODE
        ----------------------------------------------------
        */

        if (
            this.elements.codeButton
        ) {

            this.elements.codeButton
                .addEventListener(
                    "click",
                    () => {

                        this.showCode();

                    }
                );

        }


        /*
        ----------------------------------------------------
        I/O
        ----------------------------------------------------
        */

        if (
            this.elements.ioButton
        ) {

            this.elements.ioButton
                .addEventListener(
                    "click",
                    () => {

                        this.showIO();

                    }
                );

        }


        /*
        ----------------------------------------------------
        SIDEBAR WEBSITE
        ----------------------------------------------------
        */

        if (
            this.elements.sideSite
        ) {

            this.elements.sideSite
                .addEventListener(
                    "click",
                    () => {

                        this.showSite();

                    }
                );

        }

    },


    /*
    ========================================================
    LANGUAGE
    ========================================================
    */

    bindLanguage: function() {

        if (
            !this.elements.language
        ) {

            return;

        }


        this.elements.language
            .addEventListener(
                "change",
                () => {

                    this.state.currentLanguage =
                        this.elements.language.value;


                    this.updatePanelStatus();

                    this.setStatus(
                        "READY"
                    );

                }
            );

    },


    /*
    ========================================================
    SIDEBAR
    ========================================================
    */

    bindSidebar: function() {

        if (
            !this.elements.sideItems
        ) {

            return;

        }


        this.elements.sideItems
            .forEach(
                item => {

                    item.addEventListener(
                        "click",
                        () => {

                            this.handleSidebarItem(
                                item
                            );

                        }
                    );

                }
            );

    },


    /*
    ========================================================
    SIDEBAR ITEM
    ========================================================
    */

    handleSidebarItem: function(item) {

        const side =
            item.dataset.side;


        this.state.activeSideItem =
            side || "";


        this.elements.sideItems
            .forEach(
                element => {

                    element.classList.remove(
                        "active"
                    );

                }
            );


        item.classList.add(
            "active"
        );


        switch (
            side
        ) {

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


            default:

                this.setStatus(
                    "READY"
                );

                break;

        }

    },


    /*
    ========================================================
    MENUS
    ========================================================
    */

    bindMenus: function() {

        if (
            !this.elements.menuItems
        ) {

            return;

        }


        this.elements.menuItems
            .forEach(
                item => {

                    item.addEventListener(
                        "click",
                        () => {

                            this.handleMenu(
                                item
                            );

                        }
                    );

                }
            );

    },


    /*
    ========================================================
    MENU
    ========================================================
    */

    handleMenu: function(item) {

        const menu =
            item.dataset.menu;


        this.state.activeMenu =
            menu || null;


        switch (
            menu
        ) {

            case "file":

                this.setStatus(
                    "FILE"
                );

                break;


            case "edit":

                this.setStatus(
                    "EDIT"
                );

                break;


            case "view":

                this.setStatus(
                    "VIEW"
                );

                break;


            case "run":

                this.setStatus(
                    "RUN"
                );

                break;


            case "tools":

                this.setStatus(
                    "TOOLS"
                );

                break;


            case "help":

                this.setStatus(
                    "HELP"
                );

                break;


            default:

                this.setStatus(
                    "READY"
                );

                break;

        }

    },


    /*
    ========================================================
    THEME
    ========================================================
    */

    toggleTheme: function() {

        this.state.darkMode =
            !this.state.darkMode;


        document.body.classList.toggle(
            "dark",
            this.state.darkMode
        );


        this.updateThemeButton();

        this.flashTheme();

        this.setStatus(
            "READY"
        );

    },


    /*
    ========================================================
    THEME BUTTON
    ========================================================
    */

    updateThemeButton: function() {

        const button =
            this.elements.themeButton;


        if (!button) {

            return;

        }


        if (
            this.state.darkMode
        ) {

            button.textContent =
                "☾";

            button.title =
                "Switch to light theme";

        }

        else {

            button.textContent =
                "☀";

            button.title =
                "Switch to dark theme";

        }

    },


    /*
    ========================================================
    THEME FLASH
    ========================================================
    */

    flashTheme: function() {

        const flash =
            document.getElementById(
                "themeFlash"
            );


        if (!flash) {

            return;

        }


        flash.classList.remove(
            "active"
        );


        void flash.offsetWidth;


        flash.classList.add(
            "active"
        );


        setTimeout(
            () => {

                flash.classList.remove(
                    "active"
                );

            },
            180
        );

    },


    /*
    ========================================================
    CLEAR
    ========================================================
    */

    requestClear: function() {

        /*
        ----------------------------------------------------
        USE VEDAS EDITOR API
        ----------------------------------------------------
        */

        if (
            window.VEDASEditor &&
            typeof window.VEDASEditor.setCode ===
                "function"
        ) {

            window.VEDASEditor.setCode(
                ""
            );

        }

        else if (
            window.VEDASEditor &&
            typeof window.VEDASEditor.clear ===
                "function"
        ) {

            window.VEDASEditor.clear();

        }

        else {

            /*
            ------------------------------------------------
            FALLBACK
            ------------------------------------------------
            */

            const textarea =
                document.getElementById(
                    "code"
                );


            if (textarea) {

                textarea.value =
                    "";

            }

        }


        this.clearTerminal();

        this.setStatus(
            "CLEARED"
        );

    },


    /*
    ========================================================
    CLEAR TERMINAL
    ========================================================
    */

    clearTerminal: function() {

        const terminal =
            this.elements.terminalOutput;


        if (!terminal) {

            return;

        }


        terminal.classList.remove(
            "output-success",
            "output-error",
            "output-warning"
        );


        terminal.textContent =
            "VEDAS CODE LAB v6.2\nReady.";

    },


    /*
    ========================================================
    RUN REQUEST
    ========================================================

    THIS IS THE MOST IMPORTANT PART.

    ControlEngine does NOT execute code.

    It calls:

        window.runCode()

    CLEngine performs the execution.

    ========================================================
    */

    requestRun: function() {

        if (
            this.state.running
        ) {

            return;

        }


        /*
        ----------------------------------------------------
        CHECK CL ENGINE
        ----------------------------------------------------

        Do NOT check:

            window.CLEngine.execute()

        The execution API is:

            window.runCode()
        ----------------------------------------------------
        */

        if (
            typeof window.runCode !==
            "function"
        ) {

            this.state.running =
                false;


            this.updateRunButton(
                false
            );


            this.setStatus(
                "CL ENGINE OFFLINE"
            );


            this.writeTerminal(

                "CL Engine is not available.\n\n" +

                "Make sure clEngine.js is loaded " +

                "before controlEngine.js.",

                "error"

            );


            console.error(
                "VEDAS: window.runCode() is unavailable."
            );


            return;

        }


        /*
        ----------------------------------------------------
        START UI STATE
        ----------------------------------------------------
        */

        this.state.running =
            true;


        this.updateRunButton(
            true
        );


        this.setStatus(
            "RUNNING"
        );


        /*
        ----------------------------------------------------
        CALL CLEngine
        ----------------------------------------------------
        */

        let result;


        try {

            result =
                window.runCode();

        }

        catch (
            error
        ) {

            this.executionError(
                error
            );

            return;

        }


        /*
        ----------------------------------------------------
        HANDLE PROMISE
        ----------------------------------------------------
        */

        if (
            result &&
            typeof result.then ===
                "function"
        ) {

            result
                .then(
                    output => {

                        this.executionFinished(
                            output
                        );

                    }
                )
                .catch(
                    error => {

                        this.executionError(
                            error
                        );

                    }
                );


            return;

        }


        /*
        ----------------------------------------------------
        SYNCHRONOUS RESULT
        ----------------------------------------------------
        */

        this.executionFinished(
            result
        );

    },


    /*
    ========================================================
    EXECUTION FINISHED
    ========================================================
    */

    executionFinished: function(result) {

        this.state.running =
            false;


        this.updateRunButton(
            false
        );


        /*
        ----------------------------------------------------
        WEB PREVIEW
        ----------------------------------------------------
        */

        if (
            result &&
            typeof result === "object" &&
            result.preview !== undefined
        ) {

            this.showWebPreview(
                result.preview
            );

        }


        /*
        ----------------------------------------------------
        ERROR RESULT
        ----------------------------------------------------
        */

        if (
            result &&
            typeof result === "object" &&
            result.error
        ) {

            this.setStatus(
                "ERROR"
            );

        }

        else {

            this.setStatus(
                "FINISHED"
            );

        }

    },


    /*
    ========================================================
    EXECUTION ERROR
    ========================================================
    */

    executionError: function(error) {

        this.state.running =
            false;


        this.updateRunButton(
            false
        );


        this.setStatus(
            "ERROR"
        );


        const message =
            error &&
            error.message
                ? error.message
                : String(
                    error ||
                    "Execution error."
                );


        this.writeTerminal(
            message,
            "error"
        );


        console.error(
            "VEDAS ControlEngine execution error:",
            error
        );

    },


    /*
    ========================================================
    RUN BUTTON STATE
    ========================================================
    */

    updateRunButton: function(running) {

        const button =
            this.elements.runButton;


        if (!button) {

            return;

        }


        if (running) {

            button.disabled =
                true;


            button.classList.add(
                "running"
            );


            button.textContent =
                "● RUNNING";

        }

        else {

            button.disabled =
                false;


            button.classList.remove(
                "running"
            );


            button.textContent =
                "▶ RUN";

        }

    },


    /*
    ========================================================
    CODE VIEW
    ========================================================
    */

    showCode: function() {

        this.state.currentView =
            "code";


        if (
            this.elements.coding
        ) {

            this.elements.coding.hidden =
                false;

        }


        if (
            this.elements.io
        ) {

            this.elements.io.hidden =
                true;

        }


        if (
            this.elements.webPreviewArea
        ) {

            this.elements.webPreviewArea.hidden =
                true;

        }


        this.updateToolbarState(
            "code"
        );


        this.setStatus(
            "READY"
        );


        this.refreshEditor();

    },


    /*
    ========================================================
    I/O VIEW
    ========================================================
    */

    showIO: function() {

        this.state.currentView =
            "io";


        if (
            this.elements.coding
        ) {

            this.elements.coding.hidden =
                true;

        }


        if (
            this.elements.io
        ) {

            this.elements.io.hidden =
                false;

        }


        if (
            this.elements.webPreviewArea
        ) {

            this.elements.webPreviewArea.hidden =
                true;

        }


        this.updateToolbarState(
            "io"
        );


        this.setStatus(
            "I/O"
        );

    },


    /*
    ========================================================
    SITE VIEW
    ========================================================
    */

    showSite: function() {

        this.state.currentView =
            "site";


        if (
            this.elements.coding
        ) {

            this.elements.coding.hidden =
                false;

        }


        if (
            this.elements.io
        ) {

            this.elements.io.hidden =
                true;

        }


        if (
            this.elements.webPreviewArea
        ) {

            this.elements.webPreviewArea.hidden =
                false;

        }


        this.updateToolbarState(
            "site"
        );


        this.setStatus(
            "WEB PREVIEW"
        );


        this.refreshEditor();

    },


    /*
    ========================================================
    WEB PREVIEW
    ========================================================
    */

    showWebPreview: function(preview) {

        if (
            !this.elements.webPreview
        ) {

            return;

        }


        this.elements.webPreview.srcdoc =
            String(
                preview
            );


        this.showSite();

    },


    /*
    ========================================================
    VIEW UPDATE
    ========================================================
    */

    updateView: function() {

        switch (
            this.state.currentView
        ) {

            case "site":

                this.showSite();

                break;


            case "io":

                this.showIO();

                break;


            case "code":

            default:

                this.showCode();

                break;

        }

    },


    /*
    ========================================================
    TOOLBAR STATE
    ========================================================
    */

    updateToolbarState: function(view) {

        const buttons = [

            this.elements.siteButton,

            this.elements.codeButton,

            this.elements.ioButton

        ];


        buttons.forEach(
            button => {

                if (button) {

                    button.classList.remove(
                        "active"
                    );

                }

            }
        );


        if (
            view === "site" &&
            this.elements.siteButton
        ) {

            this.elements.siteButton
                .classList
                .add(
                    "active"
                );

        }


        if (
            view === "code" &&
            this.elements.codeButton
        ) {

            this.elements.codeButton
                .classList
                .add(
                    "active"
                );

        }


        if (
            view === "io" &&
            this.elements.ioButton
        ) {

            this.elements.ioButton
                .classList
                .add(
                    "active"
                );

        }

    },


    /*
    ========================================================
    PANEL STATUS
    ========================================================
    */

    updatePanelStatus: function() {

        if (
            !this.elements.panelStatus
        ) {

            return;

        }


        const names = {

            python:
                "Python 3",

            c:
                "C",

            cpp:
                "C++",

            java:
                "Java",

            javascript:
                "JavaScript",

            web:
                "HTML + CSS + JS"

        };


        this.elements.panelStatus.textContent =
            names[
                this.state.currentLanguage
            ] ||
            this.state.currentLanguage;

    },


    /*
    ========================================================
    STATUS
    ========================================================
    */

    setStatus: function(status) {

        if (
            !this.elements.status
        ) {

            return;

        }


        this.elements.status.textContent =
            String(
                status
            ).toUpperCase();

    },


    /*
    ========================================================
    TERMINAL UI
    ========================================================
    */

    writeTerminal: function(
        text,
        type = "normal"
    ) {

        const terminal =
            this.elements.terminalOutput;


        if (!terminal) {

            return;

        }


        terminal.classList.remove(
            "output-success",
            "output-error",
            "output-warning"
        );


        if (
            type === "success"
        ) {

            terminal.classList.add(
                "output-success"
            );

        }


        if (
            type === "error"
        ) {

            terminal.classList.add(
                "output-error"
            );

        }


        if (
            type === "warning"
        ) {

            terminal.classList.add(
                "output-warning"
            );

        }


        terminal.textContent =
            String(
                text ?? ""
            );

    },


    /*
    ========================================================
    EDITOR REFRESH
    ========================================================
    */

    refreshEditor: function() {

        if (
            window.VEDASEditor &&
            typeof window.VEDASEditor.refresh ===
                "function"
        ) {

            setTimeout(
                () => {

                    window.VEDASEditor.refresh();

                },
                0
            );

        }

    },


    /*
    ========================================================
    KEYBOARD
    ========================================================
    */

    bindKeyboard: function() {

        document.addEventListener(
            "keydown",
            event => {

                /*
                ------------------------------------------------
                CTRL + ENTER
                ------------------------------------------------
                */

                if (
                    event.ctrlKey &&
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    this.requestRun();

                }


                /*
                ------------------------------------------------
                ESCAPE
                ------------------------------------------------
                */

                if (
                    event.key === "Escape" &&
                    this.state.running
                ) {

                    this.requestStop();

                }

            }
        );

    },


    /*
    ========================================================
    STOP REQUEST
    ========================================================
    */

    requestStop: function() {

        if (
            !this.state.running
        ) {

            return;

        }


        /*
        ----------------------------------------------------
        ASK CLEngine TO STOP
        ----------------------------------------------------
        */

        if (
            window.CLEngine &&
            typeof window.CLEngine.stop ===
                "function"
        ) {

            try {

                window.CLEngine.stop();

            }

            catch (
                error
            ) {

                console.error(
                    "VEDAS CL Engine stop failed:",
                    error
                );

            }

        }


        /*
        ----------------------------------------------------
        RESET UI
        ----------------------------------------------------
        */

        this.state.running =
            false;


        this.updateRunButton(
            false
        );


        this.setStatus(
            "STOPPED"
        );

    },


    /*
    ========================================================
    STATE API
    ========================================================
    */

    getState: function() {

        return {

            running:
                this.state.running,

            currentView:
                this.state.currentView,

            currentLanguage:
                this.state.currentLanguage,

            darkMode:
                this.state.darkMode,

            activeSideItem:
                this.state.activeSideItem,

            activeMenu:
                this.state.activeMenu

        };

    }

};


/*
============================================================
START CONTROL ENGINE
============================================================
*/

function initializeVEDASControl() {

    ControlEngine.init();

}


/*
============================================================
DOM READY
============================================================
*/

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeVEDASControl,
        {
            once: true
        }
    );

}

else {

    initializeVEDASControl();

}


/*
============================================================
GLOBAL
============================================================
*/

window.VEDASControl =
    ControlEngine;


/*
============================================================
READY
============================================================
*/

console.log(
    "VEDAS ControlEngine v6.2 loaded."
);