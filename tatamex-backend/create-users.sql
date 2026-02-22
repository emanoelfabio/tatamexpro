-- =====================================================
-- TATAMEX PERFORMANCE - Criar Tabela de Usuários
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    tipo TEXT DEFAULT 'aluno' CHECK (tipo IN ('admin', 'professor', 'aluno')),
    telefone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política de acesso público para desenvolvimento
DROP POLICY IF EXISTS "usuarios_any" ON usuarios;
CREATE POLICY "usuarios_any" ON usuarios FOR ALL USING (true) WITH CHECK (true);

-- Criar usuário admin de exemplo (substitua o auth_id)
-- Primeiro, insira sem auth_id se ainda não tiver:
INSERT INTO usuarios (nome, email, tipo, telefone)
VALUES ('Administrador', 'admin@tatamex.com', 'admin', '')
ON CONFLICT (email) DO NOTHING;

-- Verificar usuários criados
SELECT id, nome, email, tipo, created_at FROM usuarios;

SELECT 'Tabela usuarios criada com sucesso!' AS status;
