import re

ts_path = r"d:\ITI Graduation Project\PharmaLink-Frontend\src\app\core\services\recurring-prescriptions.service.ts"

with open(ts_path, 'r', encoding='utf-8') as f:
    ts_content = f.read()

if "prescriptionImageUrl?:" not in ts_content:
    ts_content = ts_content.replace(
        "createdAt: string;",
        "createdAt: string;\n  prescriptionImageUrl?: string;"
    )
    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)

print("Updated frontend DTO")
