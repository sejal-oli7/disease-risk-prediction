from flask import Flask, render_template, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import Config
from extensions import db, jwt
from routes.patient import patient_bp
from routes.admin import admin_bp
from models.user import User
from models.patient import Patient
from models.prediction import Prediction

from routes.auth import auth_bp
from routes.prediction import prediction_bp


# =====================================================================
#  ADJUST THESE 4 NAMES to match your models (models/prediction.py and
#  models/patient.py). Only change the text inside the quotes.
# =====================================================================
PREDICTION_USER_FIELD = "user_id"      # column: who made the prediction
PREDICTION_DISEASE_FIELD = "disease"   # column: disease name
PREDICTION_RISK_FIELD = "risk_level"   # column: Low / Moderate / High
PATIENT_USER_FIELD = "user_id"         # column: patient's owner (user)
# =====================================================================

# Turns the text saved in your database into the names the chart uses
DISEASE_LABELS = [
    ("diabetes",  "Diabetes"),
    ("heart",     "Heart Disease"),
    ("kidney",    "Kidney Disease"),
    ("liver",     "Liver Disease"),
    ("parkinson", "Parkinson's Disease"),
    ("stroke",    "Stroke"),
]


def clean_disease(value):
    text = str(value or "").lower()
    for key, label in DISEASE_LABELS:
        if key in text:
            return label
    return None


def clean_risk(value):
    text = str(value or "").lower()
    if "low" in text:
        return "low"
    if "mod" in text or "medium" in text:
        return "moderate"
    if "high" in text:
        return "high"
    return None


def current_user_id():
    identity = get_jwt_identity()
    # identity may be a number, a string, or a dict like {"id": 1}
    if isinstance(identity, dict):
        identity = identity.get("id") or identity.get("user_id")
    try:
        return int(identity)
    except (TypeError, ValueError):
        return identity


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(patient_bp)
    app.register_blueprint(admin_bp)

    with app.app_context():
        db.create_all()

    # ---------------- PAGES ----------------

    @app.route("/")
    def home():
        return render_template("home.html")

    @app.route("/auth")
    def login():
        return render_template("auth/login.html")

    @app.route("/register")
    def register():
        return render_template("auth/register.html")

    @app.route("/dashboard")
    def dashboard():
        return render_template("dashboard.html")

    @app.route("/prediction")
    def prediction():
        return render_template("prediction.html")

    @app.route("/prediction-history")
    def prediction_history():
        return render_template("prediction_history.html")

    @app.route("/admin")
    def admin_dashboard():
        return render_template("admin_dashboard.html")

    @app.route("/about")
    def about():
        return render_template("about.html")

    @app.route("/services")
    def services():
        return render_template("services.html")

    @app.route("/contact")
    def contact():
        return render_template("contact.html")

    @app.route("/how-it-works")
    def how_it_works():
        return render_template("how_it_works.html")

    @app.route("/patients")
    def patients():
        return render_template("patients.html")

    # ---------------- DASHBOARD DATA (NEW) ----------------
    # Returns ONLY the logged-in user's predictions and patients.

    @app.route("/api/dashboard-stats")
    @jwt_required()
    def dashboard_stats():
        user_id = current_user_id()

        try:
            predictions = Prediction.query.filter(
                getattr(Prediction, PREDICTION_USER_FIELD) == user_id
            ).all()

            patient_count = Patient.query.filter(
                getattr(Patient, PATIENT_USER_FIELD) == user_id
            ).count()

        except AttributeError as e:
            return jsonify({
                "error": "Column name mismatch - edit the 4 names at the top of app.py",
                "detail": str(e)
            }), 500

        by_disease = {}
        risk = {"low": 0, "moderate": 0, "high": 0}

        for p in predictions:
            disease = clean_disease(getattr(p, PREDICTION_DISEASE_FIELD, None))
            if disease:
                by_disease[disease] = by_disease.get(disease, 0) + 1

            level = clean_risk(getattr(p, PREDICTION_RISK_FIELD, None))
            if level:
                risk[level] += 1

        return jsonify({
            "total_patients": patient_count,
            "by_disease": by_disease,
            "risk": risk
        })

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)