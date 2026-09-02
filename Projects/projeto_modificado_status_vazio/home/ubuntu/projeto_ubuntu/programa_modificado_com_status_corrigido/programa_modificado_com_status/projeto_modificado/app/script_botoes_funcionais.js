// Sistema de Gestão de Manutenção - Versão com Botões Funcionais
// Usando delegação de eventos para garantir que os botões funcionem

// Variáveis globais
let dashboard;
let currentSection = 'obras';

// Dados em memória
const data = {
    projects: JSON.parse(localStorage.getItem('projects')) || [],
    maintenances: JSON.parse(localStorage.getItem('maintenances')) || [],
    plantoes: JSON.parse(localStorage.getItem('plantoes')) || [],
    treinamentos: JSON.parse(localStorage.getItem('treinamentos')) || [],
    viagens: JSON.parse(localStorage.getItem('viagens')) || []
};

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando sistema...');
    initializeSystem();
});

function initializeSystem() {
    // Fechar todos os modais primeiro
    closeAllModals();
    
    // Configurar navegação
    setupNavigation();
    
    // Configurar event listeners usando delegação
    setupEventDelegation();
    
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
        
        // Botões de fechar (X)
        else if (target.classList.contains("close") || target.classList.contains("close-maintenance") || target.classList.contains("close-plantao") || target.classList.contains("close-treinamento") || target.classList.contains("close-viagem")) {
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
        
        // Botões de exportação Excel
        else if (target.classList.contains('btn-export')) {
            e.preventDefault();
            e.stopPropagation();
            const section = getCurrentSection();
            exportToExcel(section);
        }
    });
    
    // Event listeners para formulários
    document.addEventListener('submit', function(e) {
        if (e.target.id === 'project-form') {
            e.preventDefault();
            saveProject();
        }
        else if (e.target.id === 'maintenance-form') {
            e.preventDefault();
            saveMaintenance();
        }
        else if (e.target.id === 'plantao-form') {
            e.preventDefault();
            savePlantao();
        }
        else if (e.target.id === 'treinamento-form') {
            e.preventDefault();
            saveTreinamento();
        }
        else if (e.target.id === 'viagem-form') {
            e.preventDefault();
            saveViagem();
        }
    });
    
    // Event listener para fechar modal clicando fora
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
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
    
    // Atualizar botões de exportação
    updateExportButtons();
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
    
    // Configurar título e botão baseado no modo (adicionar/editar)
    if (index >= 0) {
        if (title) title.textContent = `Editar ${getTypeName(type)}`;
        if (submitBtn) submitBtn.textContent = 'Salvar Alterações';
        fillForm(type, index);
    } else {
        if (title) title.textContent = `Adicionar ${getTypeName(type)}`;
        if (submitBtn) submitBtn.textContent = `Adicionar ${getTypeName(type)}`;
        clearForm(formId);
    }
    
    // Mostrar modal
    modal.style.display = 'block';
    
    // Armazenar informações do modal atual
    modal.dataset.type = type;
    modal.dataset.index = index;
}

function closeModal() {
    console.log('Fechando modal');
    
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
        modal.dataset.type = '';
        modal.dataset.index = '';
    });
    
    // Limpar todos os formulários
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (form.reset) form.reset();
    });
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
    // Implementar preenchimento de formulário baseado no tipo
    console.log('Preenchendo formulário:', type, index);
    // TODO: Implementar preenchimento específico para cada tipo
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
    
    data.projects.push(formData);
    localStorage.setItem('projects', JSON.stringify(data.projects));
    
    updateDisplay('obras');
    updateExportButtons();
    closeModal();
    
    alert('Projeto salvo com sucesso!');
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
    
    data.maintenances.push(formData);
    localStorage.setItem('maintenances', JSON.stringify(data.maintenances));
    
    updateDisplay('preventiva');
    updateExportButtons();
    closeModal();
    
    alert('Manutenção salva com sucesso!');
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
    
    data.plantoes.push(formData);
    localStorage.setItem('plantoes', JSON.stringify(data.plantoes));
    
    updateDisplay('plantao');
    updateExportButtons();
    closeModal();
    
    alert('Escala de plantão salva com sucesso!');
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
    
    data.treinamentos.push(formData);
    localStorage.setItem('treinamentos', JSON.stringify(data.treinamentos));
    
    updateDisplay('treinamentos');
    updateExportButtons();
    closeModal();
    
    alert('Treinamento salvo com sucesso!');
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
    
    data.viagens.push(formData);
    localStorage.setItem('viagens', JSON.stringify(data.viagens));
    
    updateDisplay('viagens');
    updateExportButtons();
    closeModal();
    
    alert('Viagem salva com sucesso!');
}

function updateDisplay(sectionId) {
    console.log('Atualizando display da seção:', sectionId);
    
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

function updateExportButtons() {
    // Implementar lógica de botões de exportação
    console.log('Atualizando botões de exportação');
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
        updateDisplay('obras');
        updateExportButtons();
    }
}

function deleteMaintenance(index) {
    if (confirm('Tem certeza que deseja remover esta manutenção?')) {
        data.maintenances.splice(index, 1);
        localStorage.setItem('maintenances', JSON.stringify(data.maintenances));
        updateDisplay('preventiva');
        updateExportButtons();
    }
}

function deletePlantao(index) {
    if (confirm('Tem certeza que deseja remover esta escala de plantão?')) {
        data.plantoes.splice(index, 1);
        localStorage.setItem('plantoes', JSON.stringify(data.plantoes));
        updateDisplay('plantao');
        updateExportButtons();
    }
}

function deleteTreinamento(index) {
    if (confirm('Tem certeza que deseja remover este treinamento?')) {
        data.treinamentos.splice(index, 1);
        localStorage.setItem('treinamentos', JSON.stringify(data.treinamentos));
        updateDisplay('treinamentos');
        updateExportButtons();
    }
}

function deleteViagem(index) {
    if (confirm('Tem certeza que deseja remover esta viagem?')) {
        data.viagens.splice(index, 1);
        localStorage.setItem('viagens', JSON.stringify(data.viagens));
        updateDisplay('viagens');
        updateExportButtons();
    }
}

// Event listener para slider de progresso
document.addEventListener('input', function(e) {
    if (e.target.id === 'progress') {
        const progressValue = document.getElementById('progress-value');
        if (progressValue) {
            progressValue.textContent = e.target.value + '%';
        }
    }
});

console.log('Script carregado com sucesso');

