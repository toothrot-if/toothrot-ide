
var FILE_TYPES = {
    STORY: {
        ID: "STORY",
        LABEL: "Story files",
        PATTERN: /\.trot\.(md|ext\.md)$/,
        EXTENSION: ".trot.ext.md",
        FOLDER: "/resources/",
        LANGUAGE: "toothrot"
    },
    SCREEN: {
        ID: "SCREEN",
        LABEL: "Screens",
        PATTERN: /\.html$/,
        EXTENSION: ".html",
        FOLDER: "/resources/screens/",
        LANGUAGE: "html"
    },
    TEMPLATE: {
        ID: "TEMPLATE",
        LABEL: "Templates",
        PATTERN: /\.html$/,
        EXTENSION: ".html",
        FOLDER: "/resources/templates/",
        LANGUAGE: "html"
    },
    STYLESHEET: {
        ID: "STYLESHEET",
        LABEL: "Stylesheets",
        PATTERN: /\.css$/,
        EXTENSION: ".css",
        FOLDER: "/files/style/",
        LANGUAGE: "css"
    }
};

module.exports = Object.freeze(FILE_TYPES);
