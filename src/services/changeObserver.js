
function create(app) {
    
    var lastHash, lastFileName;
    
    var storyErrors = false;
    var unsavedChanges = false;
    var logger = app.getService("logging");
    
    var listeners = {
        editorChanged: onEditorChanged,
        editorSaved: onEditorSaved,
        editorFileOpened: onEditorFileOpened,
        changeToProject: onProjectChange,
        storyValidated: onValidation
    };
    
    app.on("message", function (data) {
        
        var channel = data.data.message;
        var payload = data.data.messageData;
        
        if (channel in listeners) {
            listeners[channel](payload);
        }
    });
    
    function hasUnsavedChanges() {
        return unsavedChanges;
    }
    
    function hasStoryErrors() {
        return storyErrors;
    }
    
    function onEditorChanged(data) {
        
        if (data.hash === lastHash) {
            return;
        }
        
        if (data.fileName !== lastFileName) {
            lastHash = data.hash;
            lastFileName = data.fileName;
            return;
        }
        
        lastHash = data.hash;
        unsavedChanges = true;
        
        app.broadcast("projectFilesChanged");
    }
    
    function onEditorSaved() {
        
        unsavedChanges = false;
        
        logger.log("File '" + lastFileName + "' saved.");
        app.broadcast("projectFilesSaved");
    }
    
    function onEditorFileOpened(data) {
        
        unsavedChanges = false;
        lastHash = data.hash;
        lastFileName = data.fileName;
        
        logger.log("File '" + lastFileName + "' opened.");
        
        app.broadcast("projectFilesSaved");
    }
    
    function onProjectChange() {
        unsavedChanges = false;
    }
    
    function onValidation(errors) {
        storyErrors = !!(errors && errors.length);
    }
    
    return {
        hasUnsavedChanges: hasUnsavedChanges,
        hasStoryErrors: hasStoryErrors
    };
}

module.exports = create;
