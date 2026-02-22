/**
 * =====================================================
 * TATAMEX PERFORMANCE - Cliente Supabase
 * =====================================================
 * 
 * Configuração do cliente Supabase para o sistema
 * de gerenciamento de academia de artes marciais.
 * 
 * @version 1.0.0
 */

// =====================================================
// CONFIGURAÇÃO
// =====================================================

// URL do projeto Supabase (substitua pela sua URL)
const SUPABASE_URL = 'https://voqvpxtyoawlopmeaqiy.supabase.co';

// Chave anônima do projeto (substitua pela sua chave)
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcXZweHR5b2F3bG9wbWVhcWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MTY2NzcsImV4cCI6MjA4NzI5MjY3N30.VY2wb4dC2wNcCbUDWK1e6-UYQnIuEfJeJJhq5yblPKE';

// =====================================================
// CLIENTE SUPABASE
// =====================================================

class TatamexSupabase {
    constructor() {
        this.url = SUPABASE_URL;
        this.key = SUPABASE_ANON_KEY;
        this.currentUser = null;
        this.init();
    }

    init() {
        // Verificar sessão existente
        const savedSession = localStorage.getItem('tatamex_session');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                this.setSession(session);
            } catch (e) {
                console.error('Erro ao restaurar sessão:', e);
            }
        }
    }

    // Testar conexão com o banco
    async testConnection() {
        try {
            const response = await fetch(`${this.url}/rest/v1/usuarios?limit=1`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (response.ok) {
                return { success: true, message: 'Conectado ao banco de dados!' };
            } else {
                const error = await response.json();
                if (error.message?.includes('infinite recursion')) {
                    return { 
                        success: false, 
                        error: 'RLS_POLICY_ERROR',
                        message: 'Erro nas políticas de segurança (RLS). Execute o SQL de correção no Supabase SQL Editor.' 
                    };
                }
                return { success: false, error: error.message, message: 'Erro ao conectar ao banco' };
            }
        } catch (error) {
            return { success: false, error: error.message, message: 'Falha na conexão' };
        }
    }

    // Headers padrão para requisições
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'apikey': this.key,
        };
        
        if (this.currentUser?.access_token) {
            headers['Authorization'] = `Bearer ${this.currentUser.access_token}`;
        }
        
        return headers;
    }

    // Gerenciar sessão
    setSession(session) {
        this.currentUser = session;
        localStorage.setItem('tatamex_session', JSON.stringify(session));
    }

    clearSession() {
        this.currentUser = null;
        localStorage.removeItem('tatamex_session');
    }

    // Verificar se está logado
    isAuthenticated() {
        return this.currentUser !== null && this.currentUser.access_token !== undefined;
    }

    // Obter usuário atual
    getCurrentUser() {
        return this.currentUser?.user || null;
    }

    // =====================================================
    // AUTENTICAÇÃO
    // =====================================================

    /**
     * Login com email e senha
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise}
     */
    async login(email, password) {
        try {
            const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.key,
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error_description || data.msg || 'Erro no login');
            }

            this.setSession(data);
            return { success: true, data };
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Registro de novo usuário
     * @param {string} email 
     * @param {string} password 
     * @param {object} metadata 
     * @returns {Promise}
     */
    async register(email, password, metadata = {}) {
        try {
            const response = await fetch(`${this.url}/auth/v1/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.key,
                },
                body: JSON.stringify({
                    email,
                    password,
                    data: { nome: metadata },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error_description || data.msg || 'Erro no registro');
            }

            return { success: true, data };
        } catch (error) {
            console.error('Erro no registro:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Criar usuário no banco de dados
     * @param {object} usuario 
     * @returns {Promise}
     */
    async createUsuario(usuario) {
        try {
            const response = await fetch(`${this.url}/rest/v1/usuarios`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(usuario),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao criar usuário');
            }

            return { success: true, data };
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obter usuários
     * @returns {Promise}
     */
    getUsuarios() {
        return fetch(`${this.url}/rest/v1/usuarios?select=*`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
    }

    /**
     * Logout
     * @returns {Promise}
     */
    async logout() {
        try {
            if (this.currentUser?.access_token) {
                await fetch(`${this.url}/auth/v1/logout`, {
                    method: 'POST',
                    headers: this.getHeaders(),
                });
            }
            
            this.clearSession();
            return { success: true };
        } catch (error) {
            console.error('Erro no logout:', error);
            this.clearSession();
            return { success: true };
        }
    }

    /**
     * Enviar email de recuperação de senha
     * @param {string} email 
     * @returns {Promise}
     */
    async resetPassword(email) {
        try {
            const response = await fetch(`${this.url}/auth/v1/recover`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.key,
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Erro ao enviar email');
            }

            return { success: true };
        } catch (error) {
            console.error('Erro na recuperação:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // USUARIOS
    // =====================================================

    /**
     * Buscar usuário atual
     */
    async getCurrentUsuario() {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/usuarios?auth_id=eq.${this.currentUser.user.id}&select=*`,
                { headers: this.getHeaders() }
            );

            const data = await response.json();
            return { success: true, data: data[0] || null };
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Buscar todos os usuários
     */
    async getUsuarios() {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/usuarios?select=*&order=created_at.desc`,
                { headers: this.getHeaders() }
            );

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Atualizar usuário
     */
    async updateUsuario(id, updates) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/usuarios?id=eq.${id}`,
                {
                    method: 'PATCH',
                    headers: this.getHeaders(),
                    body: JSON.stringify(updates),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Erro ao atualizar');
            }

            return { success: true };
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // ALUNOS
    // =====================================================

    /**
     * Buscar todos os alunos
     */
    async getAlunos() {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/alunos?select=*,usuarios(nome,email,foto_url)&ativo=eq.true&order=created_at.desc`,
                { headers: this.getHeaders() }
            );

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao buscar alunos:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Buscar aluno por ID
     */
    async getAluno(id) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/alunos?id=eq.${id}&select=*,usuarios(nome,email,foto_url)`,
                { headers: this.getHeaders() }
            );

            const data = await response.json();
            return { success: true, data: data[0] || null };
        } catch (error) {
            console.error('Erro ao buscar aluno:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Buscar aluno por usuário
     */
    async getAlunoByUser(usuarioId) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/alunos?usuario_id=eq.${usuarioId}&select=*,usuarios(nome,email,foto_url)`,
                { headers: this.getHeaders() }
            );

            const data = await response.json();
            return { success: true, data: data[0] || null };
        } catch (error) {
            console.error('Erro ao buscar aluno:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Criar aluno
     */
    async createAluno(alunoData) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/alunos`,
                {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify(alunoData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao criar aluno');
            }

            return { success: true, data };
        } catch (error) {
            console.error('Erro ao criar aluno:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Atualizar aluno
     */
    async updateAluno(id, updates) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/alunos?id=eq.${id}`,
                {
                    method: 'PATCH',
                    headers: this.getHeaders(),
                    body: JSON.stringify(updates),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Erro ao atualizar');
            }

            return { success: true };
        } catch (error) {
            console.error('Erro ao atualizar aluno:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // PROFESSORES
    // =====================================================

    /**
     * Buscar todos os professores
     */
    async getProfessores() {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/professores?select=*,usuarios(nome,email,foto_url)&ativo=eq.true`,
                { headers: this.getHeaders() }
            );

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao buscar professores:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Criar professor
     */
    async createProfessor(professorData) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/professores`,
                {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify(professorData),
                }
            );

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Erro ao criar professor:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // TURMAS
    // =====================================================

    /**
     * Buscar todas as turmas
     */
    async getTurmas() {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/turmas?select=*,professores(usuarios(nome))&ativo=eq.true&order=horario`,
                { headers: this.getHeaders() }
            );

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao buscar turmas:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Buscar turma por ID
     */
    async getTurma(id) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/turmas?id=eq.${id}&select=*,professores(usuarios(nome))`,
                { headers: this.getHeaders() }
            );

            const data = await response.json();
            return { success: true, data: data[0] || null };
        } catch (error) {
            console.error('Erro ao buscar turma:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Criar turma
     */
    async createTurma(turmaData) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/turmas`,
                {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify(turmaData),
                }
            );

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Erro ao criar turma:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Atualizar turma
     */
    async updateTurma(id, updates) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/turmas?id=eq.${id}`,
                {
                    method: 'PATCH',
                    headers: this.getHeaders(),
                    body: JSON.stringify(updates),
                }
            );

            return { success: response.ok };
        } catch (error) {
            console.error('Erro ao atualizar turma:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Buscar alunos de uma turma
     */
    async getTurmaAlunos(turmaId) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/turmas_alunos?turma_id=eq.${turmaId}&select=*,alunos(*,usuarios(nome,email,foto_url))&ativo=eq.true`,
                { headers: this.getHeaders() }
            );

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao buscar alunos da turma:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Matricular aluno em turma
     */
    async matricularAluno(turmaId, alunoId) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/turmas_alunos`,
                {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify({ turma_id: turmaId, aluno_id: alunoId }),
                }
            );

            return { success: response.ok };
        } catch (error) {
            console.error('Erro ao matricular aluno:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // PRESENÇAS
    // =====================================================

    /**
     * Registrar presença
     */
    async registrarPresenca(alunoId, turmaId, presente = true, observacao = '') {
        try {
            const hoje = new Date().toISOString().split('T')[0];
            
            // Verificar se já existe registro para hoje
            const checkResponse = await fetch(
                `${this.url}/rest/v1/presencas?aluno_id=eq.${alunoId}&turma_id=eq.${turmaId}&data=eq.${hoje}`,
                { headers: this.getHeaders() }
            );

            const existing = await checkResponse.json();

            if (existing.length > 0) {
                // Atualizar existente
                const response = await fetch(
                    `${this.url}/rest/v1/presencas?id=eq.${existing[0].id}`,
                    {
                        method: 'PATCH',
                        headers: this.getHeaders(),
                        body: JSON.stringify({ presente, observacao }),
                    }
                );
            } else {
                // Criar novo
                const response = await fetch(
                    `${this.url}/rest/v1/presencas`,
                    {
                        method: 'POST',
                        headers: this.getHeaders(),
                        body: JSON.stringify({
                            aluno_id: alunoId,
                            turma_id: turmaId,
                            data: hoje,
                            presente,
                            observacao,
                        }),
                    }
                );
            }

            return { success: true };
        } catch (error) {
            console.error('Erro ao registrar presença:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Buscar presenças de um aluno
     */
    async getAlunoPresencas(alunoId) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/presencas?aluno_id=eq.${alunoId}&order=data.desc&limit=30`,
                { headers: this.getHeaders() }
            );

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao buscar presenças:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Buscar presenças de uma turma
     */
    async getTurmaPresencas(turmaId, data) {
        try {
            let url = `${this.url}/rest/v1/presencas?turma_id=eq.${turmaId}`;
            if (data) {
                url += `&data=eq.${data}`;
            }
            url += '&select=*,alunos(usuarios(nome),faixa)';
            
            const response = await fetch(url, { headers: this.getHeaders() });
            const result = await response.json();
            return { success: true, data: result };
        } catch (error) {
            console.error('Erro ao buscar presenças:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // ANOTAÇÕES
    // =====================================================

    /**
     * Buscar anotações do usuário
     */
    async getAnotacoes() {
        try {
            const usuario = this.getCurrentUser();
            const response = await fetch(
                `${this.url}/rest/v1/anotacoes?usuario_id=eq.${usuario.id}&order=created_at.desc`,
                { headers: this.getHeaders() }
            );

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao buscar anotações:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Criar anotação
     */
    async createAnotacao(titulo, texto, categoria = 'Geral') {
        try {
            const usuario = this.getCurrentUser();
            const response = await fetch(
                `${this.url}/rest/v1/anotacoes`,
                {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify({
                        usuario_id: usuario.id,
                        titulo,
                        texto,
                        categoria,
                    }),
                }
            );

            const data = await response.json();
            return { success: response.ok, data };
        } catch (error) {
            console.error('Erro ao criar anotação:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Atualizar anotação
     */
    async updateAnotacao(id, updates) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/anotacoes?id=eq.${id}`,
                {
                    method: 'PATCH',
                    headers: this.getHeaders(),
                    body: JSON.stringify(updates),
                }
            );

            return { success: response.ok };
        } catch (error) {
            console.error('Erro ao atualizar anotação:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Deletar anotação
     */
    async deleteAnotacao(id) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/anotacoes?id=eq.${id}`,
                {
                    method: 'DELETE',
                    headers: this.getHeaders(),
                }
            );

            return { success: response.ok };
        } catch (error) {
            console.error('Erro ao deletar anotação:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // ARQUIVOS (STORAGE)
    // =====================================================

    /**
     * Upload de arquivo
     */
    async uploadFile(bucket, path, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(
                `${this.url}/storage/v1/upload/${bucket}/${path}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.currentUser.access_token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro no upload');
            }

            // Registrar no banco
            const fileRecord = {
                usuario_id: this.currentUser.user.id,
                nome: file.name,
                tipo: file.type,
                url: `${this.url}/storage/v1/object/public/${bucket}/${path}`,
                tamanho: file.size,
            };

            await fetch(`${this.url}/rest/v1/arquivos`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(fileRecord),
            });

            return { success: true, data };
        } catch (error) {
            console.error('Erro no upload:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Upload de foto de perfil
     */
    async uploadProfilePhoto(file) {
        const usuario = this.getCurrentUser();
        const path = `perfil_${usuario.id}_${Date.now()}.${file.name.split('.').pop()}`;
        return await this.uploadFile('alunos', path, file);
    }

    /**
     * Buscar arquivos do usuário
     */
    async getArquivos() {
        try {
            const usuario = this.getCurrentUser();
            const response = await fetch(
                `${this.url}/rest/v1/arquivos?usuario_id=eq.${usuario.id}&order=created_at.desc`,
                { headers: this.getHeaders() }
            );

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao buscar arquivos:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // GRADUAÇÕES
    // =====================================================

    /**
     * Buscar graduações do aluno
     */
    async getGraduacoes(alunoId) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/graduacoes?aluno_id=eq.${alunoId}&order=data_obtencao.desc`,
                { headers: this.getHeaders() }
            );

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao buscar graduações:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Registrar nova graduação
     */
    async registrarGraduacao(alunoId, faixa, graus = 0, observacao = '') {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/graduacoes`,
                {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify({
                        aluno_id: alunoId,
                        faixa,
                        graus,
                        observacao,
                    }),
                }
            );

            // Atualizar faixa do aluno
            await this.updateAluno(alunoId, { faixa, graus });

            return { success: response.ok };
        } catch (error) {
            console.error('Erro ao registrar graduação:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // AVISOS
    // =====================================================

    /**
     * Buscar avisos ativos
     */
    async getAvisos() {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/avisos?ativo=eq.true&order=created_at.desc`,
                { headers: this.getHeaders() }
            );

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao buscar avisos:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Criar aviso (admin)
     */
    async createAviso(titulo, conteudo, prioridade = 'normal') {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/avisos`,
                {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify({ titulo, conteudo, prioridade }),
                }
            );

            return { success: response.ok };
        } catch (error) {
            console.error('Erro ao criar aviso:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // PLANOS
    // =====================================================

    /**
     * Buscar planos
     */
    async getPlanos() {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/planos?ativo=eq.true&order=nome`,
                { headers: this.getHeaders() }
            );

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao buscar planos:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Criar plano
     */
    async createPlano(planoData) {
        try {
            const response = await fetch(
                `${this.url}/rest/v1/planos`,
                {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify(planoData),
                }
            );

            return { success: response.ok };
        } catch (error) {
            console.error('Erro ao criar plano:', error);
            return { success: false, error: error.message };
        }
    }

    // =====================================================
    // ESTATÍSTICAS
    // =====================================================

    /**
     * Buscar estatísticas do aluno
     */
    async getEstatisticasAluno(alunoId) {
        try {
            // Total de presenças
            const presencasResponse = await fetch(
                `${this.url}/rest/v1/presencas?aluno_id=eq.${alunoId}&presente=eq.true&select=id`,
                { headers: this.getHeaders() }
            );
            const presencas = await presencasResponse.json();

            // Este mês
            const primeiroDiaMes = new Date();
            primeiroDiaMes.setDate(1);
            const dataFormatada = primeiroDiaMes.toISOString().split('T')[0];
            
            const presencasMesResponse = await fetch(
                `${this.url}/rest/v1/presencas?aluno_id=eq.${alunoId}&presente=eq.true&data=gte.${dataFormatada}&select=id`,
                { headers: this.getHeaders() }
            );
            const presencasMes = await presencasMesResponse.json();

            // Turmas
            const turmasResponse = await fetch(
                `${this.url}/rest/v1/turmas_alunos?aluno_id=eq.${alunoId}&ativo=eq.true&select=id`,
                { headers: this.getHeaders() }
            );
            const turmas = await turmasResponse.json();

            return {
                success: true,
                data: {
                    totalPresencas: presencas.length,
                    presencasEsteMes: presencasMes.length,
                    turmasAtivas: turmas.length,
                }
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Buscar estatísticas da academia
     */
    async getEstatisticasAcademia() {
        try {
            const [alunosRes, turmasRes, presencasRes] = await Promise.all([
                fetch(`${this.url}/rest/v1/alunos?ativo=eq.true&select=id`, { headers: this.getHeaders() }),
                fetch(`${this.url}/rest/v1/turmas?ativo=eq.true&select=id`, { headers: this.getHeaders() }),
                fetch(`${this.url}/rest/v1/presencas?presente=eq.true&select=id`, { headers: this.getHeaders() })
            ]);

            const [alunos, turmas, presencas] = await Promise.all([
                alunosRes.json(),
                turmasRes.json(),
                presencasRes.json()
            ]);

            return {
                success: true,
                data: {
                    totalAlunos: alunos.length,
                    totalTurmas: turmas.length,
                    totalPresencas: presencas.length,
                }
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return { success: false, error: error.message };
        }
    }
}

// =====================================================
// INSTÂNCIA GLOBAL
// =====================================================

const tatamex = new TatamexSupabase();

// Exportar para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { tatamex, TatamexSupabase };
}
