/**
 * =====================================================
 * TATAMEX PERFORMANCE - App PWA Principal
 * =====================================================
 * 
 * Aplicação principal em JavaScript puro para
 * gerenciamento de academia de artes marciais.
 * 
 * @version 1.0.0
 */

// =====================================================
// CONFIGURAÇÃO DO APP
// =====================================================

const APP_NAME = 'TatameX Performance';
const APP_VERSION = '1.0.0';

// Estado global do app
const appState = {
    currentScreen: 'home',
    user: null,
    usuario: null,
    alunos: [],
    turmas: [],
    planos: [],
    avisos: [],
    loading: false,
};

// Elementos do DOM
const elements = {};

// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log(`${APP_NAME} v${APP_VERSION} - Inicializando...`);
    
    // Cache elementos do DOM
    cacheElements();
    
    // Configurar service worker para PWA
    await setupServiceWorker();
    
    // Configurar eventos globais
    setupEventListeners();
    
    // Verificar autenticação
    if (tatamex.isAuthenticated()) {
        await loadUserData();
        showScreen('dashboard');
    } else {
        showScreen('login');
    }
});

// Cache de elementos DOM
function cacheElements() {
    elements.app = document.getElementById('app');
    elements.loadingOverlay = document.getElementById('loading');
    elements.loginForm = document.getElementById('login-form');
    elements.registerForm = document.getElementById('register-form');
    elements.navHome = document.getElementById('nav-home');
    elements.navDashboard = document.getElementById('nav-dashboard');
    elements.navTurmas = document.getElementById('nav-turmas');
    elements.navPresenca = document.getElementById('nav-presenca');
    elements.navProfile = document.getElementById('nav-profile');
    elements.logoutBtn = document.getElementById('logout-btn');
}

// =====================================================
// SERVICE WORKER (PWA)
// =====================================================

async function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registrado:', registration);
        } catch (error) {
            console.log('Service Worker não disponível:', error);
        }
    }
}

// =====================================================
// EVENTOS
// =====================================================

function setupEventListeners() {
    // Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Navegação
    document.querySelectorAll('[data-nav]').forEach(btn => {
        btn.addEventListener('click', () => {
            showScreen(btn.dataset.nav);
        });
    });

    // Voltar
    document.querySelectorAll('[data-back]').forEach(btn => {
        btn.addEventListener('click', () => {
            showScreen('dashboard');
        });
    });

    // Install PWA
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.addEventListener('click', async () => {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    installBtn.style.display = 'none';
                }
            });
        }
    });
}

// =====================================================
// AUTENTICAÇÃO
// =====================================================

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    
    showLoading(true);
    errorEl.textContent = '';
    
    const result = await tatamex.login(email, password);
    
    if (result.success) {
        await loadUserData();
        showScreen('dashboard');
    } else {
        errorEl.textContent = result.error;
    }
    
    showLoading(false);
}

async function handleRegister(e) {
    e.preventDefault();
    
    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const tipo = document.getElementById('reg-tipo').value;
    const errorEl = document.getElementById('register-error');
    
    if (!nome || !email || !password) {
        errorEl.textContent = 'Preencha todos os campos';
        return;
    }
    
    showLoading(true);
    errorEl.textContent = '';
    
    const result = await tatamex.register(email, password, {
        nome,
        tipo,
    });
    
    if (result.success) {
        // Fazer login automático
        await tatamex.login(email, password);
        await loadUserData();
        showScreen('dashboard');
    } else {
        errorEl.textContent = result.error;
    }
    
    showLoading(false);
}

async function handleLogout() {
    showLoading(true);
    await tatamex.logout();
    appState.user = null;
    appState.usuario = null;
    showScreen('login');
    showLoading(false);
}

// =====================================================
// DADOS
// =====================================================

async function loadUserData() {
    showLoading(true);
    
    try {
        // Buscar dados do usuário
        const usuarioResult = await tatamex.getCurrentUsuario();
        if (usuarioResult.success && usuarioResult.data) {
            appState.usuario = usuarioResult.data;
            
            // Carregar dados baseado no tipo
            if (appState.usuario.tipo === 'admin' || appState.usuario.tipo === 'professor') {
                const [alunosRes, turmasRes, avisosRes, planosRes] = await Promise.all([
                    tatamex.getAlunos(),
                    tatamex.getTurmas(),
                    tatamex.getAvisos(),
                    tatamex.getPlanos(),
                ]);
                
                if (alunosRes.success) appState.alunos = alunosRes.data;
                if (turmasRes.success) appState.turmas = turmasRes.data;
                if (avisosRes.success) appState.avisos = avisosRes.data;
                if (planosRes.success) appState.planos = planosRes.data;
            } else if (appState.usuario.tipo === 'aluno') {
                const [alunoRes, presencasRes, graduacoesRes, avisosRes] = await Promise.all([
                    tatamex.getAlunoByUser(appState.usuario.id),
                    tatamex.getAlunoPresencas(appState.usuario.id),
                    tatamex.getGraduacoes(appState.usuario.id),
                    tatamex.getAvisos(),
                ]);
                
                if (alunoRes.success) appState.aluno = alunoRes.data;
                if (presencasRes.success) appState.presencas = presencasRes.data;
                if (graduacoesRes.success) appState.graduacoes = graduacoesRes.data;
                if (avisosRes.success) appState.avisos = avisosRes.data;
            }
        }
        
        updateUI();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
    
    showLoading(false);
}

function updateUI() {
    // Atualizar nome do usuário
    const userNameEl = document.getElementById('user-name');
    if (userNameEl && appState.usuario) {
        userNameEl.textContent = appState.usuario.nome;
    }
    
    // Atualizar menu baseado no tipo
    const professorMenu = document.getElementById('professor-menu');
    if (professorMenu) {
        professorMenu.style.display = (appState.usuario?.tipo === 'admin' || appState.usuario?.tipo === 'professor') 
            ? 'block' : 'none';
    }
}

// =====================================================
// NAVEGAÇÃO
// =====================================================

function showScreen(screenName) {
    appState.currentScreen = screenName;
    
    // Ocultar todas as telas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
    
    // Mostrar tela selecionada
    const screen = document.getElementById(`screen-${screenName}`);
    if (screen) {
        screen.style.display = 'block';
    }
    
    // Atualizar navegação
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    
    const activeNav = document.querySelector(`[data-nav="${screenName}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    // Carregar dados específicos da tela
    loadScreenData(screenName);
}

async function loadScreenData(screenName) {
    switch (screenName) {
        case 'turmas':
            if (appState.turmas.length > 0) {
                renderTurmas();
            }
            break;
        case 'alunos':
            if (appState.alunos.length > 0) {
                renderAlunos();
            }
            break;
        case 'presenca':
            if (appState.turmas.length > 0) {
                renderPresenca();
            }
            break;
    }
}

// =====================================================
// RENDERIZAÇÃO
// =====================================================

function renderTurmas() {
    const container = document.getElementById('turmas-list');
    if (!container) return;
    
    if (appState.turmas.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma turma encontrada</p>';
        return;
    }
    
    container.innerHTML = appState.turmas.map(turma => `
        <div class="card turma-card" data-id="${turma.id}">
            <h3>${turma.nome}</h3>
            <p class="horario">${turma.horario}</p>
            <p class="dias">${turma.dias_semana || 'Seg à Sáb'}</p>
            <button class="btn btn-primary" onclick="showTurmaDetail('${turma.id}')">
                Ver Detalhes
            </button>
        </div>
    `).join('');
}

function renderAlunos() {
    const container = document.getElementById('alunos-list');
    if (!container) return;
    
    if (appState.alunos.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum aluno encontrado</p>';
        return;
    }
    
    container.innerHTML = appState.alunos.map(aluno => `
        <div class="card aluno-card" data-id="${aluno.id}">
            <div class="aluno-foto">
                ${aluno.usuarios?.foto_url 
                    ? `<img src="${aluno.usuarios.foto_url}" alt="${aluno.usuarios.nome}">`
                    : `<div class="avatar">${aluno.usuarios?.nome?.charAt(0) || 'A'}</div>`
                }
            </div>
            <div class="aluno-info">
                <h3>${aluno.usuarios?.nome || 'Aluno'}</h3>
                <span class="faixa faixa-${aluno.faixa.toLowerCase()}">${aluno.faixa}</span>
            </div>
            <button class="btn btn-sm" onclick="showAlunoDetail('${aluno.id}')">
                Ver
            </button>
        </div>
    `).join('');
}

function renderPresenca() {
    const container = document.getElementById('presenca-turma-select');
    if (!container) return;
    
    container.innerHTML = appState.turmas.map(turma => 
        `<option value="${turma.id}">${turma.nome}</option>`
    ).join('');
    
    // Carregar presenças da primeira turma
    if (appState.turmas.length > 0) {
        loadPresenca(appState.turmas[0].id);
    }
}

async function loadPresenca(turmaId) {
    const hoje = new Date().toISOString().split('T')[0];
    const result = await tatamex.getTurmaPresencas(turmaId, hoje);
    
    const container = document.getElementById('presenca-list');
    if (!container) return;
    
    if (!result.success || result.data.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma presença registrada hoje</p>';
        return;
    }
    
    container.innerHTML = result.data.map(p => `
        <div class="presenca-item ${p.presente ? 'presente' : 'ausente'}">
            <span class="nome">${p.alunos?.usuarios?.nome || 'Aluno'}</span>
            <span class="status">${p.presente ? '✅ Presente' : '❌ Ausente'}</span>
        </div>
    `).join('');
}

// Funções globais para onclick
window.showTurmaDetail = async function(turmaId) {
    const result = await tatamex.getTurmaAlunos(turmaId);
    console.log('Alunos da turma:', result.data);
    // Implementar modal de detalhes
};

window.showAlunoDetail = async function(alunoId) {
    const result = await tatamex.getAluno(alunoId);
    console.log('Detalhes do aluno:', result.data);
    // Implementar modal de detalhes
};

window.loadPresenca = loadPresenca;

// =====================================================
// UTILITÁRIOS
// =====================================================

function showLoading(show) {
    const overlay = document.getElementById('loading');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
}
