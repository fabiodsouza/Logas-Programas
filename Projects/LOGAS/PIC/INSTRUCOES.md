# Modernização Menu.grf - LOGÁS

Guia rápido para aplicar o visual dark mode no seu Menu.grf existente.

## O que está incluído neste pacote

| Arquivo | Função |
|---|---|
| `Modernizar_Menu_iFIX.vba` | Script VBA principal - aplica todas as cores/fontes |
| `icon_tank.png` | Ícone de tanque (botões: ALSCO, EXTRUMINAS, M PEQUI, VDL) |
| `icon_pin.png` | Ícone de localização (botões: BETIM, EXTREMA, LAGARTO, ORLÂNDIA) |
| `icon_tank_active.png` | Versão destacada (ciano forte) para botão ativo |
| `icon_pin_active.png` | Versão destacada para botão ativo |
| `icon_user.png` | Ícone para o botão LOGIN |
| `icon_flame.png` | Logo de chama para o header (opcional) |

## Passo a passo

### 1. BACKUP (obrigatório)

Antes de qualquer coisa, copie seu `Menu.grf` original e renomeie para `Menu_BACKUP.grf`. Guarde em pasta separada.

### 2. Copie os ícones

Copie os 6 arquivos PNG para a pasta do iFIX:

```
C:\Program Files (x86)\Proficy\Proficy iFIX\PIC\
```

(Se seu iFIX estiver instalado em outro lugar, ajuste o caminho. A pasta exata pode variar - procure por uma pasta `PIC` na instalação.)

### 3. Aplique o script VBA

1. Abra o **Menu.grf** no iFIX Workspace em modo **Configure**
2. Pressione **ALT+F11** para abrir o editor VBA
3. No painel esquerdo (Project Explorer), expanda **VBAProject (Menu)** → **Microsoft FIX Objects** → clique 2x em **Menu**
4. Role até o final do código (depois das Subs `CommandButton14_Click()`, etc.)
5. Cole TODO o conteúdo do arquivo `Modernizar_Menu_iFIX.vba`
6. Posicione o cursor dentro da Sub `AplicarVisualModerno`
7. Pressione **F5** para executar
8. Vai aparecer uma mensagem confirmando "Visual moderno aplicado"
9. Volte ao Workspace e salve com **Ctrl+S**

### 4. Adicione os ícones nos botões (manual)

O VBA do iFIX não permite definir Picture de CommandButton via código, então essa parte é manual mas rápida:

Para cada CommandButton:

1. Em modo **Configure**, clique no botão (ex: ALSCO)
2. Pressione **F4** para abrir a janela Properties
3. Procure a propriedade **Picture**
4. Clique no botão "..." ao lado e selecione o ícone:

| Botão | Ícone |
|---|---|
| ALSCO | `icon_tank.png` |
| BETIM | `icon_pin.png` |
| EXTREMA | `icon_pin.png` |
| EXTRUMINAS | `icon_tank.png` |
| LAGARTO | `icon_pin.png` |
| M PEQUI | `icon_tank.png` |
| VDL | `icon_tank.png` |
| ORLÂNDIA | `icon_pin.png` |
| LOGIN | `icon_user.png` |

5. Defina a propriedade **PicturePosition = 7** (texto à direita do ícone)

### 5. Teste

Pressione **F5** no Workspace para entrar em modo Run e ver o resultado.

## Paleta de cores (referência)

| Elemento | RGB | Hex | Uso |
|---|---|---|---|
| Fundo do menu | 10,14,20 | #0A0E14 | Background da tela |
| Botão normal | 20,26,36 | #141A24 | Cor do CommandButton |
| Botão ativo | 0,212,255 | #00D4FF | Hover / botão selecionado |
| Borda | 42,53,72 | #2A3548 | BorderColor dos botões |
| Texto | 192,200,214 | #C0C8D6 | ForeColor do texto |
| Header | 15,22,32 | #0F1620 | Faixa superior do menu |

## Restauração

Se quiser desfazer tudo, rode a Sub `RestaurarVisualPadrao` (F5 dentro dela) - ela volta tudo para o visual MSForms padrão. Se ainda assim algo der errado, use o `Menu_BACKUP.grf` que você salvou no passo 1.

## Limitações conhecidas

- O VBA do iFIX MSForms não permite cantos arredondados (border-radius) nos CommandButtons. Para ter cantos arredondados, seria necessário usar Rectangle objects do iFIX como "botões falsos" com VBA por trás - mais trabalhoso.
- A sombra/glow do botão ativo no mockup também é decorativa do navegador; no iFIX o destaque do botão selecionado é feito apenas com mudança de BackColor para ciano.
- A fonte "Tahoma Bold 9pt" é equivalente próxima à fonte do mockup. Se quiser visual ainda mais moderno, instale "Segoe UI" no Windows do servidor iFIX e troque na constante do VBA.
