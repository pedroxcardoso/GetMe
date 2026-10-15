!include "nsDialogs.nsh"
!include "LogicLib.nsh"

!ifndef BUILD_UNINSTALLER
Var GETMEToolsCheckbox
Var GETMEDownloadTools
!endif

!macro customWelcomePage
  !insertmacro MUI_PAGE_WELCOME
  Page custom GETMEToolsOptionsPage GETMEToolsOptionsLeave
!macroend

!ifndef BUILD_UNINSTALLER
Function GETMEToolsOptionsPage
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0 6u 100% 18u "Prepare os motores do GETME"
  Pop $0

  ${NSD_CreateCheckbox} 0 31u 100% 18u "Baixar yt-dlp e FFmpeg agora (~125 MB)"
  Pop $GETMEToolsCheckbox
  ${NSD_Check} $GETMEToolsCheckbox

  ${NSD_CreateLabel} 0 57u 100% 60u "Precisa de internet. O yt-dlp vem do GitHub do projeto e o FFmpeg Essentials do Gyan.dev, indicado no ffmpeg.org. Os checksums são conferidos e o GETME detecta os arquivos automaticamente. Se desmarcar, configure depois em Configurações."
  Pop $0

  nsDialogs::Show
FunctionEnd

Function GETMEToolsOptionsLeave
  ${NSD_GetState} $GETMEToolsCheckbox $0
  ${If} $0 == ${BST_CHECKED}
    StrCpy $GETMEDownloadTools "1"
  ${Else}
    StrCpy $GETMEDownloadTools "0"
  ${EndIf}
FunctionEnd
!endif

!macro customInstall
  ${If} $GETMEDownloadTools == "1"
    MessageBox MB_OK|MB_ICONINFORMATION "O GETME vai baixar yt-dlp e FFmpeg agora. Isso pode levar alguns minutos; mantenha o instalador aberto."
    DetailPrint "Baixando e preparando os motores do GETME..."
    File /oname=$PLUGINSDIR\getme-install-engines.ps1 "${BUILD_RESOURCES_DIR}\install-engines.ps1"
    ExecWait '"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "$PLUGINSDIR\getme-install-engines.ps1" -TargetDirectory "$APPDATA\pipoca-pixel-downloader\tools"' $0
    Delete "$PLUGINSDIR\getme-install-engines.ps1"
    ${If} $0 != 0
      MessageBox MB_OK|MB_ICONEXCLAMATION "Não foi possível baixar os motores. O GETME foi instalado mesmo assim; configure os executáveis depois em Configurações."
    ${Else}
      DetailPrint "yt-dlp e FFmpeg foram preparados."
    ${EndIf}
  ${EndIf}
!macroend
