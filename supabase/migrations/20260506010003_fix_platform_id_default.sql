-- Ensure platforms id has a default
ALTER TABLE platforms ALTER COLUMN id SET DEFAULT gen_random_uuid();
