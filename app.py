from flask import Flask, render_template

from config import Config
from extensions import db, jwt

from routes.auth import auth_bp
from routes.prediction import prediction_bp
from routes.admin import admin_bp
from routes.dashboard import dashboard_bp


def create_app():

    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)

    # Register application blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(dashboard_bp)

    # Create database tables
    with app.app_context():
        db.create_all()

    # ========================================
    # PUBLIC PAGES
    # ========================================

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


    # ========================================
    # USER PAGES
    # ========================================

    @app.route("/dashboard")
    def dashboard():
        return render_template("dashboard.html")


    @app.route("/prediction")
    def prediction():
        return render_template("prediction.html")


    @app.route("/prediction-history")
    def prediction_history():
        return render_template("prediction_history.html")


    # ========================================
    # ADMIN PAGE
    # ========================================

    @app.route("/admin")
    def admin_dashboard():
        return render_template("admin_dashboard.html")


    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
