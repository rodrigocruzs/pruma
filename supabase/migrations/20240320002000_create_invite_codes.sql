-- Create invite_codes table
CREATE TABLE IF NOT EXISTS invite_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    used_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own created invite codes"
ON invite_codes FOR SELECT
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Users can create invite codes"
ON invite_codes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own invite codes"
ON invite_codes FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Function to generate random invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql; 