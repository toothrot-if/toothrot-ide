/* global __dirname, process */

var win;

var url = require("url");
var path = require("path");
var homedir = require("homedir");
var electron = require("electron");
var logger = require("electron-log");

var toothrot = require("toothrot");

var APP_PATH = path.join(homedir(), "toothrot/");
var LOG_FILE = path.join(APP_PATH, "log.txt");

var app = electron.app;
var BrowserWindow = electron.BrowserWindow;

logger.transports.file.level = "info";
logger.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}";
logger.transports.console.format = "[{y}-{m}-{d} {h}:{i}:{s}] [{level}] {text}";
logger.transports.file.file = LOG_FILE;

global.toothrot = toothrot;

function start () {
    
    logger.info("----- Toothrot IDE is starting up...");
    
    win = new BrowserWindow({
        width: 980,
        height: 600,
        frame: true,
        icon: path.join(__dirname, "style/icons/icon64.png")
    });
    
    win.setMenu(null);
    
    win.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file",
        slashes: true
    }));
    
    // win.webContents.openDevTools();
    
    win.on("closed", function () {
        win = null;
    });
}

app.on("ready", start);

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        logger.info("----- Exiting...");
        app.quit();
    }
});

app.on("activate", function () {
    if (win === null) {
        start();
    }
});
