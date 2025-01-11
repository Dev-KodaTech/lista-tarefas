-- Criar um usuário de teste
-- Nota: Substitua 'USER-UUID' pelo UUID real do usuário após criar a conta
DO $$
DECLARE
    test_user_id uuid := 'USER-UUID';
BEGIN

-- Inserir categorias padrão
INSERT INTO public.categories (name, color, user_id)
VALUES
    ('Trabalho', '#FF4136', test_user_id),
    ('Pessoal', '#2ECC40', test_user_id),
    ('Saúde', '#0074D9', test_user_id),
    ('Casa', '#B10DC9', test_user_id),
    ('Estudos', '#FF851B', test_user_id),
    ('Projetos', '#7FDBFF', test_user_id),
    ('Compras', '#01FF70', test_user_id),
    ('Família', '#F012BE', test_user_id);

-- Inserir tarefas de exemplo para cada categoria
-- Categoria: Trabalho
INSERT INTO public.todos (text, completed, date, time, category, note, repeat, user_id)
VALUES
    ('Reunião com equipe de desenvolvimento', false, CURRENT_DATE + INTERVAL '1 day', '10:00', 'Trabalho', 'Discutir sprint planning', 'weekly', test_user_id),
    ('Revisar relatório mensal', false, CURRENT_DATE + INTERVAL '3 days', '14:00', 'Trabalho', 'Incluir métricas de performance', null, test_user_id),
    ('Preparar apresentação para cliente', false, CURRENT_DATE + INTERVAL '2 days', '09:00', 'Trabalho', 'Focar em resultados Q4', null, test_user_id);

-- Categoria: Pessoal
INSERT INTO public.todos (text, completed, date, time, category, note, repeat, user_id)
VALUES
    ('Academia', false, CURRENT_DATE, '07:00', 'Pessoal', 'Treino de força', 'daily', test_user_id),
    ('Meditar', false, CURRENT_DATE, '06:00', 'Pessoal', '20 minutos de mindfulness', 'daily', test_user_id),
    ('Ler livro', false, CURRENT_DATE, '20:00', 'Pessoal', 'Capítulo 5 - Clean Code', null, test_user_id);

-- Categoria: Saúde
INSERT INTO public.todos (text, completed, date, time, category, note, repeat, user_id)
VALUES
    ('Consulta médica', false, CURRENT_DATE + INTERVAL '5 days', '15:30', 'Saúde', 'Check-up anual', null, test_user_id),
    ('Tomar vitaminas', false, CURRENT_DATE, '08:00', 'Saúde', 'Complexo B e Vitamina D', 'daily', test_user_id),
    ('Beber água', false, CURRENT_DATE, null, 'Saúde', '2L por dia', 'daily', test_user_id);

-- Categoria: Casa
INSERT INTO public.todos (text, completed, date, time, category, note, repeat, user_id)
VALUES
    ('Limpar escritório', false, CURRENT_DATE + INTERVAL '1 day', null, 'Casa', 'Organizar documentos', 'weekly', test_user_id),
    ('Pagar contas', false, CURRENT_DATE + INTERVAL '5 days', null, 'Casa', 'Água, luz e internet', 'monthly', test_user_id),
    ('Fazer compras do mês', false, CURRENT_DATE + INTERVAL '7 days', '10:00', 'Casa', 'Atualizar lista no app', 'monthly', test_user_id);

-- Categoria: Estudos
INSERT INTO public.todos (text, completed, date, time, category, note, repeat, user_id)
VALUES
    ('Curso de TypeScript', false, CURRENT_DATE, '19:00', 'Estudos', 'Módulo de Generics', null, test_user_id),
    ('Praticar inglês', false, CURRENT_DATE, '18:00', 'Estudos', '30 minutos de conversação', 'daily', test_user_id),
    ('Ler documentação React', false, CURRENT_DATE + INTERVAL '2 days', null, 'Estudos', 'Hooks avançados', null, test_user_id);

-- Categoria: Projetos
INSERT INTO public.todos (text, completed, date, time, category, note, repeat, user_id)
VALUES
    ('Desenvolver API REST', false, CURRENT_DATE + INTERVAL '10 days', null, 'Projetos', 'Implementar autenticação JWT', null, test_user_id),
    ('Atualizar portfolio', false, CURRENT_DATE + INTERVAL '4 days', null, 'Projetos', 'Adicionar novos projetos', null, test_user_id),
    ('Contribuir open source', false, CURRENT_DATE + INTERVAL '3 days', null, 'Projetos', 'Procurar issues "good first issue"', 'weekly', test_user_id);

-- Categoria: Compras
INSERT INTO public.todos (text, completed, date, time, category, note, repeat, user_id)
VALUES
    ('Comprar presente aniversário', false, CURRENT_DATE + INTERVAL '6 days', null, 'Compras', 'Aniversário do João', null, test_user_id),
    ('Pesquisar preço notebook', false, CURRENT_DATE + INTERVAL '2 days', null, 'Compras', 'Comparar modelos Dell e Lenovo', null, test_user_id),
    ('Renovar assinaturas', false, CURRENT_DATE + INTERVAL '15 days', null, 'Compras', 'Netflix e Spotify', 'monthly', test_user_id);

-- Categoria: Família
INSERT INTO public.todos (text, completed, date, time, category, note, repeat, user_id)
VALUES
    ('Almoço em família', false, CURRENT_DATE + INTERVAL '7 days', '12:00', 'Família', 'Levar sobremesa', null, test_user_id),
    ('Ligar para os pais', false, CURRENT_DATE, '20:30', 'Família', null, 'weekly', test_user_id),
    ('Aniversário sobrinho', false, CURRENT_DATE + INTERVAL '20 days', '15:00', 'Família', 'Comprar presente', null, test_user_id);

-- Inserir algumas tarefas concluídas
INSERT INTO public.todos (text, completed, date, time, category, note, user_id, created_at)
VALUES
    ('Configurar ambiente de desenvolvimento', true, CURRENT_DATE - INTERVAL '2 days', null, 'Trabalho', 'Setup completo realizado', test_user_id, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('Reunião de planejamento', true, CURRENT_DATE - INTERVAL '1 day', '14:00', 'Trabalho', 'Ata enviada por email', test_user_id, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('Backup arquivos importantes', true, CURRENT_DATE - INTERVAL '3 days', null, 'Projetos', 'Backup realizado na nuvem', test_user_id, CURRENT_TIMESTAMP - INTERVAL '3 days');

-- Inserir alguns anexos de exemplo
INSERT INTO public.task_attachments (todo_id, file_path, file_name, file_size, file_type, user_id)
SELECT 
    t.id,
    'task-attachments/' || test_user_id || '/' || t.id || '/documento.pdf',
    'documento.pdf',
    1024576, -- 1MB
    'application/pdf',
    test_user_id
FROM public.todos t
WHERE t.category = 'Trabalho'
LIMIT 3;

END $$; 