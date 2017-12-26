/* global __dirname */

var fs = require("fs");
var format = require("vrep").format;
var path = require("path");
var dialog = require("./dialog");
var template = "" + fs.readFileSync(path.join(__dirname, "../templates/confirm.html"));

function confirm (options) {
    
    var config = options || {};
    
    var values = {
        title: config.title || "Confirm your intent",
        message: config.message || "Are you sure you want to do this?",
        okText: config.okText || "OK",
        cancelText: config.cancelText || "Cancel"
    };
    
    dialog(format(template, values), {
        onAccept: onAccept,
        onClose: config.onClose
    });
    
    function onAccept (values) {
        if (config.onAccept) {
            config.onAccept(values ? values.value : null);
        }
    }
}

module.exports = confirm;
