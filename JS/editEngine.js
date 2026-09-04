"use strict";

/*
============================================================
VEDAS EDIT ENGINE v1.1
============================================================

RESPONSIBLE FOR:
✓ EDIT dropdown
✓ Undo
✓ Redo
✓ Cut
✓ Copy
✓ Paste
✓ Select All
✓ Find
✓ Replace
✓ Go To Line
✓ Save
✓ Ctrl + S
✓ Keyboard shortcuts

DOES NOT:
✗ Initialize CodeMirror
✗ Configure CodeMirror
✗ Execute code
✗ Compile code

EDITOR:
    VEDASEditor

FILE OPERATIONS:
    FileEngine
============================================================
*/

const EditEngine = {

    findText: "",
    replaceText: "",


    /* ========================================================
       INIT
    ======================================================== */

    init() {

        this.bindMenu();
        this.bindKeyboard();

        console.log(
            "VEDAS EditEngine v1.1 READY"
        );

    },


    /* ========================================================
       EDIT MENU
    ======================================================== */

    bindMenu() {

        const editMenu =
            document.querySelector(".editMenu");

        if (!editMenu) {

            console.warn(
                "VEDAS EditEngine: .editMenu NOT FOUND"
            );

            return;

        }


        const menuButton =
            editMenu.querySelector(".menuItem");

        if (!menuButton) {

            console.warn(
                "VEDAS EditEngine: EDIT button NOT FOUND"
            );

            return;

        }


        /* ====================================================
           EDIT BUTTON
        ==================================================== */

        menuButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                this.closeOtherMenus(
                    editMenu
                );

                editMenu.classList.toggle(
                    "open"
                );

            }
        );


        /* ====================================================
           DROPDOWN ITEMS
        ==================================================== */

        editMenu.addEventListener(
            "click",
            event => {

                const item =
                    event.target.closest(
                        ".dropdownItem"
                    );

                if (!item) {
                    return;
                }


                event.stopPropagation();


                const action =
                    item.dataset.action;


                this.handleAction(
                    action
                );


                editMenu.classList.remove(
                    "open"
                );

            }
        );


        /* ====================================================
           OUTSIDE CLICK
        ==================================================== */

        document.addEventListener(
            "click",
            event => {

                if (
                    !editMenu.contains(
                        event.target
                    )
                ) {

                    editMenu.classList.remove(
                        "open"
                    );

                }

            }
        );

    },


    /* ========================================================
       CLOSE OTHER MENUS
    ======================================================== */

    closeOtherMenus(currentMenu) {

        document
            .querySelectorAll(
                ".fileMenu, .editMenu, .viewMenu, .projectMenu, .runMenu, .toolsMenu, .helpMenu"
            )
            .forEach(
                menu => {

                    if (
                        menu !== currentMenu
                    ) {

                        menu.classList.remove(
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

            case "undo":
                this.undo();
                break;


            case "redo":
                this.redo();
                break;


            case "cut":
                this.cut();
                break;


            case "copy":
                this.copy();
                break;


            case "paste":
                this.paste();
                break;


            case "selectAll":
                this.selectAll();
                break;


            case "find":
                this.find();
                break;


            case "replace":
                this.replace();
                break;


            case "gotoLine":
                this.gotoLine();
                break;


            case "save":
                this.save();
                break;

        }

    },


    /* ========================================================
       GET EDITOR
    ======================================================== */

    getEditor() {

        if (
            window.VEDASEditor &&
            typeof window.VEDASEditor.getEditor ===
                "function"
        ) {

            return window.VEDASEditor.getEditor();

        }

        return null;

    },


    /* ========================================================
       UNDO
    ======================================================== */

    undo() {

        const editor =
            this.getEditor();

        if (
            editor &&
            typeof editor.undo ===
                "function"
        ) {

            editor.undo();

            this.status(
                "UNDO"
            );

        }

    },


    /* ========================================================
       REDO
    ======================================================== */

    redo() {

        const editor =
            this.getEditor();

        if (
            editor &&
            typeof editor.redo ===
                "function"
        ) {

            editor.redo();

            this.status(
                "REDO"
            );

        }

    },


    /* ========================================================
       CUT
    ======================================================== */

    cut() {

        document.execCommand(
            "cut"
        );

        this.status(
            "CUT"
        );

    },


    /* ========================================================
       COPY
    ======================================================== */

    copy() {

        document.execCommand(
            "copy"
        );

        this.status(
            "COPIED"
        );

    },


    /* ========================================================
       PASTE
    ======================================================== */

    async paste() {

        try {

            const text =
                await navigator.clipboard.readText();


            const editor =
                this.getEditor();


            if (editor) {

                editor.replaceSelection(
                    text
                );

            }


            this.status(
                "PASTED"
            );

        }

        catch (error) {

            console.warn(
                "Clipboard paste unavailable.",
                error
            );

            this.status(
                "PASTE BLOCKED"
            );

        }

    },


    /* ========================================================
       SELECT ALL
    ======================================================== */

    selectAll() {

        const editor =
            this.getEditor();

        if (!editor) {
            return;
        }


        if (
            typeof editor.execCommand ===
            "function"
        ) {

            editor.execCommand(
                "selectAll"
            );

            this.status(
                "SELECTED ALL"
            );

        }

    },


    /* ========================================================
       FIND
    ======================================================== */

    find() {

        const value =
            window.prompt(
                "Find:",
                this.findText
            );


        if (
            value === null ||
            !value
        ) {

            return;

        }


        this.findText =
            value;


        const editor =
            this.getEditor();


        if (!editor) {
            return;
        }


        if (
            typeof editor.getSearchCursor !==
            "function"
        ) {

            this.status(
                "SEARCH UNAVAILABLE"
            );

            return;

        }


        const cursor =
            editor.getSearchCursor(
                value
            );


        if (
            cursor.findNext()
        ) {

            editor.setSelection(
                cursor.from(),
                cursor.to()
            );


            this.status(
                "FOUND"
            );

        }

        else {

            this.status(
                "NOT FOUND"
            );

        }

    },


    /* ========================================================
       REPLACE
    ======================================================== */

    replace() {

        const findValue =
            window.prompt(
                "Find:",
                this.findText
            );


        if (
            findValue === null ||
            !findValue
        ) {

            return;

        }


        const replaceValue =
            window.prompt(
                "Replace with:",
                this.replaceText
            );


        if (
            replaceValue === null
        ) {

            return;

        }


        this.findText =
            findValue;

        this.replaceText =
            replaceValue;


        const editor =
            this.getEditor();


        if (!editor) {
            return;
        }


        if (
            typeof editor.getSearchCursor !==
            "function"
        ) {

            this.status(
                "REPLACE UNAVAILABLE"
            );

            return;

        }


        const cursor =
            editor.getSearchCursor(
                findValue
            );


        let count = 0;


        while (
            cursor.findNext()
        ) {

            cursor.replace(
                replaceValue
            );

            count++;

        }


        this.status(
            count +
            " REPLACED"
        );

    },


    /* ========================================================
       GO TO LINE
    ======================================================== */

    gotoLine() {

        const editor =
            this.getEditor();


        if (!editor) {
            return;
        }


        const value =
            window.prompt(
                "Go to line:",
                ""
            );


        if (
            value === null
        ) {

            return;

        }


        const number =
            Number(
                value
            );


        if (
            !Number.isInteger(
                number
            ) ||
            number < 1
        ) {

            this.status(
                "INVALID LINE"
            );

            return;

        }


        const target =
            number - 1;


        if (
            target >=
            editor.lineCount()
        ) {

            this.status(
                "LINE NOT FOUND"
            );

            return;

        }


        editor.setCursor(
            target,
            0
        );


        editor.focus();


        this.status(
            "LINE " +
            number
        );

    },


    /* ========================================================
       SAVE
    ======================================================== */

    async save() {

        if (
            window.FileEngine &&
            typeof window.FileEngine.saveCurrentFile ===
                "function"
        ) {

            try {

                await window.FileEngine.saveCurrentFile();

                this.status(
                    "SAVED"
                );

                return;

            }

            catch (error) {

                console.warn(
                    "Current file save failed.",
                    error
                );

            }

        }


        if (
            window.FileEngine &&
            typeof window.FileEngine.saveFile ===
                "function"
        ) {

            const name =
                window.prompt(
                    "Save file as:",
                    "main.txt"
                );


            if (!name) {
                return;
            }


            const code =
                window.VEDASEditor &&
                typeof window.VEDASEditor.getCode ===
                    "function"

                    ? window.VEDASEditor.getCode()

                    : "";


            try {

                await window.FileEngine.saveFile(
                    name,
                    code
                );


                this.status(
                    "SAVED " +
                    name
                );

            }

            catch (error) {

                console.error(
                    error
                );

                this.status(
                    "SAVE ERROR"
                );

            }

        }

        else {

            this.status(
                "FILE ENGINE OFFLINE"
            );

        }

    },


    /* ========================================================
       KEYBOARD SHORTCUTS
    ======================================================== */

    bindKeyboard() {

        document.addEventListener(
            "keydown",
            event => {

                if (!event.ctrlKey) {
                    return;
                }


                const key =
                    event.key.toLowerCase();


                if (
                    key === "z" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    this.undo();

                }


                else if (
                    key === "y"
                ) {

                    event.preventDefault();

                    this.redo();

                }


                else if (
                    key === "s"
                ) {

                    event.preventDefault();

                    this.save();

                }


                else if (
                    key === "f"
                ) {

                    event.preventDefault();

                    this.find();

                }


                else if (
                    key === "h"
                ) {

                    event.preventDefault();

                    this.replace();

                }


                else if (
                    key === "g"
                ) {

                    event.preventDefault();

                    this.gotoLine();

                }

            }
        );

    },


    /* ========================================================
       STATUS
    ======================================================== */

    status(message) {

        if (
            window.CLEngine &&
            typeof window.CLEngine.setStatus ===
                "function"
        ) {

            window.CLEngine.setStatus(
                message
            );

        }

        else {

            console.log(
                "VEDAS EDIT:",
                message
            );

        }

    }

};


/* =========================================================
   START
========================================================= */

function initializeEditEngine() {

    EditEngine.init();

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeEditEngine,
        {
            once: true
        }
    );

}

else {

    initializeEditEngine();

}


/* =========================================================
   GLOBAL
========================================================= */

window.EditEngine =
    EditEngine;


/* =========================================================
   READY
========================================================= */

console.log(
    "VEDAS EDIT ENGINE v1.1 READY"
);