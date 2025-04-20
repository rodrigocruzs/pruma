-- Enable RLS on all tables
ALTER TABLE "PrestadorPJ" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pagamento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotaFiscal" ENABLE ROW LEVEL SECURITY;

-- Add created_by columns if they don't exist
DO $$ 
BEGIN
    -- Add created_by to PrestadorPJ if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'PrestadorPJ' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE "PrestadorPJ" 
        ADD COLUMN created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;

    -- Add created_by to Pagamento if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Pagamento' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE "Pagamento" 
        ADD COLUMN created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;

    -- Add created_by to NotaFiscal if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'NotaFiscal' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE "NotaFiscal" 
        ADD COLUMN created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();
    END IF;
END $$;

-- Update existing rows to set created_by to the first user (if needed)
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Get the first user's ID
    SELECT id INTO first_user_id FROM auth.users ORDER BY created_at LIMIT 1;
    
    -- Update existing rows only if they have NULL created_by
    IF first_user_id IS NOT NULL THEN
        UPDATE "PrestadorPJ" SET created_by = first_user_id WHERE created_by IS NULL;
        UPDATE "Pagamento" SET created_by = first_user_id WHERE created_by IS NULL;
        UPDATE "NotaFiscal" SET created_by = first_user_id WHERE created_by IS NULL;
    END IF;
END $$;

-- PrestadorPJ policies
CREATE POLICY "Users can view their own contractors"
ON "PrestadorPJ" FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can create contractors"
ON "PrestadorPJ" FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own contractors"
ON "PrestadorPJ" FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own contractors"
ON "PrestadorPJ" FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Pagamento policies
CREATE POLICY "Users can view their own payments"
ON "Pagamento" FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can create payments"
ON "Pagamento" FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own payments"
ON "Pagamento" FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own payments"
ON "Pagamento" FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- NotaFiscal policies
CREATE POLICY "Users can view their own invoices"
ON "NotaFiscal" FOR SELECT
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can create invoices"
ON "NotaFiscal" FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own invoices"
ON "NotaFiscal" FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own invoices"
ON "NotaFiscal" FOR DELETE
TO authenticated
USING (created_by = auth.uid()); 