-- Add category_id to platforms
ALTER TABLE platforms ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Cleanup: If we want to migrate old text category to id, we would need a mapping.
-- For now, we'll just support both or phase out the text one.
