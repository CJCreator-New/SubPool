import os

path = 'supabase/migrations/20260313010000_waitlist_system.sql'
with open(path, 'r', encoding='utf-8') as file:
    content = file.read()

# Fix the accidental "position" in variable names and logic
content = content.replace('v_next_"position"', 'v_next_position')
content = content.replace('v_"position"', 'v_position')
content = content.replace('v_position', 'v_waitlist_pos') # Rename variable to avoid conflict

# Replace the specific lines where it's still broken
content = content.replace('INTO v_already_waiting, v_position', 'INTO v_already_waiting, v_waitlist_pos')
content = content.replace('SELECT v_position', 'SELECT v_waitlist_pos')
content = content.replace('v_waitlist_pos :=', 'v_waitlist_pos :=') # No change needed but for consistency
content = content.replace('VALUES (p_pool_id, p_user_id, v_waitlist_pos,', 'VALUES (p_pool_id, p_user_id, v_waitlist_pos,')
content = content.replace('SELECT "position" INTO v_waitlist_pos', 'SELECT "position" INTO v_waitlist_pos')
content = content.replace('RETURN v_next_position;', 'RETURN v_next_position;') # Wait, I renamed v_next_"position" back to v_next_position

# Be very careful
with open(path, 'w', encoding='utf-8') as file:
    file.write(content)
