import os
import joblib
import pandas as pd


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "ml_models")


def load_model(disease):
    model_path = os.path.join(MODEL_DIR, disease, "model.pkl")

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model not found: {model_path}"
        )

    return joblib.load(model_path)


def predict_diabetes(data):
    model = load_model("diabetes")

    scaler_path = os.path.join(
        MODEL_DIR,
        "diabetes",
        "scaler.pkl"
    )

    scaler = joblib.load(scaler_path)

    feature_cols = [
        "Pregnancies",
        "Glucose",
        "BloodPressure",
        "SkinThickness",
        "Insulin",
        "BMI",
        "DiabetesPedigreeFunction",
        "Age"
    ]

    features = pd.DataFrame([{
        "Pregnancies": data["Pregnancies"],
        "Glucose": data["Glucose"],
        "BloodPressure": data["BloodPressure"],
        "SkinThickness": data["SkinThickness"],
        "Insulin": data["Insulin"],
        "BMI": data["BMI"],
        "DiabetesPedigreeFunction": data["DiabetesPedigreeFunction"],
        "Age": data["Age"]
    }])

    features_scaled = scaler.transform(features)

    prediction = model.predict(features_scaled)[0]
    probability = model.predict_proba(features_scaled)[0][1]

    if probability < 0.30:
        risk_level = "Low"
    elif probability < 0.70:
        risk_level = "Medium"
    else:
        risk_level = "High"

    return {
        "prediction": int(prediction),
        "probability": float(probability),
        "risk_level": risk_level
    }