import os

path = 'supabase/migrations/20260312161000_phase1_reconciliation.sql'
with open(path, 'r', encoding='utf-8') as file:
    lines = file.readlines()

new_lines = []
for line in lines:
    if ' ON public;' in line:
        continue
    new_lines.append(line)

with open(path, 'w', encoding='utf-8') as file:
    file.writelines(new_lines)
