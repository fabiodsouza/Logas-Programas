'==========================================================================
' MODERNIZAR MENU.GRF - LOGAS
' Versao: 1.0
' Autor: Customizacao visual dark mode
'
' COMO USAR:
'  1. Faca BACKUP do Menu.grf original (copie e cole, renomeie para
'     Menu_BACKUP.grf antes de tudo)
'  2. Abra o Menu.grf no iFIX Workspace em modo Configure
'  3. Pressione ALT+F11 para abrir o editor VBA
'  4. No painel esquerdo, clique duas vezes em "Menu" dentro de VBAProject
'  5. Cole TODO este codigo no final do modulo Menu (depois das Subs
'     existentes dos CommandButtons)
'  6. Posicione o cursor dentro da Sub "AplicarVisualModerno" e pressione F5
'  7. Salve a tela (Ctrl+S) e teste em modo Run
'  8. Se algo der errado, feche SEM SALVAR e use o backup
'
' OBSERVACAO IMPORTANTE:
' Antes de rodar, coloque os 6 arquivos PNG (icon_tank.png, icon_pin.png,
' icon_user.png, icon_flame.png, icon_tank_active.png, icon_pin_active.png)
' na pasta C:\Program Files (x86)\Proficy\Proficy iFIX\PIC\ (ou ajuste o
' caminho na constante PASTA_ICONES abaixo).
'==========================================================================

Option Explicit

' === CONFIGURACAO ===
Const PASTA_ICONES As String = "C:\Program Files (x86)\Proficy\Proficy iFIX\PIC\"

' === PALETA DE CORES (dark + ciano) ===
' VBA usa BGR (Blue, Green, Red) em vez de RGB
Const COR_FUNDO_MENU As Long = &H140A00      ' RGB(10,14,20)   fundo escuro
Const COR_BOTAO_NORMAL As Long = &H241A14    ' RGB(20,26,36)   cinza grafite
Const COR_BOTAO_ATIVO As Long = &HFFD400     ' RGB(0,212,255)  ciano
Const COR_BORDA As Long = &H48352A           ' RGB(42,53,72)   borda sutil
Const COR_TEXTO As Long = &HD6C8C0           ' RGB(192,200,214) texto claro
Const COR_TEXTO_ATIVO As Long = &H0F0F0F     ' quase preto p/ contraste no ciano
Const COR_HEADER As Long = &H20160F          ' RGB(15,22,32)
Const COR_TEXTO_LOGIN As Long = &HA8927A    ' RGB(122,146,168)


'==========================================================================
' SUB PRINCIPAL - rode esta com F5
'==========================================================================
Public Sub AplicarVisualModerno()
    Dim ctrl As Object
    Dim btnCount As Integer
    Dim msg As String

    On Error GoTo TratarErro

    btnCount = 0

    ' Itera sobre todos os controles da tela Menu
    For Each ctrl In ThisDocument.Page.ContainedObjects

        ' Aplica visual nos CommandButtons (botoes do menu)
        If TypeName(ctrl) = "CommandButton" Then
            EstilizarBotao ctrl
            btnCount = btnCount + 1
        End If

    Next ctrl

    ' Aplica cor de fundo da tela inteira (background)
    AplicarFundoMenu

    msg = "Visual moderno aplicado com sucesso!" & vbCrLf & vbCrLf & _
          btnCount & " botoes estilizados." & vbCrLf & vbCrLf & _
          "Proximos passos:" & vbCrLf & _
          "1. Salve a tela (Ctrl+S)" & vbCrLf & _
          "2. Teste em modo Run (F5 no Workspace)" & vbCrLf & _
          "3. Adicione os icones manualmente (instrucoes no final)"

    MsgBox msg, vbInformation, "LOGAS - Modernizacao"
    Exit Sub

TratarErro:
    MsgBox "Erro ao aplicar visual: " & Err.Description & vbCrLf & _
           "Linha de erro: " & Erl, vbCritical, "Erro"
End Sub


'==========================================================================
' Estiliza um CommandButton individual
'==========================================================================
Private Sub EstilizarBotao(btn As Object)
    On Error Resume Next

    ' Cores
    btn.BackColor = COR_BOTAO_NORMAL
    btn.ForeColor = COR_TEXTO

    ' Tipografia
    btn.Font.Name = "Tahoma"
    btn.Font.Size = 9
    btn.Font.Bold = True

    ' Estilo do botao (1 = fmButtonEffectFlat - sem 3D)
    btn.SpecialEffect = 0  ' fmSpecialEffectFlat
    btn.BorderStyle = 1    ' fmBorderStyleSingle
    btn.BorderColor = COR_BORDA

    ' Alinhamento e padding visual
    btn.TextAlign = 2  ' fmTextAlignCenter

    ' Tamanho padronizado dos botoes (em twips - 1 pixel ~ 15 twips)
    ' Para 120x28 pixels: width=1800, height=420
    ' Comentado para preservar layout original se voce ja tem tamanhos especificos
    ' btn.Width = 1800
    ' btn.Height = 420

    On Error GoTo 0
End Sub


'==========================================================================
' Aplica cor de fundo escuro na tela do Menu
'==========================================================================
Private Sub AplicarFundoMenu()
    On Error Resume Next

    ' Define cor de fundo da Picture (tela)
    ThisDocument.BackgroundColor = COR_FUNDO_MENU

    On Error GoTo 0
End Sub


'==========================================================================
' RESTAURAR - rode esta sub se quiser desfazer (visual padrao MSForms)
'==========================================================================
Public Sub RestaurarVisualPadrao()
    Dim ctrl As Object
    Dim resp As VbMsgBoxResult

    resp = MsgBox("Restaurar todos os botoes para o visual padrao do iFIX?", _
                  vbYesNo + vbQuestion, "Restaurar")
    If resp <> vbYes Then Exit Sub

    On Error Resume Next
    For Each ctrl In ThisDocument.Page.ContainedObjects
        If TypeName(ctrl) = "CommandButton" Then
            ctrl.BackColor = &H8000000F  ' cor padrao do sistema (botao)
            ctrl.ForeColor = &H80000012  ' texto padrao
            ctrl.Font.Name = "MS Sans Serif"
            ctrl.Font.Size = 8
            ctrl.Font.Bold = False
            ctrl.SpecialEffect = 2  ' raised
            ctrl.BorderStyle = 0
        End If
    Next ctrl

    ThisDocument.BackgroundColor = &H808080  ' cinza padrao

    MsgBox "Visual restaurado.", vbInformation
    On Error GoTo 0
End Sub


'==========================================================================
' HOVER EFFECT - opcional
' Adicione chamadas a essas Subs no MouseMove de cada CommandButton se quiser
' efeito hover (botao muda de cor ao passar o mouse)
'==========================================================================
Public Sub BotaoMouseEnter(btn As Object)
    On Error Resume Next
    btn.BackColor = &H48352A  ' borda como hover
    btn.ForeColor = &HFFD400  ' texto ciano
End Sub

Public Sub BotaoMouseLeave(btn As Object)
    On Error Resume Next
    btn.BackColor = COR_BOTAO_NORMAL
    btn.ForeColor = COR_TEXTO
End Sub


'==========================================================================
' INSTRUCOES PARA ADICIONAR OS ICONES (manual - 1 vez)
'==========================================================================
' Os PNGs nao podem ser inseridos automaticamente nos CommandButtons via VBA
' do iFIX por restricao do MSForms. Faca assim, manualmente, para cada botao:
'
' 1. Copie os 6 arquivos PNG para C:\Program Files (x86)\Proficy\Proficy iFIX\PIC\
' 2. No iFIX Workspace, em modo Configure, clique no CommandButton (ex: ALSCO)
' 3. Na janela Properties (F4), procure a propriedade "Picture"
' 4. Clique no "..." e selecione o icone correto:
'      ALSCO, EXTRUMINAS, M PEQUI, VDL  -> icon_tank.png
'      BETIM, EXTREMA, LAGARTO, ORLANDIA -> icon_pin.png
' 5. Defina "PicturePosition" = 7 (fmPicturePositionLeftCenter)
' 6. Repita para todos os 13 botoes
'
' Alternativa: use a propriedade Caption do botao com um caractere unicode
' (ex: triangulo, circulo) que ja vem com a fonte do iFIX - sem precisar de PNG.
'==========================================================================
