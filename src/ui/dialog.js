
var FADE_DURATION = 200;

var fade = require("domfx/fade");
var delegate = require("../utils/delegate");

function nothing () {
    // do nothing...
}

function dialog (content, options) {
    
    var container = document.createElement("div");
    var events = delegate(container);
    var config = options || {};
    var onOpen = config.onOpen || nothing;
    var onClose = config.onClose || nothing;
    var onAccept = config.onAccept || nothing;
    var disableClose = config.disableClose || false;
    
    container.setAttribute("class", "dialog-conainer");
    
    events.on("click", "okButton", accept);
    events.on("click", "cancelButton", close);
    events.on("click", "overlay", close);
    
    container.innerHTML = content;
    
    container.style.display = "none";
    document.body.appendChild(container);
    
    function open () {
        fade.in(container, FADE_DURATION, function () {
            onOpen(container);
        });
    }
    
    function accept () {
        onAccept(gatherValues());
        hide();
    }
    
    function close () {
        
        if (disableClose) {
            return;
        }
        
        onClose(gatherValues());
        hide();
    }
    
    function hide () {
        fade.out(container, FADE_DURATION, destroy);
    }
    
    function destroy () {
        
        container.parentNode.removeChild(container);
        events.destroy();
        
        container = null;
        
    }
    
    function gatherValues () {
        
        var count = 0;
        var values = {};
        var elements = container.querySelectorAll("[name]");
        
        Array.prototype.forEach.call(elements, function (element) {
            
            if (element.name) {
                
                count += 1;
                
                if (element.nodeName.toLowerCase() === "select") {
                    values[element.name] = element.options[element.selectedIndex].value;
                }
                else {
                    values[element.name] = element.value;
                }
                
            }
        });
        
        return count ? values : null;
    }
    
    requestAnimationFrame(open);
}

module.exports = dialog;
