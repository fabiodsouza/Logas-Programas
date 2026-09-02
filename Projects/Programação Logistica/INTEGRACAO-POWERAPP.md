# Integração Power App (SharePoint) → Kanban — Realizado

O kanban é onde você **planeja** (previsto). O Power App é onde os **motoristas registram** as
entregas feitas (realizado), gravando numa **lista do SharePoint**. Esta integração traz esses
registros para o kanban, casando por **cliente + dia**, e alimenta a tela **Comparar (prev × real)**.

## Como o kanban consome os dados

Ao abrir, o kanban lê um arquivo **`realizado.js`** (na mesma pasta) e casa cada registro com a
entrega planejada daquele cliente/dia. Registros sem entrega planejada aparecem na comparação como
"SEM PREVISÃO".

O formato do arquivo (veja `realizado-exemplo.js`):

```js
window.LOGAS_REALIZADO = {
  atualizado: "2026-07-06T09:00:00",
  registros: [
    { cliente:"BELGO", data:"2026-07-06", cavalo:"Cavalo A", carreta:"CRT-1234",
      motorista:"João", saida:"09:30", chegada:"10:20", barSaida:106, barChegada:98, base:"BETIM" }
  ]
};
```

### De-para: colunas da SUA lista → campos do contrato

| Coluna no SharePoint      | Campo no `realizado.js` | Observação |
|---------------------------|-------------------------|------------|
| CLIENTE                   | `cliente`               | tem que bater com o nome no kanban (maiúsc/minúsc/espaço ignorados) |
| DATA E HORA INICIAL       | `dataHora`              | o kanban separa a data e usa a hora como **chegada** |
| placacavalo               | `cavalo`                | é a placa (aparece na comparação como placa) |
| CARRETA 1 (+ CARRETA 2)   | `carreta`               | pode concatenar as duas |
| nome_motorista            | `motorista`             | |
| PRESSAO_CHEGADA           | `barChegada`            | pressão encontrada na chegada |
| PRESSAO_FINALIZADA        | `barFinal`              | pressão após finalizar |
| ABASTECIMENTO_QTY         | `abastecimento`         | quantidade abastecida |
| nota_fiscal (ou m2nfe)    | `nf`                    | |
| baseOrigem                | `base`                  | opcional |

As demais colunas (medidores, cestos, transvaso, observação, etc.) não entram na comparação por
enquanto — se quiser alguma delas, me avise que eu incluo.

> Não há na lista a **hora de saída da base** nem o **bar na saída**; esses ficam só no previsto (do kanban).
> O nome do `cliente` deve bater com o do kanban (maiúsc/minúsc e espaços são ignorados no casamento).

## Teste rápido (manual), sem automação

1. Exporte a lista do SharePoint (List → **Exportar → CSV**) OU monte um CSV com as colunas:
   `cliente;data;cavalo;carreta;motorista;saida;chegada;barSaida;barChegada;base`
2. No kanban, abra **Comparar (prev × real)** → botão **Importar realizado** → escolha o CSV (ou um JSON).
3. A comparação é preenchida na hora. (Também aceita renomear `realizado-exemplo.js` para `realizado.js`.)

## Frota — motoristas e placas de cavalo

O botão **Frota** (na barra) importa os **nomes dos motoristas** e as **placas dos cavalos** para o
autocompletar do sistema. Duas formas:

- **Manual:** botão Frota → Importar de arquivo → escolha um CSV/JSON. Aceita o **próprio export da
  lista do SharePoint** (usa `nome_motorista`, `placacavalo`, `CARRETA 1`), ou um CSV com colunas
  `motorista` / `placa` / `carreta`.
- **Automático (recomendado):** você **não precisa** de um fluxo separado de frota. Ao carregar o
  `realizado.js` (abaixo), o kanban já extrai sozinho os **motoristas** e as **placas** de cada
  registro e alimenta o autocompletar. Ou seja, o mesmo fluxo do Power Automate resolve os dois.
- **Master completo (opcional):** se quiser a lista completa de motoristas/veículos (mesmo os que
  ainda não apareceram em entregas), deixe um `frota.js` na pasta (veja `frota-exemplo.js`):
  ```js
  window.LOGAS_FROTA = { motoristas:["João","Pedro"], placas:["ABC1D23","XYZ9K88"], carretas:["CRT-1234"] };
  ```

Os motoristas alimentam o campo Motorista (previsto e realizado); as placas alimentam o campo
**Cavalo realizado (placa)**.

## Sincronização automática (contínua) com Power Automate

Objetivo: um fluxo agendado gera o `realizado.js` nesta pasta (via **OneDrive** sincronizado no PC).

1. **Power Automate** (make.powerautomate.com) → **Criar** → **Fluxo de nuvem agendado**
   (ex.: repetir a cada 15 minutos).
2. Ação **SharePoint → Obter itens**: selecione o site e a lista onde os motoristas registram.
   (Opcional: filtrar por data de hoje para o arquivo ficar pequeno.)
3. Ação **Selecionar** (Data Operations → Select): mapeie as colunas da sua lista para as chaves do
   contrato (aba "Map"), assim:
   - `cliente`       ← CLIENTE
   - `dataHora`      ← DATA E HORA INICIAL
   - `cavalo`        ← placacavalo
   - `carreta`       ← CARRETA 1 (concatene CARRETA 2 se quiser)
   - `motorista`     ← nome_motorista
   - `barChegada`    ← PRESSAO_CHEGADA
   - `barFinal`      ← PRESSAO_FINALIZADA
   - `abastecimento` ← ABASTECIMENTO_QTY
   - `nf`            ← nota_fiscal
   - `base`          ← baseOrigem
4. Ação **Compor** (Compose) com o texto:
   ```
   window.LOGAS_REALIZADO = { "atualizado": "@{utcNow()}", "registros": @{body('Selecionar')} };
   ```
5. Ação **OneDrive for Business → Criar arquivo** (ou "Atualizar arquivo"):
   - Pasta: a mesma pasta do kanban, sincronizada pelo OneDrive no PC.
   - Nome do arquivo: `realizado.js`
   - Conteúdo: a saída do **Compor**.
6. Salve e ligue o fluxo. O OneDrive baixa o `realizado.js` para o PC; ao abrir/recarregar o kanban,
   o realizado aparece — e os **motoristas e placas** já entram no autocompletar automaticamente
   (não precisa de outro fluxo para a frota).

> Este é o "importar direto do app": o fluxo lê a **lista do SharePoint que é a fonte do app** e
> entrega tudo pronto para o kanban, sem exportação manual.

### Observações
- O kanban precisa ficar na pasta sincronizada do OneDrive (junto do `realizado.js`, `dados.js`).
- Alternativa a Power Automate: um script Python com Microsoft Graph rodando no Agendador de Tarefas —
  mais robusto, mas exige registro de aplicativo no Azure AD (peça ao admin). Posso montar se preferir.
- Para o casamento funcionar, os nomes de cliente da lista devem corresponder aos do kanban. Se forem
  diferentes, me passe a lista de nomes que eu adiciono um "de-para".
