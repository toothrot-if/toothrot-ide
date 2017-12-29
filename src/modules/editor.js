
var crypto = require("crypto");
var fade = require("domfx/fade");
var loader = require("monaco-loader");
var domglue = require("domglue");
var contains = require("enjoy-core/contains");
var privatize = require("enjoy-core/privatize");

var registerLanguage = require("toothrot-monarch").register;

var FILE_TYPES = require("../projectFileTypes");

var DEFAULT_EDITOR_LANGUAGE = FILE_TYPES.STORY.LANGUAGE;
var DEFAULT_STORY_FILE_NAME = "story.trot.md";

var FILE_LIST_TYPE = "fileSelect";
var FILE_LIST_ITEM_TYPE = "fileOption";

var FILE_LIST_SELECTOR = "[data-type='" + FILE_LIST_TYPE + "']";
var EDITOR_FRAME_SELECTOR = ".editor-frame";
var EDITOR_CONTENT_SELECTOR = ".editor-content";

var FILE_GROUP_ATTRIBUTE = "data-file-type";
var FILE_LANGUAGE_ATTRIBUTE = "data-file-language";

var DELETE_BUTTON_TYPE = "deleteFileButton";

var KEY_CODES = {
    KEY_N: 78,
    KEY_S: 83
};

var ERROR_DECORATION_CLASS = "line-error";

var PROTECTED_FILES = ["story.trot.md", "main.html", "pause.html"];

var CREATE_FILE_TYPE = "createFileButton";

function create(context) {
    
    var monaco, editor, element, editorElement, editorFrame, projects, fileList;
    var view, dialogs, changes, logger;
    var oldDecorations = [];
    
    var current = {
        project: null,
        fileName: null,
        fileType: FILE_TYPES.STORY.ID
    };
    
    function init() {
        
        projects = context.getService("project");
        changes = context.getService("changeObserver");
        dialogs = context.getService("dialog");
        logger = context.getService("logging");
        
        logger.log("Initializing module 'editor'...");
        
        element = context.getElement();
        view = domglue.live(element);
        fileList = element.querySelector(FILE_LIST_SELECTOR);
        editorFrame = document.querySelector(EDITOR_FRAME_SELECTOR);
        editorElement = document.querySelector(EDITOR_CONTENT_SELECTOR);
        
        fade.out(element, 0);
        fade.out(editorFrame, 0);
        
        loader().then(function (monacoEditor) {
            
            monaco = monacoEditor;
            
            registerLanguage(monaco);
            
            editor = monaco.editor.create(editorElement, {
                value: "",
                language: DEFAULT_EDITOR_LANGUAGE,
                lineNumbers: true,
                scrollBeyondLastLine: true,
                readOnly: false,
                automaticLayout: true,
                theme: "toothrot",
                dragAndDrop: true,
                folding: true,
                renderWhitespace: "boundary",
                rulers: [100],
                wordWrap: "on",
                minimap: {
                    enabled: false
                }
            });
            
            editor.onDidChangeModelContent(onContentChange);
            editor.onKeyDown(onKeyDown);
            
            logger.log("Monaco editor initialized.");
        });
    }
    
    function destroy() {
        editorElement = null;
        editorFrame = null;
        fileList = null;
        element = null;
        projects = null;
    }
    
    function updateFileControls() {
        
        clearFileList();
        
        Object.keys(FILE_TYPES).forEach(function (id) {
            
            var type = FILE_TYPES[id];
            
            addFileGroup(
                type.LABEL,
                projects.getFileNamesForType(current.project, type.ID),
                type.LANGUAGE,
                type.ID
            );
        });
        
        updateFileButtons();
    }
    
    function updateFileButtons() {
        view.update({
            deleteButton: {
                "@data-state": contains(PROTECTED_FILES, current.fileName) ? "disabled" : "enabled"
            }
        });
    }
    
    function clearFileList() {
        fileList.innerHTML = "";
    }
    
    function addFileGroup(label, files, language, fileType) {
        
        var group = document.createElement("optgroup");
        
        group.setAttribute("label", label);
        group.setAttribute(FILE_GROUP_ATTRIBUTE, fileType);
        
        files.forEach(function (file) {
            
            var option = document.createElement("option");
            
            option.value = file;
            option.innerHTML = file;
            
            if (current.fileName === file) {
                option.setAttribute("selected", "selected");
            }
            
            option.setAttribute("data-type", FILE_LIST_ITEM_TYPE);
            option.setAttribute(FILE_LANGUAGE_ATTRIBUTE, language);
            
            group.appendChild(option);
        });
        
        fileList.appendChild(group);
    }
    
    function openFile(fileName, fileType) {
        
        var value;
        
        fileType = fileType || FILE_TYPES.STORY.ID;
        
        current.fileName = fileName;
        current.fileType = fileType;
        
        if (fileType in FILE_TYPES) {
            value = projects.getFile(current.project, fileType, fileName);
        }
        
        if (typeof value === "string") {
            
            context.broadcast("editorFileOpened", {
                fileName: fileName,
                hash: createHash(value)
            });
            
            editor.setValue(value);
            monaco.editor.setModelLanguage(editor.getModel(), FILE_TYPES[fileType].LANGUAGE);
            
            if (fileType === FILE_TYPES.STORY.ID) {
                validate();
            }
            
            updateFileControls();
        }
    }
    
    function save() {
        
        if (current.fileType in FILE_TYPES) {
            
            projects.saveFile(
                current.project,
                current.fileType,
                current.fileName,
                editor.getValue()
            );
            
            context.broadcast("editorSaved");
            logger.log("File '" + current.fileName + "' saved.");
        }
        else {
            logger.error("Saving failed. Unknown file type '" + current.fileType + "'.");
        }
    }
    
    function deleteFile() {
        if (current.fileType in FILE_TYPES) {
            projects.deleteFile(current.project, current.fileType, current.fileName);
            context.broadcast("fileDeleted");
            logger.log("File '" + current.fileName + "' deleted.");
        }
        else {
            logger.error("Deleting failed. Unknown file type '" + current.fileType + "'.");
        }
    }
    
    function validate() {
        projects.parseStory(current.project, function (errors) {
            displayErrors(errors);
            context.broadcast("storyValidated", errors || []);
        });
    }
    
    function displayErrors(errors) {
        
        var newDecorations = [];
        
        (errors || []).filter(function (error) {
            return error.isToothrotError;
        }).forEach(function (error) {
            
            var locationParts = error.message.split("@");
            var line = parseInt(locationParts.pop(), 10);
            
            var file = locationParts.join("@").split(" ").pop().
                replace("<", "").replace(">", "").replace("(", "").replace(")", "");
            
            if (file === current.fileName) {
                pushLineError(line);
            }
            else if (isHierarchyError(error) && current.fileType === FILE_TYPES.STORY.ID) {
                
                line = findHierarchy();
                
                if (line > 0) {
                    pushLineError(line);
                }
            }
        });
        
        oldDecorations = editor.deltaDecorations(oldDecorations, newDecorations);
        
        function pushLineError(line) {
            newDecorations.push({
                range: new monaco.Range(line, 1, line, 2),
                options: {
                    isWholeLine: true,
                    linesDecorationsClassName: ERROR_DECORATION_CLASS
                }
            });
        }
    }
    
    function isHierarchyError(error) {
        return (
            error.id === "CIRCULAR_HIERARCHY" ||
            error.id === "HIERARCHY_JSON_ERROR"
        );
    }
    
    function findHierarchy() {
        
        var content = editor.getValue();
        
        return content.split("@hierarchy")[0].split("\n").length;
    }
    
    function revealLocation(targetLocation) {
        
        if (current.fileName === targetLocation.file) {
            reveal();
        }
        else {
            ifShouldOpenFile(function () {
                openFile(targetLocation.file);
                reveal();
            });
        }
        
        function reveal() {
            editor.revealRangeAtTop(
                new monaco.Range(targetLocation.line, 1, targetLocation.line, 2)
            );
        }
    }
    
    function isAllowedFileName(fileName, fileType) {
        return (
            fileName &&
            fileType in FILE_TYPES &&
            typeof fileName === "string" &&
            !projects.fileExists(
                current.project,
                fileType,
                fileName + FILE_TYPES[fileType].EXTENSION
            )
        );
    }
    
    function showNewFileDialog() {
        dialogs.showNewFileDialog(
            isAllowedFileName,
            privatize(FILE_TYPES, "__key"),
            function (error, values) {
                
                var fileName;
                
                if (error) {
                    return;
                }
                
                fileName = values.fileName + FILE_TYPES[values.fileType].EXTENSION;
                
                projects.saveFile(current.project, values.fileType, fileName, "");
                openFile(fileName, values.fileType);
            }
        );
    }
    
    function onContentChange() {
        context.broadcast("editorChanged", {
            fileName: current.fileName,
            hash: createHash(editor.getValue())
        });
    }
    
    function handleRealmChange(realm) {
        if (realm === "editor") {
            fade.in(element, 0);
            fade.in(editorFrame, 0);
        }
        else {
            fade.out(element, 0);
            fade.out(editorFrame, 0);
        }
    }
    
    function handleProjectChange(data) {
        
        current.project = data.id;
        current.fileName = DEFAULT_STORY_FILE_NAME;
        
        updateFileControls();
        
        view.update({
           projectTitle: current.project 
        });
        
        editor.setValue(projects.getMainStoryFile(data.id));
        monaco.editor.setModelLanguage(editor.getModel(), FILE_TYPES.STORY.LANGUAGE);
        
        validate();
    }
    
    function handleChange(event, target, type) {
        if (type === FILE_LIST_TYPE) {
            handleOptionClick(target.options[target.selectedIndex]);
        }
    }
    
    function ifShouldOpenFile(then) {
        if (changes.hasUnsavedChanges()) {
            dialogs.confirmDiscardChanges(function (accepted) {
                if (accepted) {
                    then();
                }
                else {
                    updateFileControls();
                }
            });
        }
        else {
            then();
        }
    }
    
    function ifShouldDeleteFile(then) {
        dialogs.confirmDeleteFile(current.fileName, function (accepted) {
            if (accepted) {
                then();
            }
        });
    }
    
    function handleOptionClick(option) {
        ifShouldOpenFile(function () {
            openFile(
                option.value,
                option.parentNode.getAttribute(FILE_GROUP_ATTRIBUTE)
            );
        });
    }
    
    function handleDeleteClick() {
        ifShouldDeleteFile(function () {
            deleteFile();
            openFile(DEFAULT_STORY_FILE_NAME);
        });
    }
    
    function isKeyCodeFor(value, key) {
        return (value === KEY_CODES[key] || value === monaco.KeyCode[key]);
    }
    
    function onKeyDown(event) {
        if (event.ctrlKey && isKeyCodeFor(event.keyCode, "KEY_S")) {
            save();
            validate();
        }
        else if (event.ctrlKey && isKeyCodeFor(event.keyCode, "KEY_N")) {
            showNewFileDialog();
        }
    }
    
    function onClick(event, target, type) {
        if (type === DELETE_BUTTON_TYPE) {
            handleDeleteClick();
        }
        else if (type === CREATE_FILE_TYPE) {
            showNewFileDialog();
        }
    }
    
    function createHash(content) {
        return crypto.createHash("md5").update(content).digest("hex");
    }
    
    return {
        init: init,
        destroy: destroy,
        onchange: handleChange,
        onkeydown: onKeyDown,
        onclick: onClick,
        onmessage: {
            goToRealm: handleRealmChange,
            changeToProject: handleProjectChange,
            locationLinkClicked: revealLocation,
            saveButtonClick: save
        }
    };
}

module.exports = create;
