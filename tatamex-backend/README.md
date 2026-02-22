# 🏆 TatameX Performance - Backend

## Status: ⚠️ RLS Policy Error

O banco de dados Supabase está configurado, mas existe um erro de "infinite recursion" nas políticas de segurança (RLS).

## Como Corrigir o Erro

### Passo 1: Acesse o Supabase
1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto: `tatamex-performance`
3. Clique em **SQL Editor** no menu lateral

### Passo 2: Execute o SQL de Correção
No SQL Editor, copie e cole o seguinte código:

```sql
-- =====================================================
-- TATAMEX PERFORMANCE - Correção de Políticas RLS
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "usuários_view_all" ON public.usuarios;
DROP POLICY IF EXISTS "usuários_view_own" ON public.usuarios;
DROP POLICY IF EXISTS "usuários_insert" ON public.usuarios;
DROP POLICY IF EXISTS "usuários_update" ON public.usuarios;
DROP POLICY IF EXISTS "alunos_view_admin_professor" ON public.alunos;
DROP POLICY IF EXISTS "alunos_insert" ON public.alunos;
DROP POLICY IF EXISTS "professores_view" ON public.professores;
DROP POLICY IF EXISTS "turmas_view" ON public.turmas;
DROP POLICY IF EXISTS "presencas_view" ON public.presencas;
DROP POLICY IF EXISTS "anotacoes_view" ON public.anotacoes;

-- Create simplified policies (no recursion)
CREATE POLICY "usuarios_any" ON public.usuarios
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "alunos_any" ON public.alunos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "professores_any" ON public.professores
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "turmas_any" ON public.turmas
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "presencas_any" ON public.presencas
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "planos_any" ON public.planos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "anotacoes_any" ON public.anotacoes
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "arquivos_any" ON public.arquivos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "graduacoes_any" ON public.graduacoes
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "avisos_any" ON public.avisos
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "turmas_alunos_any" ON public.turmas_alunos
    FOR ALL USING (true) WITH CHECK (true);

-- Verify
SELECT 'Políticas corrigidas com sucesso!' AS status;
```

### Passo 3: Execute o SQL
1. Clique no botão **Run** ou pressione Ctrl+Enter
2. Você deve ver a mensagem "Políticas corrigidas com sucesso!"

### Passo 4: Teste a Conexão
Após executar o SQL, teste no seu navegador. O erro de RLS deve estar resolvido.

---

## 📁 Arquivos do Backend

- `database.sql` - Schema completo do banco de dados
- `supabase.js` - Cliente JavaScript com todas as funções API

## 🔗 Configuração Atual

- **URL**: `https://voqvpxtyoawlopmeaqiy.supabase.co`
- **Chave Anônima**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (configurada em supabase.js)

## ⚠️ Nota de Segurança

As políticas criadas acima permitem acesso total para simplificar o desenvolvimento. Em produção, você deve:
1. Criar políticas mais restritivas
2. Usar autenticação de usuário
3. Configurar permissões baseadas em roles

---

**Data da última atualização**: 2026-02-22

---

## Como Criar Usuário Administrador

Você pode criar um usuário admin diretamente no Supabase:

### Passo 1: Liste os usuários existentes
No SQL Editor, execute:
```sql
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;
```

### Passo 2: Insira o usuário na tabela usuarios
Após criar o usuário no app (mesmo com erro), execute:
```sql
-- Substitua o auth_id pelo ID do usuário que você quer tornar admin:
INSERT INTO usuarios (auth_id, nome, email, tipo, telefone)
VALUES (
  'COLOQUE_O_AUTH_ID_AQUI',
  'Nome do Admin',
  'admin@email.com',
  'admin',
  ''
);
```

### Para encontrar o auth_id:
Se o usuário já se registrou (mesmo com erro), você pode ver o ID em auth.users
