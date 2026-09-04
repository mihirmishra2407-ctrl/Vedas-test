"use strict";

/*
============================================================
VEDAS VIEW ENGINE v2.0
============================================================

RESPONSIBLE FOR:
✓ VIEW dropdown
✓ Toggle Sidebar
✓ Toggle Terminal
✓ Toggle I/O
✓ Zoom In
✓ Zoom Out
✓ Reset Zoom
✓ Full Screen
✓ View state

DOES NOT:
✗ Initialize CodeMirror
✗ Configure CodeMirror
✗ Directly use CodeMirror internals
✗ Execute code
✗ Compile code
✗ Manage files
✗ Manage projects

ARCHITECTURE:

VEDASEditor
    ↓
CodeMirror ONLY

ViewEngine
    ↓
VIEW / UI ONLY

FileEngine
    ↓
FILE operations

ProjectEngine
    ↓
Workspace

CLEngine
    ↓
Code execution
============================================================
*/


const ViewEngine = {

    /* ========================================================
       STATE
    ======================================================== */

    zoom: 100,

    minZoom: 70,

    maxZoom: 150,

    zoomStep: 10,

    sidebarVisible: true,

    terminalVisible: true,

    ioVisible: true,


    /* ========================================================
       INIT
    ======================================================== */

    init() {

        this.bindMenu();

        this.bindKeyboard();

        this.loadState();

        this.applyZoom();

        console.log(
            "VEDAS ViewEngine v2.0 ready."
        );

    },


    /* ========================================================
       MENU
    ======================================================== */

    bindMenu() {

        const viewMenu =
            document.querySelector(
                ".viewMenu"
            );


        if (!viewMenu) {

            console.warn(
                "VEDAS ViewEngine: .viewMenu not found."
            );

            return;

        }


        viewMenu.addEventListener(
            "click",
            event => {

                /*
                VIEW button
                */

                const button =
                    event.target.closest(
                        ".menuItem"
                    );


                if (
                    button &&
                    button.parentElement ===
                        viewMenu
                ) {

                    viewMenu.classList.toggle(
                        "open"
                    );

                    return;

                }


                /*
                Dropdown item
                */

                const item =
                    event.target.closest(
                        ".dropdownItem"
                    );


                if (!item) {
                    return;
                }


                const action =
                    item.dataset.action;


                if (!action) {
                    return;
                }


                this.handleAction(
                    action
                );


                viewMenu.classList.remove(
                    "open"
                );

            }
        );


        /*
        Click outside
        */

        document.addEventListener(
            "click",
            event => {

                if (
                    !viewMenu.contains(
                        event.target
                    )
                ) {

                    viewMenu.classList.remove(
                        "open"
                    );

                }

            }
        );

    },


    /* ========================================================
       ACTION ROUTER
    ======================================================== */

    handleAction(action) {

        switch (action) {

            case "toggleSidebar":

                this.toggleSidebar();

                break;


            case "toggleTerminal":

                this.toggleTerminal();

                break;


            case "toggleIO":

                this.toggleIO();

                break;


            case "zoomIn":

                this.zoomIn();

                break;


            case "zoomOut":

                this.zoomOut();

                break;


            case "resetZoom":

                this.resetZoom();

                break;


            case "fullScreen":

                this.fullScreen();

                break;


            default:

                console.warn(
                    "VEDAS ViewEngine: unknown action:",
                    action
                );

        }

    },


    /* ========================================================
       SIDEBAR
    ======================================================== */

    getSidebar() {

        return (
            document.querySelector(
                ".sidebar"
            ) ||

            document.querySelector(
                "#sidebar"
            )
        );

    },


    toggleSidebar() {

        const sidebar =
            this.getSidebar();


        if (!sidebar) {

            this.status(
                "SIDEBAR NOT FOUND"
            );

            return;

        }


        this.sidebarVisible =
            !this.sidebarVisible;


        if (
            this.sidebarVisible
        ) {

            sidebar.classList.remove(
                "viewHidden"
            );

            sidebar.hidden =
                false;

        }

        else {

            sidebar.classList.add(
                "viewHidden"
            );

            sidebar.hidden =
                true;

        }


        this.saveState();


        this.refreshEditor();


        this.status(
            this.sidebarVisible
                ? "SIDEBAR SHOWN"
                : "SIDEBAR HIDDEN"
        );

    },


    /* ========================================================
       TERMINAL
    ======================================================== */

    getTerminal() {

        return (
            document.querySelector(
                "#terminal"
            ) ||

            document.querySelector(
                ".terminal"
            ) ||

            document.querySelector(
                "#terminalScreen"
            )
        );

    },


    toggleTerminal() {

        const terminal =
            this.getTerminal();


        if (!terminal) {

            this.status(
                "TERMINAL NOT FOUND"
            );

            return;

        }


        this.terminalVisible =
            !this.terminalVisible;


        if (
            this.terminalVisible
        ) {

            terminal.classList.remove(
                "viewHidden"
            );

            terminal.hidden =
                false;

        }

        else {

            terminal.classList.add(
                "viewHidden"
            );

            terminal.hidden =
                true;

        }


        this.saveState();


        this.refreshEditor();


        this.status(
            this.terminalVisible
                ? "TERMINAL SHOWN"
                : "TERMINAL HIDDEN"
        );

    },


    /* ========================================================
       I/O
    ======================================================== */

    getIO() {

        return (
            document.querySelector(
                "#io"
            ) ||

            document.querySelector(
                ".io"
            )
        );

    },


    toggleIO() {

        const io =
            this.getIO();


        if (!io) {

            this.status(
                "I/O NOT FOUND"
            );

            return;

        }


        this.ioVisible =
            !this.ioVisible;


        if (
            this.ioVisible
        ) {

            io.classList.remove(
                "viewHidden"
            );

            io.hidden =
                false;

        }

        else {

            io.classList.add(
                "viewHidden"
            );

            io.hidden =
                true;

        }


        this.saveState();


        this.refreshEditor();


        this.status(
            this.ioVisible
                ? "I/O SHOWN"
                : "I/O HIDDEN"
        );

    },


    /* ========================================================
       ZOOM IN
    ======================================================== */

    zoomIn() {

        if (
            this.zoom >=
            this.maxZoom
        ) {

            this.status(
                "MAX ZOOM"
            );

            return;

        }


        this.zoom +=
            this.zoomStep;


        this.applyZoom();

        this.saveState();


        this.status(
            "ZOOM " +
            this.zoom +
            "%"
        );

    },


    /* ========================================================
       ZOOM OUT
    ======================================================== */

    zoomOut() {

        if (
            this.zoom <=
            this.minZoom
        ) {

            this.status(
                "MIN ZOOM"
            );

            return;

        }


        this.zoom -=
            this.zoomStep;


        this.applyZoom();

        this.saveState();


        this.status(
            "ZOOM " +
            this.zoom +
            "%"
        );

    },


    /* ========================================================
       RESET ZOOM
    ======================================================== */

    resetZoom() {

        this.zoom =
            100;


        this.applyZoom();

        this.saveState();


        this.status(
            "ZOOM 100%"
        );

    },


    /* ========================================================
       APPLY ZOOM
    ======================================================== */

    applyZoom() {

        /*
        IMPORTANT:

        ViewEngine does NOT touch CodeMirror.

        We use a CSS variable on the VEDAS
        application UI.

        VEDASEditor remains the owner
        of CodeMirror.
        */

        const factor =
            this.zoom / 100;


        document.documentElement
            .style
            .setProperty(
                "--vedas-zoom-factor",
                factor
            );


        document.documentElement
            .style
            .setProperty(
                "--vedas-zoom",
                this.zoom + "%"
            );


        document.body.dataset.zoom =
            String(
                this.zoom
            );


        /*
        Tell the editor that its container
        may have changed size.

        We are NOT accessing CodeMirror directly.
        */

        this.refreshEditor();

    },


    /* ========================================================
       EDITOR REFRESH
    ======================================================== */

    refreshEditor() {

        if (
            window.VEDASEditor &&
            typeof
                window.VEDASEditor.refresh ===
                "function"
        ) {

            try {

                window.VEDASEditor.refresh();

            }

            catch (error) {

                console.warn(
                    "VEDAS Editor refresh failed.",
                    error
                );

            }

        }

    },


    /* ========================================================
       FULL SCREEN
    ======================================================== */

    async fullScreen() {

        try {

            if (
                !document.fullscreenElement
            ) {

                await
                    document.documentElement
                        .requestFullscreen();


                this.status(
                    "FULL SCREEN"
                );

            }

            else {

                await
                    document.exitFullscreen();


                this.status(
                    "FULL SCREEN OFF"
                );

            }


            this.refreshEditor();

        }

        catch (error) {

            console.warn(
                "Fullscreen unavailable.",
                error
            );


            this.status(
                "FULL SCREEN BLOCKED"
            );

        }

    },


    /* ========================================================
       KEYBOARD
    ======================================================== */

    bindKeyboard() {

        document.addEventListener(
            "keydown",
            event => {

                /*
                Ctrl + +
                */

                if (
                    event.ctrlKey &&
                    (
                        event.key === "+" ||
                        event.key === "="
                    )
                ) {

                    event.preventDefault();

                    this.zoomIn();

                    return;

                }


                /*
                Ctrl + -
                */

                if (
                    event.ctrlKey &&
                    (
                        event.key === "-" ||
                        event.key === "_"
                    )
                ) {

                    event.preventDefault();

                    this.zoomOut();

                    return;

                }


                /*
                Ctrl + 0
                */

                if (
                    event.ctrlKey &&
                    event.key === "0"
                ) {

                    event.preventDefault();

                    this.resetZoom();

                    return;

                }

            }
        );

    },


    /* ========================================================
       SAVE STATE
    ======================================================== */

    saveState() {

        try {

            localStorage.setItem(
                "vedasViewState",
                JSON.stringify({

                    zoom:
                        this.zoom,

                    sidebarVisible:
                        this.sidebarVisible,

                    terminalVisible:
                        this.terminalVisible,

                    ioVisible:
                        this.ioVisible

                })
            );

        }

        catch (error) {

            console.warn(
                "VEDAS ViewEngine: state save failed.",
                error
            );

        }

    },


    /* ========================================================
       LOAD STATE
    ======================================================== */

    loadState() {

        try {

            const saved =
                localStorage.getItem(
                    "vedasViewState"
                );


            if (!saved) {
                return;
            }


            const state =
                JSON.parse(
                    saved
                );


            if (
                Number.isFinite(
                    state.zoom
                )
            ) {

                this.zoom =
                    Math.min(
                        this.maxZoom,
                        Math.max(
                            this.minZoom,
                            state.zoom
                        )
                    );

            }


            if (
                typeof
                    state.sidebarVisible ===
                    "boolean"
            ) {

                this.sidebarVisible =
                    state.sidebarVisible;

            }


            if (
                typeof
                    state.terminalVisible ===
                    "boolean"
            ) {

                this.terminalVisible =
                    state.terminalVisible;

            }


            if (
                typeof
                    state.ioVisible ===
                    "boolean"
            ) {

                this.ioVisible =
                    state.ioVisible;

            }


            /*
            Apply saved visibility.
            */

            const sidebar =
                this.getSidebar();


            if (sidebar) {

                sidebar.hidden =
                    !this.sidebarVisible;

                sidebar.classList.toggle(
                    "viewHidden",
                    !this.sidebarVisible
                );

            }


            const terminal =
                this.getTerminal();


            if (terminal) {

                terminal.hidden =
                    !this.terminalVisible;

                terminal.classList.toggle(
                    "viewHidden",
                    !this.terminalVisible
                );

            }


            const io =
                this.getIO();


            if (io) {

                io.hidden =
                    !this.ioVisible;

                io.classList.toggle(
                    "viewHidden",
                    !this.ioVisible
                );

            }

        }

        catch (error) {

            console.warn(
                "VEDAS ViewEngine: state load failed.",
                error
            );

        }

    },


    /* ========================================================
       STATUS
    ======================================================== */

    status(message) {

        if (
            window.CLEngine &&
            typeof
                window.CLEngine.setStatus ===
                "function"
        ) {

            window.CLEngine.setStatus(
                message
            );

        }

        else {

            console.log(
                "VEDAS VIEW:",
                message
            );

        }

    }

};


/* ============================================================
   START
============================================================ */

function initializeViewEngine() {

    ViewEngine.init();

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeViewEngine,
        {
            once: true
        }
    );

}

else {

    initializeViewEngine();

}


/* ============================================================
   GLOBAL
============================================================ */

window.ViewEngine =
    ViewEngine;


/*
============================================================
VEDAS VIEW ENGINE v2.0
READY
============================================================
*/