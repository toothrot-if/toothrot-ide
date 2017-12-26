
var normalize = require("path").normalize;
var homedir = require("homedir");

var APP_PATH = normalize(homedir() + "/toothrot/");
var PROJECTS_PATH = normalize(APP_PATH + "/projects/");

module.exports = {
    paths: {
        app: APP_PATH,
        projects: PROJECTS_PATH
    }
};
