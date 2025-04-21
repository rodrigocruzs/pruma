-- Add the discount column to Pagamento table
-- This is needed for the new "Descontos" field in the BatchPaymentPage UI

-- Add the discount column with a default value of 0
ALTER TABLE "Pagamento" 
ADD COLUMN IF NOT EXISTS "discount" NUMERIC DEFAULT 0 NOT NULL;

-- Update existing records to set discount to 0 (redundant due to DEFAULT 0, but just to be safe)
UPDATE "Pagamento" SET "discount" = 0 WHERE "discount" IS NULL;

-- Add a comment to the column for documentation
COMMENT ON COLUMN "Pagamento"."discount" IS 'Discount amount that reduces the final payment value'; 