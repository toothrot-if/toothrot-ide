
var prompt = require("../ui/prompt");
var confirm = require("../ui/confirm");
var newFileDialog = require("../ui/newFileDialog");

function create (app) {
    
    var logger = app.getService("logging");
    
    function enterProjectName (then) {
        
        logger.log("Showing project name dialog...");
        
        prompt({
            title: "Choose a project name",
            message: "What should the project be called?",
            placeholder: "Project name",
            onAccept: onAccept,
            onClose: onClose
        });
        
        function onAccept (value) {
            
            logger.log("Project name dialog closed.");
            
            if (value) {
                then(null, value);
            }
            else {
                then(new Error("No project name supplied."));
            }
        }
        
        function onClose () {
            onAccept();
        }
    }
    
    //
    // isAllowedFileName(fileName, fileType)
    // then(error, values)
    //
    function showNewFileDialog(isAllowedFileName, fileTypes, then) {
        
        logger.log("Opening new file dialog...");
        
        newFileDialog({
            onAccept: onAccept,
            onClose: onClose,
            isAllowedFileName: isAllowedFileName,
            fileTypes: fileTypes
        });
        
        function onAccept(values) {
            logger.log("New file dialog accepted.");
            then(null, {
                fileType: values.fileType,
                fileName: values.fileName
            });
        }
        
        function onClose() {
            logger.log("New file dialog canceled.");
            then(new Error("Dialog canceled."));
        }
    }
    
    function confirmDeleteProject (name, then) {
        
        logger.log("Showing delete project dialog...");
        
        confirm({
            title: "Delete project?",
            message: "Do you really want to delete project '" + name + "'? This cannot be undone!",
            okText: "Yes, delete the project",
            onAccept: onAccept,
            onClose: onClose
        });
        
        function onAccept () {
            logger.log("Delete project dialog accepted.");
            then(true);
        }
        
        function onClose () {
            logger.log("Delete project dialog closed.");
            then(false);
        }
    }
    
    function confirmDiscardChanges(then) {
        
        logger.log("Showing discard changes dialog...");
        
        confirm({
            title: "Discard changes?",
            message: "There are unsaved changes! Do you wish to discard them?",
            okText: "Yes, discard the changes",
            onAccept: onAccept,
            onClose: onClose
        });
        
        function onAccept () {
            logger.log("Discard changes dialog accepted.");
            then(true);
        }
        
        function onClose () {
            logger.log("Discard changes dialog closed.");
            then(false);
        }
    }
    
    function confirmDeleteFile(fileName, then) {
        
        logger.log("Showing delete file dialog...");
        
        confirm({
            title: "Delete file?",
            message: "Do you really want to delete '" + fileName + "'? This can't be undone!",
            okText: "Yes, delete the file",
            onAccept: onAccept,
            onClose: onClose
        });
        
        function onAccept () {
            logger.log("Delete file dialog accepted.");
            then(true);
        }
        
        function onClose () {
            logger.log("Delete file dialog closed.");
            then(false);
        }
    }
    
    return {
        enterProjectName: enterProjectName,
        confirmDeleteProject: confirmDeleteProject,
        confirmDiscardChanges: confirmDiscardChanges,
        confirmDeleteFile: confirmDeleteFile,
        showNewFileDialog: showNewFileDialog
    };
}

module.exports = create;
