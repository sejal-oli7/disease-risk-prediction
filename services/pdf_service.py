# services/pdf_service.py

import io
import re

import pymupdf
import pytesseract
from PIL import Image, ImageOps, ImageEnhance, ImageFilter


# ============================================================
# TEXT EXTRACTION
# ============================================================

def extract_pdf_text(pdf_path):
    """
    Extract text from a PDF file using PyMuPDF.
    """
    text_parts = []

    with pymupdf.open(pdf_path) as doc:
        for page in doc:
            text_parts.append(page.get_text())

    return "\n".join(text_parts)


def extract_image_text(file_bytes):
    """
    Extract text from JPG/JPEG/PNG images using Tesseract OCR.
    Basic preprocessing is applied to improve OCR quality.
    """

    image = Image.open(io.BytesIO(file_bytes))

    # Convert to grayscale
    image = ImageOps.grayscale(image)

    # Increase size for better OCR
    image = image.resize(
        (image.width * 2, image.height * 2)
    )

    # Improve contrast
    image = ImageEnhance.Contrast(image).enhance(1.5)

    # Sharpen text
    image = image.filter(ImageFilter.SHARPEN)

    # OCR
    text = pytesseract.image_to_string(
        image,
        lang="eng",
        config="--psm 6"
    )

    return text


def extract_text_from_file(file_bytes, filename):
    """
    Extract text from PDF or image file.
    """

    filename = filename.lower()

    if filename.endswith(".pdf"):
        with pymupdf.open(
            stream=file_bytes,
            filetype="pdf"
        ) as doc:

            text_parts = []

            for page in doc:
                text_parts.append(page.get_text())

            return "\n".join(text_parts)

    elif filename.endswith(
        (".jpg", ".jpeg", ".png")
    ):
        return extract_image_text(file_bytes)

    raise ValueError(
        "Unsupported file type. Please upload PDF, JPG, JPEG or PNG."
    )


# ============================================================
# BASIC EXTRACTION HELPERS
# ============================================================

def _extract_number(text, patterns):
    """
    Try multiple regex patterns and return the first numeric value.
    """

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:

            try:
                return float(
                    match.group(1)
                    .replace(",", "")
                )

            except (ValueError, AttributeError):
                continue

    return None


def _extract_text_value(text, patterns):
    """
    Try multiple regex patterns and return text value.
    """

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:

            return match.group(1).strip()

    return None


# ============================================================
# MAIN VALUE EXTRACTION
# ============================================================

def extract_values_from_text(text):

    values = {}

    if not text:
        return values

    # Normalize common OCR characters
    text = text.replace("\r", "\n")

    # ========================================================
    # AGE + GENDER
    # ========================================================

    # IMPORTANT:
    # First search for formats such as:
    #
    # Age/Gender - 8Y/M
    # Age/Gender: 8Y/M
    # Agefsender - 8Y/m
    #
    # This must happen BEFORE generic Age extraction.
    # Otherwise "age 2 of 2" from the footer can be detected.

    age_gender_match = re.search(
        r"(?:Age\s*/?\s*Gender|Agef?sender|Age\s*Gender)"
        r"\s*[-:]*\s*"
        r"(\d{1,3})\s*[Yy]\s*/\s*([MmFf])",
        text,
        re.IGNORECASE
    )

    if age_gender_match:

        values["Age"] = float(
            age_gender_match.group(1)
        )

        gender_code = (
            age_gender_match.group(2)
            .upper()
        )

        if gender_code == "M":
            values["Gender"] = "Male"

        elif gender_code == "F":
            values["Gender"] = "Female"

    # --------------------------------------------------------
    # Normal Gender extraction
    # --------------------------------------------------------

    if "Gender" not in values:

        gender = _extract_text_value(
            text,
            [
                r"\bGender\s*[:\-]?\s*(Male|Female|M|F)\b",
                r"\bSex\s*[:\-]?\s*(Male|Female|M|F)\b"
            ]
        )

        if gender:

            gender_lower = gender.lower()

            if gender_lower == "m":
                values["Gender"] = "Male"

            elif gender_lower == "f":
                values["Gender"] = "Female"

            else:
                values["Gender"] = gender.capitalize()

    # --------------------------------------------------------
    # Normal Age extraction
    # --------------------------------------------------------

    if "Age" not in values:

        age_match = re.search(
            r"\bAge\s*[-:]?\s*(\d{1,3})"
            r"(?!\s*(?:of|/)\s*\d+)",
            text,
            re.IGNORECASE
        )

        if age_match:

            values["Age"] = float(
                age_match.group(1)
            )

    # ========================================================
    # DIABETES
    # ========================================================

    diabetes_patterns = {

        "Pregnancies": [
            r"\bPregnancies\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Glucose": [
            r"\bGlucose\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "BloodPressure": [
            r"\bBlood\s*Pressure\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bBP\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "SkinThickness": [
            r"\bSkin\s*Thickness\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Insulin": [
            r"\bInsulin\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "BMI": [
            r"\bBMI\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bBody\s*Mass\s*Index\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "DiabetesPedigreeFunction": [
            r"\bDiabetes\s*Pedigree\s*Function\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bDPF\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ]
    }

    for field, patterns in diabetes_patterns.items():

        value = _extract_number(
            text,
            patterns
        )

        if value is not None:
            values[field] = value

    # ========================================================
    # LIVER DISEASE
    # ========================================================

    liver_patterns = {

        "Total_Bilirubin": [
            r"Bilirubin\s*\(\s*Tota[lI]\s*\)\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"Total\s*Bilirubin\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"Bii?l?i?rubin\s*\(\s*Tota[lI]\s*\)\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Direct_Bilirubin": [
            r"Bilirubin\s*\(\s*Direct\s*\)\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"Bililrubin\s*\(\s*Direct\s*\)\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"Direct\s*Bilirubin\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Alkphos": [
            r"\bAlkphos\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bALP\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"Alkaline\s*Phosphatase\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Sgpt": [
            r"\bSGPT\s*\(\s*ALT\s*\)\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bSGPT\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bALT\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Sgot": [
            r"\bSGOT\s*\(\s*AST\s*\)\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bSGOT\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bAST\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Total_Proteins": [
            r"\bTotal\s*Proteins?\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bTotal\s*Protein\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Albumin": [
            r"\bAlbumin\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "AG_Ratio": [
            r"\bA\s*/\s*G\s*Ratio\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bA/G\s*Ratio\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ]
    }

    for field, patterns in liver_patterns.items():

        value = _extract_number(
            text,
            patterns
        )

        if value is not None:
            values[field] = value

    # ========================================================
    # HEART DISEASE
    # ========================================================

    heart_numeric_patterns = {

        "Weight": [
            r"\bWeight\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Height": [
            r"\bHeight\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "BMI": [
            r"\bBMI\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Systolic_BP": [
            r"\bSystolic\s*(?:BP|Blood\s*Pressure)?\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bSBP\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Diastolic_BP": [
            r"\bDiastolic\s*(?:BP|Blood\s*Pressure)?\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bDBP\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Heart_Rate": [
            r"\bHeart\s*Rate\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bPulse\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Blood_Sugar_Fasting": [
            r"\bBlood\s*Sugar\s*(?:Fasting)?\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bFasting\s*Blood\s*Sugar\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Cholesterol_Total": [
            r"\bCholesterol\s*(?:Total)?\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bTotal\s*Cholesterol\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ]
    }

    for field, patterns in heart_numeric_patterns.items():

        value = _extract_number(
            text,
            patterns
        )

        if value is not None:
            values[field] = value

    # --------------------------------------------------------
    # Blood Pressure combined format
    # Example: BP 120/80
    # --------------------------------------------------------

    if (
        "Systolic_BP" not in values
        or "Diastolic_BP" not in values
    ):

        bp_match = re.search(
            r"\b(?:BP|Blood\s*Pressure)"
            r"\s*[:\-]?\s*"
            r"(\d{2,3})\s*/\s*(\d{2,3})",
            text,
            re.IGNORECASE
        )

        if bp_match:

            if "Systolic_BP" not in values:
                values["Systolic_BP"] = float(
                    bp_match.group(1)
                )

            if "Diastolic_BP" not in values:
                values["Diastolic_BP"] = float(
                    bp_match.group(2)
                )

    # ========================================================
    # KIDNEY DISEASE
    # ========================================================

    kidney_patterns = {

        "age": [
            r"\bAge\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "bp": [
            r"\bBP\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bBlood\s*Pressure\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "sg": [
            r"\bSG\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bSpecific\s*Gravity\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "al": [
            r"\bAL\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "su": [
            r"\bSU\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "bgr": [
            r"\bBGR\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bBlood\s*Glucose\s*Random\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "bu": [
            r"\bBU\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bBlood\s*Urea\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "sc": [
            r"\bSC\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bSerum\s*Creatinine\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "sod": [
            r"\bSOD\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bSodium\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "pot": [
            r"\bPOT\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bPotassium\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "hemo": [
            r"\bHEMO\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bHemoglobin\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "pcv": [
            r"\bPCV\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "wc": [
            r"\bWC\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bWhite\s*Blood\s*Cell\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "rc": [
            r"\bRC\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bRed\s*Blood\s*Cell\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ]
    }

    for field, patterns in kidney_patterns.items():

        value = _extract_number(
            text,
            patterns
        )

        if value is not None:

            # Do not overwrite canonical Age
            if field == "age":

                if "Age" not in values:
                    values["Age"] = value

            else:
                values[field] = value

    # ========================================================
    # KIDNEY TEXT / BINARY FIELDS
    # ========================================================

    kidney_text_fields = [

        "rbc",
        "pc",
        "pcc",
        "ba",
        "htn",
        "dm",
        "cad",
        "appet",
        "pe",
        "ane"
    ]

    kidney_text_patterns = {

        "rbc": [
            r"\bRBC\s*[:\-]?\s*(normal|abnormal)"
        ],

        "pc": [
            r"\bPC\s*[:\-]?\s*(normal|abnormal)"
        ],

        "pcc": [
            r"\bPCC\s*[:\-]?\s*(present|notpresent|not\s*present)"
        ],

        "ba": [
            r"\bBA\s*[:\-]?\s*(present|notpresent|not\s*present)"
        ],

        "htn": [
            r"\bHTN\s*[:\-]?\s*(yes|no)"
        ],

        "dm": [
            r"\bDM\s*[:\-]?\s*(yes|no)"
        ],

        "cad": [
            r"\bCAD\s*[:\-]?\s*(yes|no)"
        ],

        "appet": [
            r"\bAPPET\s*[:\-]?\s*(good|poor)"
        ],

        "pe": [
            r"\bPE\s*[:\-]?\s*(yes|no)"
        ],

        "ane": [
            r"\bANE\s*[:\-]?\s*(yes|no)"
        ]
    }

    for field in kidney_text_fields:

        patterns = kidney_text_patterns.get(
            field,
            []
        )

        value = _extract_text_value(
            text,
            patterns
        )

        if value is not None:
            values[field] = value

    # ========================================================
    # PARKINSON'S DISEASE
    # ========================================================

    parkinsons_patterns = {

        "MDVP:Fo(Hz)": [
            r"MDVP\s*:\s*Fo\s*\(\s*Hz\s*\)\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "MDVP:Fhi(Hz)": [
            r"MDVP\s*:\s*Fhi\s*\(\s*Hz\s*\)\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "MDVP:Flo(Hz)": [
            r"MDVP\s*:\s*Flo\s*\(\s*Hz\s*\)\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "MDVP:Jitter(%)": [
            r"MDVP\s*:\s*Jitter\s*\(\s*%\s*\)\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "MDVP:Jitter(Abs)": [
            r"MDVP\s*:\s*Jitter\s*\(\s*Abs\s*\)\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "MDVP:RAP": [
            r"MDVP\s*:\s*RAP\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "MDVP:PPQ": [
            r"MDVP\s*:\s*PPQ\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Jitter:DDP": [
            r"Jitter\s*:\s*DDP\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "MDVP:Shimmer": [
            r"MDVP\s*:\s*Shimmer\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "MDVP:Shimmer(dB)": [
            r"MDVP\s*:\s*Shimmer\s*\(\s*dB\s*\)\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Shimmer:APQ3": [
            r"Shimmer\s*:\s*APQ3\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Shimmer:APQ5": [
            r"Shimmer\s*:\s*APQ5\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "MDVP:APQ": [
            r"MDVP\s*:\s*APQ\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "Shimmer:DDA": [
            r"Shimmer\s*:\s*DDA\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "NHR": [
            r"\bNHR\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "HNR": [
            r"\bHNR\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "RPDE": [
            r"\bRPDE\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "DFA": [
            r"\bDFA\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "spread1": [
            r"\bspread1\s*[:\-]?\s*(-?\d+(?:\.\d+)?)"
        ],

        "spread2": [
            r"\bspread2\s*[:\-]?\s*(-?\d+(?:\.\d+)?)"
        ],

        "D2": [
            r"\bD2\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "PPE": [
            r"\bPPE\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ]
    }

    for field, patterns in parkinsons_patterns.items():

        value = _extract_number(
            text,
            patterns
        )

        if value is not None:
            values[field] = value

    # ========================================================
    # STROKE DISEASE
    # ========================================================

    stroke_patterns = {

        "avg_glucose_level": [
            r"\bAverage\s*Glucose\s*Level\s*[:\-]?\s*(\d+(?:\.\d+)?)",
            r"\bAvg\s*Glucose\s*Level\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ],

        "bmi": [
            r"\bBMI\s*[:\-]?\s*(\d+(?:\.\d+)?)"
        ]
    }

    for field, patterns in stroke_patterns.items():

        value = _extract_number(
            text,
            patterns
        )

        if value is not None:
            values[field] = value

    # --------------------------------------------------------
    # Stroke gender
    # --------------------------------------------------------

    if "Gender" in values:
        values["gender"] = values["Gender"]

    # --------------------------------------------------------
    # Stroke age
    # --------------------------------------------------------

    if "Age" in values:
        values["age"] = values["Age"]

    # --------------------------------------------------------
    # Stroke categorical fields
    # --------------------------------------------------------

    stroke_text_patterns = {

        "hypertension": [
            r"\bHypertension\s*[:\-]?\s*(yes|no|0|1)"
        ],

        "heart_disease": [
            r"\bHeart\s*Disease\s*[:\-]?\s*(yes|no|0|1)"
        ],

        "ever_married": [
            r"\bEver\s*Married\s*[:\-]?\s*(Yes|No)"
        ],

        "work_type": [
            r"\bWork\s*Type\s*[:\-]?\s*"
            r"(Private|Self-employed|Govt_job|children|Never_worked)"
        ],

        "Residence_type": [
            r"\bResidence\s*Type\s*[:\-]?\s*"
            r"(Urban|Rural)"
        ],

        "smoking_status": [
            r"\bSmoking\s*Status\s*[:\-]?\s*"
            r"(formerly smoked|never smoked|smokes|Unknown)"
        ]
    }

    for field, patterns in stroke_text_patterns.items():

        value = _extract_text_value(
            text,
            patterns
        )

        if value is not None:

            if field in (
                "hypertension",
                "heart_disease"
            ):

                if str(value).lower() in (
                    "yes",
                    "1"
                ):
                    values[field] = 1

                else:
                    values[field] = 0

            else:
                values[field] = value

    # ========================================================
    # RETURN
    # ========================================================

    return values


# ============================================================
# REQUIRED FIELDS
# ============================================================

DISEASE_REQUIREMENTS = {

    "diabetes": [
        "Pregnancies",
        "Glucose",
        "BloodPressure",
        "SkinThickness",
        "Insulin",
        "BMI",
        "DiabetesPedigreeFunction",
        "Age"
    ],

    "liver": [
        "Age",
        "Gender",
        "Total_Bilirubin",
        "Direct_Bilirubin",
        "Alkphos",
        "Sgpt",
        "Sgot",
        "Total_Proteins",
        "Albumin",
        "AG_Ratio"
    ],

    "heart": [
        "Age",
        "Gender",
        "Weight",
        "Height",
        "BMI",
        "Smoking",
        "Alcohol_Intake",
        "Physical_Activity",
        "Diet",
        "Stress_Level",
        "Hypertension",
        "Diabetes",
        "Hyperlipidemia",
        "Family_History",
        "Previous_Heart_Attack",
        "Systolic_BP",
        "Diastolic_BP",
        "Heart_Rate",
        "Blood_Sugar_Fasting",
        "Cholesterol_Total"
    ],

    "kidney": [
        "age",
        "bp",
        "sg",
        "al",
        "su",
        "rbc",
        "pc",
        "pcc",
        "ba",
        "bgr",
        "bu",
        "sc",
        "sod",
        "pot",
        "hemo",
        "pcv",
        "wc",
        "rc",
        "htn",
        "dm",
        "cad",
        "appet",
        "pe",
        "ane"
    ],

    "parkinsons": [
        "MDVP:Fo(Hz)",
        "MDVP:Fhi(Hz)",
        "MDVP:Flo(Hz)",
        "MDVP:Jitter(%)",
        "MDVP:Jitter(Abs)",
        "MDVP:RAP",
        "MDVP:PPQ",
        "Jitter:DDP",
        "MDVP:Shimmer",
        "MDVP:Shimmer(dB)",
        "Shimmer:APQ3",
        "Shimmer:APQ5",
        "MDVP:APQ",
        "Shimmer:DDA",
        "NHR",
        "HNR",
        "RPDE",
        "DFA",
        "spread1",
        "spread2",
        "D2",
        "PPE"
    ],

    "stroke": [
        "gender",
        "age",
        "hypertension",
        "heart_disease",
        "ever_married",
        "work_type",
        "Residence_type",
        "avg_glucose_level",
        "bmi",
        "smoking_status"
    ]
}


# ============================================================
# CHECK REQUIRED FIELDS
# ============================================================

def check_required_fields(disease, values):

    disease = disease.lower().strip()

    aliases = {

        "heart_disease": "heart",
        "heart disease": "heart",

        "kidney_disease": "kidney",
        "kidney disease": "kidney",

        "liver_disease": "liver",
        "liver disease": "liver",

        "parkinson": "parkinsons",
        "parkinson's": "parkinsons",
        "parkinsons disease": "parkinsons",

        "stroke_disease": "stroke"
    }

    disease = aliases.get(
        disease,
        disease
    )

    required = DISEASE_REQUIREMENTS.get(
        disease,
        []
    )

    if not required:

        return {
            "complete": False,
            "missing_fields": [],
            "message": "Unknown disease."
        }

    # --------------------------------------------------------
    # Create normalized copy.
    # This avoids creating duplicate display values.
    # --------------------------------------------------------

    normalized = dict(values)

    # Age aliases
    if (
        "Age" in normalized
        and "age" not in normalized
    ):
        normalized["age"] = normalized["Age"]

    elif (
        "age" in normalized
        and "Age" not in normalized
    ):
        normalized["Age"] = normalized["age"]

    # Gender aliases
    if (
        "Gender" in normalized
        and "gender" not in normalized
    ):
        normalized["gender"] = normalized["Gender"]

    elif (
        "gender" in normalized
        and "Gender" not in normalized
    ):
        normalized["Gender"] = normalized["gender"]

    # BMI aliases
    if (
        "BMI" in normalized
        and "bmi" not in normalized
    ):
        normalized["bmi"] = normalized["BMI"]

    elif (
        "bmi" in normalized
        and "BMI" not in normalized
    ):
        normalized["BMI"] = normalized["bmi"]

    # --------------------------------------------------------
    # Find missing fields
    # --------------------------------------------------------

    missing_fields = []

    for field in required:

        if field not in normalized:

            missing_fields.append(field)

            continue

        value = normalized[field]

        if value is None:
            missing_fields.append(field)

            continue

        if isinstance(value, str):

            if not value.strip():
                missing_fields.append(field)

    # --------------------------------------------------------
    # Result
    # --------------------------------------------------------

    if missing_fields:

        return {
            "complete": False,
            "missing_fields": missing_fields,
            "message": (
                f"{disease.title()} data is incomplete."
            )
        }

    return {
        "complete": True,
        "missing_fields": [],
        "message": (
            f"{disease.title()} data is complete."
        )
    }


# ============================================================
# CHECK ALL DISEASES
# ============================================================

def check_all_diseases(values):

    results = {}

    for disease in DISEASE_REQUIREMENTS:

        results[disease] = check_required_fields(
            disease,
            values
        )

    ready = []
    insufficient_data = []

    for disease, result in results.items():

        if result["complete"]:
            ready.append(disease)

        else:
            insufficient_data.append({
                "disease": disease,
                "missing_fields": result["missing_fields"]
            })

    return {
        "results": results,
        "ready_for_prediction": ready,
        "insufficient_data": insufficient_data
    }