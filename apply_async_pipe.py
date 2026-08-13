path = r'd:\ITI Graduation Project\PharmaLink-Frontend\src\app\pages\patient\reminders\reminders.html'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

opening = '<div class="min-h-screen bg-slate-50" dir="rtl">'
ng_wrap_open = '<ng-container *ngIf="reminders$ | async as reminders">\n'

if ng_wrap_open not in c:
    c = c.replace(opening, ng_wrap_open + opening)

c = c.rstrip()
if not c.endswith('</ng-container>'):
    c = c + '\n</ng-container>'

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated reminders.html with async pipe')
