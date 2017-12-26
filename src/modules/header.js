
var each = require("enjoy-core/each");
var fade = require("domfx/fade");
var glue = require("domglue");

var ATTRIBUTE_REALM = "data-realm";

function create (context) {
    
    var dialogs, projects, changes, element, view;
    
    function init() {
        
        element = context.getElement();
        changes = context.getService("changeObserver");
        dialogs = context.getService("dialog");
        projects = context.getService("project");
        
        view = glue.live(element);
    }
    
    function destroy() {
        
        view.destroy();
        
        view = null;
        dialogs = null;
        projects = null;
        element = null;
    }
    
    function addProject() {
        dialogs.enterProjectName(function (error, name) {
            if (name) {
                projects.createProject(name);
            }
        });
    }
    
    function handleClick(event, element, elementType) {
        if (elementType === "addProjectButton") {
            addProject();
        }
        else if (elementType === "goToProjects") {
            if (changes.hasUnsavedChanges()) {
                dialogs.confirmDiscardChanges(function (accepted) {
                    if (accepted) {
                        context.broadcast("goToRealm", "projects");
                    }
                });
            }
            else {
                context.broadcast("goToRealm", "projects");
            }
        }
    }
    
    function handleRealmChange(realm) {
        each(fade.out, element.querySelectorAll("[" + ATTRIBUTE_REALM + "]"));
        setTimeout(function () {
            each(fade.in, element.querySelectorAll("[" + ATTRIBUTE_REALM + "='" + realm + "']"));
        }, 100);
    }
    
    function handleProjectChange(data) {
        view.update({
            name: data.name,
            button: {
                "@data-project-id": data.id,
                "@data-project-name": data.name
            }
        });
    }
    
    return {
        behaviors: ["projectControl"],
        init: init,
        destroy: destroy,
        onclick: handleClick,
        onmessage: {
            goToRealm: handleRealmChange,
            changeToProject: handleProjectChange
        }
    };
    
}

module.exports = create;
