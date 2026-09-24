import os
import joblib
import pandas as pd
import numpy as np


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


def predict_heart_disease(data):
    model = load_model("heart_disease")

    # Create engineered features used during model training
    pulse_pressure = data["Systolic_BP"] - data["Diastolic_BP"]

    mean_arterial_pressure = (
        data["Systolic_BP"] + 2 * data["Diastolic_BP"]
    ) / 3

    # Create BMI category
    bmi = data["BMI"]

    if bmi < 18.5:
        bmi_category = "Underweight"
    elif bmi < 25:
        bmi_category = "Normal"
    elif bmi < 30:
        bmi_category = "Overweight"
    else:
        bmi_category = "Obese"

    # Create age group
    age = data["Age"]

    if age < 40:
        age_group = "<40"
    elif age < 55:
        age_group = "40-55"
    elif age < 70:
        age_group = "55-70"
    else:
        age_group = "70+"

    # Count major risk factors
    risk_factor_count = (
        data["Hypertension"]
        + data["Diabetes"]
        + data["Hyperlipidemia"]
        + data["Family_History"]
        + data["Previous_Heart_Attack"]
    )

    # Create binary risk indicators
    high_cholesterol = (
        1 if data["Cholesterol_Total"] >= 240 else 0
    )

    high_blood_sugar = (
        1 if data["Blood_Sugar_Fasting"] >= 126 else 0
    )

    is_smoker = (
        1 if data["Smoking"] == "Current" else 0
    )

    # Prepare all features expected by the trained model
    features = pd.DataFrame([{
        "Age": data["Age"],
        "Gender": data["Gender"],
        "Weight": data["Weight"],
        "Height": data["Height"],
        "BMI": data["BMI"],
        "Smoking": data["Smoking"],
        "Alcohol_Intake": data["Alcohol_Intake"],
        "Physical_Activity": data["Physical_Activity"],
        "Diet": data["Diet"],
        "Stress_Level": data["Stress_Level"],
        "Hypertension": data["Hypertension"],
        "Diabetes": data["Diabetes"],
        "Hyperlipidemia": data["Hyperlipidemia"],
        "Family_History": data["Family_History"],
        "Previous_Heart_Attack": data["Previous_Heart_Attack"],
        "Systolic_BP": data["Systolic_BP"],
        "Diastolic_BP": data["Diastolic_BP"],
        "Heart_Rate": data["Heart_Rate"],
        "Blood_Sugar_Fasting": data["Blood_Sugar_Fasting"],
        "Cholesterol_Total": data["Cholesterol_Total"],
        "Pulse_Pressure": pulse_pressure,
        "MAP": mean_arterial_pressure,
        "BMI_Category": bmi_category,
        "Age_Group": age_group,
        "Risk_Factor_Count": risk_factor_count,
        "High_Cholesterol": high_cholesterol,
        "High_BloodSugar": high_blood_sugar,
        "Is_Smoker": is_smoker
    }])

    # Run the trained ML pipeline
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

    # Convert probability into risk level
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

def predict_kidney(data):
    model = load_model("kidney")

    # Create the original input features
    features = pd.DataFrame([{
        "age": data["age"],
        "bp": data["bp"],
        "sg": data["sg"],
        "al": data["al"],
        "su": data["su"],
        "rbc": data["rbc"],
        "pc": data["pc"],
        "pcc": data["pcc"],
        "ba": data["ba"],
        "bgr": data["bgr"],
        "bu": data["bu"],
        "sc": data["sc"],
        "sod": data["sod"],
        "pot": data["pot"],
        "hemo": data["hemo"],
        "pcv": data["pcv"],
        "wc": data["wc"],
        "rc": data["rc"],
        "htn": data["htn"],
        "dm": data["dm"],
        "cad": data["cad"],
        "appet": data["appet"],
        "pe": data["pe"],
        "ane": data["ane"]
    }])

    # Apply the same feature engineering used during model training
    features["Anemia_Flag"] = (features["hemo"] < 12).astype(int)
    features["High_BP_Flag"] = (features["bp"] >= 90).astype(int)
    features["Low_Albumin_Urine_Flag"] = (features["al"] >= 1).astype(int)
    features["Abnormal_Creatinine"] = (features["sc"] > 1.2).astype(int)

    features["Low_Hemoglobin_Severity"] = pd.cut(
        features["hemo"],
        bins=[0, 8, 11, 13, 20],
        labels=["Severe", "Moderate", "Mild", "Normal"]
    )

    features["Comorbidity_Count"] = (
        (features["htn"] == "yes").astype(int)
        + (features["dm"] == "yes").astype(int)
        + (features["cad"] == "yes").astype(int)
    )

    features["Age_Group"] = pd.cut(
        features["age"],
        bins=[0, 18, 40, 60, 100],
        labels=["Child", "Adult", "Middle-aged", "Senior"]
    )

    # Make prediction
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

    # Convert probability into risk level
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

def predict_liver(data):
    model = load_model("liver")

    features = pd.DataFrame([{
        "Age": data["Age"],
        "Gender": data["Gender"],
        "Total_Bilirubin": data["Total_Bilirubin"],
        "Direct_Bilirubin": data["Direct_Bilirubin"],
        "Alkphos": data["Alkphos"],
        "Sgpt": data["Sgpt"],
        "Sgot": data["Sgot"],
        "Total_Proteins": data["Total_Proteins"],
        "Albumin": data["Albumin"],
        "AG_Ratio": data["AG_Ratio"]
    }])

    # Feature engineering used during model training
    features["Bilirubin_Ratio"] = (
        features["Direct_Bilirubin"] /
        features["Total_Bilirubin"].replace(0, np.nan)
    )

    features["Enzyme_Ratio_SgotSgpt"] = (
        features["Sgot"] /
        features["Sgpt"].replace(0, np.nan)
    )

    features["High_Bilirubin"] = (
        features["Total_Bilirubin"] > 1.2
    ).astype(int)

    features["High_Alkphos"] = (
        features["Alkphos"] > 147
    ).astype(int)

    features["Low_Albumin"] = (
        features["Albumin"] < 3.5
    ).astype(int)

    features["Age_Group"] = pd.cut(
        features["Age"],
        bins=[0, 30, 45, 60, 100],
        labels=["<30", "30-45", "45-60", "60+"]
    )

    # Make prediction
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

    # Convert probability into risk level
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

def predict_breast_cancer(data):
    model = load_model("breast_cancer")

    features = pd.DataFrame([{
        "Age": data["Age"],
        "Race": data["Race"],
        "Marital Status": data["Marital Status"],
        "T Stage": data["T Stage"],
        "N Stage": data["N Stage"],
        "6th Stage": data["6th Stage"],
        "differentiate": data["differentiate"],
        "Grade": data["Grade"],
        "A Stage": data["A Stage"],
        "Tumor Size": data["Tumor Size"],
        "Estrogen Status": data["Estrogen Status"],
        "Progesterone Status": data["Progesterone Status"],
        "Regional Node Examined": data["Regional Node Examined"],
        "Reginol Node Positive": data["Reginol Node Positive"]
    }])

    # Feature engineering used during training
    features["Node_Positive_Ratio"] = (
        features["Reginol Node Positive"] /
        features["Regional Node Examined"]
    )

    features["Age_Group"] = pd.cut(
        features["Age"],
        bins=[0, 40, 50, 60, 70, 120],
        labels=["<40", "40-50", "50-60", "60-70", "70+"]
    )

    features["Tumor_Size_Category"] = pd.cut(
        features["Tumor Size"],
        bins=[0, 20, 50, 999],
        labels=["Small(<=20mm)", "Medium(21-50mm)", "Large(>50mm)"]
    )

    features["Hormone_Receptor_Positive_Count"] = (
        (features["Estrogen Status"] == "Positive").astype(int)
        + (features["Progesterone Status"] == "Positive").astype(int)
    )

    features["Both_Hormones_Positive"] = (
        features["Hormone_Receptor_Positive_Count"] == 2
    ).astype(int)

    features["High_Grade"] = (
        features["Grade"].isin(["3", "4"])
    ).astype(int)

    features["Advanced_Stage"] = (
        features["6th Stage"].isin(["IIIA", "IIIB", "IIIC"])
    ).astype(int)

    # Make prediction
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

    # Convert probability into risk level
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


def predict_parkinsons(data):
    model = load_model("parkinsons")

    features = pd.DataFrame([{
        "MDVP:Fo(Hz)": data["MDVP:Fo(Hz)"],
        "MDVP:Fhi(Hz)": data["MDVP:Fhi(Hz)"],
        "MDVP:Flo(Hz)": data["MDVP:Flo(Hz)"],
        "MDVP:Jitter(%)": data["MDVP:Jitter(%)"],
        "MDVP:Jitter(Abs)": data["MDVP:Jitter(Abs)"],
        "MDVP:RAP": data["MDVP:RAP"],
        "MDVP:PPQ": data["MDVP:PPQ"],
        "Jitter:DDP": data["Jitter:DDP"],
        "MDVP:Shimmer": data["MDVP:Shimmer"],
        "MDVP:Shimmer(dB)": data["MDVP:Shimmer(dB)"],
        "Shimmer:APQ3": data["Shimmer:APQ3"],
        "Shimmer:APQ5": data["Shimmer:APQ5"],
        "MDVP:APQ": data["MDVP:APQ"],
        "Shimmer:DDA": data["Shimmer:DDA"],
        "NHR": data["NHR"],
        "HNR": data["HNR"],
        "RPDE": data["RPDE"],
        "DFA": data["DFA"],
        "spread1": data["spread1"],
        "spread2": data["spread2"],
        "D2": data["D2"],
        "PPE": data["PPE"]
    }])

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

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

def predict_stroke(data):
    model = load_model("stroke")
    encoders = joblib.load("ml_models/stroke/encoders.pkl")

    features = pd.DataFrame([{
        "gender": encoders["gender"].transform([data["gender"]])[0],
        "age": data["age"],
        "hypertension": data["hypertension"],
        "heart_disease": data["heart_disease"],
        "ever_married": encoders["ever_married"].transform(
            [data["ever_married"]]
        )[0],
        "work_type": encoders["work_type"].transform(
            [data["work_type"]]
        )[0],
        "Residence_type": encoders["Residence_type"].transform(
            [data["Residence_type"]]
        )[0],
        "avg_glucose_level": data["avg_glucose_level"],
        "bmi": data["bmi"],
        "smoking_status": encoders["smoking_status"].transform(
            [data["smoking_status"]]
        )[0]
    }])

    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]

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