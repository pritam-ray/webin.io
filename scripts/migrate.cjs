const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
  const match = envContent.match(new RegExp(`${name}=(.*)`));
  return match ? match[1].trim() : null;
};

const dbPassword = getEnvVar('SUPABASE_DB_PASSWORD');
const host = 'db.jmpbdgcyefuqdfinqqjv.supabase.co';
const user = 'postgres';
const database = 'postgres';
const port = 6543;

if (!dbPassword) {
  console.error('\n❌ ERROR: SUPABASE_DB_PASSWORD is not set in your .env file!');
  console.log('Please open your .env file and add the following line:');
  console.log('SUPABASE_DB_PASSWORD=your-database-password\n');
  process.exit(1);
}

const sqlPath = path.resolve(process.cwd(), 'supabase_schema.sql');
const migrationSql = fs.readFileSync(sqlPath, 'utf8');

async function run() {
  console.log(`Connecting to Supabase Database (host: ${host})...`);
  const client = new Client({
    host,
    user,
    password: dbPassword,
    database,
    port,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected! Running SQL migrations...');
    await client.query(migrationSql);
    console.log('✅ Success: SQL migration executed successfully! Your Supabase database is now updated.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
