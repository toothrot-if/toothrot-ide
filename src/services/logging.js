
var logger = require("electron-log");

function create() {
    
    function log() {
        logger.info.apply(logger, arguments);
    }
    
    function warn() {
        logger.warn.apply(logger, arguments);
    }
    
    function error() {
        logger.error.apply(logger, arguments);
    }
    
    return {
        log: log,
        warn: warn,
        error: error
    };
}

module.exports = create;
