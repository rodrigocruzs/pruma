-- First, remove all existing policies
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

-- Disable and re-enable RLS to ensure clean state
ALTER TABLE "PrestadorPJ" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Pagamento" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "NotaFiscal" DISABLE ROW LEVEL SECURITY;

ALTER TABLE "PrestadorPJ" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Pagamento" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotaFiscal" ENABLE ROW LEVEL SECURITY;

-- Set default deny-all
ALTER TABLE "PrestadorPJ" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Pagamento" FORCE ROW LEVEL SECURITY;
ALTER TABLE "NotaFiscal" FORCE ROW LEVEL SECURITY;

-- Recreate policies with strict conditions
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