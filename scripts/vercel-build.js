const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do cliente Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY; // Chave de serviço para acesso administrativo

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  try {
    console.log('Iniciando execução das migrations...');
    
    // Lê os arquivos de migration em ordem
    const migrationsDir = path.join(__dirname, '../supabase/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      console.log(`Executando migration: ${file}`);
      const migration = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Executa a migration
      const { error } = await supabase.rpc('exec_sql', { sql: migration });
      
      if (error) {
        throw new Error(`Erro ao executar migration ${file}: ${error.message}`);
      }
      
      console.log(`Migration ${file} executada com sucesso`);
    }

    console.log('Todas as migrations foram executadas com sucesso');
  } catch (error) {
    console.error('Erro ao executar migrations:', error);
    process.exit(1);
  }
}

async function runSeeds() {
  try {
    console.log('Iniciando execução dos seeds...');
    
    // Lê o arquivo de seed
    const seedFile = path.join(__dirname, '../supabase/seed.sql');
    const seedSQL = fs.readFileSync(seedFile, 'utf8');
    
    // Executa o seed
    const { error } = await supabase.rpc('exec_sql', { sql: seedSQL });
    
    if (error) {
      throw new Error(`Erro ao executar seed: ${error.message}`);
    }
    
    console.log('Seeds executados com sucesso');
  } catch (error) {
    console.error('Erro ao executar seeds:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    // Executa as migrations primeiro
    await runMigrations();
    
    // Depois executa os seeds
    await runSeeds();
    
    console.log('Build concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro durante o build:', error);
    process.exit(1);
  }
}

main(); 