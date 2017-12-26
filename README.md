# Toothrot Editor

A desktop app for editing text-based games based on [toothrot](https://github.com/iiyo/toothrot).
It works on windows, mac and linux systems and can build the games for browser, win, mac and linux.

## Features

 * Uses the same text editor widget as Visual Studio Code
   ([monaco](https://microsoft.github.io/monaco-editor/))
 * Takes you directly to offending lines when the validator finds errors
 * Runs the game directly in a new window
 * Colorizes toothrot story files correctly
 * Allows editing of story files, screens, templates and stylesheets

## Development

### Testing the app

Toothrot Editor is an [electron](http://electronjs.org/) app.
You can test the app by running the following in the root folder of the project:

    electron .

If you want to use the Chrome dev tools, uncomment the following line in `index.js`:

```javascript
    // win.webContents.openDevTools();
```

Dont forget to disable the dev tools before drafting a release!

### Building a windows installer

The windows installer is built using [NSIS](http://nsis.sourceforge.net). An `.nsi` file
is used to define the installer behavior.

To create a fresh installer, we first have to prepare the NSI file:

    npm run update-nsi-file

Afterwards, the file `scripts/installers/windows/installer.nsi` should be created. In the NSIS
program, choose `Compile NSI scripts`. Open the `installer.nsi` script and NSIS should build
the installer automatically.

The installer file can then be found in `release-builds/installers/`.

Hint: This will also usually work on non-windows systems when `wine` is installed.

### Building a debian (.deb) package

    npm run build-linux
    npm run package-debian
