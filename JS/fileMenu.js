"use strict";

const FileMenu = {

    init() {

        const fileMenu =
            document.querySelector(".fileMenu");

        if (!fileMenu) return;

        fileMenu.addEventListener("click", event => {

            const item =
                event.target.closest(".dropdownItem");

            if (!item) return;

            const action =
                item.dataset.action;

            this.handleAction(action);

            fileMenu.classList.remove("open");

        });

    },


    handleAction(action) {

        switch (action) {

            case "openWorkspace":
                ProjectEngine.openWorkspace();
                break;

            case "refreshWorkspace":
                ProjectEngine.refresh();
                break;

            case "newFile":
                FileEngine.newFile();
                break;

            case "newFolder":
                FileEngine.newFolder();
                break;

            case "saveFile":
                FileEngine.saveFile();
                break;

            case "rename":
                FileEngine.rename();
                break;

            case "delete":
                FileEngine.delete();
                break;

            case "closeWorkspace":
                ProjectEngine.closeWorkspace();
                break;

            default:
                console.warn(
                    "Unknown FILE action:",
                    action
                );

        }

    }

};


if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        () => FileMenu.init(),
        { once: true }
    );

} else {

    FileMenu.init();

}
