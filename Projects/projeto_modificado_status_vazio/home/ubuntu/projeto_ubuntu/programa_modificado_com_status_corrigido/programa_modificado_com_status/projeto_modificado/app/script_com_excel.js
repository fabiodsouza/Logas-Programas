// Classe principal para gerenciar o Dashboard
class MaintenanceDashboard {
    constructor() {
        this.currentSection = 'obras';
        this.projectManager = new ProjectManager();
        this.maintenanceManager = new MaintenanceManager();
        this.plantaoManager = new PlantaoManager();
        this.treinamentoManager = new TreinamentoManager();
        this.viagemManager = new ViagemManager();
        this.excelExporter = new ExcelExporter();
        this.init();
    }

    init() {
        this.setupNavigation();
        this.projectManager.init();
        this.maintenanceManager.init();
        this.plantaoManager.init();
        this.treinamentoManager.init();
        this.viagemManager.init();
        this.excelExporter.init();
        this.showSection('obras');
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sectionId = e.target.id.replace('nav-', '');
                this.showSection(sectionId);
            });
        });
    }

    showSection(sectionId) {
        // Ocultar todas as seções
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Remover classe active de todos os botões
        document.querySelectorAll('.nav-btn').forEach(btn => {
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

        this.currentSection = sectionId;

        // Atualizar displays
        if (sectionId === 'obras') {
            this.projectManager.updateDisplay();
        } else if (sectionId === 'preventiva') {
            this.maintenanceManager.updateDisplay();
        } else if (sectionId === 'plantao') {
            this.plantaoManager.updateDisplay();
        } else if (sectionId === 'treinamentos') {
            this.treinamentoManager.updateDisplay();
        } else if (sectionId === 'viagens') {
            this.viagemManager.updateDisplay();
        }

        // Atualizar botões de exportação
        this.excelExporter.updateExportButtons();
    }
}

// Classe para gerenciar exportação para Excel
class ExcelExporter {
    constructor() {
        this.dashboard = null;
    }

    init() {
        this.setupExportButtons();
    }

    setupExportButtons() {
        // Adicionar botões de exportação em cada seção
        this.addExportButtonToSection('obras-section', 'Exportar Obras para Excel', () => this.exportObras());
        this.addExportButtonToSection('preventiva-section', 'Exportar Manutenções para Excel', () => this.exportManutencoes());
        this.addExportButtonToSection('plantao-section', 'Exportar Plantões para Excel', () => this.exportPlantoes());
        this.addExportButtonToSection('treinamentos-section', 'Exportar Treinamentos para Excel', () => this.exportTreinamentos());
        this.addExportButtonToSection('viagens-section', 'Exportar Viagens para Excel', () => this.exportViagens());
    }

    addExportButtonToSection(sectionId, buttonText, clickHandler) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const addProjectSection = section.querySelector('.add-project-section');
        if (!addProjectSection) return;

        // Verificar se o botão já existe
        if (addProjectSection.querySelector('.btn-export')) return;

        const exportButton = document.createElement('button');
        exportButton.className = 'btn-export';
        exportButton.textContent = buttonText;
        exportButton.style.marginLeft = '10px';
        exportButton.addEventListener('click', clickHandler);

        addProjectSection.appendChild(exportButton);
    }

    updateExportButtons() {
        // Mostrar/ocultar botões de exportação baseado na seção ativa e se há dados
        const sections = ['obras', 'preventiva', 'plantao', 'treinamentos', 'viagens'];
        
        sections.forEach(sectionName => {
            const button = document.querySelector(`#${sectionName}-section .btn-export`);
            if (button) {
                const hasData = this.hasDataForSection(sectionName);
                button.style.display = hasData ? 'inline-block' : 'none';
            }
        });
    }

    hasDataForSection(sectionName) {
        switch (sectionName) {
            case 'obras':
                return dashboard.projectManager.projects.length > 0;
            case 'preventiva':
                return dashboard.maintenanceManager.maintenances.length > 0;
            case 'plantao':
                return dashboard.plantaoManager.plantoes.length > 0;
            case 'treinamentos':
                return dashboard.treinamentoManager.treinamentos.length > 0;
            case 'viagens':
                return dashboard.viagemManager.viagens.length > 0;
            default:
                return false;
        }
    }

    exportObras() {
        const data = dashboard.projectManager.projects;
        if (data.length === 0) {
            alert('Não há obras para exportar.');
            return;
                const headers = [\'Nome do Projeto\', \'Grau de Urgência\', \'Status\', \'Responsável\', \'Especificidade\', \'Local\', \'Prazo/Data\', \'Andamento (%)\"];
        const rows = data.map(project => [
            project.name,
            project.urgency,
            project.status,
            project.responsible,
            project.specificity,
            project.location,
            this.formatDate(project.deadline),
            project.progress
        ]);

        this.downloadExcel(headers, rows, 'Obras_em_Andamento');
    }

    exportManutencoes() {
        const data = dashboard.maintenanceManager.maintenances;
        if (data.length === 0) {
            alert('Não há manutenções para exportar.');
            return;
        }

        const headers = ['Cliente', 'Data', 'Tipo de Manutenção', 'Técnico Escalado', 'Carro Reservado', 'Principais Atuações'];
        const rows = data.map(maintenance => [
            maintenance.client,
            this.formatDate(maintenance.date),
            maintenance.type,
            maintenance.technician,
            maintenance.vehicle,
            maintenance.activities
        ]);

        this.downloadExcel(headers, rows, 'Manutencao_Preventiva');
    }

    exportPlantoes() {
        const data = dashboard.plantaoManager.plantoes;
        if (data.length === 0) {
            alert('Não há plantões para exportar.');
            return;
        }

        const headers = ['Colaborador', 'Data de Início', 'Data de Término'];
        const rows = data.map(plantao => [
            plantao.colaborador,
            this.formatDate(plantao.dataInicio),
            this.formatDate(plantao.dataTermino)
        ]);

        this.downloadExcel(headers, rows, 'Escala_de_Plantao');
    }

    exportTreinamentos() {
        const data = dashboard.treinamentoManager.treinamentos;
        if (data.length === 0) {
            alert('Não há treinamentos para exportar.');
            return;
        }

        const headers = ['Colaborador', 'Treinamento', 'Local', 'Data', 'Horário'];
        const rows = data.map(treinamento => [
            treinamento.colaborador,
            treinamento.nome,
            treinamento.local,
            this.formatDate(treinamento.data),
            treinamento.horario
        ]);

        this.downloadExcel(headers, rows, 'Escala_de_Treinamentos');
    }

    exportViagens() {
        const data = dashboard.viagemManager.viagens;
        if (data.length === 0) {
            alert('Não há viagens para exportar.');
            return;
        }

        const headers = ['Colaborador', 'Local', 'Intervalo da Viagem', 'Data', 'Meio de Transporte'];
        const rows = data.map(viagem => [
            viagem.colaborador,
            viagem.local,
            viagem.intervalo,
            this.formatDate(viagem.data),
            viagem.transporte
        ]);

        this.downloadExcel(headers, rows, 'Escala_de_Viagens');
    }

    downloadExcel(headers, rows, filename) {
        // Criar workbook e worksheet
        const wb = XLSX.utils.book_new();
        const wsData = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Configurar largura das colunas
        const colWidths = headers.map(() => ({ wch: 20 }));
        ws['!cols'] = colWidths;

        // Adicionar worksheet ao workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Dados');

        // Gerar nome do arquivo com data atual
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const finalFilename = `${filename}_${dateStr}.xlsx`;

        // Fazer download
        XLSX.writeFile(wb, finalFilename);
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
}

// Classe para gerenciar Projetos (Obras em Andamento)
class ProjectManager {
    constructor() {
        this.projects = JSON.parse(localStorage.getItem('projects')) || [];
        this.editingIndex = -1;
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Botão adicionar
        document.getElementById('add-project-btn').addEventListener('click', () => {
            console.log('Botão Adicionar Obra clicado');
            this.openModal();
        });

        // Fechar modal
        document.querySelector('#project-modal .close').addEventListener('click', () => {
            console.log('Botão Fechar (X) do modal de Obras clicado');
            this.closeModal();
        });

        // Cancelar
        document.getElementById('cancel-btn').addEventListener('click', () => {
            console.log('Botão Cancelar do modal de Obras clicado');
            this.closeModal();
        });

        // Formulário
        document.getElementById('project-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProject();
        });

        // Slider de progresso
        document.getElementById('progress').addEventListener('input', (e) => {
            document.getElementById('progress-value').textContent = e.target.value + '%';
        });

        // Fechar modal clicando fora
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('project-modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    openModal(index = -1) {
        this.editingIndex = index;
        const modal = document.getElementById('project-modal');
        const title = document.getElementById('modal-title');
        const submitBtn = document.getElementById('submit-btn');

        if (index >= 0) {
            title.textContent = 'Editar Obra';
            submitBtn.textContent = 'Salvar Alterações';
            this.fillForm(this.projects[index]);
        } else {
            title.textContent = 'Adicionar Nova Obra';
            submitBtn.textContent = 'Adicionar Obra';
            this.clearForm();
        }

        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('project-modal').style.display = 'none';
        this.clearForm();
        this.editingIndex = -1;
    }

    fillForm(project) {
        document.getElementById(\'project-name\').value = project.name;
        document.getElementById(\'urgency\').value = project.urgency;
        document.getElementById(\'responsible\').value = project.responsible;
        document.getElementById(\'specificity\').value = project.specificity;
        document.getElementById(\'location\').value = project.location;
        document.getElementById(\'deadline\').value = project.deadline;
        document.getElementById(\'progress\').value = project.progress;
        document.getElementById(\'progress-value\').textContent = project.progress + \'%\';
        document.getElementById(\'status\').value = project.status;
    }

    clearForm() {
        document.getElementById(\'project-form\').reset();
        document.getElementById(\'progress-value\').textContent = \'0%\';
    }

    saveProject() {
        const formData = {
            name: document.getElementById('project-name').value,
            urgency: document.getElementById('urgency').value,
            responsible: document.getElementById('responsible').value,
            specificity: document.getElementById('specificity').value,
            location: document.getElementById('location').value,
            deadline: document.getElementById('deadline').value,
            progress: parseInt(document.getElementById(\'progress\').value),
            status: document.getElementById(\'status\').value
        };

        if (this.editingIndex >= 0) {
            this.projects[this.editingIndex] = formData;
        } else {
            this.projects.push(formData);
        }

        this.saveToStorage();
        this.updateDisplay();
        this.closeModal();
        
        // Atualizar botões de exportação
        if (dashboard && dashboard.excelExporter) {
            dashboard.excelExporter.updateExportButtons();
        }
    }

    deleteProject(index) {
        if (confirm('Tem certeza que deseja remover esta obra?')) {
            this.projects.splice(index, 1);
            this.saveToStorage();
            this.updateDisplay();
            
            // Atualizar botões de exportação
            if (dashboard && dashboard.excelExporter) {
                dashboard.excelExporter.updateExportButtons();
            }
        }
    }

    saveToStorage() {
        localStorage.setItem('projects', JSON.stringify(this.projects));
    }

    updateDisplay() {
        const tbody = document.getElementById('project-list');
        const emptyState = document.getElementById('empty-state');
        const table = document.querySelector('#obras-section .dashboard-table table');

        if (this.projects.length === 0) {
            if (table) table.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        if (table) table.style.display = 'table';
        emptyState.style.display = 'none';

        tbody.innerHTML = this.projects.m        tbody.innerHTML = this.projects.map((project, index) => `
            <tr>
                <td>${project.name}</td>
                <td><span class=\"badge badge-${project.urgency.toLowerCase()}\">${project.urgency}</span></td>
                <td>${project.responsible}</td>
                <td>${project.specificity}</td>
                <td>${project.location}</td>
                <td>${this.formatDate(project.deadline)}</td>
                <td>
                    <div class=\"progress-container\">
                        <div class=\"progress-bar\">
                            <div class=\"progress-fill\" style=\"width: ${project.progress}%\"></div>
                        </div>
                        <span class=\"progress-text\">${project.progress}%</span>
                    </div>
                </td>
                <td><span class=\"badge badge-${project.status.toLowerCase().replace(/ /g, \"-\")}\">${project.status}</span></td>
                <td class=\"actions\">
                    <button class=\"btn-edit\" onclick=\"dashboard.projectManager.openModal(${index})\">Editar</button>
                    <button class=\"btn-delete\" onclick=\"dashboard.projectManager.deleteProject(${index})\">Remover</button>
                </td>
            </tr>
        `).join('');${index})\">Remover</button>
                </td>
            </tr>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
}

// Classe para gerenciar Manutenção Preventiva
class MaintenanceManager {
    constructor() {
        this.maintenances = JSON.parse(localStorage.getItem('maintenances')) || [];
        this.editingIndex = -1;
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Botão adicionar
        document.getElementById('add-maintenance-btn').addEventListener('click', () => {
            console.log('Botão Adicionar Manutenção clicado');
            this.openModal();
        });

        // Fechar modal
        document.querySelector('#maintenance-modal .close-maintenance').addEventListener('click', () => {
            console.log('Botão Fechar (X) do modal de Manutenção clicado');
            this.closeModal();
        });

        // Cancelar
        document.getElementById('maintenance-cancel-btn').addEventListener('click', () => {
            console.log('Botão Cancelar do modal de Manutenção clicado');
            this.closeModal();
        });

        // Formulário
        document.getElementById('maintenance-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMaintenance();
        });

        // Fechar modal clicando fora
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('maintenance-modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    openModal(index = -1) {
        this.editingIndex = index;
        const modal = document.getElementById('maintenance-modal');
        const title = document.getElementById('maintenance-modal-title');
        const submitBtn = document.getElementById('maintenance-submit-btn');

        if (index >= 0) {
            title.textContent = 'Editar Manutenção';
            submitBtn.textContent = 'Salvar Alterações';
            this.fillForm(this.maintenances[index]);
        } else {
            title.textContent = 'Adicionar Nova Manutenção';
            submitBtn.textContent = 'Adicionar Manutenção';
            this.clearForm();
        }

        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('maintenance-modal').style.display = 'none';
        this.clearForm();
        this.editingIndex = -1;
    }

    fillForm(maintenance) {
        document.getElementById('client').value = maintenance.client;
        document.getElementById('maintenance-date').value = maintenance.date;
        document.getElementById('maintenance-type').value = maintenance.type;
        document.getElementById('technician').value = maintenance.technician;
        document.getElementById('reserved-car').value = maintenance.vehicle;
        document.getElementById('main-actions').value = maintenance.activities;
    }

    clearForm() {
        document.getElementById('maintenance-form').reset();
    }

    saveMaintenance() {
        const formData = {
            client: document.getElementById('client').value,
            date: document.getElementById('maintenance-date').value,
            type: document.getElementById('maintenance-type').value,
            technician: document.getElementById('technician').value,
            vehicle: document.getElementById('reserved-car').value,
            activities: document.getElementById('main-actions').value
        };

        if (this.editingIndex >= 0) {
            this.maintenances[this.editingIndex] = formData;
        } else {
            this.maintenances.push(formData);
        }

        this.saveToStorage();
        this.updateDisplay();
        this.closeModal();
        
        // Atualizar botões de exportação
        if (dashboard && dashboard.excelExporter) {
            dashboard.excelExporter.updateExportButtons();
        }
    }

    deleteMaintenance(index) {
        if (confirm('Tem certeza que deseja remover esta manutenção?')) {
            this.maintenances.splice(index, 1);
            this.saveToStorage();
            this.updateDisplay();
            
            // Atualizar botões de exportação
            if (dashboard && dashboard.excelExporter) {
                dashboard.excelExporter.updateExportButtons();
            }
        }
    }

    saveToStorage() {
        localStorage.setItem('maintenances', JSON.stringify(this.maintenances));
    }

    updateDisplay() {
        const tbody = document.getElementById('maintenance-list');
        const emptyState = document.getElementById('maintenance-empty-state');
        const table = document.querySelector('#preventiva-section .dashboard-table table');

        if (this.maintenances.length === 0) {
            if (table) table.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        if (table) table.style.display = 'table';
        emptyState.style.display = 'none';

        tbody.innerHTML = this.maintenances.map((maintenance, index) => `
            <tr>
                <td>${maintenance.client}</td>
                <td>${this.formatDate(maintenance.date)}</td>
                <td><span class="badge badge-${this.getTypeBadgeClass(maintenance.type)}">${maintenance.type}</span></td>
                <td>${maintenance.technician}</td>
                <td>${maintenance.vehicle}</td>
                <td>${maintenance.activities}</td>
                <td class="actions">
                    <button class="btn-edit" onclick="dashboard.maintenanceManager.openModal(${index})">Editar</button>
                    <button class="btn-delete" onclick="dashboard.maintenanceManager.deleteMaintenance(${index})">Remover</button>
                </td>
            </tr>
        `).join('');
    }

    getTypeBadgeClass(type) {
        const typeMap = {
            'Preventiva Básica': 'success',
            'Preventiva Completa': 'info',
            'Inspeção Técnica': 'warning',
            'Manutenção Elétrica': 'pink',
            'Manutenção Hidráulica': 'cyan',
            'Manutenção de Ar Condicionado': 'purple',
            'Outros': 'secondary'
        };
        return typeMap[type] || 'secondary';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
}

// Classe para gerenciar Escala de Plantão
class PlantaoManager {
    constructor() {
        this.plantoes = JSON.parse(localStorage.getItem('plantoes')) || [];
        this.editingIndex = -1;
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Botão adicionar
        document.getElementById('add-plantao-btn').addEventListener('click', () => {
            console.log('Botão Adicionar Plantão clicado');
            this.openModal();
        });

        // Fechar modal
        document.querySelector("#plantao-modal .close-plantao").addEventListener("click", () => {
            console.log('Botão Fechar (X) do modal de Plantão clicado');
            this.closeModal();
        });

        // Cancelar
        document.getElementById('plantao-cancel-btn').addEventListener('click', () => {
            console.log('Botão Cancelar do modal de Plantão clicado');
            this.closeModal();
        });

        // Formulário
        document.getElementById('plantao-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePlantao();
        });

        // Fechar modal clicando fora
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('plantao-modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    openModal(index = -1) {
        this.editingIndex = index;
        const modal = document.getElementById('plantao-modal');
        const title = document.getElementById('plantao-modal-title');
        const submitBtn = document.getElementById('plantao-submit-btn');

        if (index >= 0) {
            title.textContent = 'Editar Escala de Plantão';
            submitBtn.textContent = 'Salvar Alterações';
            this.fillForm(this.plantoes[index]);
        } else {
            title.textContent = 'Adicionar Nova Escala de Plantão';
            submitBtn.textContent = 'Adicionar Escala';
            this.clearForm();
        }

        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('plantao-modal').style.display = 'none';
        this.clearForm();
        this.editingIndex = -1;
    }

    fillForm(plantao) {
        document.getElementById('plantao-colaborador').value = plantao.colaborador;
        document.getElementById('plantao-data-inicio').value = plantao.dataInicio;
        document.getElementById('plantao-data-termino').value = plantao.dataTermino;
    }

    clearForm() {
        document.getElementById('plantao-form').reset();
    }

    savePlantao() {
        const formData = {
            colaborador: document.getElementById('plantao-colaborador').value,
            dataInicio: document.getElementById('plantao-data-inicio').value,
            dataTermino: document.getElementById('plantao-data-termino').value
        };

        if (this.editingIndex >= 0) {
            this.plantoes[this.editingIndex] = formData;
        } else {
            this.plantoes.push(formData);
        }

        this.saveToStorage();
        this.updateDisplay();
        this.closeModal();
        
        // Atualizar botões de exportação
        if (dashboard && dashboard.excelExporter) {
            dashboard.excelExporter.updateExportButtons();
        }
    }

    deletePlantao(index) {
        if (confirm('Tem certeza que deseja remover esta escala de plantão?')) {
            this.plantoes.splice(index, 1);
            this.saveToStorage();
            this.updateDisplay();
            
            // Atualizar botões de exportação
            if (dashboard && dashboard.excelExporter) {
                dashboard.excelExporter.updateExportButtons();
            }
        }
    }

    saveToStorage() {
        localStorage.setItem('plantoes', JSON.stringify(this.plantoes));
    }

    updateDisplay() {
        const tbody = document.getElementById('plantao-list');
        const emptyState = document.getElementById('plantao-empty-state');
        const table = document.querySelector('#plantao-section .dashboard-table table');

        if (this.plantoes.length === 0) {
            if (table) table.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        if (table) table.style.display = 'table';
        emptyState.style.display = 'none';

        tbody.innerHTML = this.plantoes.map((plantao, index) => `
            <tr>
                <td>${plantao.colaborador}</td>
                <td>${this.formatDate(plantao.dataInicio)}</td>
                <td>${this.formatDate(plantao.dataTermino)}</td>
                <td class="actions">
                    <button class="btn-edit" onclick="dashboard.plantaoManager.openModal(${index})">Editar</button>
                    <button class="btn-delete" onclick="dashboard.plantaoManager.deletePlantao(${index})">Remover</button>
                </td>
            </tr>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
}

// Classe para gerenciar Escala de Treinamentos
class TreinamentoManager {
    constructor() {
        this.treinamentos = JSON.parse(localStorage.getItem('treinamentos')) || [];
        this.editingIndex = -1;
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Botão adicionar
        document.getElementById('add-treinamento-btn').addEventListener('click', () => {
            console.log('Botão Adicionar Treinamento clicado');
            this.openModal();
        });

        // Fechar modal
        document.querySelector("#treinamento-modal .close-treinamento").addEventListener("click", () => {
            console.log('Botão Fechar (X) do modal de Treinamento clicado');
            this.closeModal();
        });

        // Cancelar
        document.getElementById('treinamento-cancel-btn').addEventListener('click', () => {
            console.log('Botão Cancelar do modal de Treinamento clicado');
            this.closeModal();
        });

        // Formulário
        document.getElementById('treinamento-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTreinamento();
        });

        // Fechar modal clicando fora
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('treinamento-modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    openModal(index = -1) {
        this.editingIndex = index;
        const modal = document.getElementById('treinamento-modal');
        const title = document.getElementById('treinamento-modal-title');
        const submitBtn = document.getElementById('treinamento-submit-btn');

        if (index >= 0) {
            title.textContent = 'Editar Treinamento';
            submitBtn.textContent = 'Salvar Alterações';
            this.fillForm(this.treinamentos[index]);
        } else {
            title.textContent = 'Adicionar Novo Treinamento';
            submitBtn.textContent = 'Adicionar Treinamento';
            this.clearForm();
        }

        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('treinamento-modal').style.display = 'none';
        this.clearForm();
        this.editingIndex = -1;
    }

    fillForm(treinamento) {
        document.getElementById('treinamento-colaborador').value = treinamento.colaborador;
        document.getElementById('treinamento-nome').value = treinamento.nome;
        document.getElementById('treinamento-local').value = treinamento.local;
        document.getElementById('treinamento-data').value = treinamento.data;
        document.getElementById('treinamento-horario').value = treinamento.horario;
    }

    clearForm() {
        document.getElementById('treinamento-form').reset();
    }

    saveTreinamento() {
        const formData = {
            colaborador: document.getElementById('treinamento-colaborador').value,
            nome: document.getElementById('treinamento-nome').value,
            local: document.getElementById('treinamento-local').value,
            data: document.getElementById('treinamento-data').value,
            horario: document.getElementById('treinamento-horario').value
        };

        if (this.editingIndex >= 0) {
            this.treinamentos[this.editingIndex] = formData;
        } else {
            this.treinamentos.push(formData);
        }

        this.saveToStorage();
        this.updateDisplay();
        this.closeModal();
        
        // Atualizar botões de exportação
        if (dashboard && dashboard.excelExporter) {
            dashboard.excelExporter.updateExportButtons();
        }
    }

    deleteTreinamento(index) {
        if (confirm('Tem certeza que deseja remover este treinamento?')) {
            this.treinamentos.splice(index, 1);
            this.saveToStorage();
            this.updateDisplay();
            
            // Atualizar botões de exportação
            if (dashboard && dashboard.excelExporter) {
                dashboard.excelExporter.updateExportButtons();
            }
        }
    }

    saveToStorage() {
        localStorage.setItem('treinamentos', JSON.stringify(this.treinamentos));
    }

    updateDisplay() {
        const tbody = document.getElementById('treinamento-list');
        const emptyState = document.getElementById('treinamento-empty-state');
        const table = document.querySelector('#treinamentos-section .dashboard-table table');

        if (this.treinamentos.length === 0) {
            if (table) table.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        if (table) table.style.display = 'table';
        emptyState.style.display = 'none';

        tbody.innerHTML = this.treinamentos.map((treinamento, index) => `
            <tr>
                <td>${treinamento.colaborador}</td>
                <td>${treinamento.nome}</td>
                <td>${treinamento.local}</td>
                <td>${this.formatDate(treinamento.data)}</td>
                <td>${treinamento.horario}</td>
                <td class="actions">
                    <button class="btn-edit" onclick="dashboard.treinamentoManager.openModal(${index})">Editar</button>
                    <button class="btn-delete" onclick="dashboard.treinamentoManager.deleteTreinamento(${index})">Remover</button>
                </td>
            </tr>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
}

// Classe para gerenciar Escala de Viagens
class ViagemManager {
    constructor() {
        this.viagens = JSON.parse(localStorage.getItem('viagens')) || [];
        this.editingIndex = -1;
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Botão adicionar
        document.getElementById('add-viagem-btn').addEventListener('click', () => {
            console.log('Botão Adicionar Viagem clicado');
            this.openModal();
        });

        // Fechar modal
        document.querySelector("#viagem-modal .close-viagem").addEventListener("click", () => {
            console.log('Botão Fechar (X) do modal de Viagem clicado');
            this.closeModal();
        });

        // Cancelar
        document.getElementById('viagem-cancel-btn').addEventListener('click', () => {
            console.log('Botão Cancelar do modal de Viagem clicado');
            this.closeModal();
        });

        // Formulário
        document.getElementById('viagem-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveViagem();
        });

        // Mostrar/ocultar campo nome individual
        document.getElementById('viagem-colaborador').addEventListener('change', (e) => {
            const nomeGroup = document.getElementById('nome-individual-group');
            if (e.target.value === 'Individual') {
                nomeGroup.style.display = 'block';
                document.getElementById('viagem-nome-individual').required = true;
            } else {
                nomeGroup.style.display = 'none';
                document.getElementById('viagem-nome-individual').required = false;
            }
        });

        // Fechar modal clicando fora
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('viagem-modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    openModal(index = -1) {
        this.editingIndex = index;
        const modal = document.getElementById('viagem-modal');
        const title = document.getElementById('viagem-modal-title');
        const submitBtn = document.getElementById('viagem-submit-btn');

        if (index >= 0) {
            title.textContent = 'Editar Viagem';
            submitBtn.textContent = 'Salvar Alterações';
            this.fillForm(this.viagens[index]);
        } else {
            title.textContent = 'Adicionar Nova Viagem';
            submitBtn.textContent = 'Adicionar Viagem';
            this.clearForm();
        }

        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('viagem-modal').style.display = 'none';
        this.clearForm();
        this.editingIndex = -1;
    }

    fillForm(viagem) {
        document.getElementById('viagem-colaborador').value = viagem.tipoColaborador;
        document.getElementById('viagem-nome-individual').value = viagem.nomeIndividual || '';
        document.getElementById('viagem-local').value = viagem.local;
        document.getElementById('viagem-intervalo').value = viagem.intervalo;
        document.getElementById('viagem-data').value = viagem.data;
        document.getElementById('viagem-transporte').value = viagem.transporte;

        // Mostrar campo nome individual se necessário
        const nomeGroup = document.getElementById('nome-individual-group');
        if (viagem.tipoColaborador === 'Individual') {
            nomeGroup.style.display = 'block';
            document.getElementById('viagem-nome-individual').required = true;
        } else {
            nomeGroup.style.display = 'none';
            document.getElementById('viagem-nome-individual').required = false;
        }
    }

    clearForm() {
        document.getElementById('viagem-form').reset();
        document.getElementById('nome-individual-group').style.display = 'none';
        document.getElementById('viagem-nome-individual').required = false;
    }

    saveViagem() {
        const tipoColaborador = document.getElementById('viagem-colaborador').value;
        const nomeIndividual = document.getElementById('viagem-nome-individual').value;
        
        let colaboradorFinal = tipoColaborador;
        if (tipoColaborador === 'Individual' && nomeIndividual) {
            colaboradorFinal = nomeIndividual;
        }

        const formData = {
            tipoColaborador: tipoColaborador,
            nomeIndividual: nomeIndividual,
            colaborador: colaboradorFinal,
            local: document.getElementById('viagem-local').value,
            intervalo: document.getElementById('viagem-intervalo').value,
            data: document.getElementById('viagem-data').value,
            transporte: document.getElementById('viagem-transporte').value
        };

        if (this.editingIndex >= 0) {
            this.viagens[this.editingIndex] = formData;
        } else {
            this.viagens.push(formData);
        }

        this.saveToStorage();
        this.updateDisplay();
        this.closeModal();
        
        // Atualizar botões de exportação
        if (dashboard && dashboard.excelExporter) {
            dashboard.excelExporter.updateExportButtons();
        }
    }

    deleteViagem(index) {
        if (confirm('Tem certeza que deseja remover esta viagem?')) {
            this.viagens.splice(index, 1);
            this.saveToStorage();
            this.updateDisplay();
            
            // Atualizar botões de exportação
            if (dashboard && dashboard.excelExporter) {
                dashboard.excelExporter.updateExportButtons();
            }
        }
    }

    saveToStorage() {
        localStorage.setItem('viagens', JSON.stringify(this.viagens));
    }

    updateDisplay() {
        const tbody = document.getElementById('viagem-list');
        const emptyState = document.getElementById('viagem-empty-state');
        const table = document.querySelector('#viagens-section .dashboard-table table');

        if (this.viagens.length === 0) {
            if (table) table.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        if (table) table.style.display = 'table';
        emptyState.style.display = 'none';

        tbody.innerHTML = this.viagens.map((viagem, index) => `
            <tr>
                <td>${viagem.colaborador}</td>
                <td>${viagem.local}</td>
                <td>${viagem.intervalo}</td>
                <td>${this.formatDate(viagem.data)}</td>
                <td><span class="badge badge-transport">${viagem.transporte}</span></td>
                <td class="actions">
                    <button class="btn-edit" onclick="dashboard.viagemManager.openModal(${index})">Editar</button>
                    <button class="btn-delete" onclick="dashboard.viagemManager.deleteViagem(${index})">Remover</button>
                </td>
            </tr>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
}

// Inicializar o dashboard quando a página carregar
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new MaintenanceDashboard();
});





