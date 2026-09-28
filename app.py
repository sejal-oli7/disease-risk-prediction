from flask import Flask, render_template
from config import Config
from extensions import db, jwt
from routes.patient import patient_bp
from routes.admin import admin_bp
from models.user import User
from models.patient import Patient
from models.prediction import Prediction

from routes.auth import auth_bp
from routes.prediction import prediction_bp


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

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)