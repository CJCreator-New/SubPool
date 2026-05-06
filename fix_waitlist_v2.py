import os

path = 'supabase/migrations/20260313010000_waitlist_system.sql'
with open(path, 'r', encoding='utf-8') as file:
    content = file.read()

# More aggressive quoting for "position" column
content = content.replace('position INTEGER', '"position" INTEGER')
content = content.replace('position ASC', '"position" ASC')
content = content.replace('OVER (ORDER BY position)', 'OVER (ORDER BY "position")')
content = content.replace('v_next_user.position', 'v_next_user."position"')

# Be careful with variables vs columns
# In PL/pgSQL, variables are usually v_position, so "position" should mostly refer to columns or return fields.

with open(path, 'w', encoding='utf-8') as file:
    file.write(content)
