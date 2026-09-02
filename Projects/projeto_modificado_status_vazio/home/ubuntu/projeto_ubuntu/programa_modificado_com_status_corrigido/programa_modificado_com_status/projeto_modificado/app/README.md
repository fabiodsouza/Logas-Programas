# Sistema Completo de Gestão de Manutenção

Um aplicativo web moderno e completo para gestão de manutenção com cinco módulos integrados.

## 🎯 **Funcionalidades Principais**

### 📋 **1. Obras em Andamento**
- **Campos**: Nome do Projeto | Grau de Urgência | Responsável | Especificidade | Local | Prazo/Data | Porcentagem de Andamento
- **Recursos**: Badges coloridos para urgência, barras de progresso visuais, sistema CRUD completo

### 🔧 **2. Manutenção Preventiva**
- **Campos**: Cliente | Data | Tipo de Manutenção | Técnico Escalado | Carro Reservado | Principais Atuações
- **Tipos**: Preventiva Básica, Preventiva Completa, Inspeção Técnica, Manutenção Elétrica, Hidráulica, Ar Condicionado, Outros
- **Recursos**: Badges coloridos por tipo, sistema CRUD completo

### 👥 **3. Escala de Plantão**
- **Campos**: Colaborador | Data de Início | Data de Término
- **Recursos**: Controle de períodos de plantão, sistema CRUD completo

### 📚 **4. Escala de Treinamentos**
- **Campos**: Colaborador | Treinamento | Local | Data | Horário
- **Recursos**: Gestão completa de treinamentos, sistema CRUD completo

### ✈️ **5. Escala de Viagens**
- **Campos**: Colaborador | Local | Intervalo da Viagem | Data | Meio de Transporte
- **Recursos Especiais**: 
  - Opções de colaborador: **Equipe 1**, **Equipe 2**, ou **Individual** (com nome específico)
  - Badges para meio de transporte
  - Sistema CRUD completo

## 🎨 **Características do Design**

### 🌈 **Navegação Colorida**
- **Verde**: Obras em Andamento
- **Azul**: Manutenção Preventiva  
- **Laranja**: Escala de Plantão
- **Roxo**: Escala de Treinamentos
- **Rosa**: Escala de Viagens

### 📱 **Interface Responsiva**
- Design adaptável para desktop e mobile
- Navegação intuitiva entre telas
- Modais com scroll interno
- Transições suaves

### 💾 **Armazenamento Inteligente**
- Dados salvos automaticamente no navegador
- Armazenamento independente para cada módulo
- Persistência entre sessões

## 🚀 **Como Usar**

### **Instalação**
1. Extraia o arquivo ZIP
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. O sistema funcionará imediatamente offline

### **Navegação**
- Use os botões coloridos no topo para alternar entre as telas
- Cada tela tem sua própria cor identificadora
- O botão ativo fica destacado

### **Operações Básicas**
1. **Adicionar**: Clique no botão "+ Adicionar" de cada tela
2. **Editar**: Clique em "Editar" na linha desejada
3. **Remover**: Clique em "Remover" na linha desejada
4. **Visualizar**: Todos os dados são exibidos em tabelas organizadas

### **Funcionalidades Especiais**

#### **Obras em Andamento**
- Slider de progresso visual (0-100%)
- Níveis de urgência: Baixa, Média, Alta, Crítica
- Badges coloridos por urgência

#### **Manutenção Preventiva**
- 7 tipos diferentes de manutenção
- Badges coloridos por tipo
- Campos específicos para técnico e veículo

#### **Escala de Viagens**
- **Equipe 1** e **Equipe 2**: Seleção direta
- **Individual**: Campo adicional para nome específico
- Meio de transporte com badge visual

## 🔧 **Tecnologias Utilizadas**

- **HTML5**: Estrutura semântica moderna
- **CSS3**: Design responsivo com gradientes e animações
- **JavaScript**: Funcionalidade completa sem dependências
- **LocalStorage**: Persistência de dados no navegador

## 📊 **Estrutura de Dados**

Cada módulo mantém seus dados independentemente:
- `projects`: Obras em andamento
- `maintenances`: Manutenção preventiva
- `plantoes`: Escala de plantão
- `treinamentos`: Escala de treinamentos
- `viagens`: Escala de viagens

## 🎯 **Benefícios**

✅ **Gestão Visual**: Interface clara e intuitiva
✅ **Organização**: Cinco módulos especializados
✅ **Mobilidade**: Funciona em qualquer dispositivo
✅ **Simplicidade**: Sem necessidade de instalação
✅ **Persistência**: Dados salvos automaticamente
✅ **Flexibilidade**: Equipes e colaboradores individuais
✅ **Profissional**: Design moderno e polido

## 📝 **Suporte**

O sistema é totalmente autocontido e funciona offline. Todos os dados são armazenados localmente no navegador, garantindo privacidade e disponibilidade constante.

---

**Sistema desenvolvido para gestão completa de manutenção e escalas de trabalho.**

