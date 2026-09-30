
/* ========================================
   GLOBAL HELPERS
======================================== */

function getToken() {
    return localStorage.getItem("access_token");
}


function saveToken(token) {
    localStorage.setItem("access_token", token);
}


function removeToken() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_role");
}


/* ========================================
   SAFE JSON RESPONSE
======================================== */

async function parseResponse(response) {

    const text = await response.text();

    console.log("Response status:", response.status);
    console.log("Response body:", text);

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch (error) {

        console.error(
            "Invalid JSON response:",
            text
        );

        return {
            _invalidJson: true,
            _rawResponse: text
        };
    }
}


/* ========================================
   API REQUEST
======================================== */

async function apiRequest(url, options = {}) {

    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers["Authorization"] =
            `Bearer ${token}`;
    }

    return fetch(
        url,
        {
            ...options,
            headers
        }
    );
}


/* ========================================
   REGISTER
======================================== */

function initializeRegister() {

    const registerForm =
        document.getElementById(
            "registerForm"
        );

    if (!registerForm) {
        return;
    }

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const nameElement =
                document.getElementById("name");

            const emailElement =
                document.getElementById("email");

            const passwordElement =
                document.getElementById("password");

            const name =
                nameElement
                    ? nameElement.value.trim()
                    : "";

            const email =
                emailElement
                    ? emailElement.value.trim()
                    : "";

            const password =
                passwordElement
                    ? passwordElement.value
                    : "";

            if (
                !name ||
                !email ||
                !password
            ) {

                alert(
                    "Please fill in all required fields."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        "/api/auth/register",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    name: name,
                                    email: email,
                                    password: password
                                })
                        }
                    );

                const data =
                    await parseResponse(
                        response
                    );

                if (data._invalidJson) {

                    alert(
                        "Server returned an invalid response. Check Flask terminal."
                    );

                    return;
                }

                if (!response.ok) {

                    alert(
                        data.message ||
                        data.error ||
                        "Registration failed."
                    );

                    return;
                }

                alert(
                    data.message ||
                    "Registration successful."
                );

                window.location.href =
                    "/auth";

            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );

                alert(
                    "Unable to connect to the server."
                );
            }
        }
    );
}


/* ========================================
   LOGIN
======================================== */

function initializeLogin() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );

    if (!loginForm) {
        return;
    }

    console.log(
        "Login form initialized."
    );

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();
            event.stopPropagation();

            const emailElement =
                document.getElementById(
                    "email"
                );

            const passwordElement =
                document.getElementById(
                    "password"
                );

            const email =
                emailElement
                    ? emailElement.value.trim()
                    : "";

            const password =
                passwordElement
                    ? passwordElement.value
                    : "";

            if (!email || !password) {

                alert(
                    "Please enter your email and password."
                );

                return;
            }

            try {

                console.log(
                    "Sending login request..."
                );

                const response =
                    await fetch(
                        "/api/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email: email,
                                    password: password
                                })
                        }
                    );

                const data =
                    await parseResponse(
                        response
                    );

                console.log(
                    "Login response:",
                    data
                );

                if (data._invalidJson) {

                    alert(
                        "Server returned an invalid response. Check Flask terminal."
                    );

                    return;
                }

                if (!response.ok) {

                    alert(
                        data.message ||
                        data.error ||
                        data.msg ||
                        "Login failed."
                    );

                    return;
                }

                const token =
                    data.access_token ||
                    data.token;

                if (!token) {

                    console.error(
                        "No access token returned:",
                        data
                    );

                    alert(
                        "Login successful, but no access token was returned."
                    );

                    return;
                }

                saveToken(token);

                const userRole =
                    data.user?.role ||
                    "user";

                const userData = {

                    id:
                        data.user?.id,

                    name:
                        data.user?.name ||
                        email.split("@")[0],

                    email:
                        data.user?.email ||
                        email,

                    role:
                        userRole
                };

                localStorage.setItem(
                    "user",
                    JSON.stringify(userData)
                );

                localStorage.setItem(
                    "user_role",
                    userRole
                );

                console.log(
                    "JWT token saved successfully."
                );

                console.log(
                    "Logged in user:",
                    userData
                );

                console.log(
                    "Logged in user role:",
                    userRole
                );

                if (
                    userRole === "admin"
                ) {

                    window.location.href =
                        "/admin";

                } else {

                    window.location.href =
                        "/dashboard";
                }

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                alert(
                    "Unable to connect to the server."
                );
            }
        }
    );
}


/* ========================================
   LOGOUT
======================================== */

function initializeLogout() {

    const logoutLinks =
        document.querySelectorAll(
            '[href*="logout"]'
        );

    logoutLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    removeToken();

                }
            );

        }
    );
}


/* ========================================
   DISEASE FIELD DEFINITIONS
======================================== */

const diseaseFields = {

    /* ====================================
       DIABETES
    ==================================== */

    diabetes: [

        {
            name: "Pregnancies",
            label: "Pregnancies",
            type: "number",
            placeholder:
                "Enter pregnancies"
        },

        {
            name: "Glucose",
            label: "Glucose",
            type: "number",
            placeholder:
                "Enter glucose level"
        },

        {
            name: "BloodPressure",
            label: "Blood Pressure",
            type: "number",
            placeholder:
                "Enter blood pressure"
        },

        {
            name: "SkinThickness",
            label: "Skin Thickness",
            type: "number",
            placeholder:
                "Enter skin thickness"
        },

        {
            name: "Insulin",
            label: "Insulin",
            type: "number",
            placeholder:
                "Enter insulin level"
        },

        {
            name: "BMI",
            label: "BMI",
            type: "number",
            step: "any",
            placeholder:
                "Enter BMI"
        },

        {
            name:
                "DiabetesPedigreeFunction",

            label:
                "Diabetes Pedigree Function",

            type: "number",

            step: "any",

            placeholder:
                "Enter pedigree value"
        },

        {
            name: "Age",
            label: "Age",
            type: "number",
            placeholder:
                "Enter age"
        }

    ],


    /* ====================================
       HEART DISEASE
    ==================================== */

    heart: [

        {
            name: "Age",
            label: "Age",
            type: "number",
            placeholder: "Enter age"
        },

        {
            name: "Gender",
            label: "Gender",
            type: "select",
            options: [
                "Male",
                "Female"
            ]
        },

        {
            name: "Weight",
            label: "Weight (kg)",
            type: "number",
            step: "0.1",
            placeholder: "Enter weight"
        },

        {
            name: "Height",
            label: "Height (cm)",
            type: "number",
            step: "0.1",
            placeholder: "Enter height"
        },

        {
            name: "BMI",
            label: "BMI",
            type: "number",
            step: "0.1",
            placeholder: "Enter BMI"
        },

        {
            name: "Smoking",
            label: "Smoking",
            type: "select",
            options: [
                "Never",
                "Current",
                "Former"
            ]
        },

        {
            name: "Alcohol_Intake",
            label: "Alcohol Intake",
            type: "select",
            options: [
                "None",
                "Low",
                "Moderate",
                "High"
            ]
        },

        {
            name: "Physical_Activity",
            label: "Physical Activity",
            type: "select",
            options: [
                "Sedentary",
                "Moderate",
                "Active"
            ]
        },

        {
            name: "Diet",
            label: "Diet",
            type: "select",
            options: [
                "Healthy",
                "Average",
                "Unhealthy"
            ]
        },

        {
            name: "Stress_Level",
            label: "Stress Level",
            type: "select",
            options: [
                "Low",
                "Medium",
                "High"
            ]
        },

        {
            name: "Hypertension",
            label: "Hypertension",
            type: "select",
            options: [
                "Yes",
                "No"
            ],
            binary: true
        },

        {
            name: "Diabetes",
            label: "Diabetes",
            type: "select",
            options: [
                "Yes",
                "No"
            ],
            binary: true
        },

        {
            name: "Hyperlipidemia",
            label: "Hyperlipidemia",
            type: "select",
            options: [
                "Yes",
                "No"
            ],
            binary: true
        },

        {
            name: "Family_History",
            label: "Family History",
            type: "select",
            options: [
                "Yes",
                "No"
            ],
            binary: true
        },

        {
            name: "Previous_Heart_Attack",
            label: "Previous Heart Attack",
            type: "select",
            options: [
                "Yes",
                "No"
            ],
            binary: true
        },

        {
            name: "Systolic_BP",
            label: "Systolic Blood Pressure",
            type: "number",
            placeholder: "e.g. 120"
        },

        {
            name: "Diastolic_BP",
            label: "Diastolic Blood Pressure",
            type: "number",
            placeholder: "e.g. 80"
        },

        {
            name: "Heart_Rate",
            label: "Heart Rate",
            type: "number",
            placeholder: "e.g. 72"
        },

        {
            name: "Blood_Sugar_Fasting",
            label: "Fasting Blood Sugar",
            type: "number",
            step: "0.1",
            placeholder: "e.g. 90"
        },

        {
            name: "Cholesterol_Total",
            label: "Total Cholesterol",
            type: "number",
            step: "0.1",
            placeholder: "e.g. 180"
        }

    ],


    /* ====================================
       KIDNEY DISEASE
    ==================================== */

    kidney: [

        {
            name: "age",
            label: "Age",
            type: "number",
            placeholder: "Enter age"
        },

        {
            name: "gender",
            label: "Gender",
            type: "select",
            options: [
                "Male",
                "Female"
            ]
        },

        {
            name: "bp",
            label: "Blood Pressure",
            type: "number",
            placeholder: "Enter blood pressure"
        },

        {
            name: "sg",
            label: "Specific Gravity",
            type: "number",
            step: "any",
            placeholder: "Example: 1.020"
        },

        {
            name: "al",
            label: "Albumin",
            type: "number",
            placeholder: "Enter albumin"
        },

        {
            name: "su",
            label: "Sugar",
            type: "number",
            placeholder: "Enter sugar"
        },

        {
            name: "rbc",
            label: "Red Blood Cells",
            type: "select",
            options: [
                "normal",
                "abnormal"
            ]
        },

        {
            name: "pc",
            label: "Pus Cell",
            type: "select",
            options: [
                "normal",
                "abnormal"
            ]
        },

        {
            name: "pcc",
            label: "Pus Cell Clumps",
            type: "select",
            options: [
                "present",
                "notpresent"
            ]
        },

        {
            name: "ba",
            label: "Bacteria",
            type: "select",
            options: [
                "present",
                "notpresent"
            ]
        },

        {
            name: "bgr",
            label: "Blood Glucose Random",
            type: "number",
            step: "any",
            placeholder: "Enter glucose level"
        },

        {
            name: "bu",
            label: "Blood Urea",
            type: "number",
            step: "any",
            placeholder: "Enter blood urea"
        },

        {
            name: "sc",
            label: "Serum Creatinine",
            type: "number",
            step: "any",
            placeholder: "Enter serum creatinine"
        },

        {
            name: "sod",
            label: "Sodium",
            type: "number",
            step: "any",
            placeholder: "Enter sodium"
        },

        {
            name: "pot",
            label: "Potassium",
            type: "number",
            step: "any",
            placeholder: "Enter potassium"
        },

        {
            name: "hemo",
            label: "Hemoglobin",
            type: "number",
            step: "any",
            placeholder: "Enter hemoglobin"
        },

        {
            name: "pcv",
            label: "Packed Cell Volume",
            type: "number",
            step: "any",
            placeholder: "Enter PCV"
        },

        {
            name: "wc",
            label: "White Blood Cell Count",
            type: "number",
            placeholder: "Enter White Blood Cell Count"
        },

        {
            name: "rc",
            label: "Red Blood Cell Count",
            type: "number",
            step: "any",
            placeholder: "Enter Red Blood Cell Count"
        },

        {
            name: "htn",
            label: "Hypertension",
            type: "select",
            options: [
                "yes",
                "no"
            ]
        },

        {
            name: "dm",
            label: "Diabetes Mellitus",
            type: "select",
            options: [
                "yes",
                "no"
            ]
        },

        {
            name: "cad",
            label: "Coronary Artery Disease",
            type: "select",
            options: [
                "yes",
                "no"
            ]
        },

        {
            name: "appet",
            label: "Appetite",
            type: "select",
            options: [
                "good",
                "poor"
            ]
        },

        {
            name: "pe",
            label: "Pedal Edema",
            type: "select",
            options: [
                "yes",
                "no"
            ]
        },

        {
            name: "ane",
            label: "Anemia",
            type: "select",
            options: [
                "yes",
                "no"
            ]
        }

    ],


    /* ====================================
       LIVER DISEASE
    ==================================== */

    liver: [

        {
            name: "Age",
            label: "Age",
            type: "number",
            placeholder:
                "Enter age"
        },

        {
            name: "Gender",
            label: "Gender",
            type: "select",
            options: [
                "Male",
                "Female"
            ]
        },

        {
            name: "Total_Bilirubin",
            label:
                "Total Bilirubin",
            type: "number",
            step: "any",
            placeholder:
                "Enter total bilirubin"
        },

        {
            name: "Direct_Bilirubin",
            label:
                "Direct Bilirubin",
            type: "number",
            step: "any",
            placeholder:
                "Enter direct bilirubin"
        },

        {
            name: "Alkphos",
            label:
                "Alkaline Phosphotase",
            type: "number",
            placeholder:
                "Enter Alkphos"
        },

        {
            name: "Sgpt",
            label: "SGPT",
            type: "number",
            placeholder:
                "Enter SGPT"
        },

        {
            name: "Sgot",
            label: "SGOT",
            type: "number",
            placeholder:
                "Enter SGOT"
        },

        {
            name: "Total_Proteins",
            label:
                "Total Proteins",
            type: "number",
            step: "any",
            placeholder:
                "Enter total proteins"
        },

        {
            name: "Albumin",
            label: "Albumin",
            type: "number",
            step: "any",
            placeholder:
                "Enter albumin"
        },

        {
            name: "AG_Ratio",
            label:
                "Albumin / Globulin Ratio",
            type: "number",
            step: "any",
            placeholder:
                "Enter A/G ratio"
        }

    ],


    /* ====================================
       PARKINSON'S DISEASE
    ==================================== */

    parkinsons: [

        {
            name: "MDVP:Fo(Hz)",
            label:
                "MDVP:Fo (Hz)",
            type: "number",
            step: "any",
            placeholder:
                "Enter value"
        },

        {
            name: "MDVP:Fhi(Hz)",
            label:
                "MDVP:Fhi (Hz)",
            type: "number",
            step: "any",
            placeholder:
                "Enter value"
        },

        {
            name: "MDVP:Flo(Hz)",
            label:
                "MDVP:Flo (Hz)",
            type: "number",
            step: "any",
            placeholder:
                "Enter value"
        },

        {
            name: "MDVP:Jitter(%)",
            label:
                "MDVP:Jitter (%)",
            type: "number",
            step: "any",
            placeholder:
                "Enter value"
        },

        {
            name: "MDVP:Jitter(Abs)",
            label:
                "MDVP:Jitter (Abs)",
            type: "number",
            step: "any",
            placeholder:
                "Enter value"
        },

        {
            name: "MDVP:RAP",
            label:
                "MDVP:RAP",
            type: "number",
            step: "any",
            placeholder:
                "Enter value"
        },

        {
            name: "MDVP:PPQ",
            label:
                "MDVP:PPQ",
            type: "number",
            step: "any",
            placeholder:
                "Enter value"
        },

        {
            name: "Jitter:DDP",
            label:
                "Jitter:DDP",
            type: "number",
            step: "any",
            placeholder:
                "Enter value"
        },

        {
            name: "MDVP:Shimmer",
            label:
                "MDVP:Shimmer",
            type: "number",
            step: "any",
            placeholder:
                "Enter value"
        },

        {
            name: "MDVP:Shimmer(dB)",
            label:
                "MDVP:Shimmer (dB)",
            type: "number",
            step: "any",
            placeholder:
                "Enter value"
        },

        {
            name: "Shimmer:APQ3",
            label:
                "Shimmer:APQ3",
            type: "number",
            step: "any",
            placeholder:
                "Enter value"
        },

        {
            name: "Shimmer:APQ5",
            label:
                "Shimmer:APQ5",
            type: "number",
            step: "any",
            placeholder:
                "Enter value"
        },

        {
            name: "MDVP:APQ",
            label:
                "MDVP:APQ",
            type: "number",
            step: "any",
            placeholder:
                "Enter value"
        },

        {
            name: "Shimmer:DDA",
            label:
                "Shimmer:DDA",
            type: "number",
            step: "any",
            placeholder:
                "Enter value"
        },

        {
            name: "NHR",
            label:
                "NHR",
            type: "number",
            step: "any",
            placeholder:
                "Enter NHR"
        },

        {
            name: "HNR",
            label:
                "HNR",
            type: "number",
            step: "any",
            placeholder:
                "Enter HNR"
        },

        {
            name: "RPDE",
            label:
                "RPDE",
            type: "number",
            step: "any",
            placeholder:
                "Enter RPDE"
        },

        {
            name: "DFA",
            label:
                "DFA",
            type: "number",
            step: "any",
            placeholder:
                "Enter DFA"
        },

        {
            name: "spread1",
            label:
                "Spread 1",
            type: "number",
            step: "any",
            placeholder:
                "Enter spread1"
        },

        {
            name: "spread2",
            label:
                "Spread 2",
            type: "number",
            step: "any",
            placeholder:
                "Enter spread2"
        },

        {
            name: "D2",
            label:
                "D2",
            type: "number",
            step: "any",
            placeholder:
                "Enter D2"
        },

        {
            name: "PPE",
            label:
                "PPE",
            type: "number",
            step: "any",
            placeholder:
                "Enter PPE"
        }

    ],


    /* ====================================
       STROKE
    ==================================== */

    stroke: [

        {
            name: "gender",
            label: "Gender",
            type: "select",
            options: [
                "Male",
                "Female",
                "Other"
            ]
        },

        {
            name: "age",
            label: "Age",
            type: "number",
            placeholder:
                "Enter age"
        },

        {
            name: "hypertension",
            label: "Hypertension",
            type: "select",
            options: [
                "Yes",
                "No"
            ],
            binary: true
        },

        {
            name: "heart_disease",
            label: "Heart Disease",
            type: "select",
            options: [
                "Yes",
                "No"
            ],
            binary: true
        },

        {
            name: "ever_married",
            label: "Ever Married",
            type: "select",
            options: [
                "Yes",
                "No"
            ]
        },

        {
            name: "work_type",
            label: "Work Type",
            type: "select",
            options: [
                "Private",
                "Self-employed",
                "Govt_job",
                "children",
                "Never_worked"
            ]
        },

        {
            name: "Residence_type",
            label: "Residence Type",
            type: "select",
            options: [
                "Urban",
                "Rural"
            ]
        },

        {
            name: "avg_glucose_level",
            label:
                "Average Glucose Level",
            type: "number",
            step: "any",
            placeholder:
                "Enter glucose level"
        },

        {
            name: "bmi",
            label: "BMI",
            type: "number",
            step: "any",
            placeholder:
                "Enter BMI"
        },

        {
            name: "smoking_status",
            label: "Smoking Status",
            type: "select",
            options: [
                "formerly smoked",
                "never smoked",
                "smokes",
                "Unknown"
            ]
        }

    ]

};


/* ========================================
   PREDICTION ENDPOINTS
======================================== */

const predictionEndpoints = {

    diabetes:
        "/api/predict/diabetes",

    heart:
        "/api/predict/heart-disease",

    kidney:
        "/api/predict/kidney",

    liver:
        "/api/predict/liver",

    parkinsons:
        "/api/predict/parkinsons",

    stroke:
        "/api/predict/stroke"
};


/* ========================================
   CREATE INPUT FIELD
======================================== */

function createInputField(field) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "form-group";


    const label =
        document.createElement("label");

    label.htmlFor =
        `field_${field.name}`;

    label.textContent =
        field.label;


    let input;


    /* ====================================
       SELECT FIELD
    ==================================== */

    if (field.type === "select") {

        input =
            document.createElement("select");

        input.id =
            `field_${field.name}`;

        input.name =
            field.name;

        input.required = true;


        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";

        defaultOption.textContent =
            `Select ${field.label}`;

        defaultOption.disabled = true;

        defaultOption.selected = true;

        input.appendChild(
            defaultOption
        );


        field.options.forEach(
            function (optionValue) {

                const option =
                    document.createElement(
                        "option"
                    );


                if (
                    field.binary === true &&
                    (
                        optionValue === "Yes" ||
                        optionValue === "No"
                    )
                ) {

                    option.value =
                        optionValue === "Yes"
                            ? "1"
                            : "0";

                } else {

                    option.value =
                        optionValue;
                }


                option.textContent =
                    optionValue;


                input.appendChild(
                    option
                );
            }
        );

    }


    /* ====================================
       NORMAL INPUT
    ==================================== */

    else {

        input =
            document.createElement(
                "input"
            );

        input.type =
            field.type || "text";

        input.id =
            `field_${field.name}`;

        input.name =
            field.name;

        input.placeholder =
            field.placeholder || "";

        input.required = true;


        if (field.step) {

            input.step =
                field.step;
        }


        if (
            field.min !== undefined
        ) {

            input.min =
                field.min;
        }


        if (
            field.max !== undefined
        ) {

            input.max =
                field.max;
        }
    }


    wrapper.appendChild(label);

    wrapper.appendChild(input);

    return wrapper;
}


/* ========================================
   CREATE DISEASE FIELDS
======================================== */

function createDiseaseFields(
    disease,
    fieldsContainer,
    diseaseFieldsContainer
) {

    if (
        !fieldsContainer ||
        !diseaseFieldsContainer
    ) {

        return;
    }


    fieldsContainer.innerHTML =
        "";


    if (
        !disease ||
        !diseaseFields[disease]
    ) {

        diseaseFieldsContainer.style.display =
            "none";

        return;
    }


    diseaseFields[disease].forEach(
        function (field) {

            const fieldElement =
                createInputField(field);

            fieldsContainer.appendChild(
                fieldElement
            );
        }
    );


    diseaseFieldsContainer.style.display =
        "block";
}


/* ========================================
   GET FIELD VALUE
======================================== */

function getFieldValue(
    field,
    element
) {

    const value =
        element.value.trim();


    if (value === "") {

        return null;
    }


    if (field.type === "number") {

        const numberValue =
            Number(value);


        if (
            Number.isNaN(
                numberValue
            )
        ) {

            throw new Error(
                `${field.label} must be a valid number.`
            );
        }


        if (
            numberValue < 0 &&
            field.name !== "spread1"
        ) {

            throw new Error(
                `${field.label} cannot be negative.`
            );
        }


        return numberValue;
    }


    return value;
}


/* ========================================
   LOAD USER PATIENTS
======================================== */

async function loadPredictionPatients() {

    const patientSelect =
        document.getElementById(
            "patient_id"
        );

    const patientNameInput =
        document.getElementById(
            "patient_name"
        );


    if (!patientSelect) {

        return;
    }


    const token =
        getToken();


    if (!token) {

        patientSelect.innerHTML = `
            <option value="">
                Please login first
            </option>
        `;

        return;
    }


    try {

        patientSelect.innerHTML = `
            <option value="">
                Loading patients...
            </option>
        `;


        const response =
            await apiRequest(
                "/api/patients",
                {
                    method: "GET"
                }
            );


        const data =
            await parseResponse(
                response
            );


        /* ====================================
           TOKEN EXPIRED
        ==================================== */

        if (
            response.status === 401
        ) {

            removeToken();

            patientSelect.innerHTML = `
                <option value="">
                    Session expired
                </option>
            `;

            window.location.href =
                "/auth";

            return;
        }


        /* ====================================
           SERVER ERROR
        ==================================== */

        if (!response.ok) {

            patientSelect.innerHTML = `
                <option value="">
                    Unable to load patients
                </option>
            `;

            console.error(
                "Patient loading error:",
                data
            );

            return;
        }


        const patients =
            Array.isArray(
                data.patients
            )
                ? data.patients
                : [];


        /* ====================================
           CLEAR DROPDOWN
        ==================================== */

        patientSelect.innerHTML = `
            <option value="">
                Select a patient
            </option>
        `;


        /* ====================================
           NO PATIENTS
        ==================================== */

        if (
            patients.length === 0
        ) {

            patientSelect.innerHTML = `
                <option value="">
                    No patients found
                </option>
            `;

            if (patientNameInput) {

                patientNameInput.value = "";
            }

            return;
        }


        /* ====================================
           ADD PATIENT OPTIONS
        ==================================== */

        patients.forEach(
            function (patient) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    patient.id;


                option.textContent =
                    `${patient.name} (ID: ${patient.id})`;


                option.dataset.name =
                    patient.name || "";


                option.dataset.age =
                    patient.age ?? "";


                option.dataset.gender =
                    patient.gender || "";


                patientSelect.appendChild(
                    option
                );
            }
        );


        /* ====================================
           PATIENT SELECTION
        ==================================== */

        patientSelect.onchange =
            function () {

                const selectedOption =
                    this.options[
                        this.selectedIndex
                    ];


                if (!patientNameInput) {

                    return;
                }


                if (
                    selectedOption &&
                    selectedOption.value
                ) {

                    patientNameInput.value =
                        selectedOption.dataset.name ||
                        "";

                } else {

                    patientNameInput.value =
                        "";
                }
            };


    } catch (error) {

        console.error(
            "Error loading patients:",
            error
        );


        patientSelect.innerHTML = `
            <option value="">
                Unable to load patients
            </option>
        `;
    }
}


/* ========================================
   PREDICTION ANALYSIS CHART
======================================== */

let predictionProbabilityChart =
    null;


/* ========================================
   DESTROY PREDICTION ANALYSIS CHART
======================================== */

function destroyPredictionAnalysisChart() {

    if (
        predictionProbabilityChart
    ) {

        predictionProbabilityChart.destroy();

        predictionProbabilityChart =
            null;
    }
}


/* ========================================
   DISPLAY PREDICTION ANALYSIS
======================================== */

function displayPredictionAnalysis(
    data,
    patientId,
    selectedDisease
) {

    const analysisSection =
        document.getElementById(
            "predictionAnalysis"
        );


    if (!analysisSection) {

        return;
    }


    const disease =
        data.disease ||
        selectedDisease;


    const prediction =
        data.prediction ??
        data.result ??
        data.label ??
        "N/A";


    const probability =
        data.probability ??
        data.risk_probability ??
        data.confidence ??
        null;


    const risk =
        data.risk_level ||
        data.risk ||
        getRiskLevel(
            prediction,
            probability
        );


    let percentage =
        Number(probability);


    if (
        Number.isNaN(
            percentage
        )
    ) {

        percentage = 0;

    } else {

        if (
            percentage <= 1
        ) {

            percentage *= 100;
        }


        percentage =
            Math.max(
                0,
                Math.min(
                    100,
                    percentage
                )
            );
    }


    const analysisDisease =
        document.getElementById(
            "analysisDisease"
        );


    const analysisRisk =
        document.getElementById(
            "analysisRisk"
        );


    const analysisProbability =
        document.getElementById(
            "analysisProbability"
        );


    const analysisPrediction =
        document.getElementById(
            "analysisPrediction"
        );


    const interpretation =
        document.getElementById(
            "analysisInterpretation"
        );


    /* ====================================
       DISEASE
    ==================================== */

    if (analysisDisease) {

        analysisDisease.textContent =
            formatDiseaseName(
                disease
            );
    }


    /* ====================================
       RISK
    ==================================== */

    if (analysisRisk) {

        analysisRisk.textContent =
            formatRisk(
                risk
            );


        analysisRisk.classList.remove(
            "risk-low",
            "risk-medium",
            "risk-high"
        );


        const riskText =
            String(risk)
                .toLowerCase();


        if (
            riskText.includes("high")
        ) {

            analysisRisk.classList.add(
                "risk-high"
            );

        } else if (
            riskText.includes("medium")
        ) {

            analysisRisk.classList.add(
                "risk-medium"
            );

        } else if (
            riskText.includes("low")
        ) {

            analysisRisk.classList.add(
                "risk-low"
            );
        }
    }


    /* ====================================
       PROBABILITY
    ==================================== */

    if (analysisProbability) {

        if (
            probability !== null &&
            probability !== undefined &&
            !Number.isNaN(
                Number(probability)
            )
        ) {

            analysisProbability.textContent =
                `${percentage.toFixed(2)}%`;

        } else {

            analysisProbability.textContent =
                "N/A";
        }
    }


    /* ====================================
       PREDICTION
    ==================================== */

    if (analysisPrediction) {

        analysisPrediction.textContent =
            prediction;
    }


    /* ====================================
       INTERPRETATION
    ==================================== */

    if (interpretation) {

        if (
            probability !== null &&
            probability !== undefined &&
            !Number.isNaN(
                Number(probability)
            )
        ) {

            interpretation.textContent =
                `The machine-learning model estimated a ${percentage.toFixed(2)}% probability for the selected outcome. This value represents model output and should not be interpreted as a medical diagnosis.`;

        } else {

            interpretation.textContent =
                "The machine-learning model returned a prediction, but a probability value was not provided.";
        }
    }


    /* ====================================
       SHOW ANALYSIS
    ==================================== */

    analysisSection.style.display =
        "block";


    /* ====================================
       CREATE CHART
    ==================================== */

    const canvas =
        document.getElementById(
            "predictionProbabilityChart"
        );


    if (
        canvas &&
        typeof Chart !== "undefined"
    ) {

        destroyPredictionAnalysisChart();


        predictionProbabilityChart =
            new Chart(
                canvas,
                {
                    type: "doughnut",

                    data: {

                        labels: [
                            "Estimated Probability",
                            "Remaining"
                        ],

                        datasets: [

                            {
                                data: [
                                    percentage,
                                    100 - percentage
                                ],

                                borderWidth:
                                    0
                            }

                        ]
                    },

                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

                        cutout:
                            "72%",

                        plugins: {

                            legend: {

                                position:
                                    "bottom"
                            },

                            tooltip: {

                                callbacks: {

                                    label:
                                        function (
                                            context
                                        ) {

                                            return (
                                                " " +
                                                context.label +
                                                ": " +
                                                Number(
                                                    context.raw
                                                ).toFixed(
                                                    2
                                                ) +
                                                "%"
                                            );
                                        }
                                }
                            }
                        }
                    }
                }
            );

    } else if (
        typeof Chart === "undefined"
    ) {

        console.warn(
            "Chart.js is not loaded. Prediction analysis chart cannot be created."
        );
    }


    /* ====================================
       SCROLL TO ANALYSIS
    ==================================== */

    analysisSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* ========================================
   HIDE PREDICTION ANALYSIS
======================================== */

function hidePredictionAnalysis() {

    const analysisSection =
        document.getElementById(
            "predictionAnalysis"
        );


    if (analysisSection) {

        analysisSection.style.display =
            "none";
    }


    destroyPredictionAnalysisChart();
}


/* ========================================
   DISPLAY PREDICTION RESULT
======================================== */

function displayPredictionResult(
    data,
    patientId,
    selectedDisease
) {

    const predictionResult =
        document.getElementById(
            "predictionResult"
        );


    if (!predictionResult) {

        return;
    }


    const disease =
        data.disease ||
        selectedDisease;


    const prediction =
        data.prediction ??
        data.result ??
        data.label ??
        "N/A";


    const probability =
        data.probability ??
        data.risk_probability ??
        data.confidence ??
        null;


    const risk =
        data.risk_level ||
        data.risk ||
        getRiskLevel(
            prediction,
            probability
        );


    const message =
        data.message ||
        "Prediction completed successfully.";


    const resultRisk =
        document.getElementById(
            "resultRisk"
        );


    const resultMessage =
        document.getElementById(
            "resultMessage"
        );


    const resultDisease =
        document.getElementById(
            "resultDisease"
        );


    const resultPrediction =
        document.getElementById(
            "resultPrediction"
        );


    const resultProbability =
        document.getElementById(
            "resultProbability"
        );


    const resultPatient =
        document.getElementById(
            "resultPatient"
        );


    /* ====================================
       RISK
    ==================================== */

    if (resultRisk) {

        resultRisk.textContent =
            formatRisk(
                risk
            );


        resultRisk.classList.remove(
            "risk-low",
            "risk-medium",
            "risk-high"
        );


        const riskText =
            String(risk)
                .toLowerCase();


        if (
            riskText.includes("high")
        ) {

            resultRisk.classList.add(
                "risk-high"
            );

        } else if (
            riskText.includes("medium")
        ) {

            resultRisk.classList.add(
                "risk-medium"
            );

        } else if (
            riskText.includes("low")
        ) {

            resultRisk.classList.add(
                "risk-low"
            );
        }
    }


    /* ====================================
       MESSAGE
    ==================================== */

    if (resultMessage) {

        resultMessage.textContent =
            message;
    }


    /* ====================================
       DISEASE
    ==================================== */

    if (resultDisease) {

        resultDisease.textContent =
            formatDiseaseName(
                disease
            );
    }


    /* ====================================
       PREDICTION
    ==================================== */

    if (resultPrediction) {

        resultPrediction.textContent =
            prediction;
    }


    /* ====================================
       PROBABILITY
    ==================================== */

    if (resultProbability) {

        if (
            probability !== null &&
            probability !== undefined
        ) {

            let percentage =
                Number(
                    probability
                );


            if (
                !Number.isNaN(
                    percentage
                )
            ) {

                if (
                    percentage <= 1
                ) {

                    percentage *= 100;
                }


                resultProbability.textContent =
                    `${percentage.toFixed(2)}%`;

            } else {

                resultProbability.textContent =
                    String(
                        probability
                    );
            }

        } else {

            resultProbability.textContent =
                "N/A";
        }
    }


    /* ====================================
       PATIENT
    ==================================== */

    if (resultPatient) {

        resultPatient.textContent =
            patientId;
    }


    /* ====================================
       SHOW RESULT
    ==================================== */

    predictionResult.style.display =
        "block";


    /* ====================================
       SHOW IMMEDIATE ANALYSIS
    ==================================== */

    displayPredictionAnalysis(
        data,
        patientId,
        selectedDisease
    );


    predictionResult.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


/* ========================================
   PREDICTION PAGE
======================================== */

function initializePrediction() {

    const predictionForm =
        document.getElementById(
            "predictionForm"
        );


    if (!predictionForm) {

        return;
    }


    const diseaseSelect =
        document.getElementById(
            "disease"
        );


    const diseaseFieldsContainer =
        document.getElementById(
            "diseaseFields"
        );


    const fieldsContainer =
        document.getElementById(
            "fieldsContainer"
        );


    const clearBtn =
        document.getElementById(
            "clearBtn"
        );


    const loadingBox =
        document.getElementById(
            "loadingBox"
        );


    const errorBox =
        document.getElementById(
            "errorBox"
        );


    const errorMessage =
        document.getElementById(
            "errorMessage"
        );


    const predictionResult =
        document.getElementById(
            "predictionResult"
        );


    console.log(
        "Prediction page initialized."
    );


    /* ====================================
       LOAD USER PATIENTS
    ==================================== */

    loadPredictionPatients();


    /* ====================================
       SHOW LOADING
    ==================================== */

    function showLoading() {

        if (loadingBox) {

            loadingBox.style.display =
                "flex";
        }
    }


    /* ====================================
       HIDE LOADING
    ==================================== */

    function hideLoading() {

        if (loadingBox) {

            loadingBox.style.display =
                "none";
        }
    }


    /* ====================================
       SHOW ERROR
    ==================================== */

    function showError(message) {

        if (
            !errorBox ||
            !errorMessage
        ) {

            alert(message);

            return;
        }


        errorMessage.textContent =
            message;


        errorBox.style.display =
            "block";


        errorBox.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }


    /* ====================================
       HIDE ERROR
    ==================================== */

    function hideError() {

        if (errorBox) {

            errorBox.style.display =
                "none";
        }


        if (errorMessage) {

            errorMessage.textContent =
                "";
        }
    }


    /* ====================================
       HIDE RESULT
    ==================================== */

    function hideResult() {

        if (predictionResult) {

            predictionResult.style.display =
                "none";
        }


        hidePredictionAnalysis();
    }


    /* ====================================
       DISEASE CHANGE
    ==================================== */

    if (diseaseSelect) {

        diseaseSelect.addEventListener(
            "change",
            function () {

                hideError();

                hideResult();

                createDiseaseFields(
                    diseaseSelect.value,
                    fieldsContainer,
                    diseaseFieldsContainer
                );
            }
        );
    }


    /* ====================================
       CLEAR BUTTON
    ==================================== */

    if (clearBtn) {

        clearBtn.addEventListener(
            "click",
            function () {

                predictionForm.reset();


                if (fieldsContainer) {

                    fieldsContainer.innerHTML =
                        "";
                }


                if (diseaseFieldsContainer) {

                    diseaseFieldsContainer.style.display =
                        "none";
                }


                hideError();

                hideResult();

                hideLoading();


                const patientNameInput =
                    document.getElementById(
                        "patient_name"
                    );


                if (patientNameInput) {

                    patientNameInput.value =
                        "";
                }
            }
        );
    }


    /* ====================================
       FORM SUBMIT
    ==================================== */

    predictionForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();
            event.stopPropagation();


            hideError();

            hideResult();


            /* ====================================
               CHECK TOKEN
            ==================================== */

            const token =
                getToken();


            if (!token) {

                showError(
                    "Please login before making a prediction."
                );

                return;
            }


            /* ====================================
               PATIENT DATA
            ==================================== */

            const patientIdElement =
                document.getElementById(
                    "patient_id"
                );


            const patientNameElement =
                document.getElementById(
                    "patient_name"
                );


            const patientId =
                patientIdElement
                    ? patientIdElement.value.trim()
                    : "";


            const patientName =
                patientNameElement
                    ? patientNameElement.value.trim()
                    : "";


            const disease =
                diseaseSelect
                    ? diseaseSelect.value
                    : "";


            /* ====================================
               VALIDATE PATIENT
            ==================================== */

            if (!patientId) {

                showError(
                    "Please select a patient."
                );

                return;
            }


            const numericPatientId =
                Number(patientId);


            if (
                Number.isNaN(
                    numericPatientId
                ) ||
                numericPatientId <= 0
            ) {

                showError(
                    "Selected patient is invalid."
                );

                return;
            }


            if (!patientName) {

                showError(
                    "Please select a valid patient."
                );

                return;
            }


            /* ====================================
               VALIDATE DISEASE
            ==================================== */

            if (!disease) {

                showError(
                    "Please select a disease."
                );

                return;
            }


            const fields =
                diseaseFields[disease];


            if (!fields) {

                showError(
                    "Fields for this disease are not configured."
                );

                return;
            }


            /* ====================================
               COLLECT MODEL INPUTS
            ==================================== */

            const inputData = {};


            try {

                for (
                    const field of fields
                ) {

                    const element =
                        document.getElementById(
                            `field_${field.name}`
                        );


                    if (!element) {

                        throw new Error(
                            `${field.label} field is missing.`
                        );
                    }


                    const value =
                        getFieldValue(
                            field,
                            element
                        );


                    if (
                        value === null ||
                        value === ""
                    ) {

                        element.focus();

                        throw new Error(
                            `Please enter ${field.label}.`
                        );
                    }


                    inputData[field.name] =
                        value;
                }

            } catch (error) {

                showError(
                    error.message
                );

                return;
            }


            /* ====================================
               BACKEND PAYLOAD
            ==================================== */

            const payload = {

                patient_id:
                    numericPatientId,

                patient_name:
                    patientName,

                disease:
                    disease,

                ...inputData
            };


            const endpoint =
                predictionEndpoints[disease];


            if (!endpoint) {

                showError(
                    "Prediction endpoint is not configured for this disease."
                );

                return;
            }


            console.log(
                "================================"
            );

            console.log(
                "Prediction endpoint:",
                endpoint
            );

            console.log(
                "Prediction payload:",
                payload
            );

            console.log(
                "================================"
            );


            showLoading();


            try {

                const response =
                    await apiRequest(
                        endpoint,
                        {
                            method: "POST",

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );


                const responseText =
                    await response.text();


                console.log(
                    "Prediction status:",
                    response.status
                );


                console.log(
                    "Prediction response:",
                    responseText
                );


                let data = {};


                if (responseText) {

                    try {

                        data =
                            JSON.parse(
                                responseText
                            );

                    } catch (error) {

                        throw new Error(
                            "The server returned an invalid response. Check the Flask terminal."
                        );
                    }
                }


                /* ====================================
                   TOKEN EXPIRED
                ==================================== */

                if (
                    response.status === 401
                ) {

                    console.warn(
                        "Prediction request was rejected with HTTP 401."
                    );


                    removeToken();


                    throw new Error(
                        data.msg ||
                        data.message ||
                        data.error ||
                        "Your login session has expired. Please login again."
                    );
                }


                /* ====================================
                   SERVER ERROR
                ==================================== */

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        data.error ||
                        data.msg ||
                        `Prediction failed with status ${response.status}.`
                    );
                }


                /* ====================================
                   DISPLAY RESULT
                ==================================== */

                displayPredictionResult(
                    data,
                    numericPatientId,
                    disease
                );

            } catch (error) {

                console.error(
                    "Prediction error:",
                    error
                );


                showError(
                    error.message ||
                    "Unable to connect to the prediction server."
                );

            } finally {

                hideLoading();
            }

        }
    );
}


/* ========================================
   RISK LEVEL
======================================== */

function getRiskLevel(
    prediction,
    probability
) {

    if (
        probability !== null &&
        probability !== undefined
    ) {

        let value =
            Number(probability);


        if (
            !Number.isNaN(value)
        ) {

            if (value > 1) {

                value /= 100;
            }


            if (value < 0.30) {

                return "Low Risk";
            }


            if (value < 0.70) {

                return "Medium Risk";
            }


            return "High Risk";
        }
    }


    if (
        prediction === 1 ||
        prediction === "1"
    ) {

        return "Risk Detected";
    }


    if (
        prediction === 0 ||
        prediction === "0"
    ) {

        return "Low Risk";
    }


    return "Result Available";
}


/* ========================================
   FORMAT RISK
======================================== */

function formatRisk(risk) {

    const value =
        String(risk || "")
            .toLowerCase();


    if (
        value.includes("high")
    ) {

        return "High Risk";
    }


    if (
        value.includes("medium")
    ) {

        return "Medium Risk";
    }


    if (
        value.includes("low")
    ) {

        return "Low Risk";
    }


    return risk ||
        "Result Available";
}


/* ========================================
   FORMAT DISEASE NAME
======================================== */

function formatDiseaseName(name) {

    const names = {

        diabetes:
            "Diabetes",

        heart:
            "Heart Disease",

        heart_disease:
            "Heart Disease",

        kidney:
            "Kidney Disease",

        kidney_disease:
            "Kidney Disease",

        liver:
            "Liver Disease",

        liver_disease:
            "Liver Disease",

        parkinsons:
            "Parkinson's Disease",

        parkinsons_disease:
            "Parkinson's Disease",

        stroke:
            "Stroke"
    };


    const key =
        String(name)
            .toLowerCase()
            .trim();


    return names[key] ||
        name;
}


/* ========================================
   PAGE INITIALIZATION
======================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "MULTI JavaScript initialized."
        );


        initializeRegister();

        initializeLogin();

        initializeLogout();

        initializePrediction();

    }
);


/* ========================================
   ADMIN DASHBOARD
======================================== */

let adminRiskPieChart = null;
let adminDiseaseBarChart = null;

let adminUsers = [];
let adminPatients = [];
let adminPredictions = [];


/* ========================================
   ADMIN API REQUEST
======================================== */

async function adminRequest(url, options = {}) {

    const token = getToken();

    if (!token) {
        throw new Error("Admin login session not found.");
    }

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(url, {
        ...options,
        headers
    });

    const data = await parseResponse(response);

    if (response.status === 401) {

        removeToken();

        window.location.href = "/auth";

        throw new Error(
            "Admin session expired. Please login again."
        );
    }

    if (!response.ok) {

        throw new Error(
            data.message ||
            data.error ||
            data.msg ||
            `Request failed with status ${response.status}.`
        );
    }

    return data;
}


/* ========================================
   ADMIN HELPERS
======================================== */

function adminEscape(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function adminValue(object, ...keys) {

    for (const key of keys) {

        if (
            object &&
            object[key] !== undefined &&
            object[key] !== null
        ) {
            return object[key];
        }
    }

    return "";
}


function adminFormatDisease(disease) {

    const value =
        String(disease || "")
            .toLowerCase()
            .trim();

    if (value.includes("diabetes")) {
        return "Diabetes";
    }

    if (value.includes("heart")) {
        return "Heart Disease";
    }

    if (value.includes("kidney")) {
        return "Kidney Disease";
    }

    if (value.includes("liver")) {
        return "Liver Disease";
    }

    if (value.includes("parkinson")) {
        return "Parkinson's Disease";
    }

    if (value.includes("stroke")) {
        return "Stroke";
    }

    return disease || "Unknown";
}


function adminNormalizeRisk(risk) {

    const value =
        String(risk || "")
            .toLowerCase()
            .trim();

    if (value.includes("high")) {
        return "High";
    }

    if (
        value.includes("medium") ||
        value.includes("moderate")
    ) {
        return "Medium";
    }

    if (value.includes("low")) {
        return "Low";
    }

    return "Unknown";
}


function adminFormatDate(value) {

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


function adminFormatProbability(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "N/A";
    }

    let number = Number(value);

    if (Number.isNaN(number)) {
        return String(value);
    }

    if (number <= 1) {
        number *= 100;
    }

    return `${number.toFixed(2)}%`;
}


function adminPredictionLabel(prediction) {

    if (
        prediction === 1 ||
        String(prediction) === "1"
    ) {
        return "Positive";
    }

    if (
        prediction === 0 ||
        String(prediction) === "0"
    ) {
        return "Negative";
    }

    return prediction || "N/A";
}


function adminRiskClass(risk) {

    const normalized =
        adminNormalizeRisk(risk);

    if (normalized === "High") {
        return "risk-high";
    }

    if (normalized === "Medium") {
        return "risk-medium";
    }

    if (normalized === "Low") {
        return "risk-low";
    }

    return "";
}


/* ========================================
   ADMIN ERROR
======================================== */

function showAdminError(message) {

    const errorBox =
        document.getElementById("adminError");

    if (!errorBox) {
        return;
    }

    errorBox.textContent =
        message || "Something went wrong.";

    errorBox.style.display = "block";
}


function hideAdminError() {

    const errorBox =
        document.getElementById("adminError");

    if (!errorBox) {
        return;
    }

    errorBox.textContent = "";

    errorBox.style.display = "none";
}


/* ========================================
   ADMIN SIDEBAR
======================================== */

function showAdminSection(sectionName) {

    const sections = {

        dashboard:
            document.getElementById(
                "adminDashboardSection"
            ),

        users:
            document.getElementById(
                "adminUsersSection"
            ),

        patients:
            document.getElementById(
                "adminPatientsSection"
            ),

        predictions:
            document.getElementById(
                "adminPredictionsSection"
            )
    };


    Object.values(sections).forEach(
        function (section) {

            if (section) {
                section.classList.remove("active");
            }

        }
    );


    if (sections[sectionName]) {

        sections[sectionName]
            .classList.add("active");
    }


    const navItems =
        document.querySelectorAll(
            ".admin-nav-item"
        );


    navItems.forEach(
        function (item) {

            item.classList.remove("active");

            if (
                item.dataset.section ===
                sectionName
            ) {

                item.classList.add("active");
            }
        }
    );


    const titles = {

        dashboard: "Dashboard",

        users: "Users",

        patients: "Patients",

        predictions: "Predictions"
    };


    const title =
        document.getElementById(
            "adminPageTitle"
        );


    if (title) {

        title.textContent =
            titles[sectionName] ||
            "Dashboard";
    }


    closeAdminSidebar();
}


function initializeAdminNavigation() {

    const navItems =
        document.querySelectorAll(
            ".admin-nav-item"
        );


    navItems.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function () {

                    const section =
                        item.dataset.section;

                    showAdminSection(
                        section
                    );

                }
            );

        }
    );


    const viewAllBtn =
        document.querySelector(
            "[data-section-target='predictions']"
        );


    if (viewAllBtn) {

        viewAllBtn.addEventListener(
            "click",
            function () {

                showAdminSection(
                    "predictions"
                );

            }
        );
    }
}


/* ========================================
   MOBILE SIDEBAR
======================================== */

function openAdminSidebar() {

    const sidebar =
        document.getElementById(
            "adminSidebar"
        );

    const overlay =
        document.getElementById(
            "adminSidebarOverlay"
        );


    if (sidebar) {
        sidebar.classList.add("open");
    }

    if (overlay) {
        overlay.classList.add("active");
    }
}


function closeAdminSidebar() {

    const sidebar =
        document.getElementById(
            "adminSidebar"
        );

    const overlay =
        document.getElementById(
            "adminSidebarOverlay"
        );


    if (sidebar) {
        sidebar.classList.remove("open");
    }

    if (overlay) {
        overlay.classList.remove("active");
    }
}


function initializeAdminMobileMenu() {

    const menuBtn =
        document.getElementById(
            "adminMenuBtn"
        );

    const overlay =
        document.getElementById(
            "adminSidebarOverlay"
        );


    if (menuBtn) {

        menuBtn.addEventListener(
            "click",
            function () {

                openAdminSidebar();

            }
        );
    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            function () {

                closeAdminSidebar();

            }
        );
    }
}


/* ========================================
   ADMIN LOGOUT
======================================== */

function initializeAdminLogout() {

    const logoutBtn =
        document.getElementById(
            "adminLogoutBtn"
        );


    if (!logoutBtn) {
        return;
    }


    logoutBtn.addEventListener(
        "click",
        function () {

            removeToken();

            window.location.href =
                "/auth";
        }
    );
}


/* ========================================
   LOAD ADMIN NAME
======================================== */

function loadAdminName() {

    const userText =
        localStorage.getItem("user");

    let user = null;


    if (userText) {

        try {

            user =
                JSON.parse(userText);

        } catch (error) {

            console.error(
                "Unable to parse stored user:",
                error
            );
        }
    }


    const name =
        user?.name ||
        "Admin";


    const adminName =
        document.getElementById(
            "adminName"
        );


    const sidebarAdminName =
        document.getElementById(
            "sidebarAdminName"
        );


    if (adminName) {
        adminName.textContent = name;
    }


    if (sidebarAdminName) {
        sidebarAdminName.textContent = name;
    }
}


/* ========================================
   SET ADMIN TEXT
======================================== */

function setAdminText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value ?? "0";
    }
}


/* ========================================
   LOAD ADMIN DASHBOARD
======================================== */

async function loadAdminDashboard() {

    try {

        const data =
            await adminRequest(
                "/api/admin/dashboard"
            );


        console.log(
            "Admin dashboard:",
            data
        );


        const statistics =
            data.statistics ||
            data.stats ||
            data.data ||
            {};


        const totalUsers =
            adminValue(
                statistics,
                "total_users",
                "users",
                "user_count"
            );


        const totalPatients =
            adminValue(
                statistics,
                "total_patients",
                "patients",
                "patient_count"
            );


        const totalPredictions =
            adminValue(
                statistics,
                "total_predictions",
                "predictions",
                "prediction_count"
            );


        const highRisk =
            adminValue(
                statistics,
                "high_risk",
                "high",
                "highRisk"
            );


        const mediumRisk =
            adminValue(
                statistics,
                "medium_risk",
                "medium",
                "mediumRisk"
            );


        const lowRisk =
            adminValue(
                statistics,
                "low_risk",
                "low",
                "lowRisk"
            );


        setAdminText(
            "totalUsers",
            totalUsers || 0
        );


        setAdminText(
            "totalPatients",
            totalPatients || 0
        );


        setAdminText(
            "totalPredictions",
            totalPredictions || 0
        );


        setAdminText(
            "highRisk",
            highRisk || 0
        );


        setAdminText(
            "highRiskSummary",
            highRisk || 0
        );


        setAdminText(
            "mediumRisk",
            mediumRisk || 0
        );


        setAdminText(
            "lowRisk",
            lowRisk || 0
        );


        createAdminRiskPieChart(
            {
                low:
                    Number(lowRisk || 0),

                medium:
                    Number(mediumRisk || 0),

                high:
                    Number(highRisk || 0)
            }
        );


    } catch (error) {

        console.error(
            "Admin dashboard loading error:",
            error
        );

        showAdminError(
            error.message
        );
    }
}


/* ========================================
   RISK PIE CHART
======================================== */

function createAdminRiskPieChart(
    riskData
) {

    const canvas =
        document.getElementById(
            "riskPieChart"
        );


    if (!canvas) {
        return;
    }


    if (
        typeof Chart === "undefined"
    ) {

        console.warn(
            "Chart.js is not loaded."
        );

        return;
    }


    if (adminRiskPieChart) {

        adminRiskPieChart.destroy();

        adminRiskPieChart = null;
    }


    adminRiskPieChart =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {

                    labels: [
                        "Low Risk",
                        "Medium Risk",
                        "High Risk"
                    ],

                    datasets: [

                        {
                            data: [
                                riskData.low,
                                riskData.medium,
                                riskData.high
                            ],

                            backgroundColor: [
                                "#20c58a",
                                "#f5b942",
                                "#ef5b5b"
                            ],

                            borderWidth: 0,

                            hoverOffset: 8
                        }

                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    cutout: "68%",

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {

                                padding: 18,

                                usePointStyle: true
                            }
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        const values =
                                            context
                                                .dataset
                                                .data;

                                        const total =
                                            values.reduce(
                                                function (
                                                    sum,
                                                    value
                                                ) {

                                                    return (
                                                        sum +
                                                        Number(value)
                                                    );

                                                },
                                                0
                                            );

                                        const value =
                                            Number(
                                                context.raw
                                            );

                                        const percentage =
                                            total > 0
                                                ? (
                                                    value /
                                                    total
                                                ) *
                                                100
                                                : 0;

                                        return (
                                            ` ${context.label}: ` +
                                            `${value} ` +
                                            `(${percentage.toFixed(1)}%)`
                                        );
                                    }
                            }
                        }
                    }
                }
            }
        );
}


/* ========================================
   DISEASE BAR CHART
======================================== */

function createAdminDiseaseBarChart(
    predictions
) {

    const canvas =
        document.getElementById(
            "diseaseBarChart"
        );


    if (!canvas) {
        return;
    }


    if (
        typeof Chart === "undefined"
    ) {

        console.warn(
            "Chart.js is not loaded."
        );

        return;
    }


    const diseaseNames = [

        "Diabetes",

        "Heart Disease",

        "Kidney Disease",

        "Liver Disease",

        "Parkinson's Disease",

        "Stroke"
    ];


    const diseaseCounts = {

        "Diabetes": 0,

        "Heart Disease": 0,

        "Kidney Disease": 0,

        "Liver Disease": 0,

        "Parkinson's Disease": 0,

        "Stroke": 0
    };


    if (
        Array.isArray(
            predictions
        )
    ) {

        predictions.forEach(
            function (prediction) {

                const disease =
                    adminFormatDisease(
                        prediction.disease
                    );


                if (
                    diseaseCounts[disease] !==
                    undefined
                ) {

                    diseaseCounts[disease]++;
                }

            }
        );
    }


    if (adminDiseaseBarChart) {

        adminDiseaseBarChart.destroy();

        adminDiseaseBarChart = null;
    }


    adminDiseaseBarChart =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels:
                        diseaseNames,

                    datasets: [

                        {
                            label:
                                "Predictions",

                            data:
                                diseaseNames.map(
                                    function (
                                        disease
                                    ) {

                                        return (
                                            diseaseCounts[
                                                disease
                                            ]
                                        );
                                    }
                                ),

                            borderWidth: 1,

                            borderRadius: 8,

                            backgroundColor:
                                "#20c58a"
                        }

                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display: false
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            ` Predictions: ${context.raw}`
                                        );
                                    }
                            }
                        }
                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                precision: 0,

                                stepSize: 1
                            }
                        },

                        x: {

                            ticks: {

                                maxRotation: 25,

                                minRotation: 0
                            }
                        }
                    }
                }
            }
        );
}


/* ========================================
   UPDATE MONITORING
======================================== */

function updateAdminMonitoring(
    predictions
) {

    const diseaseNames = [

        "Diabetes",

        "Heart Disease",

        "Kidney Disease",

        "Liver Disease",

        "Parkinson's Disease",

        "Stroke"
    ];


    const diseaseCounts = {

        "Diabetes": 0,

        "Heart Disease": 0,

        "Kidney Disease": 0,

        "Liver Disease": 0,

        "Parkinson's Disease": 0,

        "Stroke": 0
    };


    if (
        Array.isArray(
            predictions
        )
    ) {

        predictions.forEach(
            function (prediction) {

                const disease =
                    adminFormatDisease(
                        prediction.disease
                    );


                if (
                    diseaseCounts[disease] !==
                    undefined
                ) {

                    diseaseCounts[disease]++;
                }

            }
        );
    }


    /* ====================================
       DISEASE COUNT
    ==================================== */

    setAdminText(
        "diseaseCount",
        diseaseNames.length
    );


    /* ====================================
       TOP DISEASE
    ==================================== */

    let topDisease = "—";
    let topCount = 0;


    diseaseNames.forEach(
        function (disease) {

            if (
                diseaseCounts[disease] >
                topCount
            ) {

                topCount =
                    diseaseCounts[disease];

                topDisease =
                    disease;
            }

        }
    );


    setAdminText(
        "topDisease",
        topCount > 0
            ? topDisease
            : "—"
    );


    /* ====================================
       LATEST ACTIVITY
    ==================================== */

    let latestDate = null;


    if (
        Array.isArray(
            predictions
        )
    ) {

        predictions.forEach(
            function (prediction) {

                const date =
                    adminValue(
                        prediction,
                        "created_at",
                        "date",
                        "prediction_date",
                        "createdAt"
                    );


                if (!date) {
                    return;
                }


                const currentDate =
                    new Date(date);


                if (
                    Number.isNaN(
                        currentDate.getTime()
                    )
                ) {

                    return;
                }


                if (
                    !latestDate ||
                    currentDate >
                    latestDate
                ) {

                    latestDate =
                        currentDate;
                }

            }
        );
    }


    setAdminText(
        "latestActivity",
        latestDate
            ? adminFormatDate(
                latestDate
            )
            : "—"
    );


    /* ====================================
       MONITORING LIST
    ==================================== */

    const monitoring =
        document.getElementById(
            "diseaseMonitoring"
        );


    if (!monitoring) {
        return;
    }


    const maxCount =
        Math.max(
            ...Object.values(
                diseaseCounts
            ),
            1
        );


    monitoring.innerHTML =
        diseaseNames.map(
            function (disease) {

                const count =
                    diseaseCounts[disease];


                const progress =
                    (
                        count /
                        maxCount
                    ) *
                    100;


                return `
                    <div class="monitoring-item">

                        <span>
                            ${adminEscape(disease)}
                        </span>

                        <div class="monitoring-progress">
                            <div
                                class="monitoring-progress-bar"
                                style="width: ${progress}%"
                            ></div>
                        </div>

                        <strong>
                            ${count}
                        </strong>

                    </div>
                `;

            }
        ).join("");
}


/* ========================================
   RECENT PREDICTIONS
======================================== */

function renderRecentPredictions(
    predictions
) {

    const tbody =
        document.getElementById(
            "recentPredictionsBody"
        );


    if (!tbody) {
        return;
    }


    if (
        !Array.isArray(
            predictions
        ) ||
        predictions.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="admin-empty"
                >
                    No prediction records found.
                </td>
            </tr>
        `;

        return;
    }


    const recent =
        [...predictions]
            .sort(
                function (a, b) {

                    const dateA =
                        new Date(
                            adminValue(
                                a,
                                "created_at",
                                "date",
                                "prediction_date"
                            )
                        ).getTime();

                    const dateB =
                        new Date(
                            adminValue(
                                b,
                                "created_at",
                                "date",
                                "prediction_date"
                            )
                        ).getTime();

                    return dateB - dateA;
                }
            )
            .slice(0, 10);


    tbody.innerHTML =
        recent.map(
            function (prediction) {

                const id =
                    adminValue(
                        prediction,
                        "id",
                        "prediction_id"
                    );


                const patient =
                    adminValue(
                        prediction,
                        "patient_name",
                        "patient",
                        "patient_id"
                    );


                const disease =
                    adminFormatDisease(
                        prediction.disease
                    );


                const predictionValue =
                    adminPredictionLabel(
                        adminValue(
                            prediction,
                            "prediction",
                            "result",
                            "label"
                        )
                    );


                const probability =
                    adminFormatProbability(
                        adminValue(
                            prediction,
                            "probability",
                            "risk_probability",
                            "confidence"
                        )
                    );


                const risk =
                    adminNormalizeRisk(
                        adminValue(
                            prediction,
                            "risk_level",
                            "risk"
                        )
                    );


                const date =
                    adminFormatDate(
                        adminValue(
                            prediction,
                            "created_at",
                            "date",
                            "prediction_date"
                        )
                    );


                return `
                    <tr>

                        <td>
                            ${adminEscape(id)}
                        </td>

                        <td>
                            ${adminEscape(patient)}
                        </td>

                        <td>
                            ${adminEscape(disease)}
                        </td>

                        <td>
                            ${adminEscape(predictionValue)}
                        </td>

                        <td>
                            ${adminEscape(probability)}
                        </td>

                        <td>
                            <span class="${adminRiskClass(risk)}">
                                ${adminEscape(risk)}
                            </span>
                        </td>

                        <td>
                            ${adminEscape(date)}
                        </td>

                    </tr>
                `;

            }
        ).join("");
}


/* ========================================
   LOAD ADMIN PREDICTIONS
======================================== */

async function loadAdminPredictions() {

    try {

        const data =
            await adminRequest(
                "/api/admin/predictions"
            );


        console.log(
            "Admin predictions:",
            data
        );


        adminPredictions =
            Array.isArray(
                data.predictions
            )
                ? data.predictions
                : Array.isArray(data)
                    ? data
                    : [];


        renderRecentPredictions(
            adminPredictions
        );


        createAdminDiseaseBarChart(
            adminPredictions
        );


        updateAdminMonitoring(
            adminPredictions
        );


        populateDiseaseFilter(
            adminPredictions
        );


        renderAllPredictions();


    } catch (error) {

        console.error(
            "Admin predictions loading error:",
            error
        );


        showAdminError(
            error.message
        );
    }
}


/* ========================================
   DISEASE FILTER
======================================== */

function populateDiseaseFilter(
    predictions
) {

    const select =
        document.getElementById(
            "diseaseFilter"
        );


    if (!select) {
        return;
    }


    const currentValue =
        select.value;


    const diseases = [
        "Diabetes",
        "Heart Disease",
        "Kidney Disease",
        "Liver Disease",
        "Parkinson's Disease",
        "Stroke"
    ];


    select.innerHTML = `
        <option value="">
            All Diseases
        </option>
    `;


    diseases.forEach(
        function (disease) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                disease;

            option.textContent =
                disease;

            select.appendChild(
                option
            );
        }
    );


    if (
        diseases.includes(
            currentValue
        )
    ) {

        select.value =
            currentValue;
    }
}


/* ========================================
   FILTER ADMIN PREDICTIONS
======================================== */

function getFilteredAdminPredictions() {

    const searchInput =
        document.getElementById(
            "predictionSearch"
        );


    const diseaseFilter =
        document.getElementById(
            "diseaseFilter"
        );


    const riskFilter =
        document.getElementById(
            "riskFilter"
        );


    const dateFilter =
        document.getElementById(
            "dateFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const disease =
        diseaseFilter
            ? diseaseFilter.value
            : "";


    const risk =
        riskFilter
            ? riskFilter.value
            : "";


    const date =
        dateFilter
            ? dateFilter.value
            : "";


    return adminPredictions.filter(
        function (prediction) {

            const patient =
                String(
                    adminValue(
                        prediction,
                        "patient_name",
                        "patient",
                        "patient_id"
                    )
                ).toLowerCase();


            const predictionText =
                String(
                    adminValue(
                        prediction,
                        "prediction",
                        "result",
                        "label"
                    )
                ).toLowerCase();


            const diseaseText =
                adminFormatDisease(
                    prediction.disease
                );


            const riskText =
                adminNormalizeRisk(
                    adminValue(
                        prediction,
                        "risk_level",
                        "risk"
                    )
                );


            const id =
                String(
                    adminValue(
                        prediction,
                        "id",
                        "prediction_id"
                    )
                ).toLowerCase();


            const dateValue =
                adminValue(
                    prediction,
                    "created_at",
                    "date",
                    "prediction_date"
                );


            let matchesSearch = true;
            let matchesDisease = true;
            let matchesRisk = true;
            let matchesDate = true;


            if (search) {

                const combined =
                    `${id} ${patient} ${diseaseText} ${predictionText} ${riskText}`
                        .toLowerCase();

                matchesSearch =
                    combined.includes(
                        search
                    );
            }


            if (disease) {

                matchesDisease =
                    diseaseText ===
                    disease;
            }


            if (risk) {

                matchesRisk =
                    riskText ===
                    risk;
            }


            if (date) {

                const predictionDate =
                    new Date(
                        dateValue
                    );


                if (
                    !Number.isNaN(
                        predictionDate.getTime()
                    )
                ) {

                    const localDate =
                        predictionDate
                            .toISOString()
                            .slice(0, 10);

                    matchesDate =
                        localDate === date;
                } else {

                    matchesDate = false;
                }
            }


            return (
                matchesSearch &&
                matchesDisease &&
                matchesRisk &&
                matchesDate
            );
        }
    );
}


/* ========================================
   RENDER ALL PREDICTIONS
======================================== */

function renderAllPredictions() {

    const tbody =
        document.getElementById(
            "allPredictionsBody"
        );


    if (!tbody) {
        return;
    }


    const predictions =
        getFilteredAdminPredictions();


    if (
        predictions.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="admin-empty"
                >
                    No prediction records found.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        predictions.map(
            function (prediction) {

                const id =
                    adminValue(
                        prediction,
                        "id",
                        "prediction_id"
                    );


                const patient =
                    adminValue(
                        prediction,
                        "patient_name",
                        "patient",
                        "patient_id"
                    );


                const disease =
                    adminFormatDisease(
                        prediction.disease
                    );


                const predictionValue =
                    adminPredictionLabel(
                        adminValue(
                            prediction,
                            "prediction",
                            "result",
                            "label"
                        )
                    );


                const probability =
                    adminFormatProbability(
                        adminValue(
                            prediction,
                            "probability",
                            "risk_probability",
                            "confidence"
                        )
                    );


                const risk =
                    adminNormalizeRisk(
                        adminValue(
                            prediction,
                            "risk_level",
                            "risk"
                        )
                    );


                const date =
                    adminFormatDate(
                        adminValue(
                            prediction,
                            "created_at",
                            "date",
                            "prediction_date"
                        )
                    );


                return `
                    <tr>

                        <td>
                            ${adminEscape(id)}
                        </td>

                        <td>
                            ${adminEscape(patient)}
                        </td>

                        <td>
                            ${adminEscape(disease)}
                        </td>

                        <td>
                            ${adminEscape(predictionValue)}
                        </td>

                        <td>
                            ${adminEscape(probability)}
                        </td>

                        <td>
                            <span class="${adminRiskClass(risk)}">
                                ${adminEscape(risk)}
                            </span>
                        </td>

                        <td>
                            ${adminEscape(date)}
                        </td>

                        <td>
                            <button
                                type="button"
                                class="admin-delete-btn"
                                onclick="deleteAdminPrediction(${Number(id)})"
                            >
                                Delete
                            </button>
                        </td>

                    </tr>
                `;

            }
        ).join("");
}


/* ========================================
   LOAD USERS
======================================== */

async function loadAdminUsers() {

    try {

        const data =
            await adminRequest(
                "/api/admin/users"
            );


        adminUsers =
            Array.isArray(
                data.users
            )
                ? data.users
                : Array.isArray(data)
                    ? data
                    : [];


        renderAdminUsers();


    } catch (error) {

        console.error(
            "Admin users loading error:",
            error
        );

        showAdminError(
            error.message
        );
    }
}


/* ========================================
   RENDER USERS
======================================== */

function renderAdminUsers() {

    const tbody =
        document.getElementById(
            "usersTableBody"
        );


    if (!tbody) {
        return;
    }


    const searchInput =
        document.getElementById(
            "userSearch"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const filtered =
        adminUsers.filter(
            function (user) {

                const id =
                    String(
                        adminValue(
                            user,
                            "id",
                            "user_id"
                        )
                    ).toLowerCase();


                const name =
                    String(
                        adminValue(
                            user,
                            "name"
                        )
                    ).toLowerCase();


                const email =
                    String(
                        adminValue(
                            user,
                            "email"
                        )
                    ).toLowerCase();


                return (
                    !search ||
                    id.includes(search) ||
                    name.includes(search) ||
                    email.includes(search)
                );
            }
        );


    if (
        filtered.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="admin-empty"
                >
                    No users found.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        filtered.map(
            function (user) {

                const id =
                    adminValue(
                        user,
                        "id",
                        "user_id"
                    );


                const name =
                    adminValue(
                        user,
                        "name"
                    ) ||
                    "—";


                const email =
                    adminValue(
                        user,
                        "email"
                    ) ||
                    "—";


                const role =
                    adminValue(
                        user,
                        "role"
                    ) ||
                    "user";


                return `
                    <tr>

                        <td>
                            ${adminEscape(id)}
                        </td>

                        <td>
                            ${adminEscape(name)}
                        </td>

                        <td>
                            ${adminEscape(email)}
                        </td>

                        <td>
                            ${adminEscape(role)}
                        </td>

                        <td>
                            <button
                                type="button"
                                class="admin-delete-btn"
                                onclick="deleteAdminUser(${Number(id)})"
                            >
                                Delete
                            </button>
                        </td>

                    </tr>
                `;

            }
        ).join("");
}


/* ========================================
   DELETE USER
======================================== */

async function deleteAdminUser(
    userId
) {

    if (!userId) {
        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to delete this user?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await adminRequest(
            `/api/admin/users/${userId}`,
            {
                method: "DELETE"
            }
        );


        alert(
            "User deleted successfully."
        );


        await Promise.all([
            loadAdminDashboard(),
            loadAdminUsers(),
            loadAdminPatients(),
            loadAdminPredictions()
        ]);


    } catch (error) {

        console.error(
            "Delete user error:",
            error
        );

        alert(
            error.message
        );
    }
}


/* ========================================
   LOAD PATIENTS
======================================== */

async function loadAdminPatients() {

    try {

        const data =
            await adminRequest(
                "/api/admin/patients"
            );


        adminPatients =
            Array.isArray(
                data.patients
            )
                ? data.patients
                : Array.isArray(data)
                    ? data
                    : [];


        renderAdminPatients();


    } catch (error) {

        console.error(
            "Admin patients loading error:",
            error
        );

        showAdminError(
            error.message
        );
    }
}


/* ========================================
   RENDER PATIENTS
======================================== */

function renderAdminPatients() {

    const tbody =
        document.getElementById(
            "patientsTableBody"
        );


    if (!tbody) {
        return;
    }


    const searchInput =
        document.getElementById(
            "patientSearch"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const filtered =
        adminPatients.filter(
            function (patient) {

                const id =
                    String(
                        adminValue(
                            patient,
                            "id",
                            "patient_id"
                        )
                    ).toLowerCase();


                const userId =
                    String(
                        adminValue(
                            patient,
                            "user_id"
                        )
                    ).toLowerCase();


                const name =
                    String(
                        adminValue(
                            patient,
                            "name",
                            "patient_name"
                        )
                    ).toLowerCase();


                return (
                    !search ||
                    id.includes(search) ||
                    userId.includes(search) ||
                    name.includes(search)
                );
            }
        );


    if (
        filtered.length === 0
    ) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="admin-empty"
                >
                    No patients found.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        filtered.map(
            function (patient) {

                const id =
                    adminValue(
                        patient,
                        "id",
                        "patient_id"
                    );


                const userId =
                    adminValue(
                        patient,
                        "user_id"
                    );


                const name =
                    adminValue(
                        patient,
                        "name",
                        "patient_name"
                    ) ||
                    "—";


                const age =
                    adminValue(
                        patient,
                        "age"
                    ) ||
                    "—";


                const gender =
                    adminValue(
                        patient,
                        "gender"
                    ) ||
                    "—";


                return `
                    <tr>

                        <td>
                            ${adminEscape(id)}
                        </td>

                        <td>
                            ${adminEscape(userId)}
                        </td>

                        <td>
                            ${adminEscape(name)}
                        </td>

                        <td>
                            ${adminEscape(age)}
                        </td>

                        <td>
                            ${adminEscape(gender)}
                        </td>

                        <td>
                            <button
                                type="button"
                                class="admin-delete-btn"
                                onclick="deleteAdminPatient(${Number(id)})"
                            >
                                Delete
                            </button>
                        </td>

                    </tr>
                `;

            }
        ).join("");
}


/* ========================================
   DELETE PATIENT
======================================== */

async function deleteAdminPatient(
    patientId
) {

    if (!patientId) {
        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to delete this patient?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await adminRequest(
            `/api/admin/patients/${patientId}`,
            {
                method: "DELETE"
            }
        );


        alert(
            "Patient deleted successfully."
        );


        await Promise.all([
            loadAdminDashboard(),
            loadAdminPatients(),
            loadAdminPredictions()
        ]);


    } catch (error) {

        console.error(
            "Delete patient error:",
            error
        );

        alert(
            error.message
        );
    }
}


/* ========================================
   DELETE PREDICTION
======================================== */

async function deleteAdminPrediction(
    predictionId
) {

    if (!predictionId) {
        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to delete this prediction?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await adminRequest(
            `/api/admin/predictions/${predictionId}`,
            {
                method: "DELETE"
            }
        );


        alert(
            "Prediction deleted successfully."
        );


        await Promise.all([
            loadAdminDashboard(),
            loadAdminPredictions()
        ]);


    } catch (error) {

        console.error(
            "Delete prediction error:",
            error
        );

        alert(
            error.message
        );
    }
}


/* ========================================
   ADMIN SEARCH AND FILTERS
======================================== */

function initializeAdminFilters() {

    const userSearch =
        document.getElementById(
            "userSearch"
        );


    if (userSearch) {

        userSearch.addEventListener(
            "input",
            function () {

                renderAdminUsers();

            }
        );
    }


    const patientSearch =
        document.getElementById(
            "patientSearch"
        );


    if (patientSearch) {

        patientSearch.addEventListener(
            "input",
            function () {

                renderAdminPatients();

            }
        );
    }


    const predictionSearch =
        document.getElementById(
            "predictionSearch"
        );


    const diseaseFilter =
        document.getElementById(
            "diseaseFilter"
        );


    const riskFilter =
        document.getElementById(
            "riskFilter"
        );


    const dateFilter =
        document.getElementById(
            "dateFilter"
        );


    if (predictionSearch) {

        predictionSearch.addEventListener(
            "input",
            renderAllPredictions
        );
    }


    if (diseaseFilter) {

        diseaseFilter.addEventListener(
            "change",
            renderAllPredictions
        );
    }


    if (riskFilter) {

        riskFilter.addEventListener(
            "change",
            renderAllPredictions
        );
    }


    if (dateFilter) {

        dateFilter.addEventListener(
            "change",
            renderAllPredictions
        );
    }
}


/* ========================================
   REFRESH ADMIN DASHBOARD
======================================== */

function initializeAdminRefresh() {

    const refreshBtn =
        document.getElementById(
            "refreshAdminBtn"
        );


    if (!refreshBtn) {
        return;
    }


    refreshBtn.addEventListener(
        "click",
        async function () {

            refreshBtn.disabled =
                true;


            refreshBtn.classList.add(
                "loading"
            );


            hideAdminError();


            try {

                await Promise.all([

                    loadAdminDashboard(),

                    loadAdminUsers(),

                    loadAdminPatients(),

                    loadAdminPredictions()

                ]);

            } catch (error) {

                console.error(
                    "Admin refresh error:",
                    error
                );

            } finally {

                refreshBtn.disabled =
                    false;

                refreshBtn.classList.remove(
                    "loading"
                );
            }

        }
    );
}


/* ========================================
   ADMIN INITIALIZATION
======================================== */

async function initializeAdminDashboard() {

    if (
        window.location.pathname !==
        "/admin"
    ) {

        return;
    }


    console.log(
        "Admin dashboard initialized."
    );


    hideAdminError();


    loadAdminName();


    initializeAdminNavigation();

    initializeAdminMobileMenu();

    initializeAdminLogout();

    initializeAdminFilters();

    initializeAdminRefresh();


    showAdminSection(
        "dashboard"
    );


    await Promise.all([

        loadAdminDashboard(),

        loadAdminUsers(),

        loadAdminPatients(),

        loadAdminPredictions()

    ]);
}


/* ========================================
   ADMIN DOM READY
======================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        try {

            await initializeAdminDashboard();

        } catch (error) {

            console.error(
                "Admin initialization error:",
                error
            );

            showAdminError(
                error.message
            );
        }

    }
);