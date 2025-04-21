import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function runMigration() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials');
    return;
  }
  
  console.log('Connecting to Supabase:', supabaseUrl);
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    console.log('Running migration to add discount field to Pagamento table...');
    
    // Define the SQL query to add the discount column
    const { data, error } = await supabase.rpc('exec_sql', {
      query_text: `
        ALTER TABLE "Pagamento" 
        ADD COLUMN IF NOT EXISTS "discount" NUMERIC DEFAULT 0 NOT NULL;
        
        -- Update existing records to set discount to 0
        UPDATE "Pagamento" SET "discount" = 0 WHERE "discount" IS NULL;
        
        COMMENT ON COLUMN "Pagamento"."discount" IS 'Discount amount that reduces the final payment value';
      `
    });
    
    if (error) {
      console.error('Error running migration:', error);
      
      // Fallback to raw SQL if RPC method doesn't work
      console.log('Trying alternative approach with raw SQL...');
      
      const { error: sqlError } = await supabase
        .from('Pagamento')
        .update({ 'discount_test': 0 })
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .select();
      
      if (sqlError) {
        if (sqlError.message.includes('column "discount_test" does not exist')) {
          console.log('SQL permissions may be limited. Please run this SQL in the Supabase dashboard:');
          console.log(`
            ALTER TABLE "Pagamento" 
            ADD COLUMN IF NOT EXISTS "discount" NUMERIC DEFAULT 0 NOT NULL;
            
            UPDATE "Pagamento" SET "discount" = 0 WHERE "discount" IS NULL;
            
            COMMENT ON COLUMN "Pagamento"."discount" IS 'Discount amount that reduces the final payment value';
          `);
        } else {
          console.error('Error with fallback approach:', sqlError);
        }
      }
    } else {
      console.log('Migration successful!');
      
      // Verify the column was added
      const { data: verifyData, error: verifyError } = await supabase
        .from('Pagamento')
        .select('discount')
        .limit(1);
      
      if (verifyError) {
        console.error('Error verifying column creation:', verifyError);
      } else {
        console.log('Discount column verified. Sample data:', verifyData);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

runMigration().catch(console.error); 