from functools import wraps

from flask import Blueprint, jsonify

from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models.user import User
from models.prediction import Prediction


admin_bp = Blueprint(
    "admin",
    __name__,
    url_prefix="/api/admin"
)


# ========================================
# ADMIN AUTHORIZATION
# ========================================

def admin_required(fn):

    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):

        user_id = int(get_jwt_identity())

        user = User.query.get(user_id)

        if not user:

            return jsonify({
                "error": "User not found"
            }), 404

        if user.role != "admin":

            return jsonify({
                "error": "Admin access required"
            }), 403

        return fn(*args, **kwargs)

    return wrapper


# ========================================
# ADMIN DASHBOARD
# ========================================

@admin_bp.route("/dashboard", methods=["GET"])
@admin_required
def admin_dashboard():

    total_users = User.query.count()

    total_predictions = Prediction.query.count()

    high_risk = Prediction.query.filter_by(
        risk_level="High"
    ).count()

    medium_risk = Prediction.query.filter_by(
        risk_level="Medium"
    ).count()

    low_risk = Prediction.query.filter_by(
        risk_level="Low"
    ).count()

    recent_predictions = (
        Prediction.query
        .order_by(Prediction.created_at.desc())
        .limit(10)
        .all()
    )

    predictions = []

    for item in recent_predictions:

        user = User.query.get(item.user_id)

        predictions.append({

            "id": item.id,

            "user_id": item.user_id,

            "user_name": (
                user.name
                if user
                else None
            ),

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

        "message":
            "Admin dashboard data retrieved successfully",

        "statistics": {

            "total_users":
                total_users,

            "total_predictions":
                total_predictions,

            "high_risk":
                high_risk,

            "medium_risk":
                medium_risk,

            "low_risk":
                low_risk

        },

        "recent_predictions":
            predictions

    }), 200


# ========================================
# GET USERS
# ========================================

@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_users():

    users = (
        User.query
        .order_by(User.id.desc())
        .all()
    )

    return jsonify({

        "users": [

            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }

            for user in users

        ]

    }), 200


# ========================================
# GET ALL PREDICTIONS
# ========================================

@admin_bp.route("/predictions", methods=["GET"])
@admin_required
def get_predictions():

    predictions = (
        Prediction.query
        .order_by(Prediction.id.desc())
        .all()
    )

    prediction_list = []

    for prediction in predictions:

        user = User.query.get(
            prediction.user_id
        )

        prediction_list.append({

            "id": prediction.id,

            "user_id":
                prediction.user_id,

            "user_name": (
                user.name
                if user
                else None
            ),

            "disease":
                prediction.disease,

            "prediction":
                prediction.prediction,

            "probability":
                prediction.probability,

            "risk_level":
                prediction.risk_level,

            "created_at": (
                prediction.created_at.isoformat()
                if prediction.created_at
                else None
            )

        })

    return jsonify({

        "predictions":
            prediction_list

    }), 200


# ========================================
# DELETE PREDICTION
# ========================================

@admin_bp.route(
    "/predictions/<int:prediction_id>",
    methods=["DELETE"]
)
@admin_required
def delete_prediction(prediction_id):

    prediction = Prediction.query.get(
        prediction_id
    )

    if not prediction:

        return jsonify({
            "error": "Prediction not found"
        }), 404

    db.session.delete(
        prediction
    )

    db.session.commit()

    return jsonify({

        "message":
            "Prediction deleted successfully"

    }), 200


# ========================================
# DELETE USER
# ========================================

@admin_bp.route(
    "/users/<int:user_id>",
    methods=["DELETE"]
)
@admin_required
def delete_user(user_id):

    current_admin_id = int(
        get_jwt_identity()
    )

    # Prevent admin from deleting their own account.
    if user_id == current_admin_id:

        return jsonify({

            "error":
                "You cannot delete your own admin account."

        }), 400

    user = User.query.get(
        user_id
    )

    if not user:

        return jsonify({
            "error": "User not found"
        }), 404

    # Delete predictions belonging to the user first.
    Prediction.query.filter_by(
        user_id=user_id
    ).delete(
        synchronize_session=False
    )

    db.session.delete(
        user
    )

    db.session.commit()

    return jsonify({

        "message":
            "User and related predictions deleted successfully"

    }), 200
