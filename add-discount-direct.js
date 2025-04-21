import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function runMigration() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase credentials');
    return;
  }
  
  const restUrl = `${supabaseUrl}/rest/v1/`;
  console.log('Connecting to Supabase REST API:', restUrl);
  
  try {
    // First, let's check if the column already exists
    const checkColumnResponse = await fetch(`${restUrl}Pagamento?select=id,discount&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const checkData = await checkColumnResponse.json();
    
    // If we get an error about the column not existing, then we need to create it
    if (checkColumnResponse.ok && !checkColumnResponse.status.toString().startsWith('4')) {
      console.log('Checking if discount column already exists...');
      
      // Try to access the column in the response
      const hasColumn = checkData && checkData.length > 0 && 'discount' in checkData[0];
      
      if (hasColumn) {
        console.log('Discount column already exists. No migration needed.');
        return;
      }
    }
    
    console.log('Column does not exist or could not be verified. Proceeding with manual SQL execution.');
    
    // Now we need to let the user know they need to run this SQL manually
    console.log('\n==== IMPORTANT: MANUAL ACTION REQUIRED ====');
    console.log('Please run the following SQL in the Supabase dashboard SQL Editor:');
    console.log(`
-- Add the discount column to Pagamento table
-- This is needed for the new "Descontos" field in the BatchPaymentPage UI

-- Add the discount column with a default value of 0
ALTER TABLE "Pagamento" 
ADD COLUMN IF NOT EXISTS "discount" NUMERIC DEFAULT 0 NOT NULL;

-- Update existing records to set discount to 0 (redundant due to DEFAULT 0, but just to be safe)
UPDATE "Pagamento" SET "discount" = 0 WHERE "discount" IS NULL;

-- Add a comment to the column for documentation
COMMENT ON COLUMN "Pagamento"."discount" IS 'Discount amount that reduces the final payment value';
    `);
    console.log('\nSteps to run this SQL:');
    console.log('1. Go to https://app.supabase.com/project/_/sql');
    console.log('2. Copy and paste the SQL above');
    console.log('3. Click "Run" to execute the SQL');
    console.log('4. Verify the column was added by running: SELECT * FROM "Pagamento" LIMIT 1;');
    console.log('===========================================\n');

    // Save the SQL to a file for easy access
    fs.writeFileSync('add_discount_column.sql', `
-- Add the discount column to Pagamento table
-- This is needed for the new "Descontos" field in the BatchPaymentPage UI

-- Add the discount column with a default value of 0
ALTER TABLE "Pagamento" 
ADD COLUMN IF NOT EXISTS "discount" NUMERIC DEFAULT 0 NOT NULL;

-- Update existing records to set discount to 0 (redundant due to DEFAULT 0, but just to be safe)
UPDATE "Pagamento" SET "discount" = 0 WHERE "discount" IS NULL;

-- Add a comment to the column for documentation
COMMENT ON COLUMN "Pagamento"."discount" IS 'Discount amount that reduces the final payment value';
    `);
    console.log('SQL has been saved to add_discount_column.sql for your convenience.');
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

runMigration().catch(console.error); 