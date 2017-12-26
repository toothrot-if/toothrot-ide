!include "MUI2.nsh"
Name "Toothrot Editor"

OutFile "..\..\..\release-builds\installers\ToothrotEditor-{version}-Installer.exe"

InstallDir $PROGRAMFILES\Toothrot

# For removing Start Menu shortcut in Windows 7
RequestExecutionLevel user

!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

Section
    
    # set the installation directory as the destination for the following actions
    SetOutPath $INSTDIR
    
    File /nonfatal /a /r "..\..\..\release-builds\toothrot-editor-win32-ia32\"
    
    # create the uninstaller
    WriteUninstaller "$INSTDIR\uninstall.exe"
    
    # create a shortcut in the start menu programs directory
    # point the new shortcut at the program uninstaller
    CreateShortCut "$SMPROGRAMS\Toothrot Editor.lnk" "$INSTDIR\uninstall.exe"
    
SectionEnd

Section "uninstall"
    
    Delete $INSTDIR
    Delete "$SMPROGRAMS\Toothrot Editor.lnk"
    
SectionEnd
