"use strict";

/*
============================================================
VEDAS PROJECT ENGINE v1.0
============================================================
RESPONSIBLE FOR:
✓ Workspace selection
✓ Workspace state
✓ Project name
✓ Project switching/closing
✓ Project tree refresh
✓ FileEngine coordination

DOES NOT:
✗ Control CodeMirror
✗ Execute programs
✗ Compile programs
============================================================
*/

const ProjectEngine = {

    state: {
        workspace: null,
        name: "",
        open: false
    },

    elements: {},

    init() {
        this.cache();
        this.bind();
        this.updateUI();
        console.log("VEDAS ProjectEngine v1.0 ready.");
    },

    cache() {
        this.elements = {
            projectPanel: document.getElementById("project"),
            projectName: document.getElementById("projectName"),
            projectTree: document.getElementById("projectTree"),
            openWorkspace: document.getElementById("openWorkspace"),
            closeWorkspace: document.getElementById("closeWorkspace"),
            refreshProject: document.getElementById("refreshProject")
        };
    },

    bind() {
        this.elements.openWorkspace?.addEventListener(
            "click",
            () => this.openWorkspace()
        );

        this.elements.closeWorkspace?.addEventListener(
            "click",
            () => this.closeWorkspace()
        );

        this.elements.refreshProject?.addEventListener(
            "click",
            () => this.refresh()
        );
    },

    async openWorkspace() {

        if (!window.showDirectoryPicker) {
            this.message(
                "Your browser does not support workspace access."
            );
            return;
        }

        try {

            const handle =
                await window.showDirectoryPicker({
                    mode: "readwrite"
                });

            this.state.workspace = handle;
            this.state.name = handle.name;
            this.state.open = true;

            this.updateUI();

            await FileEngine.setWorkspace(handle);

            await this.refresh();

            this.message(
                "Workspace opened: " + handle.name
            );

        } catch (error) {

            if (error.name !== "AbortError") {
                console.error(
                    "ProjectEngine:",
                    error
                );
            }

        }
    },

    async refresh() {

        if (!this.state.workspace) {
            this.updateUI();
            return;
        }

        await FileEngine.renderTree(
            this.elements.projectTree
        );
    },

    closeWorkspace() {

        this.state.workspace = null;
        this.state.name = "";
        this.state.open = false;

        FileEngine.setWorkspace(null);

        if (this.elements.projectTree) {
            this.elements.projectTree.replaceChildren();
        }

        this.updateUI();
        this.message("Workspace closed.");
    },

    updateUI() {

        if (this.elements.projectName) {

            this.elements.projectName.textContent =
                this.state.open
                    ? this.state.name
                    : "No Workspace";

        }

    },

    message(text) {

        if (window.CLEngine?.setStatus) {
            window.CLEngine.setStatus(text);
        }

        console.log("VEDAS:", text);
    },

    getWorkspace() {
        return this.state.workspace;
    },

    getState() {
        return {
            open: this.state.open,
            name: this.state.name
        };
    }

};

window.ProjectEngine = ProjectEngine;

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        () => ProjectEngine.init(),
        { once: true }
    );

} else {

    ProjectEngine.init();

}