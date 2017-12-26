
var domglue = require("domglue");
var insertLinks = require("../utils/locationMarkers").insert;
var parseLocations = require("../utils/locationMarkers").parse;

var ERROR_LINK_TYPE = "errorLink";
var LOCATION_LINK_TYPE = "locationLink";

var FILE_ATTRIBUTE = "data-file";
var LINE_ATTRIBUTE = "data-line";
var ERROR_OFFSET_ATTRIBUTE = "data-target-offset";

var MESSAGE_KEY = "message";
var MESSAGE_SELECTOR = "[data-key='" + MESSAGE_KEY + "']";

function create(context) {
    
    var element, view, currentErrors, currentOffset;
    var projectChanged = false;
    
    function init() {
        element = context.getElement();
        view = domglue.live(element);
    }
    
    function destroy() {
        
        view.destroy();
        
        view = null;
        element = null;
    }
    
    function showElement() {
        element.classList.add("enabled");
    }
    
    function hideElement() {
        element.classList.remove("enabled");
    }
    
    function updateView(errors, offset, noJump) {
        
        var prevOffset, nextOffset, markers;
        
        offset = errors[offset] ? offset : 0;
        
        prevOffset = offset === 0 ? errors.length - 1 : offset - 1;
        nextOffset = offset === errors.length - 1 ? 0 : offset + 1;
        
        currentErrors = errors;
        currentOffset = offset;
        
        projectChanged = false;
        
        view.update({
            stats: {
                offset: offset + 1,
                count: errors.length
            },
            navigation: {
                previous: {
                    "@data-target-offset": prevOffset,
                    "@data-state": prevOffset === offset ? "disabled" : "enabled"
                },
                next: {
                    "@data-target-offset": nextOffset,
                    "@data-state": nextOffset === offset ? "disabled" : "enabled"
                }
            },
            error: {
                id: errors[offset].id || "Unknown error",
                message: errors[offset].message || "No error message available"
            }
        });
        
        insertLocationLinks(element.querySelector(MESSAGE_SELECTOR));
        
        if (noJump) {
            return;
        }
        
        markers = parseLocations(currentErrors[offset].message);
        
        if (markers.length) {
            context.broadcast("locationLinkClicked", {
                file: markers[markers.length - 1].file,
                line: markers[markers.length - 1].line
            });
        }
    }
    
    function insertLocationLinks(messageContainer) {
        messageContainer.innerHTML = insertLinks(messageContainer.innerText);
    }
    
    function onValidation(errors) {
        if (errors && errors.length) {
            showElement();
            updateView(errors, currentOffset || 0, projectChanged ? false : true);
        }
        else {
            hideElement();
        }
    }
    
    function onProjectChange() {
        projectChanged = true;
        currentOffset = 0;
    }
    
    function onClick(event, target, type) {
        if (type === ERROR_LINK_TYPE) {
            updateView(currentErrors, +target.getAttribute(ERROR_OFFSET_ATTRIBUTE));
        }
        else if (type === LOCATION_LINK_TYPE) {
            context.broadcast("locationLinkClicked", {
                file: target.getAttribute(FILE_ATTRIBUTE),
                line: parseInt(target.getAttribute(LINE_ATTRIBUTE) || 0, 10)
            });
        }
    }
    
    return {
        init: init,
        destroy: destroy,
        onclick: onClick,
        onmessage: {
            storyValidated: onValidation,
            changeToProject: onProjectChange
        }
    };
}

module.exports = create;
