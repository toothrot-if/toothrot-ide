/* global __dirname */

var ENTER_KEY = 13;
var ESC_KEY = 27;

var fs = require("fs");
var path = require("path");
var dialog = require("./dialog");
var format = require("vrep").format;
var template = "" + fs.readFileSync(path.join(__dirname, "../templates/newFileDialog.html"));

var OPTION_TEMPLATE = '<option value="{ID}">{LABEL} ({EXTENSION})</option>';

function showFileDialog(config) {
    
    dialog(template, {
        onAccept: onAccept,
        onClose: config.onClose,
        onOpen: onOpen
    });
    
    function onAccept (values) {
        if (config.onAccept) {
            config.onAccept(values || null);
        }
    }
    
    function onOpen (element) {
        
        var info = element.querySelector(".info");
        var okButton = element.querySelector("[data-type='okButton']");
        var cancelButton = element.querySelector("[data-type='cancelButton']");
        var fileNameInput = element.querySelector("input[type='text']");
        var fileTypeSelect = document.querySelector("[data-type='fileType']");
        
        fileNameInput.focus();
        
        config.fileTypes.forEach(function (fileTypeInfo) {
            fileTypeSelect.innerHTML += format(OPTION_TEMPLATE, fileTypeInfo);
        });
        
        disableOkButton();
        
        element.addEventListener("keyup", checkInput);
        fileTypeSelect.addEventListener("change", checkInput);
        
        function disableOkButton() {
            okButton.classList.add("disabled");
        }
        
        function enableOkButton() {
            okButton.classList.remove("disabled");
        }
        
        function destroy () {
            okButton = null;
            cancelButton = null;
            fileNameInput = null;
            fileTypeSelect = null;
            element = null;
        }
        
        function checkInput(event) {
            
            var allowedInput = false;
            var text = fileNameInput.value || "";
            var fileType = fileTypeSelect.options[fileTypeSelect.selectedIndex].value;
            
            if (event.keyCode === ESC_KEY) {
                cancelButton.click();
                destroy();
                return;
            }
            
            allowedInput = text && typeof text === "string" && isAllowedFileName(text, fileType);
            
            if (text && !allowedInput) {
                info.classList.add("visible");
            }
            else {
                info.classList.remove("visible");
            }
            
            if (allowedInput) {
                enableOkButton();
            }
            else {
                disableOkButton();
                return;
            }
            
            if (event.keyCode === ENTER_KEY) {
                okButton.click();
                destroy();
            }
        }
    }
    
    function isAllowedFileName(fileName, fileType) {
        
        if (typeof config.isAllowedFileName === "function") {
            return config.isAllowedFileName(fileName, fileType);
        }
        
        return false;
    }
}

module.exports = showFileDialog;
