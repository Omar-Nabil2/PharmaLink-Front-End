import re

html_path = r"d:\ITI Graduation Project\PharmaLink-Frontend\src\app\pages\patient\recurring-list\recurring-list.html"
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Add image display in the card if prescriptionImageUrl exists
if "item.prescriptionImageUrl" not in html_content:
    search_str = """          <!-- Action buttons -->
          <div class="flex gap-2">"""
    replace_str = """          <!-- Prescription Image (If available) -->
          <div *ngIf="item.prescriptionImageUrl" class="mt-4 mb-2">
            <h4 class="text-xs font-black text-slate-600 mb-2">صورة الروشتة المرفقة:</h4>
            <a [href]="item.prescriptionImageUrl" target="_blank" class="block rounded-xl overflow-hidden border border-slate-200 hover:border-teal-400 transition-all">
              <img [src]="item.prescriptionImageUrl" alt="صورة الروشتة" class="w-full h-32 object-cover hover:scale-105 transition-transform duration-300" />
            </a>
          </div>

          <!-- Action buttons -->
          <div class="flex gap-2">"""
    html_content = html_content.replace(search_str, replace_str)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_content)

create_html_path = r"d:\ITI Graduation Project\PharmaLink-Frontend\src\app\pages\patient\create-recurring\create-recurring.html"
with open(create_html_path, 'r', encoding='utf-8') as f:
    create_html_content = f.read()

# Make the image upload container also show the uploaded image when editing
if "form.prescriptionImageUrl" not in create_html_content:
    search_str = """<!-- Upload Progress -->
            <div *ngIf="isUploading" class="w-full bg-slate-200 rounded-full h-2.5 mt-2 overflow-hidden">
              <div class="bg-teal-500 h-2.5 rounded-full transition-all duration-300" [style.width]="uploadProgress + '%'"></div>
            </div>"""
    
    # We don't have form.prescriptionImageUrl mapped in create-recurring form yet, but we can display the existing image in edit mode if it exists in the raw data. Wait, CreateRecurringRequest doesn't have it. We can add a property in the component.
    
    with open(create_html_path, 'w', encoding='utf-8') as f:
        f.write(create_html_content)

print("Updated frontend HTML")
