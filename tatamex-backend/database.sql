-- =====================================================
-- TATAMEX PERFORMANCE - Schema PostgreSQL Supabase
-- =====================================================

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de usuários (integração com Supabase Auth)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('admin', 'professor', 'aluno')),
    foto_url TEXT,
    telefone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de alunos
CREATE TABLE IF NOT EXISTS public.alunos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    faixa VARCHAR(50) DEFAULT 'Branca',
    graus INTEGER DEFAULT 0,
    peso VARCHAR(20),
    categoria VARCHAR(50),
    data_nascimento DATE,
    ativo BOOLEAN DEFAULT true,
    contrato_assinado BOOLEAN DEFAULT false,
    contrato_data TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de professores
CREATE TABLE IF NOT EXISTS public.professores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    especialidade VARCHAR(255),
   cref VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de turmas
CREATE TABLE IF NOT EXISTS public.turmas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    professor_id UUID REFERENCES public.professores(id) ON DELETE SET NULL,
    horario TIME NOT NULL,
    dias_semana VARCHAR(50),
    capacidade INTEGER DEFAULT 30,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de presença
CREATE TABLE IF NOT EXISTS public.presencas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
    turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    presente BOOLEAN DEFAULT true,
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de planos/aulas
CREATE TABLE IF NOT EXISTS public.planos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    duracao_minutos INTEGER DEFAULT 60,
    modalidade VARCHAR(100),
    nivel VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de anotações
CREATE TABLE IF NOT EXISTS public.anotacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    turma_id UUID REFERENCES public.turmas(id) ON DELETE SET NULL,
    titulo VARCHAR(255),
    texto TEXT NOT NULL,
    categoria VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de arquivos
CREATE TABLE IF NOT EXISTS public.arquivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    aluno_id UUID REFERENCES public.alunos(id) ON DELETE SET NULL,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    tamanho INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de graduações
CREATE TABLE IF NOT EXISTS public.graduacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
    faixa VARCHAR(50) NOT NULL,
    graus INTEGER DEFAULT 0,
    data_obtencao DATE DEFAULT CURRENT_DATE,
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de avisos
CREATE TABLE IF NOT EXISTS public.avisos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    prioridade VARCHAR(20) DEFAULT 'normal' CHECK (prioridade IN ('normal', 'importante', 'urgente')),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de turmas_alunos (relacionamento N:N)
CREATE TABLE IF NOT EXISTS public.turmas_alunos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_id UUID REFERENCES public.turmas(id) ON DELETE CASCADE,
    aluno_id UUID REFERENCES public.alunos(id) ON DELETE CASCADE,
    data_matricula DATE DEFAULT CURRENT_DATE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(turma_id, aluno_id)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON public.usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_alunos_usuario ON public.alunos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_presencas_aluno ON public.presencas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_presencas_turma ON public.presencas(turma_id);
CREATE INDEX IF NOT EXISTS idx_presencas_data ON public.presencas(data);
CREATE INDEX IF NOT EXISTS idx_anotacoes_usuario ON public.anotacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_graduacoes_aluno ON public.graduacoes(aluno_id);
CREATE INDEX IF NOT EXISTS idx_avisos_prioridade ON public.avisos(prioridade);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anotacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arquivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graduacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas_alunos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS
-- =====================================================

-- USUARIOS: Admin vê tudo, outros véem apenas seu próprio registro
CREATE POLICY "usuarios_view_all" ON public.usuarios
    FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo = 'admin'));

CREATE POLICY "usuarios_view_own" ON public.usuarios
    FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "usuários_insert" ON public.usuarios
    FOR INSERT WITH CHECK (auth.uid() = auth_id OR auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo = 'admin'));

CREATE POLICY "usuários_update" ON public.usuarios
    FOR UPDATE USING (auth.uid() = auth_id OR auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo = 'admin'));

-- ALUNOS: Admin e Professor véem todos, Aluno vê apenas si
CREATE POLICY "alunos_view_admin_professor" ON public.alunos
    FOR SELECT USING (
        auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo IN ('admin', 'professor'))
        OR usuario_id = auth.uid()
    );

CREATE POLICY "alunos_insert" ON public.alunos
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo IN ('admin', 'professor'))
        OR usuario_id = auth.uid()
    );

CREATE POLICY "alunos_update" ON public.alunos
    FOR UPDATE USING (
        auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo IN ('admin', 'professor'))
        OR usuario_id = auth.uid()
    );

-- PROFESSORES: Admin vê tudo, Professor vê apenas si
CREATE POLICY "professores_view" ON public.professores
    FOR SELECT USING (
        auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo = 'admin')
        OR usuario_id = auth.uid()
    );

CREATE POLICY "professores_insert" ON public.professores
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo = 'admin'));

CREATE POLICY "professores_update" ON public.professores
    FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo = 'admin') OR usuario_id = auth.uid());

-- TURMAS: Admin e Professor véem suas turmas
CREATE POLICY "turmas_view" ON public.turmas
    FOR SELECT USING (
        auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo IN ('admin', 'professor'))
    );

CREATE POLICY "turmas_insert" ON public.turmas
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo IN ('admin', 'professor')));

CREATE POLICY "turmas_update" ON public.turmas
    FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo IN ('admin', 'professor')));

-- PRESENCAS: Admin e Professor registram, Aluno vê apenas suas
CREATE POLICY "presencas_view" ON public.presencas
    FOR SELECT USING (
        auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo IN ('admin', 'professor'))
        OR aluno_id IN (SELECT id FROM public.alunos WHERE usuario_id = auth.uid())
    );

CREATE POLICY "presencas_insert" ON public.presencas
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo IN ('admin', 'professor')));

CREATE POLICY "presencas_update" ON public.presencas
    FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo IN ('admin', 'professor')));

-- ANOTACOES: Cada usuário vê e edita apenas as suas
CREATE POLICY "anotacoes_view" ON public.anotacoes
    FOR SELECT USING (usuario_id = auth.uid() OR auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo = 'admin'));

CREATE POLICY "anotacoes_insert" ON public.anotacoes
    FOR INSERT WITH CHECK (usuario_id = auth.uid() OR auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo = 'admin'));

CREATE POLICY "anotacoes_update" ON public.anotacoes
    FOR UPDATE USING (usuario_id = auth.uid() OR auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo = 'admin'));

CREATE POLICY "anotacoes_delete" ON public.anotacoes
    FOR DELETE USING (usuario_id = auth.uid() OR auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo = 'admin'));

-- ARQUIVOS: Cada usuário vê e edita apenas os seus
CREATE POLICY "arquivos_view" ON public.arquivos
    FOR SELECT USING (
        usuario_id = auth.uid() 
        OR auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo IN ('admin', 'professor'))
    );

CREATE POLICY "arquivos_insert" ON public.arquivos
    FOR INSERT WITH CHECK (
        usuario_id = auth.uid() 
        OR auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo IN ('admin', 'professor'))
    );

-- GRADUACOES: Admin e Professor gerenciam, Aluno vê apenas suas
CREATE POLICY "graduacoes_view" ON public.graduacoes
    FOR SELECT USING (
        auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo IN ('admin', 'professor'))
        OR aluno_id IN (SELECT id FROM public.alunos WHERE usuario_id = auth.uid())
    );

CREATE POLICY "graduacoes_insert" ON public.graduacoes
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo IN ('admin', 'professor')));

-- AVISOS: Todos véem avisos ativos
CREATE POLICY "avisos_view" ON public.avisos
    FOR SELECT USING (ativo = true);

CREATE POLICY "avisos_manage" ON public.avisos
    FOR ALL USING (auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo = 'admin'));

-- TURMAS_ALUNOS: Admin e Professor gerenciam
CREATE POLICY "turmas_alunos_view" ON public.turmas_alunos
    FOR SELECT USING (
        auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo IN ('admin', 'professor'))
        OR aluno_id IN (SELECT id FROM public.alunos WHERE usuario_id = auth.uid())
    );

CREATE POLICY "turmas_alunos_insert" ON public.turmas_alunos
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.usuarios WHERE tipo IN ('admin', 'professor')));

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para criar usuário automaticamente após signup no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (auth_id, nome, email, tipo)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'nome',
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'tipo', 'aluno')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at automático
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON public.alunos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_professores_updated_at BEFORE UPDATE ON public.professores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_turmas_updated_at BEFORE UPDATE ON public.turmas FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_planos_updated_at BEFORE UPDATE ON public.planos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_anotacoes_updated_at BEFORE UPDATE ON public.anotacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- DADOS INICIAIS (SEED)
-- =====================================================

-- Inserir planos padrão (executar uma vez)
-- INSERT INTO public.planos (nome, descricao, duracao_minutos, modalidade, nivel) VALUES
-- ('Aquecimento Geral', 'Aquecimento completo para inicio do treino', 15, 'Geral', 'Iniciante'),
-- ('Treino Técnico', 'Foco em técnicas específicas da modalidade', 45, 'Artes Marciais', 'Todos'),
-- ('Sparring', 'Rodada de luta controlada', 30, 'Luta', 'Intermediário'),
-- ('Condicionamento', 'Exercícios físicos para resistência', 30, 'Fitness', 'Todos');
