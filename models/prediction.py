from extensions import db
from datetime import datetime


class Prediction(db.Model):
    __tablename__ = "predictions"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patients.id"),
        nullable=False
    )

    disease = db.Column(db.String(50), nullable=False)
    prediction = db.Column(db.Integer, nullable=False)
    probability = db.Column(db.Float)
    risk_level = db.Column(db.String(20))

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def __repr__(self):
        return f"<Prediction {self.disease}>"
