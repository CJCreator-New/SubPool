import os

d = 'supabase/migrations'
for f in os.listdir(d):
    if not f.endswith('.sql'): continue
    path = os.path.join(d, f)
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = content.replace('`nDROP POLICY', '\nDROP POLICY')
    new_content = new_content.replace('`nCREATE POLICY', '\nCREATE POLICY')
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as file:
            file.write(new_content)
