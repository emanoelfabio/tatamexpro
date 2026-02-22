-- =====================================================
-- TATAMEX PERFORMANCE - Schema Corrigido
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Drop existing tables if they have issues
DROP POLICY IF EXISTS "usuários_view_all" ON public.usuarios;
DROP POLICY IF EXISTS "usuários_view_own" ON public.usuarios;
DROP POLICY IF EXISTS "usuários_insert" ON public.usuarios;
DROP POLICY IF EXISTS "usuários_update" ON public.usuarios;
DROP POLICY IF EXISTS "alunos_view_admin_professor" ON public.alunos;
DROP POLICY IF EXISTS "alunos_insert" ON public.alunos;
DROP POLICY IF EXISTS "alunos_update" ON public.alunos;
DROP POLICY IF EXISTS "professores_view" ON public.professores;
DROP POLICY IF EXISTS "professores_insert" ON public.professores;
DROP POLICY IF EXISTS "professores_update" ON public.professores;
DROP POLICY IF EXISTS "turmas_view" ON public.turmas;
DROP POLICY IF EXISTS "turmas_insert" ON public.turmas;
DROP POLICY IF EXISTS "turmas_update" ON public.turmas;
DROP POLICY IF EXISTS "presencas_view" ON public.presencas;
DROP POLICY IF EXISTS "presencas_insert" ON public.presencas;
DROP POLICY IF EXISTS "presencas_update" ON public.presencas;
DROP POLICY IF EXISTS "anotacoes_view" ON public.anotacoes;
DROP POLICY IF EXISTS "anotacoes_insert" ON public.anotacoes;
DROP POLICY IF EXISTS "anotacoes_update" ON public.anotacoes;
DROP POLICY IF EXISTS "anotacoes_delete" ON public.anotacoes;
DROP POLICY IF EXISTS "arquivos_view" ON public.arquivos;
DROP POLICY IF EXISTS "arquivos_insert" ON public.arquivos;
DROP POLICY IF EXISTS "graduacoes_view" ON public.graduacoes;
DROP POLICY IF EXISTS "graduacoes_insert" ON public.graduacoes;
DROP POLICY IF EXISTS "avisos_view" ON public.avisos;
DROP POLICY IF EXISTS "avisos_manage" ON public.avisos;
DROP POLICY IF EXISTS "turmas_alunos_view" ON public.turmas_alunos;
DROP POLICY IF EXISTS "turmas_alunos_insert" ON public.turmas_alunos;

-- =====================================================
-- POLÍTICAS SIMPLIFICADAS (sem recursão)
-- =====================================================

-- USUARIOS: permitem tudo por enquanto (simplificado)
CREATE POLICY "usuarios_any" ON public.usuarios
    FOR ALL USING (true) WITH CHECK (true);

-- ALUNOS: permitem tudo
CREATE POLICY "alunos_any" ON public.alunos
    FOR ALL USING (true) WITH CHECK (true);

-- PROFESSORES: permitem tudo
CREATE POLICY "professores_any" ON public.professores
    FOR ALL USING (true) WITH CHECK (true);

-- TURMAS: permitem tudo
CREATE POLICY "turmas_any" ON public.turmas
    FOR ALL USING (true) WITH CHECK (true);

-- PRESENCAS: permitem tudo
CREATE POLICY "presencas_any" ON public.presencas
    FOR ALL USING (true) WITH CHECK (true);

-- PLANOS: permitem tudo
CREATE POLICY "planos_any" ON public.planos
    FOR ALL USING (true) WITH CHECK (true);

-- ANOTACOES: permitem tudo
CREATE POLICY "anotacoes_any" ON public.anotacoes
    FOR ALL USING (true) WITH CHECK (true);

-- ARQUIVOS: permitem tudo
CREATE POLICY "arquivos_any" ON public.arquivos
    FOR ALL USING (true) WITH CHECK (true);

-- GRADUACOES: permitem tudo
CREATE POLICY "graduacoes_any" ON public.graduacoes
    FOR ALL USING (true) WITH CHECK (true);

-- AVISOS: permitem tudo
CREATE POLICY "avisos_any" ON public.avisos
    FOR ALL USING (true) WITH CHECK (true);

-- TURMAS_ALUNOS: permitem tudo
CREATE POLICY "turmas_alunos_any" ON public.turmas_alunos
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- VERIFICAR CRIAÇÃO
-- =====================================================
SELECT 'Tabelas criadas com sucesso!' AS status;
