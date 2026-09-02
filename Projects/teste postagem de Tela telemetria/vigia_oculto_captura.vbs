' Lancador invisivel: roda o vigia_captura.ps1 SEM nenhuma janela (sem piscar).
Set fso = CreateObject("Scripting.FileSystemObject")
pasta = fso.GetParentFolderName(WScript.ScriptFullName)
Set sh = CreateObject("WScript.Shell")
sh.Run "powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & pasta & "\vigia_captura.ps1""", 0, False
