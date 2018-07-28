
var fs = require("original-fs");
var rimraf = require("rimraf");
var path = require("path");
var normalize = path.normalize;
var patchFs = require("electron-patch-fs");
var createApp = require("toothrot").createApp;
var readStoryFiles = require("toothrot/src/utils/readStoryFiles");

var FILE_TYPES = require("../projectFileTypes");

function create (app) {
    
    var logger = app.getService("logging");
    var toothrot = createApp();
    
    toothrot.subscribe("error", logger.error.bind(logger));
    toothrot.subscribe("app/error", logger.error.bind(logger));
    toothrot.subscribe("app/ready", logger.log.bind(logger, "Toothrot app started."));
    
    toothrot.init();
    
    function createProject(name, then) {
        
        var folder = getProjectFolder(name);
        
        logger.log("Creating project '" + name + "'...");
        
        toothrot.channel("initializer/init").call(folder, function () {
            
            initProjectName(name);
            
            app.broadcast("projectCreated", name);
            logger.log("Project '" + name + "' created.");
            
            if (then) {
                then();
            }
        });
    }
    
    function initProjectName(name) {
        
        var info = getProjectInfo(name);
        var storyPath = getMainStoryFilePath(name);
        var storyLines = getMainStoryFile(name).split("\n");
        
        info.name = name;
        
        storyLines.shift();
        storyLines.unshift("# " + name);
        
        fs.writeFileSync(storyPath, storyLines.join("\n"));
        saveProjectInfo(name, info);
    }
    
    function getProjectsFolder() {
        return app.getGlobalConfig().paths.projects;
    }
    
    function getProjectFolder(name) {
        return normalize(getProjectsFolder() + "/" + name + "/");
    }
    
    function getProjectBuildFolder(projectId) {
        return normalize(getProjectFolder(projectId) + "/build/");
    }
    
    function getProjectInfoFilePath(projectId) {
        return normalize(getProjectFolder(projectId) + "/project.json");
    }
    
    function getFolder(projectId, fileType) {
        return normalize(getProjectFolder(projectId) + FILE_TYPES[fileType].FOLDER);
    }
    
    function getMainStoryFilePath(projectId) {
        return normalize(getFolder(projectId, FILE_TYPES.STORY.ID) + "/story.trot.md");
    }
    
    function getAstFilePath(name) {
        return normalize(getProjectFolder(name) + "/resources/ast.json");
    }
    
    function getProjectInfo(name) {
        
        var info = JSON.parse("" + fs.readFileSync(getProjectInfoFilePath(name)));
        
        info.__toothrotBuilder = {
            projectId: name
        };
        
        return info;
    }
    
    function saveProjectInfo(name, info) {
        
        logger.log("Saving project info file for '" + name + "'...");
        
        if (info.__toothrotBuilder) {
            delete info.__toothrotBuilder;
        }
        
        fs.writeFileSync(getProjectInfoFilePath(name), JSON.stringify(info));
    }
    
    function getProjectIds() {
        
        var folder = getProjectsFolder();
        
        return fs.readdirSync(folder).filter(function (name) {
            return fs.lstatSync(path.join(folder, name)).isDirectory();
        });
    }
    
    function getProjectInfos() {
        return getProjectIds().map(getProjectInfo);
    }
    
    function notify(title, message, timeout) {
        return app.getService("notification").notify(title, message, timeout);
    }
    
    function buildProjectFor(platform, name, then) {
        
        var folder = getProjectFolder(name);
        var outputDir = getProjectBuildFolder(name);
        var desktop = platform === "desktop";
        
        logger.log("Building project '" + name + "' for platform '" + platform + "'...");
        
        then = then || function () {};
        
        patchFs.patch();
        
        toothrot.channel("builder/build").call(folder, outputDir, desktop, function (error) {
            
            var message;
            var info = getProjectInfo(name);
            
            patchFs.unpatch();
            
            if (error) {
                
                message = error !== null && typeof error === "object" && error.message ?
                    error.message :
                    ((error || [])[0] || {}).message || "Unknown error";
                
                logger.error(
                    "Cannot build project '" + name + "' for platform '" + platform + "':",
                    message
                );
                
                notify(info.name + " cannot be built!", message);
                
                then(error);
                
                return;
            }
            
            logger.log("Project '" + name + "' built for platform '" + platform + "'.");
            
            notify(
                info.name + " built successfully!",
                "The Toothrot Engine project '" + info.name +"' has been built " +
                "in " + folder
            );
            
            then();
        });
    }
    
    function buildProject(name, then) {
        buildProjectFor("browser", name, then);
    }
    
    function buildProjectForDesktop(name, then) {
        buildProjectFor("desktop", name, then);
    }
    
    function runProject(name) {
        
        var folder = getProjectFolder(name);
        
        buildProject(name, function (error) {
            
            if (error) {
                return;
            }
            
            logger.log("Running project '" + name + "'...");
            
            window.open(normalize("file://" + folder + "/build/browser/index.html"));
        });
    }
    
    function deleteProject(name) {
        
        var folder = getProjectFolder(name);
        
        logger.warn("Deleting project '" + name + "'...");
        
        patchFs.patch();
        rimraf.sync(folder);
        patchFs.unpatch();
        
        app.broadcast("projectDeleted", name);
        
        notify(
            "Project '" + name + "' deleted",
            "Project '" + name + "' (" + folder + ") has been deleted."
        );
    }
    
    function parseStoryFile(name, then) {
        return toothrot.channel("parser/parse").call(getMainStoryFile(name), then);
    }
    
    function parseStory(projectId, then) {
        toothrot.channel("parser/parse").call(
            readStoryFiles(getFolder(projectId, FILE_TYPES.STORY.ID)),
            then
        );
    }
    
    function fileExists(projectId, fileType, fileName) {
        return fs.existsSync(getPath(projectId, fileType, fileName));
    }
    
    function getMainStoryFile(name) {
        return "" + fs.readFileSync(getMainStoryFilePath(name));
    }
    
    function getFile(projectId, fileType, fileName) {
        return "" + fs.readFileSync(getPath(projectId, fileType, fileName));
    }
    
    function getPath(projectId, fileType, fileName) {
        return normalize(getFolder(projectId, fileType) + "/" + fileName);
    }
    
    function getFileNamesForType(projectId, fileType) {
        
        var path = getFolder(projectId, fileType);
        var allFiles = fs.readdirSync(path);
        
        return allFiles.filter(function (fileName) {
            return FILE_TYPES[fileType].PATTERN.test(fileName);
        });
    }
    
    function getAstFile(name, then) {
        
        var ast;
        var path = getAstFilePath(name);
        
        if (!fs.existsSync(path)) {
            return parseStoryFile(name, then);
        }
        
        ast = JSON.parse("" + fs.readFileSync(path));
        
        if (typeof then === "function") {
            return then(null, ast);
        }
        
        return ast;
    }
    
    function saveFile(projectId, fileType, fileName, content) {
        fs.writeFileSync(getPath(projectId, fileType, fileName), content);
    }
    
    function deleteFile(projectId, fileType, fileName) {
        fs.unlinkSync(getPath(projectId, fileType, fileName));
    }
    
    return {
        
        // Constants
        FILE_TYPES: FILE_TYPES,
        
        // For grabbing meta infos
        getProjectInfos: getProjectInfos,
        getProjectIds: getProjectIds,
        
        // Handling a project
        createProject: createProject,
        buildProject: buildProject,
        buildProjectForDesktop: buildProjectForDesktop,
        runProject: runProject,
        deleteProject: deleteProject,
        getProjectInfo: getProjectInfo,
        getProjectInfoFilePath: getProjectInfoFilePath,
        
        // Story files
        parseStoryFile: parseStoryFile,
        parseStory: parseStory,
        
        // Managing project files
        getProjectFolder: getProjectFolder,
        getFileNamesForType: getFileNamesForType,
        getFile: getFile,
        getMainStoryFile: getMainStoryFile,
        getAstFilePath: getAstFilePath,
        getAstFile: getAstFile,
        fileExists: fileExists,
        deleteFile: deleteFile,
        saveFile: saveFile
    };
}

module.exports = create;
