from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.patient import Patient
from models.prediction import Prediction
from services.prediction_service import predict_diabetes


prediction_bp = Blueprint(
    "prediction",
    __name__,
    url_prefix="/api/predict"
)


@prediction_bp.route("/diabetes", methods=["POST"])
@jwt_required()
def diabetes_prediction():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No data provided"
            }), 400

        # Get logged-in user's ID from JWT
        user_id = int(get_jwt_identity())

        # Get patient ID from request
        patient_id = data.get("patient_id")

        if not patient_id:
            return jsonify({
                "error": "patient_id is required"
            }), 400

        # Check whether patient belongs to logged-in user
        patient = Patient.query.filter_by(
            id=patient_id,
            user_id=user_id
        ).first()

        if not patient:
            return jsonify({
                "error": "Patient not found"
            }), 404

        # Run the diabetes ML model
        result = predict_diabetes(data)

        # Save prediction result to database
        prediction_record = Prediction(
            user_id=user_id,
            patient_id=patient_id,
            disease="Diabetes",
            prediction=result["prediction"],
            probability=result["probability"],
            risk_level=result["risk_level"]
        )

        db.session.add(prediction_record)
        db.session.commit()

        return jsonify({
            "message": "Diabetes prediction completed successfully",
            "disease": "Diabetes",
            "patient_id": patient_id,
            "prediction": result["prediction"],
            "probability": result["probability"],
            "risk_level": result["risk_level"]
        }), 200

    except KeyError as e:
        return jsonify({
            "error": f"Missing field: {str(e)}"
        }), 400

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 500