import re

ts_path = r"d:\ITI Graduation Project\PharmaLink-Frontend\src\app\pages\patient\reminders\reminders.ts"
html_path = r"d:\ITI Graduation Project\PharmaLink-Frontend\src\app\pages\patient\reminders\reminders.html"

# Read TS
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Add minDate and formatTime to TS
if "minDate" not in ts_content:
    class_body_start = ts_content.find("export class Reminders")
    if class_body_start != -1:
        insert_idx = ts_content.find("{", class_body_start) + 1
        code_to_add = """
  minDate = new Date().toISOString().split('T')[0];

  formatTime(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':');
    let hour = parseInt(h, 10);
    const suffix = hour >= 12 ? 'م' : 'ص';
    if (hour === 0) hour = 12;
    if (hour > 12) hour -= 12;
    return `${hour}:${m} ${suffix}`;
  }

  formatDate(date: string): string {
    if (!date) return 'مستمر';
    return new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
  }
"""
        ts_content = ts_content[:insert_idx] + code_to_add + ts_content[insert_idx:]
        with open(ts_path, 'w', encoding='utf-8') as f:
            f.write(ts_content)

# Read HTML
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Replace {{ t }} with {{ formatTime(t) }}
html_content = html_content.replace("{{ t }}", "{{ formatTime(t) }}")

# Ensure endDate uses getDaysRemaining or formatDate
html_content = html_content.replace("{{ getDaysRemaining(r.endDate) }}", "{{ r.endDate ? 'حتى ' + formatDate(r.endDate) : 'مستمر' }}")

# Add min to startDate
html_content = html_content.replace(
    '[(ngModel)]="form.startDate" type="date"',
    '[(ngModel)]="form.startDate" type="date" [min]="minDate"'
)

# Add min to endDate
html_content = html_content.replace(
    '[(ngModel)]="form.endDate" type="date"',
    '[(ngModel)]="form.endDate" type="date" [min]="form.startDate || minDate"'
)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Applied fixes to reminders")
