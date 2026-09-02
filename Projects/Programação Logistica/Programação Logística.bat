@echo off
setlocal
rem === Abre o Kanban como um "programa" (janela propria), mesmo com o Chrome ja aberto ===
set "HTML=%~dp0programacao-kanban-dark.html"
set "URL=file:///%HTML:\=/%"
rem Perfil dedicado do app (guarda a programacao deste sistema separada do seu Chrome normal)
set "DATADIR=%LocalAppData%\LogasKanban"

set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"

if exist "%CHROME%" (
  start "" "%CHROME%" --app="%URL%" --user-data-dir="%DATADIR%" --window-size=1400,900
) else (
  start "" msedge --app="%URL%" --user-data-dir="%DATADIR%" --window-size=1400,900
)
