-- Make old category column nullable
ALTER TABLE platforms ALTER COLUMN category DROP NOT NULL;
