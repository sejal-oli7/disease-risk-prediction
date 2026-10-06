from reportlab.pdfgen import canvas

pdf_path = "liver_complete.pdf"

fields = [
    ("Age", "45"),
    ("Gender", "Female"),
    ("Total_Bilirubin", "1.2"),
    ("Direct_Bilirubin", "0.4"),
    ("Alkphos", "200"),
    ("Sgpt", "30"),
    ("Sgot", "28"),
    ("Total_Proteins", "7.0"),
    ("Albumin", "4.0"),
    ("AG_Ratio", "1.3"),
]

c = canvas.Canvas(pdf_path)

y = 800

c.setFont("Helvetica-Bold", 16)
c.drawString(50, y, "PATIENT LIVER MEDICAL REPORT")

y -= 40
c.setFont("Helvetica", 11)

for field, value in fields:
    c.drawString(50, y, f"{field}: {value}")
    y -= 30

c.save()

print(f"Created: {pdf_path}")
