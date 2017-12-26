
var shell = require("electron").shell;

var ATTRIBUTE_PROJECT_ID = "data-project-id";
var ATTRIBUTE_PROJECT_NAME = "data-project-name";

var SAVE_BUTTON_TYPE = "saveButton";
var RUN_BUTTON_TYPE = "runButton";
var BUILD_BUTTON_TYPE = "buildButton";
var BUILD_DESKTOP_BUTTON_TYPE = "buildDesktopButton";

var SAVE_BUTTON_SELECTOR = "[data-type='" + SAVE_BUTTON_TYPE + "']";
var RUN_BUTTON_SELECTOR = "[data-type='" + RUN_BUTTON_TYPE + "']";
var BUILD_BUTTON_SELECTOR = "[data-type='" + BUILD_BUTTON_TYPE + "']";
var BUILD_DESKTOP_BUTTON_SELECTOR = "[data-type='" + BUILD_DESKTOP_BUTTON_TYPE + "']";

function disableElement(element) {
    element.classList.add("disabled");
}

function enableElement(element) {
    element.classList.remove("disabled");
}

function create (context) {
    
    var projects, dialogs, logger;
    
    function init() {
        
        logger = context.getService("logging");
        projects = context.getService("project");
        dialogs = context.getService("dialog");
        
        disableSaveButtons();
    }
    
    function destroy() {
        projects = null;
        dialogs = null;
    }
    
    function deleteProject (name) {
        dialogs.confirmDeleteProject(name, function (accepted) {
            if (accepted) {
                projects.deleteProject(name);
            }
        });
    }
    
    function handleClick (event, element, elementType) {
        
        var projectName, projectId;
        
        if (!element || !element.getAttribute) {
            return;
        }
        
        projectId = element.getAttribute(ATTRIBUTE_PROJECT_ID);
        projectName = element.getAttribute(ATTRIBUTE_PROJECT_NAME);
        
        if (elementType === "runButton") {
            projects.runProject(projectId);
        }
        else if (elementType === SAVE_BUTTON_TYPE) {
            context.broadcast("saveButtonClick");
        }
        else if (elementType === "openFolderButton") {
            shell.openItem(projects.getProjectFolder(projectId));
        }
        else if (elementType === BUILD_BUTTON_TYPE) {
            projects.buildProject(projectId);
        }
        else if (elementType === BUILD_DESKTOP_BUTTON_TYPE) {
            projects.buildProjectForDesktop(projectId);
        }
        else if (elementType === "deleteButton") {
            deleteProject(projectId);
        }
        else if (elementType === "project") {
            logger.log("Switching to project '" + projectId + "'...");
            context.broadcast("changeToProject", {
                id: projectId,
                name: projectName
            });
            logger.log("Opening editor realm...");
            context.broadcast("goToRealm", "editor");
        }
    }
    
    function getElements(selector) {
        return Array.prototype.slice.call(
            context.getElement().querySelectorAll(selector) || []
        );
    }
    
    function enableElements(selector) {
        getElements(selector).forEach(enableElement);
    }
    
    function disableElements(selector) {
        getElements(selector).forEach(disableElement);
    }
    
    function disableSaveButtons() {
        disableElements(SAVE_BUTTON_SELECTOR);
        logger.log("Save button disabled.");
    }
    
    function enableSaveButtons() {
        enableElements(SAVE_BUTTON_SELECTOR);
        logger.log("Save button enabled.");
    }
    
    function disableRunButtons() {
        disableElements(RUN_BUTTON_SELECTOR);
    }
    
    function enableRunButtons() {
        enableElements(RUN_BUTTON_SELECTOR);
    }
    
    function disableBuildButtons() {
        disableElements(BUILD_BUTTON_SELECTOR);
    }
    
    function enableBuildButtons() {
        enableElements(BUILD_BUTTON_SELECTOR);
    }
    
    function disableBuildDesktopButtons() {
        disableElements(BUILD_DESKTOP_BUTTON_SELECTOR);
    }
    
    function enableBuildDesktopButtons() {
        enableElements(BUILD_DESKTOP_BUTTON_SELECTOR);
    }
    
    function enableAllBuildRelatedButtons() {
        enableRunButtons();
        enableBuildButtons();
        enableBuildDesktopButtons();
        logger.log("Build-related buttons enabled.");
    }
    
    function disableAllBuildRelatedButtons() {
        disableRunButtons();
        disableBuildButtons();
        disableBuildDesktopButtons();
        logger.log("Build-related buttons disabled.");
    }
    
    function handleProjectFilesChange() {
        enableSaveButtons();
        disableAllBuildRelatedButtons();
    }
    
    function handleProjectFilesSaved() {
        disableSaveButtons();
    }
    
    function handleValidation(errors) {
        handleValidationResult(!(errors && errors.length));
    }
    
    function handleValidationResult(valid) {
        if (valid) {
            enableAllBuildRelatedButtons();
        }
        else {
            disableAllBuildRelatedButtons();
        }
    }
    
    return {
        init: init,
        destroy: destroy,
        onclick: handleClick,
        onmessage: {
            projectFilesChanged: handleProjectFilesChange,
            projectFilesSaved: handleProjectFilesSaved,
            storyValidated: handleValidation,
            goToRealm: disableSaveButtons
        }
    };
}

module.exports = create;
