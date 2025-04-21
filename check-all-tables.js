import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function checkAllTables() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials');
    return;
  }
  
  console.log('Connecting to Supabase:', supabaseUrl);
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    // User-specified tables
    const tables = [
      'NotaFiscal',
      'Pagamento',
      'PrestadorPJ',
      'company_settings',
      'user_profiles',
      'user_roles'
    ];
    
    const tablesInfo = {};
    
    for (const table of tables) {
      console.log(`Checking table ${table}...`);
      
      // Get count
      const { count, error: countError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.log(`Error getting count for ${table}:`, countError.message);
        continue;
      }
      
      console.log(`Table ${table} exists with count: ${count}`);
      
      // Get sample data
      const { data, error: dataError } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (dataError) {
        console.log(`Error getting data for ${table}:`, dataError.message);
        continue;
      }
      
      // Build schema from sample row
      if (data && data.length > 0) {
        const sampleRow = data[0];
        const schema = {};
        
        for (const [key, value] of Object.entries(sampleRow)) {
          schema[key] = {
            type: typeof value,
            example: value,
            nullable: value === null
          };
        }
        
        tablesInfo[table] = {
          count,
          schema
        };
      } else {
        console.log(`No data found for ${table} to determine schema`);
        tablesInfo[table] = {
          count,
          schema: 'No data available to determine schema'
        };
      }
    }
    
    // Save table information to a file
    fs.writeFileSync('all-tables-info.json', JSON.stringify(tablesInfo, null, 2));
    console.log('All tables information saved to all-tables-info.json');
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkAllTables().catch(console.error); 