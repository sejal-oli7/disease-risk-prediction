from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch

output = "heart_complete.pdf"

doc = SimpleDocTemplate(
    output,
    pagesize=A4,
    rightMargin=50,
    leftMargin=50,
    topMargin=50,
    bottomMargin=50
)

styles = getSampleStyleSheet()
story = []

story.append(
    Paragraph("PATIENT HEART DISEASE TEST REPORT", styles["Title"])
)
story.append(Spacer(1, 0.2 * inch))

fields = [
    ("Age", "45"),
    ("Gender", "Female"),
    ("Weight", "60"),
    ("Height", "165"),
    ("BMI", "22.0"),
    ("Smoking", "No"),
    ("Alcohol_Intake", "No"),
    ("Physical_Activity", "High"),
    ("Diet", "Healthy"),
    ("Stress_Level", "Low"),
    ("Hypertension", "No"),
    ("Diabetes", "No"),
    ("Hyperlipidemia", "No"),
    ("Family_History", "No"),
    ("Previous_Heart_Attack", "No"),
    ("Systolic_BP", "120"),
    ("Diastolic_BP", "80"),
    ("Heart_Rate", "72"),
    ("Blood_Sugar_Fasting", "90"),
    ("Cholesterol_Total", "180"),
]

for field, value in fields:
    story.append(
        Paragraph(f"<b>{field}:</b> {value}", styles["BodyText"])
    )
    story.append(Spacer(1, 0.08 * inch))

doc.build(story)

print(f"Created: {output}")
