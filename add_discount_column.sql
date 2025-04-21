-- Migration to add discount column to Pagamento table
-- Run this SQL in the Supabase SQL Editor

-- Add the discount column with a default value of 0
ALTER TABLE "Pagamento" 
ADD COLUMN IF NOT EXISTS "discount" NUMERIC DEFAULT 0 NOT NULL;

-- Update existing records to set discount to 0 (redundant due to DEFAULT 0, but just to be safe)
UPDATE "Pagamento" SET "discount" = 0 WHERE "discount" IS NULL;

-- Add a comment to the column for documentation
COMMENT ON COLUMN "Pagamento"."discount" IS 'Discount amount that reduces the final payment value';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Pagamento' AND column_name = 'discount'; 