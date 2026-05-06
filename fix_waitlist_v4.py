import os

path = 'supabase/migrations/20260313010000_waitlist_system.sql'
with open(path, 'r', encoding='utf-8') as file:
    content = file.read()

content = content.replace('INSERT INTO pool_waitlist (pool_id, user_id, position, status)', 'INSERT INTO pool_waitlist (pool_id, user_id, "position", status)')
content = content.replace('DO UPDATE SET "position" = EXCLUDED.position', 'DO UPDATE SET "position" = EXCLUDED."position"')
content = content.replace('SELECT user_id, position INTO v_next_user', 'SELECT user_id, "position" INTO v_next_user')

with open(path, 'w', encoding='utf-8') as file:
    file.write(content)
