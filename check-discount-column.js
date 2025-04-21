import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function checkDiscountColumn() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials');
    return;
  }
  
  console.log('Connecting to Supabase:', supabaseUrl);
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    console.log('Checking row from Pagamento table to verify discount column...');
    
    const { data, error } = await supabase
      .from('Pagamento')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying Pagamento table:', error);
      return;
    }
    
    if (data && data.length > 0) {
      const row = data[0];
      console.log('Sample row from Pagamento table:');
      console.log(row);
      
      if ('discount' in row) {
        console.log('\n✅ The "discount" column exists in the Pagamento table.');
        console.log(`Current value: ${row.discount}`);
      } else {
        console.log('\n❌ The "discount" column does NOT exist in the Pagamento table.');
      }
    } else {
      console.log('No data found in Pagamento table');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkDiscountColumn().catch(console.error); 