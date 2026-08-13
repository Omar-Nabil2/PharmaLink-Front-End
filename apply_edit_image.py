import re

ts_path = r"d:\ITI Graduation Project\PharmaLink-Frontend\src\app\pages\patient\create-recurring\create-recurring.ts"
html_path = r"d:\ITI Graduation Project\PharmaLink-Frontend\src\app\pages\patient\create-recurring\create-recurring.html"

# Update TS
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

if "existingImageUrl" not in ts_content:
    ts_content = ts_content.replace(
        "isUploading = false;",
        "isUploading = false;\n  existingImageUrl: string | null = null;"
    )
    ts_content = ts_content.replace(
        "this.form = { ...data };",
        "this.form = { ...data }; this.existingImageUrl = data.prescriptionImageUrl || null;"
    )
    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)

# Update HTML
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Make the upload section visible even in edit mode, or just add an image viewer
# Actually, the upload section is currently hidden in edit mode: <div class="flex flex-col gap-1.5" *ngIf="!editId">
if "*ngIf=\"!editId\"" in html_content:
    # Instead of removing *ngIf="!editId", we can add a viewer if existingImageUrl exists
    search_str = """          <!-- Prescription Image Upload -->
          <div class="flex flex-col gap-1.5" *ngIf="!editId">"""
    replace_str = """          <!-- Prescription Image Viewer (Edit Mode) -->
          <div class="flex flex-col gap-1.5" *ngIf="editId && existingImageUrl">
            <label class="text-xs font-black text-slate-600">صورة الروشتة الحالية</label>
            <a [href]="existingImageUrl" target="_blank" class="block rounded-xl overflow-hidden border border-slate-200 hover:border-teal-400 transition-all">
              <img [src]="existingImageUrl" alt="صورة الروشتة" class="w-full h-32 object-cover hover:scale-105 transition-transform duration-300" />
            </a>
          </div>

          <!-- Prescription Image Upload -->
          <div class="flex flex-col gap-1.5" *ngIf="!editId">"""
    html_content = html_content.replace(search_str, replace_str)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

print("Updated create-recurring")
