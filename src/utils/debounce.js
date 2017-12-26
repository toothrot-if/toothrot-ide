
function debounce (fn, delay) {
    
    var timer;
    
    return function () {
        
        var context = this;
        var args = arguments;
        
        clearTimeout(timer);
        
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay || 500);
    };
}

module.exports = debounce;
