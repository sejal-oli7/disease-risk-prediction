from flask import Flask, render_template, jsonify
from config import Config
from extensions import db, jwt
from routes.patient import patient_bp
from routes.admin import admin_bp
from models.user import User
from models.patient import Patient
from models.prediction import Prediction
from routes.dashboard import dashboard_bp

from routes.auth import auth_bp
from routes.prediction import prediction_bp

from flask_jwt_extended import jwt_required, get_jwt_identity


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(patient_bp)
    app.register_blueprint(admin_bp)

    # Create database tables
    with app.app_context():
        db.create_all()

    # -------------------------
    # PUBLIC PAGES
    # -------------------------

    @app.route("/")
    def home():
        return render_template("home.html")

    @app.route("/auth")
    def login():
        return render_template("auth/login.html")

    @app.route("/register")
    def register():
        return render_template("auth/register.html")

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

    # -------------------------
    # USER PAGES
    # -------------------------

    @app.route("/dashboard")
    def dashboard():
        return render_template("dashboard.html")

    @app.route("/prediction")
    def prediction():
        return render_template("prediction.html")

    @app.route("/prediction-history")
    def prediction_history():
        return render_template("prediction_history.html")

    @app.route("/patients")
    def patients():
        return render_template("patients.html")

    # -------------------------
    # ADMIN PAGE
    # -------------------------

    @app.route("/admin")
    def admin_dashboard():
        return render_template("admin_dashboard.html")

    # -------------------------
    # USER DASHBOARD API
    # -------------------------

    @app.route("/api/dashboard-stats", methods=["GET"])
    @jwt_required()
    def dashboard_stats():

        try:
            # Get the currently logged-in user's ID from JWT
            user_id = int(get_jwt_identity())

            # Get ONLY this user's patients
            total_patients = Patient.query.filter_by(
                user_id=user_id
            ).count()

            # Get ONLY this user's predictions
            predictions = Prediction.query.filter_by(
                user_id=user_id
            ).order_by(
                Prediction.id.desc()
            ).all()

            prediction_list = []

            for p in predictions:

                patient_name = "Unknown Patient"

                # Make sure the patient also belongs to
                # the currently logged-in user
                if p.patient_id:

                    patient = Patient.query.filter_by(
                        id=p.patient_id,
                        user_id=user_id
                    ).first()

                    if patient:
                        patient_name = patient.name

                prediction_list.append({
                    "id": p.id,
                    "patient_id": p.patient_id,
                    "patient_name": patient_name,
                    "disease": p.disease,
                    "prediction": p.prediction,
                    "probability": p.probability,
                    "risk_level": p.risk_level,
                    "created_at": (
                        p.created_at.isoformat()
                        if p.created_at
                        else None
                    )
                })

            # Return ONLY logged-in user's data
            return jsonify({
                "total_patients": total_patients,
                "total_predictions": len(prediction_list),
                "predictions": prediction_list
            }), 200

        except Exception as e:

            print("Dashboard stats error:", e)

            return jsonify({
                "error": str(e)
            }), 500

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)