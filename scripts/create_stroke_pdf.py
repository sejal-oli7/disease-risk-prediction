from reportlab.pdfgen import canvas

pdf_path = "stroke_complete.pdf"

fields = [
    ("gender", "Female"),
    ("age", "45"),
    ("hypertension", "0"),
    ("heart_disease", "0"),
    ("ever_married", "Yes"),
    ("work_type", "Private"),
    ("Residence_type", "Urban"),
    ("avg_glucose_level", "120"),
    ("bmi", "24.5"),
    ("smoking_status", "never smoked"),
]

c = canvas.Canvas(pdf_path)

y = 800

c.setFont("Helvetica-Bold", 16)
c.drawString(50, y, "PATIENT STROKE MEDICAL REPORT")

y -= 40
c.setFont("Helvetica", 11)

for field, value in fields:
    c.drawString(50, y, f"{field}: {value}")
    y -= 30

c.save()

print(f"Created: {pdf_path}")
