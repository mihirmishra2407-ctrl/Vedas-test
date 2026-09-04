"use strict";

/**
 * ============================================================
 *  VEDAS FORMAT ENGINE v2.0
 *  HIGH-PERFORMANCE MULTI-LANGUAGE FORMATTER
 * ============================================================
 */

const FormatEngine = {
    busy: false,

    /**
     * MAIN FORMAT INTERFACE
     */
    format(language) {
        if (this.busy) return false;

        const lang = this.normalizeLanguage(language);
        const code = this.getCode();

        if (code === null) {
            this.status("EDITOR OFFLINE");
            return false;
        }

        if (!code.trim()) {
            this.status("EDITOR EMPTY");
            return false;
        }

        this.busy = true;

        try {
            let formatted;

            switch (lang) {
                case "python":
                    formatted = this.formatPython(code);
                    break;
                case "html":
                    formatted = this.formatHTML(code);
                    break;
                case "css":
                    formatted = this.formatCSS(code);
                    break;
                case "javascript":
                case "c":
                case "cpp":
                case "java":
                    formatted = this.formatBraceLanguage(code, lang);
                    break;
                default:
                    this.status("FORMAT UNSUPPORTED");
                    return false;
            }

            this.setCode(formatted);
            this.status(`${lang.toUpperCase()} FORMATTED`);
            return true;

        } catch (error) {
            console.error("VEDAS FormatEngine Error:", error);
            this.status("FORMAT FAILED");
            return false;
        } finally {
            this.busy = false;
        }
    },

    /**
     * BULLETPROOF LANGUAGE SELECTOR
     */
    normalizeLanguage(language) {
        // Strip out all potential internal layout line-breaks and formatting tabs
        const value = String(language || "").replace(/\s+/g, "").toLowerCase();
        
        const aliases = {
            "py": "python",
            "python3": "python",
            "python": "python", // Explicit matching security patch
            "htm": "html",
            "web": "html",
            "html5": "html",
            "js": "javascript",
            "javascript": "javascript",
            "node": "javascript",
            "cxx": "cpp",
            "c++": "cpp",
            "cpp": "cpp",
            "c": "c",
            "j": "java",
            "java": "java",
            "css": "css"
        };

        return aliases[value] || "javascript"; // Default fallback match
    },

    /**
     * EDITOR DATA BRIDGE
     */
    getCode() {
        if (window.VEDASEditor && typeof window.VEDASEditor.getCode === "function") {
            return String(window.VEDASEditor.getCode());
        }
        const textarea = document.getElementById("code");
        return textarea ? String(textarea.value || "") : null;
    },

    setCode(code) {
        if (window.VEDASEditor && typeof window.VEDASEditor.setCode === "function") {
            window.VEDASEditor.setCode(String(code));
            return true;
        }
        const textarea = document.getElementById("code");
        if (textarea) {
            textarea.value = String(code);
            return true;
        }
        throw new Error("VEDAS Editor context missing.");
    },

    /**
     * PYTHON INDENTATION PROCESSING
     */
    formatPython(code) {
        const lines = code.replace(/\r\n/g, "\n").split("\n");
        let indent = 0;
        const output = [];

        for (let raw of lines) {
            let line = raw.trim();
            if (!line) {
                output.push("");
                continue;
            }

            if (/^(elif|else|except|finally)\b/.test(line)) {
                indent = Math.max(0, indent - 1);
            }

            output.push("    ".repeat(indent) + line);

            if (/:(\s*#.*)?$/.test(line) && !/^\s*#/.test(line)) {
                indent++;
            }
        }
        return output.join("\n");
    },

    /**
     * CLEAN CLEANUP-BASED HTML ENGINE
     */
    formatHTML(code) {
        const cleaned = code.replace(/>\s+</g, "><").replace(/\r\n/g, "\n").trim();
        const tokens = cleaned.replace(/(<[^>]+>)/g, "\n$1\n").split("\n").map(x => x.trim()).filter(Boolean);
        let indent = 0;
        const output = [];
        
        const selfClosingTags = new Set(["meta","link","input","img","br","hr","source","area","base","col","embed","param","track","wbr"]);

        for (const token of tokens) {
            if (/^<\//.test(token)) {
                indent = Math.max(0, indent - 1);
            }

            output.push("    ".repeat(indent) + token);

            const match = token.match(/^<([a-zA-Z0-9-]+)\b/);
            if (match && !/^<\//.test(token) && !/\/>$/.test(token) && !selfClosingTags.has(match[1].toLowerCase())) {
                indent++;
            }
        }
        return output.join("\n");
    },

    /**
     * STRUCTURAL CSS ENGINE
     */
    formatCSS(code) {
        return code
            .replace(/\s*([{\};])\s*/g, "$1") // Strip spaces around syntax tokens
            .replace(/{/g, " {\n")
            .replace(/}/g, "\n}\n")
            .replace(/;/g, ";\n")
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean)
            .reduce((acc, line) => {
                if (line.startsWith("}")) acc.indent = Math.max(0, acc.indent - 1);
                acc.lines.push("    ".repeat(acc.indent) + line);
                if (line.endsWith("{")) acc.indent++;
                return acc;
            }, { indent: 0, lines: [] })
            .lines.join("\n");
    },

    /**
     * RE-ENGINEERED LINE-BY-LINE BRACE COMPILER
     */
    formatBraceLanguage(code, lang) {
        const cleaned = code
            .replace(/\s*([\{\};])\s*/g, "$1") 
            .replace(/\{/g, " {\n")
            .replace(/\}/g, "\n}\n")
            .replace(/;/g, ";\n")
            .replace(/\}\s*else/g, "}\nelse")
            .replace(/\}\s*catch/g, "}\ncatch");

        const rawLines = cleaned.split("\n");
        let indent = 0;
        const output = [];

        for (let line of rawLines) {
            line = line.trim();
            if (!line) continue;

            if ((lang === "c" || lang === "cpp") && line.startsWith("#")) {
                output.push(line);
                continue;
            }

            if (line.startsWith("}")) {
                indent = Math.max(0, indent - 1);
            }

            output.push("    ".repeat(indent) + line);

            if (line.endsWith("{")) {
                indent++;
            }
        }

        return output.join("\n");
    },

    /**
     * GLOBAL SYSTEM RUNTIME MESSAGING
     */
    status(message) {
        if (window.CLEngine && typeof window.CLEngine.setStatus === "function") {
            window.CLEngine.setStatus(message);
        } else {
            console.log(`[VEDAS SYSTEM STATUS]: ${message}`);
        }
    }
};

window.FormatEngine = FormatEngine;
console.log("VEDAS Engine v2.0 Initialization Successful.");
