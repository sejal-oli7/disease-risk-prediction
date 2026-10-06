from reportlab.pdfgen import canvas

pdf_path = "parkinsons_complete.pdf"

fields = [
    ("MDVP:Fo(Hz)", "150.0"),
    ("MDVP:Fhi(Hz)", "200.0"),
    ("MDVP:Flo(Hz)", "100.0"),
    ("MDVP:Jitter(%)", "0.005"),
    ("MDVP:Jitter(Abs)", "0.00003"),
    ("MDVP:RAP", "0.003"),
    ("MDVP:PPQ", "0.003"),
    ("Jitter:DDP", "0.009"),
    ("MDVP:Shimmer", "0.03"),
    ("MDVP:Shimmer(dB)", "0.3"),
    ("Shimmer:APQ3", "0.015"),
    ("Shimmer:APQ5", "0.02"),
    ("MDVP:APQ", "0.025"),
    ("Shimmer:DDA", "0.045"),
    ("NHR", "0.02"),
    ("HNR", "20.0"),
    ("RPDE", "0.4"),
    ("DFA", "0.7"),
    ("spread1", "-5.0"),
    ("spread2", "0.2"),
    ("D2", "2.0"),
    ("PPE", "0.2"),
]

c = canvas.Canvas(pdf_path)

y = 800

c.setFont("Helvetica-Bold", 16)
c.drawString(50, y, "PATIENT PARKINSONS MEDICAL REPORT")

y -= 40
c.setFont("Helvetica", 10)

for field, value in fields:
    c.drawString(50, y, f"{field}: {value}")
    y -= 30

c.save()

print(f"Created: {pdf_path}")
