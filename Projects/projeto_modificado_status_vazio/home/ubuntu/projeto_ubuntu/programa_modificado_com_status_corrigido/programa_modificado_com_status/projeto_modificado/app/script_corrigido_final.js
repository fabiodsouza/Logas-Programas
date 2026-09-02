// Sistema de Gestão de Manutenção - Versão Final Corrigida
// Todos os botões funcionais: Adicionar, Cancelar, X (fechar), Editar, Remover

// Variáveis globais
let currentSection = 'obras';
let editingIndex = -1;
let editingType = '';

// Dados em memória
let data = {
    projects: [],
    maintenances: [],
    plantoes: [],
    treinamentos: [],
    viagens: []
};

function loadDataFromLocalStorage() {
    data.projects = JSON.parse(localStorage.getItem('projects')) || [];
    data.maintenances = JSON.parse(localStorage.getItem('maintenances')) || [];
    data.plantoes = JSON.parse(localStorage.getItem('plantoes')) || [];
    data.treinamentos = JSON.parse(localStorage.getItem('treinamentos')) || [];
    data.viagens = JSON.parse(localStorage.getItem('viagens')) || [];
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
        
        // Botões de adicionar
        if (target.id === 'add-project-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Adicionar Obra clicado');
            openModal('project');
        }
        else if (target.id === 'add-maintenance-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Adicionar Manutenção clicado');
            openModal('maintenance');
        }
        else if (target.id === 'add-plantao-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Adicionar Plantão clicado');
            openModal('plantao');
        }
        else if (target.id === 'add-treinamento-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Adicionar Treinamento clicado');
            openModal('treinamento');
        }
        else if (target.id === 'add-viagem-btn') {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão Adicionar Viagem clicado');
            openModal('viagem');
        }
        
        // Botões de fechar (X) - Corrigido para todas as classes
        else if (target.classList.contains('close') || 
                 target.classList.contains('close-maintenance') ||
                 target.classList.contains('close-plantao') ||
                 target.classList.contains('close-treinamento') ||
                 target.classList.contains('close-viagem')) {
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
                 target.id === 'viagem-cancel-btn') {
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
        'viagem': 'Nova Viagem'
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
    
    const formData = {
        name: document.getElementById('project-name')?.value || '',
        urgency: document.getElementById('urgency')?.value || '',
        responsible: document.getElementById('responsible')?.value || '',
        specificity: document.getElementById('specificity')?.value || '',
        location: document.getElementById('location')?.value || '',
        deadline: document.getElementById('deadline')?.value || '',
        progress: parseInt(document.getElementById('progress')?.value || 0)
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
                <td class="actions">
                    <button class="btn-edit" onclick="openModal('project', ${index})">Editar</button>
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
                    <button class="btn-edit" onclick="openModal('maintenance', ${index})">Editar</button>
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
                    <button class="btn-edit" onclick="openModal('plantao', ${index})">Editar</button>
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
                    <button class="btn-edit" onclick="openModal('treinamento', ${index})">Editar</button>
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
                    <button class="btn-edit" onclick="openModal('viagem', ${index})">Editar</button>
                    <button class="btn-delete" onclick="deleteViagem(${index})">Remover</button>
                </td>
            </tr>
        `).join('');
    }
}

function exportToExcel(section) {
    console.log('Exportando para Excel:', section);
    alert('Funcionalidade de exportação Excel será implementada em breve!');
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Funções de delete
function deleteProject(index) {
    if (confirm('Tem certeza que deseja remover esta obra?')) {
        data.projects.splice(index, 1);
        localStorage.setItem('projects', JSON.stringify(data.projects));
        loadDataFromLocalStorage(); // Recarregar dados após deletar
        updateDisplay('obras');
    }
}

function deleteMaintenance(index) {
    if (confirm('Tem certeza que deseja remover esta manutenção?')) {
        data.maintenances.splice(index, 1);
        localStorage.setItem('maintenances', JSON.stringify(data.maintenances));
        loadDataFromLocalStorage(); // Recarregar dados após deletar
        updateDisplay('preventiva');
    }
}

function deletePlantao(index) {
    if (confirm('Tem certeza que deseja remover esta escala de plantão?')) {
        data.plantoes.splice(index, 1);
        localStorage.setItem('plantoes', JSON.stringify(data.plantoes));
        loadDataFromLocalStorage(); // Recarregar dados após deletar
        updateDisplay('plantao');
    }
}

function deleteTreinamento(index) {
    if (confirm('Tem certeza que deseja remover este treinamento?')) {
        data.treinamentos.splice(index, 1);
        localStorage.setItem('treinamentos', JSON.stringify(data.treinamentos));
        loadDataFromLocalStorage(); // Recarregar dados após deletar
        updateDisplay('treinamentos');
    }
}

function deleteViagem(index) {
    if (confirm('Tem certeza que deseja remover esta viagem?')) {
        data.viagens.splice(index, 1);
        localStorage.setItem('viagens', JSON.stringify(data.viagens));
        loadDataFromLocalStorage(); // Recarregar dados após deletar
        updateDisplay('viagens');
    }
}

console.log('Script final carregado com sucesso - Todos os botões funcionais');

