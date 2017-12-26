
var TARGET_ATTRIBUTE = "data-type";

function contains (collection, item) {
    return collection.indexOf(item) >= 0;
}

function findNearestTarget (event) {
    
    var target = event.target;
    
    while (target && target !== document.documentElement) {
        
        if (target.hasAttribute(TARGET_ATTRIBUTE)) {
            return target;
        }
        
        target = target.parentElement;
    }
    
    return target;
}

function delegate (element) {
    
    var listeners = {};
    var handlers = {};
    
    function on (eventName, type, handler) {
        
        if (hasHandler(eventName, type, handler)) {
            return;
        }
        
        ensureHasEventType(eventName, type);
        handlers[eventName][type].push(handler);
    }
    
    function destroy () {
        
        unsubscribeAll();
        
        handlers = null;
    }
    
    function unsubscribeAll () {
        Object.keys(listeners).forEach(function (key) {
            element.removeEventListener(key, listeners[key]);
        });
    }
    
    function hasHandler (eventName, type, handler) {
        return (
            handlers[eventName] &&
            handlers[eventName][type] &&
            contains(handlers[eventName][type], handler)
        );
    }
    
    function ensureHasEventType (eventName, type) {
        
        ensureHasEvent(eventName);
        
        if (!handlers[eventName][type] || !Array.isArray(handlers[eventName][type])) {
            handlers[eventName][type] = [];
        }
    }
    
    function ensureHasEvent (eventName) {
        
        if (!listeners[eventName]) {
            listeners[eventName] = listen(eventName);
        }
        
        if (!handlers[eventName] || typeof handlers[eventName] !== "object") {
            handlers[eventName] = {};
        }
    }
    
    function listen (eventName) {
        
        function listener (event) {
            
            var target = findNearestTarget(event);
            var type = target ? target.getAttribute(TARGET_ATTRIBUTE) : null;
            
            event.stopPropagation();
            
            if (type) {
                fire(eventName, type, event);
            }
        }
        
        element.addEventListener(eventName, listener);
        
        return listener;
    }
    
    function fire (eventName, type, event) {
        if (handlers[eventName] && Array.isArray(handlers[eventName][type])) {
            handlers[eventName][type].forEach(function (handler) {
                handler(event);
            });
        }
    }
    
    return {
        on: on,
        destroy: destroy
    };
}

module.exports = delegate;
