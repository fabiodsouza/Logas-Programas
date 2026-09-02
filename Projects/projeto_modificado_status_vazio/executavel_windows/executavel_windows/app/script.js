// Sistema de Gestão de Manutenção - Versão com Modal de Autenticação
// Todos os botões funcionais: Adicionar, Cancelar, X (fechar), Editar, Remover

// Variáveis globais
let currentSection = 'obras';
let editingIndex = -1;
let editingType = '';
let pendingAction = null; // Para armazenar a ação pendente após autenticação

// Função para verificar senha do administrador com modal personalizado
function checkAdminPassword(callback) {
    // Criar modal de autenticação
    const authModal = document.createElement('div');
    authModal.id = 'auth-modal';
    authModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const authContent = document.createElement('div');
    authContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        text-align: center;
        min-width: 300px;
    `;
    
    authContent.innerHTML = `
        <h3 style="margin-bottom: 20px; color: #333;">Autenticação de Administrador</h3>
        <p style="margin-bottom: 20px; color: #666;">Digite a senha do administrador para continuar:</p>
        <input type="password" id="admin-password-input" style="
            width: 100%;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            margin-bottom: 20px;
            font-size: 16px;
        " placeholder="Senha do administrador">
        <div>
            <button id="auth-confirm-btn" style="
                background: #28a745;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                margin-right: 10px;
                cursor: pointer;
                font-size: 16px;
            ">Confirmar</button>
            <button id="auth-cancel-btn" style="
                background: #dc3545;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            ">Cancelar</button>
        </div>
    `;
    
    authModal.appendChild(authContent);
    document.body.appendChild(authModal);
    
    // Focar no campo de senha
    const passwordInput = document.getElementById('admin-password-input');
    passwordInput.focus();
    
    // Função para verificar a senha
    function verifyPassword() {
        const adminPassword = "admin123"; // Senha padrão do administrador
        const userPassword = passwordInput.value;
        
        if (userPassword === adminPassword) {
            document.body.removeChild(authModal);
            callback(true);
        } else {
            alert("Senha incorreta! Acesso negado.");
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
    
    // Event listeners
    document.getElementById('auth-confirm-btn').addEventListener('click', verifyPassword);
    document.getElementById('auth-cancel-btn').addEventListener('click', function() {
        document.body.removeChild(authModal);
        callback(false);
    });
    
    // Permitir confirmar com Enter
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyPassword();
        }
    });
}

// Dados em memória
let data = {
    projects: [],
    maintenances: [],
    plantoes: [],
    treinamentos: [],
    viagens: [],
    ferias: []
};

function loadDataFromLocalStorage() {
    data.projects = JSON.parse(localStorage.getItem('projects')) || [];
    data.maintenances = JSON.parse(localStorage.getItem('maintenances')) || [];
    data.plantoes = JSON.parse(localStorage.getItem('plantoes')) || [];
    data.treinamentos = JSON.parse(localStorage.getItem('treinamentos')) || [];
    data.viagens = JSON.parse(localStorage.getItem('viagens')) || [];
    data.ferias = JSON.parse(localStorage.getItem('ferias')) || [];
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando sistema...');
    initializeSystem();
});

function initializeSystem() {
    loadDataFromLocalStorage(); // Carregar dados na inicialização
    // Fechar todos os modais primeiro
    closeAllModals();
    
    // Configurar navegação
    setupNavigation();
    
    // Configurar event listeners usando delegação
    setupEventDelegation();
    
    // Configurar event listeners específicos
    setupSpecificEventListeners();
    
    // Mostrar seção inicial
    showSection('obras');
    
    console.log('Sistema inicializado com sucesso');
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

function setupNavigation() {
    // Usar delegação de eventos para navegação
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('nav-btn')) {
            e.preventDefault();
            e.stopPropagation();
            
            const sectionId = e.target.id.replace('nav-', '');
            showSection(sectionId);
        }
    });
}

function setupEventDelegation() {
    // Usar delegação de eventos para todos os botões
    document.addEventListener('click', function(e) {
        const target = e.target;
        
        // Botões de adicionar - com autenticação
        if (target.id === 'add-project-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Adicionar Obra clicado');
            checkAdminPassword(function(authenticated) {
                if (authenticated) {
                    openModal('project');
                }
            });
        }
        else if (target.id === 'add-maintenance-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Adicionar Manutenção clicado');
            checkAdminPassword(function(authenticated) {
                if (authenticated) {
                    openModal('maintenance');
                }
            });
        }
        else if (target.id === 'add-plantao-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Adicionar Plantão clicado');
            checkAdminPassword(function(authenticated) {
                if (authenticated) {
                    openModal('plantao');
                }
            });
        }
        else if (target.id === 'add-treinamento-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Adicionar Treinamento clicado');
            checkAdminPassword(function(authenticated) {
                if (authenticated) {
                    openModal('treinamento');
                }
            });
        }
        else if (target.id === 'add-viagem-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Adicionar Viagem clicado');
            checkAdminPassword(function(authenticated) {
                if (authenticated) {
                    openModal('viagem');
                }
            });
        }
        else if (target.id === 'add-ferias-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Adicionar Férias clicado');
            checkAdminPassword(function(authenticated) {
                if (authenticated) {
                    openModal('ferias');
                }
            });
        }
        
        // Botões de fechar (X) - Corrigido para todas as classes
        else if (target.classList.contains('close') || 
                 target.classList.contains('close-maintenance') ||
                 target.classList.contains('close-plantao') ||
                 target.classList.contains('close-treinamento') ||
                 target.classList.contains('close-viagem') ||
                 target.classList.contains('close-ferias')) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Fechar (X) clicado');
            closeModal();
        }
        
        // Botões de cancelar
        else if (target.id === 'cancel-btn' || 
                 target.id === 'maintenance-cancel-btn' ||
                 target.id === 'plantao-cancel-btn' ||
                 target.id === 'treinamento-cancel-btn' ||
                 target.id === 'viagem-cancel-btn' ||
                 target.id === 'ferias-cancel-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Cancelar clicado');
            closeModal();
        }
        
        // Botões de submit (adicionar/salvar)
        else if (target.id === 'submit-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Submit Obra clicado');
            saveProject();
        }
        else if (target.id === 'maintenance-submit-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Submit Manutenção clicado');
            saveMaintenance();
        }
        else if (target.id === 'plantao-submit-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Submit Plantão clicado');
            savePlantao();
        }
        else if (target.id === 'treinamento-submit-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Submit Treinamento clicado');
            saveTreinamento();
        }
        else if (target.id === 'viagem-submit-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Submit Viagem clicado');
            saveViagem();
        }
        else if (target.id === 'ferias-submit-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Submit Férias clicado');
            saveFerias();
        }
        
        // Botões de exportação Excel
        else if (target.classList.contains('btn-export')) {
            e.preventDefault();
            e.stopPropagation();
            const section = getCurrentSection();
            exportToExcel(section);
        }
    });
    
    // Event listener para fechar modal clicando fora
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

function setupSpecificEventListeners() {
    // Event listeners para formulários (submit)
    document.addEventListener('submit', function(e) {
        e.preventDefault(); // Sempre prevenir submit padrão
    });
    
    // Event listener para slider de progresso
    document.addEventListener('input', function(e) {
        if (e.target.id === 'progress') {
            const progressValue = document.getElementById('progress-value');
            if (progressValue) {
                progressValue.textContent = e.target.value + '%';
            }
        }
        
        // Event listener para campo de colaborador em viagens
        if (e.target.id === 'viagem-colaborador') {
            const nomeIndividualGroup = document.getElementById('nome-individual-group');
            if (nomeIndividualGroup) {
                if (e.target.value === 'Individual') {
                    nomeIndividualGroup.style.display = 'block';
                } else {
                    nomeIndividualGroup.style.display = 'none';
                }
            }
        }
    });
    
    // Event listeners para cálculo automático do intervalo de férias
    document.addEventListener('change', function(e) {
        if (e.target.id === 'ferias-data-inicio' || e.target.id === 'ferias-data-termino') {
            calcularIntervaloFerias();
        }
    });
}

function showSection(sectionId) {
    console.log('Mostrando seção:', sectionId);
    
    // Fechar todos os modais
    closeAllModals();
    
    // Ocultar todas as seções
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Remover classe active de todos os botões de navegação
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar seção selecionada
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Ativar botão correspondente
    const targetButton = document.getElementById(`nav-${sectionId}`);
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    currentSection = sectionId;
    
    // Atualizar display da seção
    updateDisplay(sectionId);
}

function getCurrentSection() {
    return currentSection;
}

function openModal(type, index = -1) {
    console.log('Abrindo modal:', type, 'índice:', index);
    
    let modalId, titleId, submitBtnId, formId;
    
    switch (type) {
        case 'project':
            modalId = 'project-modal';
            titleId = 'modal-title';
            submitBtnId = 'submit-btn';
            formId = 'project-form';
            break;
        case 'maintenance':
            modalId = 'maintenance-modal';
            titleId = 'maintenance-modal-title';
            submitBtnId = 'maintenance-submit-btn';
            formId = 'maintenance-form';
            break;
        case 'plantao':
            modalId = 'plantao-modal';
            titleId = 'plantao-modal-title';
            submitBtnId = 'plantao-submit-btn';
            formId = 'plantao-form';
            break;
        case 'treinamento':
            modalId = 'treinamento-modal';
            titleId = 'treinamento-modal-title';
            submitBtnId = 'treinamento-submit-btn';
            formId = 'treinamento-form';
            break;
        case 'viagem':
            modalId = 'viagem-modal';
            titleId = 'viagem-modal-title';
            submitBtnId = 'viagem-submit-btn';
            formId = 'viagem-form';
            break;
        case 'ferias':
            modalId = 'ferias-modal';
            titleId = 'ferias-modal-title';
            submitBtnId = 'ferias-submit-btn';
            formId = 'ferias-form';
            break;
    }
    
    const modal = document.getElementById(modalId);
    const title = document.getElementById(titleId);
    const submitBtn = document.getElementById(submitBtnId);
    const form = document.getElementById(formId);
    
    if (!modal) {
        console.error('Modal não encontrado:', modalId);
        return;
    }
    
    // Configurar modo de edição
    editingIndex = index;
    editingType = type;
    
    // Configurar título e botão baseado no modo (adicionar/editar)
    if (index >= 0) {
        if (title) title.textContent = `Editar ${getTypeName(type)}`;
        if (submitBtn) submitBtn.textContent = 'Salvar Alterações';
        fillForm(type, index);
    } else {
        if (title) title.textContent = `Adicionar ${getTypeName(type)}`;
        if (submitBtn) submitBtn.textContent = `Adicionar ${getTypeName(type)}`;
        clearForm(formId); // Limpa o formulário específico
    }
    
    // Mostrar modal
    modal.style.display = 'block';
    
    // Focar no primeiro campo
    setTimeout(() => {
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    }, 100);
}

function closeModal() {
    console.log('Fechando modal');
    
    // Ocultar o modal que está atualmente visível
    const activeModal = document.querySelector('.modal[style*="display: block"]');
    if (activeModal) {
        activeModal.style.display = 'none';
        // Limpar o formulário do modal que foi fechado
        const form = activeModal.querySelector('form');
        if (form && form.reset) {
            form.reset();
        }
    }
    
    // Resetar variáveis de edição
    editingIndex = -1;
    editingType = '';
    
    // Resetar campos específicos que não são limpos pelo form.reset()
    const progressValue = document.getElementById('progress-value');
    if (progressValue) {
        progressValue.textContent = '0%';
    }
    
    const nomeIndividualGroup = document.getElementById('nome-individual-group');
    if (nomeIndividualGroup) {
        nomeIndividualGroup.style.display = 'none';
    }
}

function getTypeName(type) {
    const names = {
        'project': 'Nova Obra',
        'maintenance': 'Nova Manutenção',
        'plantao': 'Nova Escala de Plantão',
        'treinamento': 'Novo Treinamento',
        'viagem': 'Nova Viagem',
        'ferias': 'Nova Escala de Férias'
    };
    return names[type] || type;
}

function fillForm(type, index) {
    console.log('Preenchendo formulário:', type, index);
    
    // Recarregar dados do localStorage antes de preencher o formulário
    loadDataFromLocalStorage();

    let item;
    switch (type) {
        case 'project':
            item = data.projects[index];
            if (item) {
                document.getElementById('project-name').value = item.name || '';
                document.getElementById('urgency').value = item.urgency || '';
                document.getElementById('responsible').value = item.responsible || '';
                document.getElementById('specificity').value = item.specificity || '';
                document.getElementById('location').value = item.location || '';
                document.getElementById('deadline').value = item.deadline || '';
                document.getElementById('progress').value = item.progress || 0;
                document.getElementById('progress-value').textContent = (item.progress || 0) + '%';
                document.getElementById("status").value = item.status || '';
            }
            break;
        case 'maintenance':
            item = data.maintenances[index];
            if (item) {
                document.getElementById('client').value = item.client || '';
                document.getElementById('maintenance-date').value = item.date || '';
                document.getElementById('maintenance-type').value = item.type || '';
                document.getElementById('technician').value = item.technician || '';
                document.getElementById('reserved-car').value = item.vehicle || '';
                document.getElementById('main-actions').value = item.activities || '';
            }
            break;
        case 'plantao':
            item = data.plantoes[index];
            if (item) {
                document.getElementById('plantao-colaborador').value = item.colaborador || '';
                document.getElementById('plantao-data-inicio').value = item.dataInicio || '';
                document.getElementById('plantao-data-termino').value = item.dataTermino || '';
            }
            break;
        case 'treinamento':
            item = data.treinamentos[index];
            if (item) {
                document.getElementById('treinamento-colaborador').value = item.colaborador || '';
                document.getElementById('treinamento-nome').value = item.nome || '';
                document.getElementById('treinamento-local').value = item.local || '';
                document.getElementById('treinamento-data').value = item.data || '';
                document.getElementById('treinamento-horario').value = item.horario || '';
            }
            break;
        case 'viagem':
            item = data.viagens[index];
            if (item) {
                document.getElementById('viagem-colaborador').value = item.tipoColaborador || '';
                document.getElementById('viagem-nome-individual').value = item.nomeIndividual || '';
                document.getElementById('viagem-local').value = item.local || '';
                document.getElementById('viagem-intervalo').value = item.intervalo || '';
                document.getElementById('viagem-data').value = item.data || '';
                document.getElementById('viagem-transporte').value = item.transporte || '';
                
                // Mostrar campo individual se necessário
                const nomeIndividualGroup = document.getElementById('nome-individual-group');
                if (nomeIndividualGroup && item.tipoColaborador === 'Individual') {
                    nomeIndividualGroup.style.display = 'block';
                }
            }
            break;
        case 'ferias':
            item = data.ferias[index];
            if (item) {
                document.getElementById('ferias-colaborador').value = item.colaborador || '';
                document.getElementById('ferias-data-inicio').value = item.dataInicio || '';
                document.getElementById('ferias-data-termino').value = item.dataTermino || '';
                document.getElementById('ferias-intervalo').value = item.intervalo || '';
            }
            break;
    }
}

function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form && form.reset) {
        form.reset();
    }
    
    // Limpar campos específicos se necessário
    const progressValue = document.getElementById('progress-value');
    if (progressValue) {
        progressValue.textContent = '0%';
    }
    
    const nomeIndividualGroup = document.getElementById('nome-individual-group');
    if (nomeIndividualGroup) {
        nomeIndividualGroup.style.display = 'none';
    }
}

function saveProject() {
    console.log('Salvando projeto');
    
    // Capturar o valor da data e garantir que está no formato correto
    const deadlineValue = document.getElementById('deadline')?.value || '';
    let normalizedDeadline = '';
    
    if (deadlineValue) {
        // Se o valor contém hífen e tem 10 caracteres, assumir formato YYYY-MM-DD
        if (deadlineValue.includes('-') && deadlineValue.length === 10) {
            normalizedDeadline = deadlineValue;
        } else {
            // Tentar criar uma data válida
            const date = new Date(deadlineValue);
            if (!isNaN(date.getTime())) {
                normalizedDeadline = date.toISOString().split('T')[0];
            }
        }
    }
    
    const formData = {
        name: document.getElementById('project-name')?.value || '',
        urgency: document.getElementById('urgency')?.value || '',
        responsible: document.getElementById('responsible')?.value || '',
        specificity: document.getElementById('specificity')?.value || '',
        location: document.getElementById('location')?.value || '',
        deadline: normalizedDeadline,
        progress: parseInt(document.getElementById('progress')?.value || 0),
        status: document.getElementById("status")?.value || ''
    };
    
    // Validação básica
    if (!formData.name.trim()) {
        alert('Por favor, preencha o nome do projeto.');
        return;
    }
    
    if (editingIndex >= 0) {
        // Modo edição
        data.projects[editingIndex] = formData;
        alert('Projeto atualizado com sucesso!');
    } else {
        // Modo adição
        data.projects.push(formData);
        alert('Projeto adicionado com sucesso!');
    }
    
    localStorage.setItem('projects', JSON.stringify(data.projects));
    loadDataFromLocalStorage(); // Recarregar dados após salvar
    updateDisplay('obras');
    closeModal();
}

function saveMaintenance() {
    console.log('Salvando manutenção');
    
    const formData = {
        client: document.getElementById('client')?.value || '',
        date: document.getElementById('maintenance-date')?.value || '',
        type: document.getElementById('maintenance-type')?.value || '',
        technician: document.getElementById('technician')?.value || '',
        vehicle: document.getElementById('reserved-car')?.value || '',
        activities: document.getElementById('main-actions')?.value || ''
    };
    
    // Validação básica
    if (!formData.client.trim()) {
        alert('Por favor, preencha o nome do cliente.');
        return;
    }
    
    if (editingIndex >= 0) {
        // Modo edição
        data.maintenances[editingIndex] = formData;
        alert('Manutenção atualizada com sucesso!');
    } else {
        // Modo adição
        data.maintenances.push(formData);
        alert('Manutenção adicionada com sucesso!');
    }
    
    localStorage.setItem('maintenances', JSON.stringify(data.maintenances));
    loadDataFromLocalStorage(); // Recarregar dados após salvar
    updateDisplay('preventiva');
    closeModal();
}

function savePlantao() {
    console.log('Salvando plantão');
    
    const formData = {
        colaborador: document.getElementById('plantao-colaborador')?.value || '',
        dataInicio: document.getElementById('plantao-data-inicio')?.value || '',
        dataTermino: document.getElementById('plantao-data-termino')?.value || ''
    };
    
    // Validação básica
    if (!formData.colaborador.trim()) {
        alert('Por favor, preencha o nome do colaborador.');
        return;
    }
    
    if (editingIndex >= 0) {
        // Modo edição
        data.plantoes[editingIndex] = formData;
        alert('Escala de plantão atualizada com sucesso!');
    } else {
        // Modo adição
        data.plantoes.push(formData);
        alert('Escala de plantão adicionada com sucesso!');
    }
    
    localStorage.setItem('plantoes', JSON.stringify(data.plantoes));
    loadDataFromLocalStorage(); // Recarregar dados após salvar
    updateDisplay('plantao');
    closeModal();
}

function saveTreinamento() {
    console.log('Salvando treinamento');
    
    const formData = {
        colaborador: document.getElementById('treinamento-colaborador')?.value || '',
        nome: document.getElementById('treinamento-nome')?.value || '',
        local: document.getElementById('treinamento-local')?.value || '',
        data: document.getElementById('treinamento-data')?.value || '',
        horario: document.getElementById('treinamento-horario')?.value || ''
    };
    
    // Validação básica
    if (!formData.colaborador.trim()) {
        alert('Por favor, preencha o nome do colaborador.');
        return;
    }
    
    if (editingIndex >= 0) {
        // Modo edição
        data.treinamentos[editingIndex] = formData;
        alert('Treinamento atualizado com sucesso!');
    } else {
        // Modo adição
        data.treinamentos.push(formData);
        alert('Treinamento adicionado com sucesso!');
    }
    
    localStorage.setItem('treinamentos', JSON.stringify(data.treinamentos));
    loadDataFromLocalStorage(); // Recarregar dados após salvar
    updateDisplay('treinamentos');
    closeModal();
}

function saveViagem() {
    console.log('Salvando viagem');
    
    const tipoColaborador = document.getElementById('viagem-colaborador')?.value || '';
    const nomeIndividual = document.getElementById('viagem-nome-individual')?.value || '';
    
    let colaboradorFinal = tipoColaborador;
    if (tipoColaborador === 'Individual' && nomeIndividual) {
        colaboradorFinal = nomeIndividual;
    }
    
    const formData = {
        tipoColaborador: tipoColaborador,
        nomeIndividual: nomeIndividual,
        colaborador: colaboradorFinal,
        local: document.getElementById('viagem-local')?.value || '',
        intervalo: document.getElementById('viagem-intervalo')?.value || '',
        data: document.getElementById('viagem-data')?.value || '',
        transporte: document.getElementById('viagem-transporte')?.value || ''
    };
    
    // Validação básica
    if (!formData.colaborador.trim()) {
        alert('Por favor, preencha o colaborador.');
        return;
    }
    
    if (editingIndex >= 0) {
        // Modo edição
        data.viagens[editingIndex] = formData;
        alert('Viagem atualizada com sucesso!');
    } else {
        // Modo adição
        data.viagens.push(formData);
        alert('Viagem adicionada com sucesso!');
    }
    
    localStorage.setItem('viagens', JSON.stringify(data.viagens));
    loadDataFromLocalStorage(); // Recarregar dados após salvar
    updateDisplay('viagens');
    closeModal();
}

function updateDisplay(sectionId) {
    console.log('Atualizando display da seção:', sectionId);
    loadDataFromLocalStorage(); // Garantir que os dados estejam atualizados antes de renderizar
    
    switch (sectionId) {
        case 'obras':
            updateProjectsDisplay();
            break;
        case 'preventiva':
            updateMaintenanceDisplay();
            break;
        case 'plantao':
            updatePlantaoDisplay();
            break;
        case 'treinamentos':
            updateTreinamentoDisplay();
            break;
        case 'viagens':
            updateViagemDisplay();
            break;
        case 'ferias':
            renderFeriasList();
            break;
    }
}

function updateProjectsDisplay() {
    const tbody = document.getElementById('project-list');
    const emptyState = document.getElementById('empty-state');
    const table = document.querySelector('#obras-section .dashboard-table table');
    
    if (data.projects.length === 0) {
        if (table) table.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (table) table.style.display = 'table';
    if (emptyState) emptyState.style.display = 'none';
    
    if (tbody) {
        tbody.innerHTML = data.projects.map((project, index) => `
            <tr>
                <td>${project.name}</td>
                <td><span class="badge badge-${project.urgency.toLowerCase()}">${project.urgency}</span></td>
                <td>${project.responsible}</td>
                <td>${project.specificity}</td>
                <td>${project.location}</td>
                <td>${formatDate(project.deadline)}</td>
                <td>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${project.progress}%"></div>
                        </div>
                        <span class="progress-text">${project.progress}%</span>
                    </div>
                </td>
                <td><span class="badge badge-${project.status.toLowerCase().replace(/ /g, ".")}">${project.status}</span></td>
                <td class="actions">
                    <button class="btn-edit" onclick="editProject(${index})">Editar</button>
                    <button class="btn-delete" onclick="deleteProject(${index})">Remover</button>
                </td>
            </tr>
        `).join('');
    }
}

function updateMaintenanceDisplay() {
    const tbody = document.getElementById('maintenance-list');
    const emptyState = document.getElementById('maintenance-empty-state');
    const table = document.querySelector('#preventiva-section .dashboard-table table');
    
    if (data.maintenances.length === 0) {
        if (table) table.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (table) table.style.display = 'table';
    if (emptyState) emptyState.style.display = 'none';
    
    if (tbody) {
        tbody.innerHTML = data.maintenances.map((maintenance, index) => `
            <tr>
                <td>${maintenance.client}</td>
                <td>${formatDate(maintenance.date)}</td>
                <td><span class="badge badge-info">${maintenance.type}</span></td>
                <td>${maintenance.technician}</td>
                <td>${maintenance.vehicle}</td>
                <td>${maintenance.activities}</td>
                <td class="actions">
                    <button class="btn-edit" onclick="editMaintenance(${index})">Editar</button>
                    <button class="btn-delete" onclick="deleteMaintenance(${index})">Remover</button>
                </td>
            </tr>
        `).join('');
    }
}

function updatePlantaoDisplay() {
    const tbody = document.getElementById('plantao-list');
    const emptyState = document.getElementById('plantao-empty-state');
    const table = document.querySelector('#plantao-section .dashboard-table table');
    
    if (data.plantoes.length === 0) {
        if (table) table.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (table) table.style.display = 'table';
    if (emptyState) emptyState.style.display = 'none';
    
    if (tbody) {
        tbody.innerHTML = data.plantoes.map((plantao, index) => `
            <tr>
                <td>${plantao.colaborador}</td>
                <td>${formatDate(plantao.dataInicio)}</td>
                <td>${formatDate(plantao.dataTermino)}</td>
                <td class="actions">
                    <button class="btn-edit" onclick="editPlantao(${index})">Editar</button>
                    <button class="btn-delete" onclick="deletePlantao(${index})">Remover</button>
                </td>
            </tr>
        `).join('');
    }
}

function updateTreinamentoDisplay() {
    const tbody = document.getElementById('treinamento-list');
    const emptyState = document.getElementById('treinamento-empty-state');
    const table = document.querySelector('#treinamentos-section .dashboard-table table');
    
    if (data.treinamentos.length === 0) {
        if (table) table.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (table) table.style.display = 'table';
    if (emptyState) emptyState.style.display = 'none';
    
    if (tbody) {
        tbody.innerHTML = data.treinamentos.map((treinamento, index) => `
            <tr>
                <td>${treinamento.colaborador}</td>
                <td>${treinamento.nome}</td>
                <td>${treinamento.local}</td>
                <td>${formatDate(treinamento.data)}</td>
                <td>${treinamento.horario}</td>
                <td class="actions">
                    <button class="btn-edit" onclick="editTreinamento(${index})">Editar</button>
                    <button class="btn-delete" onclick="deleteTreinamento(${index})">Remover</button>
                </td>
            </tr>
        `).join('');
    }
}

function updateViagemDisplay() {
    const tbody = document.getElementById('viagem-list');
    const emptyState = document.getElementById('viagem-empty-state');
    const table = document.querySelector('#viagens-section .dashboard-table table');
    
    if (data.viagens.length === 0) {
        if (table) table.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (table) table.style.display = 'table';
    if (emptyState) emptyState.style.display = 'none';
    
    if (tbody) {
        tbody.innerHTML = data.viagens.map((viagem, index) => `
            <tr>
                <td>${viagem.colaborador}</td>
                <td>${viagem.local}</td>
                <td>${viagem.intervalo}</td>
                <td>${formatDate(viagem.data)}</td>
                <td><span class="badge badge-transport">${viagem.transporte}</span></td>
                <td class="actions">
                    <button class="btn-edit" onclick="editViagem(${index})">Editar</button>
                    <button class="btn-delete" onclick="deleteViagem(${index})">Remover</button>
                </td>
            </tr>
        `).join('');
    }
}

function updateProjectStatus(index, newStatus) {
    console.log('Atualizando status do projeto:', index, 'para:', newStatus);
    
    // Atualizar o status no array de dados
    if (data.projects[index]) {
        data.projects[index].status = newStatus;
        
        // Salvar no localStorage
        localStorage.setItem('projects', JSON.stringify(data.projects));
        
        // Recarregar dados para garantir consistência
        loadDataFromLocalStorage();
        
        console.log('Status atualizado com sucesso!');
    }
}

function exportToExcel(section) {
    console.log('Exportando para Excel:', section);
    alert('Funcionalidade de exportação Excel será implementada em breve!');
}

function formatDate(dateString) {
    if (!dateString) return '';
    
    // Se a data está no formato YYYY-MM-DD, vamos tratá-la como data local
    if (dateString.includes('-') && dateString.length === 10) {
        const [year, month, day] = dateString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString('pt-BR');
    }
    
    // Para outros formatos, usar o comportamento padrão
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Funções de edição - com autenticação
function editProject(index) {
    checkAdminPassword(function(authenticated) {
        if (authenticated) {
            openModal('project', index);
        }
    });
}

function editMaintenance(index) {
    checkAdminPassword(function(authenticated) {
        if (authenticated) {
            openModal('maintenance', index);
        }
    });
}

function editPlantao(index) {
    checkAdminPassword(function(authenticated) {
        if (authenticated) {
            openModal('plantao', index);
        }
    });
}

function editTreinamento(index) {
    checkAdminPassword(function(authenticated) {
        if (authenticated) {
            openModal('treinamento', index);
        }
    });
}

function editViagem(index) {
    checkAdminPassword(function(authenticated) {
        if (authenticated) {
            openModal('viagem', index);
        }
    });
}

// Funções de delete - com autenticação
function deleteProject(index) {
    checkAdminPassword(function(authenticated) {
        if (authenticated) {
            if (confirm('Tem certeza que deseja remover esta obra?')) {
                data.projects.splice(index, 1);
                localStorage.setItem('projects', JSON.stringify(data.projects));
                loadDataFromLocalStorage(); // Recarregar dados após deletar
                updateDisplay('obras');
            }
        }
    });
}

function deleteMaintenance(index) {
    checkAdminPassword(function(authenticated) {
        if (authenticated) {
            if (confirm('Tem certeza que deseja remover esta manutenção?')) {
                data.maintenances.splice(index, 1);
                localStorage.setItem('maintenances', JSON.stringify(data.maintenances));
                loadDataFromLocalStorage(); // Recarregar dados após deletar
                updateDisplay('preventiva');
            }
        }
    });
}

function deletePlantao(index) {
    checkAdminPassword(function(authenticated) {
        if (authenticated) {
            if (confirm('Tem certeza que deseja remover esta escala de plantão?')) {
                data.plantoes.splice(index, 1);
                localStorage.setItem('plantoes', JSON.stringify(data.plantoes));
                loadDataFromLocalStorage(); // Recarregar dados após deletar
                updateDisplay('plantao');
            }
        }
    });
}

function deleteTreinamento(index) {
    checkAdminPassword(function(authenticated) {
        if (authenticated) {
            if (confirm('Tem certeza que deseja remover este treinamento?')) {
                data.treinamentos.splice(index, 1);
                localStorage.setItem('treinamentos', JSON.stringify(data.treinamentos));
                loadDataFromLocalStorage(); // Recarregar dados após deletar
                updateDisplay('treinamentos');
            }
        }
    });
}

function deleteViagem(index) {
    checkAdminPassword(function(authenticated) {
        if (authenticated) {
            if (confirm('Tem certeza que deseja remover esta viagem?')) {
                data.viagens.splice(index, 1);
                localStorage.setItem('viagens', JSON.stringify(data.viagens));
                loadDataFromLocalStorage(); // Recarregar dados após deletar
                updateDisplay('viagens');
            }
        }
    });
}

// Função para calcular o intervalo de férias automaticamente
function calcularIntervaloFerias() {
    const dataInicio = document.getElementById('ferias-data-inicio')?.value;
    const dataTermino = document.getElementById('ferias-data-termino')?.value;
    const intervaloField = document.getElementById('ferias-intervalo');
    
    if (dataInicio && dataTermino && intervaloField) {
        const inicio = new Date(dataInicio);
        const termino = new Date(dataTermino);
        
        if (termino >= inicio) {
            // Calcular a diferença em dias (incluindo o dia de início e término)
            const diffTime = Math.abs(termino - inicio);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            intervaloField.value = diffDays + ' dias';
        } else {
            intervaloField.value = '';
        }
    }
}

// Função para salvar férias
function saveFerias() {
    console.log('Salvando férias');
    
    const formData = {
        colaborador: document.getElementById('ferias-colaborador')?.value || '',
        dataInicio: document.getElementById('ferias-data-inicio')?.value || '',
        dataTermino: document.getElementById('ferias-data-termino')?.value || '',
        intervalo: document.getElementById('ferias-intervalo')?.value || ''
    };
    
    // Validação básica
    if (!formData.colaborador || !formData.dataInicio || !formData.dataTermino) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Validar se a data de término é posterior à data de início
    const inicio = new Date(formData.dataInicio);
    const termino = new Date(formData.dataTermino);
    
    if (termino < inicio) {
        alert('A data de término deve ser posterior à data de início.');
        return;
    }
    
    // Recalcular o intervalo antes de salvar
    const diffTime = Math.abs(termino - inicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    formData.intervalo = diffDays + ' dias';
    
    if (editingIndex >= 0 && editingType === 'ferias') {
        // Editando férias existente
        data.ferias[editingIndex] = formData;
        console.log('Férias editada:', formData);
    } else {
        // Adicionando nova férias
        data.ferias.push(formData);
        console.log('Nova férias adicionada:', formData);
    }
    
    // Salvar no localStorage
    localStorage.setItem('ferias', JSON.stringify(data.ferias));
    
    // Fechar modal e atualizar display
    closeModal();
    updateDisplay('ferias');
}

// Função para renderizar a lista de férias
function renderFeriasList() {
    const feriasList = document.getElementById('ferias-list');
    const emptyState = document.getElementById('ferias-empty-state');
    const table = document.getElementById('ferias-table');
    
    if (!feriasList) {
        console.error('Lista de férias não encontrada');
        return;
    }
    
    if (data.ferias.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        if (table) table.style.display = 'none';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    if (table) table.style.display = 'table';
    
    feriasList.innerHTML = '';
    
    data.ferias.forEach((ferias, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ferias.colaborador}</td>
            <td>${formatDate(ferias.dataInicio)}</td>
            <td>${formatDate(ferias.dataTermino)}</td>
            <td>${ferias.intervalo}</td>
            <td>
                <button onclick="editFerias(${index})" class="btn-edit">Editar</button>
                <button onclick="deleteFerias(${index})" class="btn-delete">Remover</button>
            </td>
        `;
        feriasList.appendChild(row);
    });
}

// Função para editar férias - com autenticação
function editFerias(index) {
    console.log('Editando férias:', index);
    checkAdminPassword(function(authenticated) {
        if (authenticated) {
            openModal('ferias', index);
        }
    });
}

// Função para deletar férias - com autenticação
function deleteFerias(index) {
    checkAdminPassword(function(authenticated) {
        if (authenticated) {
            if (confirm('Tem certeza que deseja remover esta escala de férias?')) {
                data.ferias.splice(index, 1);
                localStorage.setItem('ferias', JSON.stringify(data.ferias));
                loadDataFromLocalStorage(); // Recarregar dados após deletar
                updateDisplay('ferias');
            }
        }
    });
}

console.log('Script final carregado com sucesso - Todos os botões funcionais com autenticação por modal');



function updateProjectStatus(index, newStatus) {
    if (index >= 0 && index < data.projects.length) {
        data.projects[index].status = newStatus;
        localStorage.setItem('projects', JSON.stringify(data.projects));
        updateProjectsDisplay(); // Atualiza a exibição para refletir a mudança
    }
}

