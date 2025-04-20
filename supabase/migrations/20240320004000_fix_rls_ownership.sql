-- First, add created_by columns if they don't exist
ALTER TABLE "PrestadorPJ" 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE "Pagamento" 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE "NotaFiscal" 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Set created_by for existing records to the first user
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    SELECT id INTO first_user_id FROM auth.users ORDER BY created_at LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        UPDATE "PrestadorPJ" SET created_by = first_user_id WHERE created_by IS NULL;
        UPDATE "Pagamento" SET created_by = first_user_id WHERE created_by IS NULL;
        UPDATE "NotaFiscal" SET created_by = first_user_id WHERE created_by IS NULL;
    END IF;
END $$;

-- Now make created_by NOT NULL
ALTER TABLE "PrestadorPJ" ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE "Pagamento" ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE "NotaFiscal" ALTER COLUMN created_by SET NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own contractors" ON "PrestadorPJ";
DROP POLICY IF EXISTS "Users can create contractors" ON "PrestadorPJ";
DROP POLICY IF EXISTS "Users can update their own contractors" ON "PrestadorPJ";
DROP POLICY IF EXISTS "Users can delete their own contractors" ON "PrestadorPJ";

DROP POLICY IF EXISTS "Users can view their own payments" ON "Pagamento";
DROP POLICY IF EXISTS "Users can create payments" ON "Pagamento";
DROP POLICY IF EXISTS "Users can update their own payments" ON "Pagamento";
DROP POLICY IF EXISTS "Users can delete their own payments" ON "Pagamento";

DROP POLICY IF EXISTS "Users can view their own invoices" ON "NotaFiscal";
DROP POLICY IF EXISTS "Users can create invoices" ON "NotaFiscal";
DROP POLICY IF EXISTS "Users can update their own invoices" ON "NotaFiscal";
DROP POLICY IF EXISTS "Users can delete their own invoices" ON "NotaFiscal";

-- Recreate policies with stricter conditions
CREATE POLICY "Users can view their own contractors"
ON "PrestadorPJ" FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Users can create contractors"
ON "PrestadorPJ" FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own contractors"
ON "PrestadorPJ" FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own contractors"
ON "PrestadorPJ" FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Pagamento policies
CREATE POLICY "Users can view their own payments"
ON "Pagamento" FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Users can create payments"
ON "Pagamento" FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own payments"
ON "Pagamento" FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own payments"
ON "Pagamento" FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- NotaFiscal policies
CREATE POLICY "Users can view their own invoices"
ON "NotaFiscal" FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Users can create invoices"
ON "NotaFiscal" FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own invoices"
ON "NotaFiscal" FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own invoices"
ON "NotaFiscal" FOR DELETE
TO authenticated
USING (auth.uid() = created_by); 