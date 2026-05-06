import os
import re

path = 'supabase/migrations/20260313010000_waitlist_system.sql'
with open(path, 'r', encoding='utf-8') as file:
    content = file.read()

# Replace position with "position" but be careful with word boundaries
# Match: whitespace or ( or , followed by position followed by whitespace or ) or , or ;
# But wait, it's safer to just replace it in the specific function return tables and queries.

# Quote "position" in RETURNS TABLE and other places where it's a column name
content = content.replace('RETURNS TABLE(position INTEGER', 'RETURNS TABLE("position" INTEGER')
content = content.replace('MAX(position)', 'MAX("position")')
content = content.replace('SELECT position', 'SELECT "position"')
content = content.replace('SET position =', 'SET "position" =')
content = content.replace('ORDER BY position', 'ORDER BY "position"')
content = content.replace('OVER (ORDER BY position)', 'OVER (ORDER BY "position")')
content = content.replace('v_next_user.position', 'v_next_user."position"')

with open(path, 'w', encoding='utf-8') as file:
    file.write(content)
