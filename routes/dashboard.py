from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models.prediction import Prediction


dashboard_bp = Blueprint(
    "dashboard",
    __name__
)


@dashboard_bp.route("/api/dashboard-stats", methods=["GET"])
@jwt_required()
def dashboard_stats():

    try:

        # Get the logged-in user's ID from JWT
        user_id = int(get_jwt_identity())

        # Get only predictions belonging to the logged-in user
        predictions = (
            Prediction.query
            .filter_by(user_id=user_id)
            .order_by(Prediction.created_at.desc())
            .all()
        )

        prediction_data = []

        for item in predictions:

            prediction_data.append({

                "id": item.id,

                "user_id": item.user_id,

                "disease": item.disease,

                "prediction": item.prediction,

                "probability": item.probability,

                "risk_level": item.risk_level,

                "created_at": (
                    item.created_at.isoformat()
                    if item.created_at
                    else None
                )

            })

        return jsonify({

            "total_predictions": len(predictions),


            "predictions": prediction_data

        }), 200

    except Exception as e:

        return jsonify({

            "error": str(e)

        }), 500