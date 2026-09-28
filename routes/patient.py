from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.patient import Patient


patient_bp = Blueprint(
    "patient",
    __name__,
    url_prefix="/api/patients"
)


# ========================================
# CREATE PATIENT
# ========================================

@patient_bp.route("", methods=["POST"])
@jwt_required()
def create_patient():

    try:

        data = request.get_json()

        if not data:

            return jsonify({
                "error": "No data provided"
            }), 400


        name = data.get("name")
        age = data.get("age")
        gender = data.get("gender")


        if not name:

            return jsonify({
                "error": "Patient name is required"
            }), 400


        user_id = int(
            get_jwt_identity()
        )


        patient = Patient(
            user_id=user_id,
            name=name,
            age=age,
            gender=gender
        )


        db.session.add(patient)

        db.session.commit()


        return jsonify({

            "message":
                "Patient created successfully",

            "patient": {

                "id":
                    patient.id,

                "name":
                    patient.name,

                "age":
                    patient.age,

                "gender":
                    patient.gender
            }

        }), 201


    except Exception as e:

        db.session.rollback()

        return jsonify({

            "error":
                str(e)

        }), 500


# ========================================
# GET LOGGED-IN USER'S PATIENTS
# ========================================

@patient_bp.route("", methods=["GET"])
@jwt_required()
def get_patients():

    try:

        user_id = int(
            get_jwt_identity()
        )


        patients = Patient.query.filter_by(
            user_id=user_id
        ).order_by(
            Patient.id.desc()
        ).all()


        return jsonify({

            "patients": [

                {
                    "id":
                        patient.id,

                    "name":
                        patient.name,

                    "age":
                        patient.age,

                    "gender":
                        patient.gender
                }

                for patient in patients

            ]

        }), 200


    except Exception as e:

        return jsonify({

            "error":
                str(e)

        }), 500


# ========================================
# GET SINGLE PATIENT
# ========================================

@patient_bp.route(
    "/<int:patient_id>",
    methods=["GET"]
)
@jwt_required()
def get_patient(patient_id):

    try:

        user_id = int(
            get_jwt_identity()
        )


        patient = Patient.query.filter_by(

            id=patient_id,

            user_id=user_id

        ).first()


        if not patient:

            return jsonify({

                "error":
                    "Patient not found"

            }), 404


        return jsonify({

            "patient": {

                "id":
                    patient.id,

                "name":
                    patient.name,

                "age":
                    patient.age,

                "gender":
                    patient.gender
            }

        }), 200


    except Exception as e:

        return jsonify({

            "error":
                str(e)

        }), 500