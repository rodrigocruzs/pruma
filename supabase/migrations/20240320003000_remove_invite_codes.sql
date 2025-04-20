-- Drop the policies first
DROP POLICY IF EXISTS "Users can view their own created invite codes" ON invite_codes;
DROP POLICY IF EXISTS "Users can create invite codes" ON invite_codes;
DROP POLICY IF EXISTS "Users can update their own invite codes" ON invite_codes;

-- Drop the function
DROP FUNCTION IF EXISTS generate_invite_code();

-- Drop the table
DROP TABLE IF EXISTS invite_codes; 