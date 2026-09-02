# Funcionalidade de Exportação para Excel

## Nova Funcionalidade Implementada

### 📊 Exportação para Excel
Adicionada funcionalidade completa para exportar os dados de todos os formulários para arquivos Excel (.xlsx).

## Como Funciona

### 1. **Botões de Exportação Inteligentes**
- Botões aparecem automaticamente quando há dados para exportar
- Um botão específico para cada seção (Obras, Manutenção, Plantão, Treinamentos, Viagens)
- Botões ficam ocultos quando não há dados para exportar

### 2. **Localização dos Botões**
- Posicionados ao lado do botão "Adicionar" em cada seção
- Design consistente com o resto da interface
- Ícone de gráfico (📊) para fácil identificação

### 3. **Funcionalidades de Cada Exportação**

#### **Obras em Andamento**
- **Arquivo gerado**: `Obras_em_Andamento_AAAAMMDD.xlsx`
- **Colunas**: Nome do Projeto, Grau de Urgência, Responsável, Especificidade, Local, Prazo/Data, Andamento (%)

#### **Manutenção Preventiva**
- **Arquivo gerado**: `Manutencao_Preventiva_AAAAMMDD.xlsx`
- **Colunas**: Cliente, Data, Tipo de Manutenção, Técnico Escalado, Carro Reservado, Principais Atuações

#### **Escala de Plantão**
- **Arquivo gerado**: `Escala_de_Plantao_AAAAMMDD.xlsx`
- **Colunas**: Colaborador, Data de Início, Data de Término

#### **Escala de Treinamentos**
- **Arquivo gerado**: `Escala_de_Treinamentos_AAAAMMDD.xlsx`
- **Colunas**: Colaborador, Treinamento, Local, Data, Horário

#### **Escala de Viagens**
- **Arquivo gerado**: `Escala_de_Viagens_AAAAMMDD.xlsx`
- **Colunas**: Colaborador, Local, Intervalo da Viagem, Data, Meio de Transporte

## Características Técnicas

### **Biblioteca Utilizada**
- **SheetJS (xlsx.js)** - Biblioteca JavaScript para manipulação de planilhas
- Carregada via CDN para máxima compatibilidade
- Versão 0.18.5 (estável e confiável)

### **Formato dos Arquivos**
- **Extensão**: .xlsx (Excel moderno)
- **Compatibilidade**: Excel 2007+, LibreOffice Calc, Google Sheets
- **Codificação**: UTF-8 (suporte completo a caracteres especiais)

### **Nomenclatura dos Arquivos**
- Padrão: `[Nome_da_Secao]_[AAAAMMDD].xlsx`
- Data automática no nome do arquivo
- Evita conflitos de nomes

### **Formatação das Planilhas**
- **Cabeçalhos**: Primeira linha com nomes das colunas
- **Largura das colunas**: Ajustada automaticamente (20 caracteres)
- **Dados**: Formatados conforme o tipo (datas em formato brasileiro)

## Melhorias na Interface

### **Estilos dos Botões de Exportação**
```css
.btn-export {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(40, 167, 69, 0.2);
}
```

### **Responsividade**
- Botões se adaptam a telas menores
- Em dispositivos móveis, botões ficam empilhados verticalmente
- Largura total em telas pequenas para melhor usabilidade

### **Feedback Visual**
- Efeito hover com elevação do botão
- Gradiente verde para indicar ação positiva
- Ícone de gráfico para identificação rápida

## Como Usar

### **Passo a Passo**
1. **Adicione dados** em qualquer seção (Obras, Manutenção, etc.)
2. **O botão de exportação aparecerá** automaticamente ao lado do botão "Adicionar"
3. **Clique no botão** "Exportar [Seção] para Excel"
4. **O arquivo será baixado** automaticamente para sua pasta de Downloads
5. **Abra o arquivo** no Excel, LibreOffice ou Google Sheets

### **Exemplo de Uso**
1. Cadastre algumas obras no sistema
2. Vá para a seção "Obras em Andamento"
3. Clique em "📊 Exportar Obras para Excel"
4. Arquivo `Obras_em_Andamento_20250704.xlsx` será baixado
5. Abra no Excel para visualizar e manipular os dados

## Vantagens da Implementação

### **✅ Facilidade de Uso**
- Interface intuitiva e familiar
- Processo de exportação em um clique
- Nomes de arquivo descritivos e organizados

### **✅ Compatibilidade Total**
- Funciona em todos os navegadores modernos
- Arquivos compatíveis com Excel, LibreOffice, Google Sheets
- Suporte completo a caracteres especiais e acentos

### **✅ Organização Automática**
- Data no nome do arquivo para versionamento
- Colunas organizadas logicamente
- Formatação consistente em todas as exportações

### **✅ Performance Otimizada**
- Biblioteca leve e eficiente
- Processamento local (sem necessidade de servidor)
- Exportação instantânea mesmo com muitos dados

### **✅ Manutenibilidade**
- Código modular e bem estruturado
- Fácil adição de novas funcionalidades
- Documentação completa

## Arquivos Modificados

### **Novos Arquivos**
- `script_com_excel.js` - Script principal com funcionalidade Excel

### **Arquivos Atualizados**
- `index.html` - Adicionada biblioteca SheetJS
- `style.css` - Estilos para botões de exportação

### **Arquivos de Backup**
- `script.js` - Versão original mantida como backup
- `style_original_backup.css` - Backup do CSS original

## Resultado Final

✅ **Sistema completo** com exportação Excel em todas as seções
✅ **Interface moderna** com botões intuitivos
✅ **Arquivos organizados** com nomenclatura padronizada
✅ **Compatibilidade total** com softwares de planilha
✅ **Responsividade** em dispositivos móveis
✅ **Performance otimizada** para uso profissional

O sistema agora oferece uma solução completa para gestão e exportação de dados, permitindo que os usuários mantenham seus registros organizados tanto no sistema web quanto em planilhas Excel para análises mais detalhadas.

