/* global __dirname */

var ENTER_KEY = 13;
var ESC_KEY = 27;

var fs = require("fs");
var format = require("vrep").format;
var path = require("path");
var dialog = require("./dialog");
var template = "" + fs.readFileSync(path.join(__dirname, "/../templates/prompt.html"));


function prompt (options) {
    
    var config = options || {};
    
    var values = {
        title: config.title || "",
        message: config.message || "Your input is required.",
        okText: config.okText || "OK",
        cancelText: config.cancelText || "Cancel",
        defaultValue: config.defaultValue || "",
        placeholder: config.placeholder || ""
    };
    
    dialog(format(template, values), {
        onAccept: onAccept,
        onClose: config.onClose,
        onOpen: onOpen
    });
    
    function onAccept (values) {
        if (config.onAccept) {
            config.onAccept(values ? values.value : null);
        }
    }
    
    function onOpen (element) {
        
        var okButton = element.querySelector("[data-type='okButton']");
        var cancelButton = element.querySelector("[data-type='cancelButton']");
        
        element.querySelector("input[type='text']").focus();
        
        element.addEventListener("keyup", function (event) {
            if (event.keyCode === ENTER_KEY) {
                okButton.click();
                destroy();
            }
            else if (event.keyCode === ESC_KEY) {
                cancelButton.click();
                destroy();
            }
        });
        
        function destroy () {
            okButton = null;
            cancelButton = null;
            element = null;
        }
    }
}

module.exports = prompt;
