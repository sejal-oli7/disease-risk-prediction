from flask import Flask
from config import Config
from extensions import db, jwt

from models.user import User
from models.patient import Patient
from models.prediction import Prediction

from routes.auth import auth_bp


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)

    # Register API blueprints
    app.register_blueprint(auth_bp)

    # Create database tables
    with app.app_context():
        db.create_all()

    @app.route("/")
    def home():
        return "Disease Risk Prediction System API is running!"

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
