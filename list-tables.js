import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function listTablesAndPolicies() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials');
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('SUPA')));
    return;
  }
  
  console.log('Connecting to Supabase:', supabaseUrl);
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  // Try to query known tables directly
  try {
    console.log('Trying to query known tables directly...');
    const knownTables = ['Empresa', 'Pagamento', 'PrestadorPJ', 'NotaFiscal', 'Config', 'Settings'];
    
    const tableInfo = [];
    
    for (const table of knownTables) {
      console.log(`Checking if ${table} exists...`);
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`Table ${table} error:`, error.message);
      } else {
        console.log(`Table ${table} exists with count: ${count}`);
        tableInfo.push({ table, count });
        
        // Get RLS policies for this table
        const { data: policies, error: policyError } = await supabase
          .from('pg_policies')
          .select('*')
          .eq('tablename', table.toLowerCase());
        
        if (policyError) {
          console.log(`Error fetching policies for ${table}:`, policyError.message);
        } else if (policies && policies.length > 0) {
          console.log(`Policies for ${table}:`, policies);
          tableInfo[tableInfo.length - 1].policies = policies;
        } else {
          console.log(`No policies found for ${table}`);
        }
      }
    }
    
    // Save the information to a file
    fs.writeFileSync('table-info.json', JSON.stringify(tableInfo, null, 2));
    console.log('Table information saved to table-info.json');
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

listTablesAndPolicies().catch(console.error); 