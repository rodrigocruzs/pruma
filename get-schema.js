import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function getTableSchemas() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials');
    return;
  }
  
  console.log('Connecting to Supabase:', supabaseUrl);
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    const tables = ['Empresa', 'Pagamento', 'PrestadorPJ', 'NotaFiscal', 'Config', 'Settings'];
    const schemas = {};
    
    for (const table of tables) {
      console.log(`Getting schema for ${table}...`);
      
      // Get a single row to examine structure
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`Error getting schema for ${table}:`, error.message);
        continue;
      }
      
      if (data && data.length > 0) {
        // Create schema from the first row
        const sampleRow = data[0];
        const schema = {};
        
        for (const [key, value] of Object.entries(sampleRow)) {
          schema[key] = {
            type: typeof value,
            example: value,
            nullable: value === null
          };
        }
        
        schemas[table] = schema;
        console.log(`Schema for ${table} successfully retrieved`);
      } else {
        console.log(`No data found for ${table} to determine schema`);
        
        // Try to query the database schema information
        const { data: columns, error: columnsError } = await supabase
          .rpc('get_table_columns', { table_name: table.toLowerCase() });
          
        if (columnsError) {
          console.log(`Error getting columns for ${table}:`, columnsError.message);
        } else if (columns && columns.length) {
          schemas[table] = columns.reduce((acc, col) => {
            acc[col.column_name] = {
              type: col.data_type,
              nullable: col.is_nullable === 'YES'
            };
            return acc;
          }, {});
          console.log(`Schema for ${table} retrieved from database metadata`);
        }
      }
    }
    
    // Save schema information to a file
    fs.writeFileSync('table-schemas.json', JSON.stringify(schemas, null, 2));
    console.log('Table schemas saved to table-schemas.json');
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

getTableSchemas().catch(console.error); 