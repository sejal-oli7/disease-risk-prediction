from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.patient import Patient
from models.prediction import Prediction

from services.prediction_service import (
    predict_diabetes,
    predict_heart_disease,
    predict_kidney,
    predict_liver,
    predict_breast_cancer,
    predict_parkinsons,
    predict_stroke
)

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


@prediction_bp.route("/heart-disease", methods=["POST"])
@jwt_required()
def heart_disease_prediction():
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

        # Run the heart disease ML model
        result = predict_heart_disease(data)

        # Save prediction result to database
        prediction_record = Prediction(
            user_id=user_id,
            patient_id=patient_id,
            disease="Heart Disease",
            prediction=result["prediction"],
            probability=result["probability"],
            risk_level=result["risk_level"]
        )

        db.session.add(prediction_record)
        db.session.commit()

        return jsonify({
            "message": "Heart disease prediction completed successfully",
            "disease": "Heart Disease",
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


@prediction_bp.route("/kidney", methods=["POST"])
@jwt_required()
def kidney_prediction():
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

        # Run the kidney disease ML model
        result = predict_kidney(data)

        # Save prediction result to database
        prediction_record = Prediction(
            user_id=user_id,
            patient_id=patient_id,
            disease="Kidney Disease",
            prediction=result["prediction"],
            probability=result["probability"],
            risk_level=result["risk_level"]
        )

        db.session.add(prediction_record)
        db.session.commit()

        return jsonify({
            "message": "Kidney disease prediction completed successfully",
            "disease": "Kidney Disease",
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

@prediction_bp.route("/liver", methods=["POST"])
@jwt_required()
def liver_prediction():
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

        # Run the liver disease ML model
        result = predict_liver(data)

        # Save prediction result to database
        prediction_record = Prediction(
            user_id=user_id,
            patient_id=patient_id,
            disease="Liver Disease",
            prediction=result["prediction"],
            probability=result["probability"],
            risk_level=result["risk_level"]
        )

        db.session.add(prediction_record)
        db.session.commit()

        return jsonify({
            "message": "Liver disease prediction completed successfully",
            "disease": "Liver Disease",
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


@prediction_bp.route("/breast-cancer", methods=["POST"])
@jwt_required()
def breast_cancer_prediction():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No data provided"
            }), 400

        user_id = int(get_jwt_identity())
        patient_id = data.get("patient_id")

        if not patient_id:
            return jsonify({
                "error": "patient_id is required"
            }), 400

        patient = Patient.query.filter_by(
            id=patient_id,
            user_id=user_id
        ).first()

        if not patient:
            return jsonify({
                "error": "Patient not found"
            }), 404

        result = predict_breast_cancer(data)

        prediction_record = Prediction(
            user_id=user_id,
            patient_id=patient_id,
            disease="Breast Cancer",
            prediction=result["prediction"],
            probability=result["probability"],
            risk_level=result["risk_level"]
        )

        db.session.add(prediction_record)
        db.session.commit()

        return jsonify({
            "message": "Breast cancer prediction completed successfully",
            "disease": "Breast Cancer",
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


@prediction_bp.route("/parkinsons", methods=["POST"])
@jwt_required()
def parkinsons_prediction():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No data provided"
            }), 400

        user_id = int(get_jwt_identity())
        patient_id = data.get("patient_id")

        if not patient_id:
            return jsonify({
                "error": "patient_id is required"
            }), 400

        patient = Patient.query.filter_by(
            id=patient_id,
            user_id=user_id
        ).first()

        if not patient:
            return jsonify({
                "error": "Patient not found"
            }), 404

        result = predict_parkinsons(data)

        prediction_record = Prediction(
            user_id=user_id,
            patient_id=patient_id,
            disease="Parkinson's Disease",
            prediction=result["prediction"],
            probability=result["probability"],
            risk_level=result["risk_level"]
        )

        db.session.add(prediction_record)
        db.session.commit()

        return jsonify({
            "message": "Parkinson's disease prediction completed successfully",
            "disease": "Parkinson's Disease",
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

@prediction_bp.route("/stroke", methods=["POST"])
@jwt_required()
def stroke_prediction():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No data provided"
            }), 400

        user_id = int(get_jwt_identity())
        patient_id = data.get("patient_id")

        if not patient_id:
            return jsonify({
                "error": "patient_id is required"
            }), 400

        patient = Patient.query.filter_by(
            id=patient_id,
            user_id=user_id
        ).first()

        if not patient:
            return jsonify({
                "error": "Patient not found"
            }), 404

        result = predict_stroke(data)

        prediction_record = Prediction(
            user_id=user_id,
            patient_id=patient_id,
            disease="Stroke",
            prediction=result["prediction"],
            probability=result["probability"],
            risk_level=result["risk_level"]
        )

        db.session.add(prediction_record)
        db.session.commit()

        return jsonify({
            "message": "Stroke prediction completed successfully",
            "disease": "Stroke",
            "patient_id": patient_id,
            "prediction": result["prediction"],
            "probability": result["probability"],
            "risk_level": result["risk_level"]
        }), 200

    except KeyError as e:
        return jsonify({
            "error": f"Missing field: {str(e)}"
        }), 400

    except ValueError as e:
        return jsonify({
            "error": str(e)
        }), 400

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "error": str(e)
        }), 500