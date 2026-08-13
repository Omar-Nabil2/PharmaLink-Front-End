import re

ts_path = r"d:\ITI Graduation Project\PharmaLink-Frontend\src\app\pages\patient\recurring-list\recurring-list.ts"
html_path = r"d:\ITI Graduation Project\PharmaLink-Frontend\src\app\pages\patient\recurring-list\recurring-list.html"

# Read TS
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

# Add CDR to TS
ts_content = ts_content.replace(
    "import { Component, OnInit, OnDestroy } from '@angular/core';",
    "import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';"
)
ts_content = ts_content.replace(
    "constructor(private svc: RecurringPrescriptionsService) {}",
    "constructor(private svc: RecurringPrescriptionsService, private cdr: ChangeDetectorRef) {}"
)
ts_content = ts_content.replace(
    "finalize(() => this.isLoading = false)",
    "finalize(() => { this.isLoading = false; this.cdr.detectChanges(); })"
)
ts_content = ts_content.replace(
    "next: (data) => this.items = data,",
    "next: (data) => { this.items = data; this.cdr.detectChanges(); },"
)
ts_content = ts_content.replace(
    "error: () => this.error = 'حدث خطأ أثناء تحميل الروشتات الدورية'",
    "error: () => { this.error = 'حدث خطأ أثناء تحميل الروشتات الدورية'; this.cdr.detectChanges(); }"
)
ts_content = ts_content.replace(
    "next: () => item.status = 'Paused',",
    "next: () => { item.status = 'Paused'; this.cdr.detectChanges(); },"
)
ts_content = ts_content.replace(
    "next: () => item.status = 'Active',",
    "next: () => { item.status = 'Active'; this.cdr.detectChanges(); },"
)
ts_content = ts_content.replace(
    "next: () => this.items = this.items.filter(x => x.id !== item.id),",
    "next: () => { this.items = this.items.filter(x => x.id !== item.id); this.cdr.detectChanges(); },"
)

if "formatDate" not in ts_content:
    class_body_start = ts_content.find("export class RecurringList")
    if class_body_start != -1:
        insert_idx = ts_content.find("{", class_body_start) + 1
        code_to_add = """
  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
  }
"""
        ts_content = ts_content[:insert_idx] + code_to_add + ts_content[insert_idx:]


with open(ts_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)

# Read HTML
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Make sure dates are formatted properly
html_content = html_content.replace(
    "{{ item.startDate | date }}",
    "{{ formatDate(item.startDate) }}"
)
html_content = html_content.replace(
    "{{ item.endDate | date }}",
    "{{ formatDate(item.endDate) }}"
)
html_content = html_content.replace(
    "{{ item.nextRunDate | date }}",
    "{{ formatDate(item.nextRunDate) }}"
)
# Check for common formats if the above were not found
html_content = re.sub(r'\{\{\s*item\.startDate\s*(?:\|\s*date[^}]*)?\}\}', '{{ formatDate(item.startDate) }}', html_content)
html_content = re.sub(r'\{\{\s*item\.endDate\s*(?:\|\s*date[^}]*)?\}\}', '{{ formatDate(item.endDate) }}', html_content)
html_content = re.sub(r'\{\{\s*item\.nextRunDate\s*(?:\|\s*date[^}]*)?\}\}', '{{ formatDate(item.nextRunDate) }}', html_content)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Applied fixes to recurring-list")
