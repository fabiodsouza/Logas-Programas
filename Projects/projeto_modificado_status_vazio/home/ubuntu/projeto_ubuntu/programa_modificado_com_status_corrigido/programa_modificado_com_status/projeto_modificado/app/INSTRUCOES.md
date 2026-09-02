## Instruções para o Sistema de Gestão de Manutenção

Este arquivo contém as instruções para utilizar o sistema de gestão de manutenção, que agora inclui autenticação por senha e formulários estilizados.

### 1. Acessando o Sistema

Para acessar o sistema, abra o arquivo `index.html` no seu navegador de internet (Google Chrome, Mozilla Firefox, Microsoft Edge, etc.).

### 2. Autenticação de Administrador

Para realizar ações de adicionar, editar ou remover itens, você precisará de uma senha de administrador. A senha padrão é: `admin123`.

- Ao clicar em qualquer botão "Adicionar", "Editar" ou "Remover", um modal de autenticação será exibido.
- Digite a senha `admin123` no campo "Senha do administrador" e clique em "Confirmar".
- Se a senha estiver correta, a ação será permitida. Caso contrário, a ação será negada.

### 3. Funcionalidades Protegidas

As seguintes ações exigem autenticação de administrador:

- Adicionar novas obras, manutenções, escalas de plantão, treinamentos, viagens e férias.
- Editar qualquer item existente em todas as seções.
- Remover qualquer item existente em todas as seções.

### 4. Funcionalidades Livres

As seguintes ações não exigem autenticação e podem ser realizadas por qualquer usuário:

- Visualizar todas as seções do sistema.
- Navegar entre as abas (Obras em Andamento, Manutenção Preventiva, etc.).
- Consultar os dados existentes nas tabelas.

### 5. Estrutura do Projeto

O projeto é composto pelos seguintes arquivos:

- `index.html`: O arquivo principal do sistema.
- `script.js`: Contém a lógica JavaScript do sistema, incluindo a autenticação e a manipulação dos formulários.
- `style.css`: Contém os estilos CSS para a aparência geral do sistema e dos formulários.
- `logo_right_style.css`: Contém estilos adicionais para o posicionamento do logo.
- `LogomarcaBranca.png`: A imagem da logomarca utilizada no sistema.

### 6. Personalização (Opcional)

- **Alterar a Senha de Administrador**: Você pode alterar a senha de administrador editando o arquivo `script.js`. Procure pela função `checkAdminPassword` e modifique a senha definida.
- **Estilização**: Para personalizar a aparência do sistema, edite o arquivo `style.css`.

Em caso de dúvidas ou problemas, entre em contato com o suporte técnico.

---

**Desenvolvido por Manus AI**

