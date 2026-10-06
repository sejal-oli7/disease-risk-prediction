from flask import Blueprint, request, jsonify

from services.pdf_service import (
    extract_text_from_file,
    extract_values_from_text,
    check_required_fields,
    check_all_diseases
)

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from extensions import db

from models.prediction import Prediction
from models.user import User

from services.prediction_service import (
    predict_diabetes,
    predict_heart_disease,
    predict_kidney,
    predict_liver,
    predict_parkinsons,
    predict_stroke
)


prediction_bp = Blueprint(
    "prediction",
    __name__,
    url_prefix="/api/predict"
)


# ============================================================
# GET PREDICTION HISTORY
# ============================================================

@prediction_bp.route(
    "/history",
    methods=["GET"]
)
@jwt_required()
def prediction_history():

    try:

        # Get logged-in user's ID from JWT
        user_id = int(
            get_jwt_identity()
        )

        # Get predictions belonging to logged-in user
        predictions = Prediction.query.filter_by(
            user_id=user_id
        ).order_by(
            Prediction.id.desc()
        ).all()

        prediction_list = []

        for prediction in predictions:

            created_at = None

            if prediction.created_at:

                created_at = (
                    prediction.created_at.isoformat()
                )

            prediction_list.append({

                "id":
                    prediction.id,

                "user_id":
                    prediction.user_id,

                "disease":
                    prediction.disease,

                "prediction":
                    prediction.prediction,

                "probability":
                    prediction.probability,

                "risk_level":
                    prediction.risk_level,

                "created_at":
                    created_at
            })

        return jsonify({

            "predictions":
                prediction_list

        }), 200


    except Exception as e:

        return jsonify({

            "error":
                str(e)

        }), 500


# ============================================================
# DIABETES PREDICTION
# ============================================================

@prediction_bp.route(
    "/diabetes",
    methods=["POST"]
)
@jwt_required()
def diabetes_prediction():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "error":
                    "No data provided"

            }), 400

        # Get logged-in user's ID
        user_id = int(
            get_jwt_identity()
        )

        # Run diabetes prediction
        result = predict_diabetes(
            data
        )

        # Save prediction
        prediction_record = Prediction(

            user_id=user_id,

            disease="Diabetes",

            prediction=result["prediction"],

            probability=result["probability"],

            risk_level=result["risk_level"]

        )

        db.session.add(
            prediction_record
        )

        db.session.commit()

        return jsonify({

            "message":
                "Diabetes prediction completed successfully",

            "disease":
                "Diabetes",

            "prediction":
                result["prediction"],

            "probability":
                result["probability"],

            "risk_level":
                result["risk_level"]

        }), 200


    except KeyError as e:

        return jsonify({

            "error":
                f"Missing field: {str(e)}"

        }), 400


    except Exception as e:

        db.session.rollback()

        return jsonify({

            "error":
                str(e)

        }), 500


# ============================================================
# HEART DISEASE PREDICTION
# ============================================================

@prediction_bp.route(
    "/heart-disease",
    methods=["POST"]
)
@jwt_required()
def heart_disease_prediction():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "error":
                    "No data provided"

            }), 400

        # Get logged-in user's ID
        user_id = int(
            get_jwt_identity()
        )

        # Run heart disease prediction
        result = predict_heart_disease(
            data
        )

        # Save prediction
        prediction_record = Prediction(

            user_id=user_id,

            disease="Heart Disease",

            prediction=result["prediction"],

            probability=result["probability"],

            risk_level=result["risk_level"]

        )

        db.session.add(
            prediction_record
        )

        db.session.commit()

        return jsonify({

            "message":
                "Heart disease prediction completed successfully",

            "disease":
                "Heart Disease",

            "prediction":
                result["prediction"],

            "probability":
                result["probability"],

            "risk_level":
                result["risk_level"]

        }), 200


    except KeyError as e:

        return jsonify({

            "error":
                f"Missing field: {str(e)}"

        }), 400


    except Exception as e:

        db.session.rollback()

        return jsonify({

            "error":
                str(e)

        }), 500


# ============================================================
# KIDNEY DISEASE PREDICTION
# ============================================================

@prediction_bp.route(
    "/kidney",
    methods=["POST"]
)
@jwt_required()
def kidney_prediction():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "error":
                    "No data provided"

            }), 400

        # Get logged-in user's ID
        user_id = int(
            get_jwt_identity()
        )

        # Run kidney prediction
        result = predict_kidney(
            data
        )

        # Save prediction
        prediction_record = Prediction(

            user_id=user_id,

            disease="Kidney Disease",

            prediction=result["prediction"],

            probability=result["probability"],

            risk_level=result["risk_level"]

        )

        db.session.add(
            prediction_record
        )

        db.session.commit()

        return jsonify({

            "message":
                "Kidney disease prediction completed successfully",

            "disease":
                "Kidney Disease",

            "prediction":
                result["prediction"],

            "probability":
                result["probability"],

            "risk_level":
                result["risk_level"]

        }), 200


    except KeyError as e:

        return jsonify({

            "error":
                f"Missing field: {str(e)}"

        }), 400


    except Exception as e:

        db.session.rollback()

        return jsonify({

            "error":
                str(e)

        }), 500


# ============================================================
# LIVER DISEASE PREDICTION
# ============================================================

@prediction_bp.route(
    "/liver",
    methods=["POST"]
)
@jwt_required()
def liver_prediction():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "error":
                    "No data provided"

            }), 400

        # Get logged-in user's ID
        user_id = int(
            get_jwt_identity()
        )

        # Run liver prediction
        result = predict_liver(
            data
        )

        # Save prediction
        prediction_record = Prediction(

            user_id=user_id,

            disease="Liver Disease",

            prediction=result["prediction"],

            probability=result["probability"],

            risk_level=result["risk_level"]

        )

        db.session.add(
            prediction_record
        )

        db.session.commit()

        return jsonify({

            "message":
                "Liver disease prediction completed successfully",

            "disease":
                "Liver Disease",

            "prediction":
                result["prediction"],

            "probability":
                result["probability"],

            "risk_level":
                result["risk_level"]

        }), 200


    except KeyError as e:

        return jsonify({

            "error":
                f"Missing field: {str(e)}"

        }), 400


    except Exception as e:

        db.session.rollback()

        return jsonify({

            "error":
                str(e)

        }), 500


# ============================================================
# PARKINSON'S DISEASE PREDICTION
# ============================================================

@prediction_bp.route(
    "/parkinsons",
    methods=["POST"]
)
@jwt_required()
def parkinsons_prediction():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "error":
                    "No data provided"

            }), 400

        # Get logged-in user's ID
        user_id = int(
            get_jwt_identity()
        )

        # Run Parkinson's prediction
        result = predict_parkinsons(
            data
        )

        # Save prediction
        prediction_record = Prediction(

            user_id=user_id,

            disease="Parkinson's Disease",

            prediction=result["prediction"],

            probability=result["probability"],

            risk_level=result["risk_level"]

        )

        db.session.add(
            prediction_record
        )

        db.session.commit()

        return jsonify({

            "message":
                "Parkinson's disease prediction completed successfully",

            "disease":
                "Parkinson's Disease",

            "prediction":
                result["prediction"],

            "probability":
                result["probability"],

            "risk_level":
                result["risk_level"]

        }), 200


    except KeyError as e:

        return jsonify({

            "error":
                f"Missing field: {str(e)}"

        }), 400


    except Exception as e:

        db.session.rollback()

        return jsonify({

            "error":
                str(e)

        }), 500


# ============================================================
# STROKE PREDICTION
# ============================================================

@prediction_bp.route(
    "/stroke",
    methods=["POST"]
)
@jwt_required()
def stroke_prediction():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "error":
                    "No data provided"

            }), 400

        # Get logged-in user's ID
        user_id = int(
            get_jwt_identity()
        )

        # Run stroke prediction
        result = predict_stroke(
            data
        )

        # Save prediction
        prediction_record = Prediction(

            user_id=user_id,

            disease="Stroke",

            prediction=result["prediction"],

            probability=result["probability"],

            risk_level=result["risk_level"]

        )

        db.session.add(
            prediction_record
        )

        db.session.commit()

        return jsonify({

            "message":
                "Stroke prediction completed successfully",

            "disease":
                "Stroke",

            "prediction":
                result["prediction"],

            "probability":
                result["probability"],

            "risk_level":
                result["risk_level"]

        }), 200


    except KeyError as e:

        return jsonify({

            "error":
                f"Missing field: {str(e)}"

        }), 400


    except ValueError as e:

        return jsonify({

            "error":
                str(e)

        }), 400


    except Exception as e:

        db.session.rollback()

        return jsonify({

            "error":
                str(e)

        }), 500


# ============================================================
# MEDICAL REPORT ANALYSIS + PREDICTION
# PDF + JPG + JPEG + PNG
# ============================================================

@prediction_bp.route(
    "/pdf-analyze",
    methods=["POST"]
)
@jwt_required()
def pdf_multi_disease_analysis():

    try:

        # ----------------------------------------
        # Get logged-in user
        # ----------------------------------------

        user_id = int(
            get_jwt_identity()
        )

        user = User.query.get(
            user_id
        )

        if not user:

            return jsonify({

                "error":
                    "User not found"

            }), 404


        # ----------------------------------------
        # Check uploaded file
        # ----------------------------------------

        if "file" not in request.files:

            return jsonify({

                "error":
                    "Medical report file is required"

            }), 400


        report_file = request.files[
            "file"
        ]


        # ----------------------------------------
        # Check filename
        # ----------------------------------------

        if not report_file.filename:

            return jsonify({

                "error":
                    "No file selected"

            }), 400


        filename = (
            report_file.filename.lower()
        )


        # ----------------------------------------
        # Allowed file extensions
        # ----------------------------------------

        allowed_extensions = (

            ".pdf",
            ".jpg",
            ".jpeg",
            ".png"

        )


        if not filename.endswith(
            allowed_extensions
        ):

            return jsonify({

                "error":
                    "Unsupported file type. "
                    "Please upload PDF, JPG, JPEG or PNG."

            }), 400


        # ----------------------------------------
        # Read uploaded file
        # ----------------------------------------

        file_bytes = report_file.read()


        if not file_bytes:

            return jsonify({

                "error":
                    "Uploaded file is empty"

            }), 400


        # ----------------------------------------
        # Extract text
        #
        # PDF
        #     -> PyMuPDF
        #
        # JPG/JPEG/PNG
        #     -> Tesseract OCR
        # ----------------------------------------

        text = extract_text_from_file(

            file_bytes,

            report_file.filename

        )


        # ----------------------------------------
        # Check extracted text
        # ----------------------------------------

        if not text or not text.strip():

            return jsonify({

                "error":
                    "Could not extract text from the "
                    "uploaded medical report. "
                    "Please upload a clear report image "
                    "or a readable PDF."

            }), 400


        # ----------------------------------------
        # Extract health parameters
        # ----------------------------------------

        values = extract_values_from_text(
            text
        )


        # ----------------------------------------
        # Check all disease requirements
        # ----------------------------------------

        disease_status = check_all_diseases(
            values
        )


        # ----------------------------------------
        # Disease model mapping
        # ----------------------------------------

        disease_map = {

            "diabetes": (

                "Diabetes",

                predict_diabetes

            ),

            "heart": (

                "Heart Disease",

                predict_heart_disease

            ),

            "kidney": (

                "Kidney Disease",

                predict_kidney

            ),

            "liver": (

                "Liver Disease",

                predict_liver

            ),

            "parkinsons": (

                "Parkinsons",

                predict_parkinsons

            ),

            "stroke": (

                "Stroke",

                predict_stroke

            )

        }


        # ----------------------------------------
        # Store analysis results
        # ----------------------------------------

        predictions = []

        not_analyzed = []

        errors = []


        # ----------------------------------------
        # Run applicable ML models
        # ----------------------------------------

        for disease_key, status in (
            disease_status["results"].items()
        ):

            disease_name = disease_key.title()
            


            # ------------------------------------
            # Skip incomplete diseases
            # ------------------------------------

            if not status["complete"]:
                not_analyzed.append({

                    "disease":
                        disease_name,

                    "reason":
                        "Insufficient Data",

                    "missing_fields":
                        status[
                            "missing_fields"
                        ]

                })

                continue


            # ------------------------------------
            # Check model configuration
            # ------------------------------------

            if disease_key not in disease_map:

                errors.append({

                    "disease":
                        disease_name,

                    "error":
                        "Prediction model not configured"

                })

                continue


            disease_name, prediction_function = (
                disease_map[
                    disease_key
                ]
            )


            # ------------------------------------
            # Run ML model safely
            # ------------------------------------

            try:

                result = prediction_function(
                    values
                )


                # --------------------------------
                # Save successful prediction
                # --------------------------------

                prediction_record = Prediction(

                    user_id=user_id,

                    disease=disease_name,

                    prediction=result[
                        "prediction"
                    ],

                    probability=result[
                        "probability"
                    ],

                    risk_level=result[
                        "risk_level"
                    ]

                )


                db.session.add(
                    prediction_record
                )


                # --------------------------------
                # Add result to response
                # --------------------------------

                predictions.append({

                    "disease":
                        disease_name,

                    "prediction":
                        result[
                            "prediction"
                        ],

                    "probability":
                        result[
                            "probability"
                        ],

                    "risk_level":
                        result[
                            "risk_level"
                        ]

                })


            except Exception as model_error:

                errors.append({

                    "disease":
                        disease_name,

                    "error":
                        str(model_error)

                })


        # ----------------------------------------
        # Save successful predictions
        # ----------------------------------------

        if predictions:

            db.session.commit()


        # ----------------------------------------
        # Return combined analysis
        # ----------------------------------------

        return jsonify({

            "message":
                "Medical report analyzed successfully",

            "user_id":
                user_id,

            "user_name":
                user.name,

            "file_type":
                filename.split(".")[-1].upper(),

            "extracted_values":
                values,

            "predictions":
                predictions,

            "not_analyzed":
                not_analyzed,

            "errors":
                errors,

            "disclaimer":
                "These results are estimated predictions "
                "based on the available health parameters "
                "and are not a medical diagnosis."

        }), 200


    # ----------------------------------------
    # Missing field
    # ----------------------------------------

    except KeyError as e:

        db.session.rollback()

        return jsonify({

            "error":
                f"Missing field: {str(e)}"

        }), 400


    # ----------------------------------------
    # Invalid value / file type
    # ----------------------------------------

    except ValueError as e:

        db.session.rollback()

        return jsonify({

            "error":
                str(e)

        }), 400


    # ----------------------------------------
    # General error
    # ----------------------------------------

    except Exception as e:

        db.session.rollback()

        return jsonify({

            "error":
                str(e)

        }), 500