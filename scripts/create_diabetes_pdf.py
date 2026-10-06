from reportlab.pdfgen import canvas

pdf_path = "diabetes_complete.pdf"

fields = [
    ("Pregnancies", "2"),
    ("Glucose", "120"),
    ("BloodPressure", "80"),
    ("SkinThickness", "25"),
    ("Insulin", "100"),
    ("BMI", "28.5"),
    ("DiabetesPedigreeFunction", "0.45"),
    ("Age", "45"),
]

c = canvas.Canvas(pdf_path)

y = 800

c.setFont("Helvetica-Bold", 16)
c.drawString(50, y, "PATIENT DIABETES MEDICAL REPORT")

y -= 40
c.setFont("Helvetica", 11)

for field, value in fields:
    c.drawString(50, y, f"{field}: {value}")
    y -= 30

c.save()

print(f"Created: {pdf_path}")
