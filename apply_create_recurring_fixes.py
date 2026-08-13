import re

ts_path = r"d:\ITI Graduation Project\PharmaLink-Frontend\src\app\pages\patient\create-recurring\create-recurring.ts"
html_path = r"d:\ITI Graduation Project\PharmaLink-Frontend\src\app\pages\patient\create-recurring\create-recurring.html"

# Read TS
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Add CDR to TS
ts_content = ts_content.replace(
    "import { Component, OnInit, OnDestroy } from '@angular/core';",
    "import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';"
)
ts_content = ts_content.replace(
    "private presService: PrescriptionService",
    "private presService: PrescriptionService, private cdr: ChangeDetectorRef"
)
ts_content = ts_content.replace(
    "finalize(() => this.isLoading = false)",
    "finalize(() => { this.isLoading = false; this.cdr.detectChanges(); })"
)
ts_content = ts_content.replace(
    "this.form = { ...data };",
    "this.form = { ...data }; this.cdr.detectChanges();"
)
ts_content = ts_content.replace(
    "error: () => { alert('حدث خطأ أثناء تحميل بيانات الروشتة الدورية'); this.router.navigate(['/patient/prescriptions/recurring']); }",
    "error: () => { alert('حدث خطأ أثناء تحميل بيانات الروشتة الدورية'); this.cdr.detectChanges(); this.router.navigate(['/patient/prescriptions/recurring']); }"
)
ts_content = ts_content.replace(
    "next: () => {",
    "next: () => { this.cdr.detectChanges();"
)
ts_content = ts_content.replace(
    "error: () => {",
    "error: () => { this.cdr.detectChanges();"
)
ts_content = ts_content.replace(
    "finalize(() => {",
    "finalize(() => { this.cdr.detectChanges();"
)
ts_content = ts_content.replace(
    "this.uploadProgress = 0;",
    "this.uploadProgress = 0; this.cdr.detectChanges();"
)
ts_content = ts_content.replace(
    "this.isUploading = false;",
    "this.isUploading = false; this.cdr.detectChanges();"
)
ts_content = ts_content.replace(
    "this.uploadProgress = Math.round(100 * event.loaded / event.total);",
    "this.uploadProgress = Math.round(100 * event.loaded / event.total); this.cdr.detectChanges();"
)

if "minDate" not in ts_content:
    class_body_start = ts_content.find("export class CreateRecurring")
    if class_body_start != -1:
        insert_idx = ts_content.find("{", class_body_start) + 1
        code_to_add = """
  minDate = new Date().toISOString().split('T')[0];
"""
        ts_content = ts_content[:insert_idx] + code_to_add + ts_content[insert_idx:]

with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)

# Read HTML
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Add min to startDate
html_content = html_content.replace(
    '[(ngModel)]="form.startDate" name="startDate" type="date"',
    '[(ngModel)]="form.startDate" name="startDate" type="date" [min]="minDate"'
)
# Make sure it catches other variations
html_content = html_content.replace(
    'type="date" [(ngModel)]="form.startDate"',
    'type="date" [(ngModel)]="form.startDate" [min]="minDate"'
)

# Add min to endDate
html_content = html_content.replace(
    '[(ngModel)]="form.endDate" name="endDate" type="date"',
    '[(ngModel)]="form.endDate" name="endDate" type="date" [min]="form.startDate || minDate"'
)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Applied fixes to create-recurring")
