/* global __dirname */

var ATTRIBUTE_PROJECT_ID = "data-project-id";
var ATTRIBUTE_PROJECT_NAME = "data-project-name";

var fs = require("fs");
var path = require("path");
var fade = require("domfx/fade");
var each = require("enjoy-core/each");
var format = require("vrep").format;

var itemTemplate = "" + fs.readFileSync(path.join(__dirname, "../templates/projectListItem.html"));

function create (context) {
    
    var element, content, projects;
    
    function init () {
        
        element = context.getElement();
        content = element.querySelector(".content");
        projects = context.getService("project");
        
        updateProjectList();
        
        setTimeout(function () {
            context.broadcast("goToRealm", "projects");
        }, 10);
    }
    
    function updateProjectList () {
        
        var text = "";
        var data = projects.getProjectInfos();
        
        each(function (item) {
            text += format(itemTemplate, {
                path: projects.getProjectFolder(item.name),
                name: item.name,
                id: item.__toothrotBuilder ? item.__toothrotBuilder.projectId : item.name
            });
        }, data);
        
        content.innerHTML = text;
    }
    
    function destroy () {
        element = null;
        content = null;
        projects = null;
    }
    
    function handleClick (event, element, elementType) {
        if (elementType === "project") {
            context.broadcast("changeToProject", {
                id: element.getAttribute(ATTRIBUTE_PROJECT_ID),
                name: element.getAttribute(ATTRIBUTE_PROJECT_NAME)
            });
            context.broadcast("goToRealm", "editor");
        }
    }
    
    function handleRealmChange (realm) {
        if (realm === "projects") {
            fade.in(element, 0);
        }
        else {
            fade.out(element, 0);
        }
    }
    
    return {
        behaviors: ["projectControl"],
        init: init,
        destroy: destroy,
        onmessage: {
            "projectCreated": updateProjectList,
            "projectDeleted": updateProjectList,
            "goToRealm": handleRealmChange
        },
        onclick: handleClick
    };
}

module.exports = create;
