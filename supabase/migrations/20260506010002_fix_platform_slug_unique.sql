-- Add unique constraint to platforms slug
ALTER TABLE platforms DROP CONSTRAINT IF EXISTS platforms_slug_key;
ALTER TABLE platforms ADD CONSTRAINT platforms_slug_key UNIQUE (slug);
