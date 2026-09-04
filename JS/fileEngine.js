"use strict";

/*
============================================================
VEDAS FILE ENGINE v2.0
============================================================

RESPONSIBLE FOR:
✓ FILE menu
✓ New File
✓ New Folder
✓ Open file
✓ Save file
✓ Rename file/folder
✓ Delete file/folder
✓ Workspace tree rendering
✓ Opening files through VEDASEditor

DOES NOT:
✗ Initialize CodeMirror
✗ Configure CodeMirror
✗ Change CodeMirror mode
✗ Execute programs
✗ Compile programs
✗ Manage workspace selection

DEPENDENCIES:
    ProjectEngine
    VEDASEditor

============================================================
*/


/* ============================================================
   FILE MENU
============================================================ */

const FileMenu = {

    init() {

        const menu =
            document.querySelector(".fileMenu");

        if (!menu) {
            console.warn(
                "VEDAS FileEngine: .fileMenu not found."
            );
            return;
        }

        menu.addEventListener(
            "click",
            event => {

                const item =
                    event.target.closest(".dropdownItem");


                /*
                --------------------------------------------
                DROPDOWN ITEM
                --------------------------------------------
                */

                if (item) {

                    event.stopPropagation();

                    const action =
                        item.dataset.action;

                    if (action) {
                        this.handleAction(action);
                    }

                    menu.classList.remove("open");

                    return;
                }


                /*
                --------------------------------------------
                FILE BUTTON
                --------------------------------------------
                */

                if (
                    event.target === menu ||
                    event.target.closest(".fileMenu") === menu
                ) {

                    menu.classList.toggle("open");

                }

            }
        );


        /*
        --------------------------------------------
        CLICK OUTSIDE
        --------------------------------------------
        */

        document.addEventListener(
            "click",
            event => {

                if (!menu.contains(event.target)) {

                    menu.classList.remove(
                        "open"
                    );

                }

            }
        );

    },


    handleAction(action) {

        switch (action) {

            case "openWorkspace":
                this.call(
                    window.ProjectEngine,
                    "openWorkspace"
                );
                break;


            case "refreshWorkspace":
                this.call(
                    window.ProjectEngine,
                    "refresh"
                );
                break;


            case "newFile":
                window.FileEngine?.newFile();
                break;


            case "newFolder":
                window.FileEngine?.newFolder();
                break;


            case "saveFile":
                window.FileEngine?.saveCurrent();
                break;


            case "rename":
                window.FileEngine?.rename();
                break;


            case "delete":
                window.FileEngine?.delete();
                break;


            case "closeWorkspace":
                this.call(
                    window.ProjectEngine,
                    "closeWorkspace"
                );
                break;

        }

    },


    call(object, method) {

        if (
            object &&
            typeof object[method] === "function"
        ) {

            object[method]();

        }

    }

};


/* ============================================================
   FILE ENGINE
============================================================ */

const FileEngine = {

    workspace: null,

    currentFile: null,

    currentDirectory: null,


    /* ========================================================
       INITIALIZE
    ======================================================== */

    init() {

        console.log(
            "VEDAS FileEngine v2.0 ready."
        );

    },


    /* ========================================================
       WORKSPACE
    ======================================================== */

    setWorkspace(handle) {

        this.workspace =
            handle || null;

        this.currentDirectory =
            this.workspace;

        this.currentFile =
            null;

    },


    getWorkspace() {

        return this.workspace;

    },


    /* ========================================================
       TREE
    ======================================================== */

    async renderTree(
        container,
        directory = this.workspace
    ) {

        if (!container) {
            return;
        }

        if (!directory) {

            container.textContent =
                "No Workspace";

            return;
        }

        container.replaceChildren();

        await this.renderDirectory(
            directory,
            container
        );

    },


    async renderDirectory(
        directory,
        container
    ) {

        const entries = [];


        for await (
            const entry
            of directory.values()
        ) {

            entries.push(entry);

        }


        entries.sort(
            (a, b) => {

                if (
                    a.kind !==
                    b.kind
                ) {

                    return (
                        a.kind ===
                        "directory"
                    )
                        ? -1
                        : 1;

                }

                return a.name.localeCompare(
                    b.name
                );

            }
        );


        for (
            const entry
            of entries
        ) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "projectFileItem";


            item.textContent =
                entry.kind ===
                "directory"

                    ? "📁 " +
                      entry.name

                    : "📄 " +
                      entry.name;


            item.dataset.name =
                entry.name;


            item.dataset.type =
                entry.kind;


            container.appendChild(
                item
            );


            /*
            --------------------------------------------
            FILE
            --------------------------------------------
            */

            if (
                entry.kind ===
                "file"
            ) {

                item.addEventListener(
                    "dblclick",
                    async () => {

                        await this.openFile(
                            entry.name,
                            directory
                        );

                    }
                );

            }


            /*
            --------------------------------------------
            FOLDER
            --------------------------------------------
            */

            else {

                item.addEventListener(
                    "dblclick",
                    async () => {

                        try {

                            const folder =
                                await directory
                                    .getDirectoryHandle(
                                        entry.name
                                    );


                            const child =
                                document.createElement(
                                    "div"
                                );


                            child.className =
                                "projectFolder";


                            container.appendChild(
                                child
                            );


                            await this.renderDirectory(
                                folder,
                                child
                            );

                        }
                        catch(error) {

                            this.error(
                                error
                            );

                        }

                    }
                );

            }

        }

    },


    /* ========================================================
       REFRESH
    ======================================================== */

    async refresh() {

        if (
            window.ProjectEngine &&
            typeof window.ProjectEngine.refresh ===
                "function"
        ) {

            await window.ProjectEngine.refresh();

            return;

        }


        const tree =
            document.getElementById(
                "projectTree"
            );


        if (tree) {

            await this.renderTree(
                tree
            );

        }

    },


    /* ========================================================
       OPEN FILE
    ======================================================== */

    async openFile(
        name,
        directory = this.currentDirectory
    ) {

        if (!directory) {

            this.error(
                "No workspace selected."
            );

            return;

        }


        try {

            const handle =
                await directory.getFileHandle(
                    name
                );


            const file =
                await handle.getFile();


            const text =
                await file.text();


            this.currentFile =
                name;


            this.currentDirectory =
                directory;


            /*
            --------------------------------------------
            VEDAS EDITOR API ONLY
            --------------------------------------------
            */

            if (
                window.VEDASEditor &&
                typeof window.VEDASEditor.setCode ===
                    "function"
            ) {

                window.VEDASEditor.setCode(
                    text
                );

            }

            else {

                const textarea =
                    document.getElementById(
                        "code"
                    );


                if (textarea) {

                    textarea.value =
                        text;

                }

            }


            if (
                window.CLEngine &&
                typeof window.CLEngine.setStatus ===
                    "function"
            ) {

                window.CLEngine.setStatus(
                    "OPENED " + name
                );

            }

            return text;

        }
        catch(error) {

            this.error(
                error
            );

        }

    },


    /* ========================================================
       NEW FILE
    ======================================================== */

    async newFile() {

        if (!this.workspace) {

            this.error(
                "Open a workspace first."
            );

            return;

        }


        const name =
            prompt(
                "Enter new file name:",
                "main.py"
            );


        if (!name) {
            return;
        }


        const cleanName =
            name.trim();


        if (!cleanName) {
            return;
        }


        try {

            await this.currentDirectory
                .getFileHandle(
                    cleanName,
                    {
                        create: true
                    }
                );


            this.currentFile =
                cleanName;


            await this.refresh();


            this.status(
                "NEW FILE " +
                cleanName
            );

        }
        catch(error) {

            this.error(
                error
            );

        }

    },


    /* ========================================================
       NEW FOLDER
    ======================================================== */

    async newFolder() {

        if (!this.workspace) {

            this.error(
                "Open a workspace first."
            );

            return;

        }


        const name =
            prompt(
                "Enter new folder name:",
                "New Folder"
            );


        if (!name) {
            return;
        }


        const cleanName =
            name.trim();


        if (!cleanName) {
            return;
        }


        try {

            await this.currentDirectory
                .getDirectoryHandle(
                    cleanName,
                    {
                        create: true
                    }
                );


            await this.refresh();


            this.status(
                "NEW FOLDER " +
                cleanName
            );

        }
        catch(error) {

            this.error(
                error
            );

        }

    },


    /* ========================================================
       SAVE CURRENT FILE
    ======================================================== */

    async saveCurrent() {

        if (!this.currentFile) {

            /*
            If no file is currently open,
            ask for a filename.
            */

            const name =
                prompt(
                    "Enter file name:",
                    "main.py"
                );


            if (!name) {
                return;
            }


            this.currentFile =
                name.trim();

        }


        if (!this.currentDirectory) {

            this.error(
                "No workspace selected."
            );

            return;

        }


        try {

            const code =
                window.VEDASEditor &&
                typeof window.VEDASEditor.getCode ===
                    "function"

                    ? window.VEDASEditor.getCode()

                    : (
                        document.getElementById(
                            "code"
                        )?.value || ""
                    );


            await this.saveFile(
                this.currentFile,
                code,
                this.currentDirectory
            );


            this.status(
                "SAVED " +
                this.currentFile
            );


            await this.refresh();

        }
        catch(error) {

            this.error(
                error
            );

        }

    },


    /* ========================================================
       SAVE FILE
    ======================================================== */

    async saveFile(
        name,
        content,
        directory = this.currentDirectory
    ) {

        if (!directory) {

            throw new Error(
                "No workspace selected."
            );

        }


        const handle =
            await directory.getFileHandle(
                name,
                {
                    create: true
                }
            );


        const writable =
            await handle.createWritable();


        await writable.write(
            String(
                content ?? ""
            )
        );


        await writable.close();


        return true;

    },


    /* ========================================================
       RENAME
    ======================================================== */

    async rename() {

        if (!this.currentFile) {

            this.error(
                "Open/select a file first."
            );

            return;

        }


        const newName =
            prompt(
                "Enter new name:",
                this.currentFile
            );


        if (!newName) {
            return;
        }


        const cleanName =
            newName.trim();


        if (
            !cleanName ||
            cleanName ===
            this.currentFile
        ) {

            return;

        }


        try {

            await this.renameEntry(
                this.currentFile,
                cleanName,
                this.currentDirectory
            );


            this.currentFile =
                cleanName;


            this.status(
                "RENAMED " +
                cleanName
            );


            await this.refresh();

        }
        catch(error) {

            this.error(
                error
            );

        }

    },


    /* ========================================================
       RENAME ENTRY
    ======================================================== */

    async renameEntry(
        oldName,
        newName,
        directory = this.currentDirectory
    ) {

        if (!directory) {

            throw new Error(
                "No workspace selected."
            );

        }


        /*
        Try file first.
        */

        try {

            const oldHandle =
                await directory.getFileHandle(
                    oldName
                );


            const file =
                await oldHandle.getFile();


            const content =
                await file.arrayBuffer();


            const newHandle =
                await directory.getFileHandle(
                    newName,
                    {
                        create: true
                    }
                );


            const writable =
                await newHandle.createWritable();


            await writable.write(
                content
            );


            await writable.close();


            await directory.removeEntry(
                oldName
            );


            return true;

        }
        catch(fileError) {

            /*
            If it wasn't a file,
            try directory.
            */

            const oldFolder =
                await directory
                    .getDirectoryHandle(
                        oldName
                    );


            /*
            File System Access API has
            no native rename operation.

            Copying folders recursively is
            therefore required.
            */

            await this.copyDirectory(
                oldFolder,
                directory,
                newName
            );


            await directory.removeEntry(
                oldName,
                {
                    recursive: true
                }
            );


            return true;

        }

    },


    /* ========================================================
       COPY DIRECTORY
    ======================================================== */

    async copyDirectory(
        source,
        parent,
        newName
    ) {

        const target =
            await parent.getDirectoryHandle(
                newName,
                {
                    create: true
                }
            );


        for await (
            const entry
            of source.values()
        ) {

            if (
                entry.kind ===
                "file"
            ) {

                const file =
                    await entry.getFile();


                const buffer =
                    await file.arrayBuffer();


                const newFile =
                    await target
                        .getFileHandle(
                            entry.name,
                            {
                                create: true
                            }
                        );


                const writable =
                    await newFile.createWritable();


                await writable.write(
                    buffer
                );


                await writable.close();

            }

            else {

                await this.copyDirectory(
                    await source
                        .getDirectoryHandle(
                            entry.name
                        ),
                    target,
                    entry.name
                );

            }

        }

    },


    /* ========================================================
       DELETE
    ======================================================== */

    async delete() {

        if (!this.currentFile) {

            this.error(
                "Open/select a file first."
            );

            return;

        }


        const confirmed =
            confirm(
                "Delete \"" +
                this.currentFile +
                "\"?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await this.deleteEntry(
                this.currentFile,
                this.currentDirectory
            );


            this.currentFile =
                null;


            if (
                window.VEDASEditor &&
                typeof window.VEDASEditor.clear ===
                    "function"
            ) {

                window.VEDASEditor.clear();

            }


            await this.refresh();


            this.status(
                "DELETED"
            );

        }
        catch(error) {

            this.error(
                error
            );

        }

    },


    /* ========================================================
       DELETE ENTRY
    ======================================================== */

    async deleteEntry(
        name,
        directory = this.currentDirectory,
        recursive = true
    ) {

        if (!directory) {

            throw new Error(
                "No workspace selected."
            );

        }


        await directory.removeEntry(
            name,
            {
                recursive
            }
        );

    },


    /* ========================================================
       CURRENT FILE
    ======================================================== */

    getCurrentFile() {

        return this.currentFile;

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
                "VEDAS:",
                message
            );

        }

    },


    /* ========================================================
       ERROR
    ======================================================== */

    error(error) {

        const message =
            error instanceof Error
                ? error.message
                : String(error);


        console.error(
            "VEDAS FileEngine:",
            error
        );


        if (
            window.CLEngine &&
            typeof window.CLEngine.setStatus ===
                "function"
        ) {

            window.CLEngine.setStatus(
                "FILE ERROR"
            );

        }


        alert(
            "VEDAS FILE ENGINE\n\n" +
            message
        );

    }

};


/* ============================================================
   GLOBAL
============================================================ */

window.FileEngine =
    FileEngine;

window.FileMenu =
    FileMenu;


/* ============================================================
   START
============================================================ */

function initializeVEDASFileEngine() {

    FileEngine.init();

    FileMenu.init();

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeVEDASFileEngine,
        {
            once: true
        }
    );

}
else {

    initializeVEDASFileEngine();

}