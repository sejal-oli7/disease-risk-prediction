from flask import Flask, render_template
from config import Config
from extensions import db, jwt
from routes.patient import patient_bp
from models.user import User
from models.patient import Patient
from models.prediction import Prediction

from routes.auth import auth_bp
from routes.prediction import prediction_bp

def create_app():
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(Config)

    # Initialize database and JWT
    db.init_app(app)
    jwt.init_app(app)

    # Register API blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(patient_bp)

    # Create database tables
    with app.app_context():
        db.create_all()

    # -------------------------
    # Frontend Pages
    # -------------------------

    @app.route("/")
    def home():
        return render_template("index.html")

    @app.route("/login")
    def login_page():
        return render_template("login.html")

    @app.route("/register")
    def register_page():
        return render_template("register.html")

    @app.route("/dashboard")
    def dashboard_page():
        return render_template("dashboard.html")

    @app.route("/prediction")
    def prediction_page():
        return render_template("prediction.html")

    @app.route("/admin")
    def admin_page():
        return render_template("admin_dashboard.html")

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
