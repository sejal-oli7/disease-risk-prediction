from reportlab.pdfgen import canvas

pdf_path = "kidney_complete.pdf"

fields = [
    ("age", "45"),
    ("bp", "80"),
    ("sg", "1.020"),
    ("al", "1"),
    ("su", "0"),
    ("rbc", "normal"),
    ("pc", "normal"),
    ("pcc", "notpresent"),
    ("ba", "notpresent"),
    ("bgr", "120"),
    ("bu", "40"),
    ("sc", "1.2"),
    ("sod", "140"),
    ("pot", "4.5"),
    ("hemo", "13.5"),
    ("pcv", "42"),
    ("wc", "8000"),
    ("rc", "5.0"),
    ("htn", "no"),
    ("dm", "no"),
    ("cad", "no"),
    ("appet", "good"),
    ("pe", "no"),
    ("ane", "no"),
]

c = canvas.Canvas(pdf_path)

y = 800

c.setFont("Helvetica-Bold", 16)
c.drawString(50, y, "PATIENT KIDNEY MEDICAL REPORT")

y -= 40
c.setFont("Helvetica", 11)

for field, value in fields:
    c.drawString(50, y, f"{field}: {value}")
    y -= 25

c.save()

print(f"Created: {pdf_path}")
