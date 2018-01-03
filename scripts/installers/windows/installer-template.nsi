!include "MUI2.nsh"
Name "Toothrot IDE"

OutFile "..\..\..\release-builds\installers\ToothrotIDE-{version}-Installer.exe"

InstallDir $PROGRAMFILES\Toothrot
InstallDirRegKey HKLM "SOFTWARE\toothrot" "installdir"

# For removing Start Menu shortcut in Windows 7
RequestExecutionLevel user

!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

Section
    
    # set the installation directory as the destination for the following actions
    SetOutPath $INSTDIR
    
    File /nonfatal /a /r "..\..\..\release-builds\toothrot-ide-win32-ia32\"
    
    WriteRegStr HKLM "${UNINSTREG}" "DisplayName" "${NAME}"
    WriteRegStr HKLM "${UNINSTREG}" "Publisher" "Toothrot IF"
    WriteRegStr HKLM "${UNINSTREG}" "URLInfoAbout" "https://toothrot.one"
    WriteRegStr HKLM "${UNINSTREG}" "DisplayIcon" '"$INSTDIR\style\icons\icon.ico"'
    
    # create the uninstaller
    WriteUninstaller "$INSTDIR\uninstall.exe"
    
    # create a shortcut in the start menu programs directory
    # point the new shortcut at the program uninstaller
    CreateShortCut "$SMPROGRAMS\Toothrot IDE.lnk" "$INSTDIR\uninstall.exe"
    
SectionEnd

Section "uninstall"
    
    Delete $INSTDIR
    Delete "$SMPROGRAMS\Toothrot IDE.lnk"
    
SectionEnd
