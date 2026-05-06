import os
import re

d = 'supabase/migrations'
for f in os.listdir(d):
    if not f.endswith('.sql'): continue
    path = os.path.join(d, f)
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = re.sub(r'(?i)create\s+policy\s+(?:")?([^"\s]+)(?:")?\s+on\s+([a-zA-Z0-9_]+)', r'DROP POLICY IF EXISTS "\1" ON \2;\nCREATE POLICY "\1" ON \2', content)
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as file:
            file.write(new_content)
