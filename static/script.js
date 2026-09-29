
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

// kidney disease
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
            label: "NHR",
            type: "number",
            step: "any",
            placeholder:
                "Enter NHR"
        },

        {
            name: "HNR",
            label: "HNR",
            type: "number",
            step: "any",
            placeholder:
                "Enter HNR"
        },

        {
            name: "RPDE",
            label: "RPDE",
            type: "number",
            step: "any",
            placeholder:
                "Enter RPDE"
        },

        {
            name: "DFA",
            label: "DFA",
            type: "number",
            step: "any",
            placeholder:
                "Enter DFA"
        },

        {
            name: "spread1",
            label: "Spread 1",
            type: "number",
            step: "any",
            placeholder:
                "Enter spread1"
        },

        {
            name: "spread2",
            label: "Spread 2",
            type: "number",
            step: "any",
            placeholder:
                "Enter spread2"
        },

        {
            name: "D2",
            label: "D2",
            type: "number",
            step: "any",
            placeholder:
                "Enter D2"
        },

        {
            name: "PPE",
            label: "PPE",
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

        /*
         * UI shows Yes / No.
         * Backend receives 1 / 0.
         */

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


                /*
                 * Stroke binary fields:
                 *
                 * Yes -> 1
                 * No  -> 0
                 *
                 * The user sees Yes/No,
                 * but the backend receives
                 * numeric values.
                 */

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


    /*
     * Select values are already
     * prepared correctly.
     *
     * Stroke:
     * Yes = "1"
     * No  = "0"
     */

    return value;
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
            formatRisk(risk);


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
                Number(probability);


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
                    String(probability);
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
               VALIDATE PATIENT ID
            ==================================== */

            if (!patientId) {

                showError(
                    "Please enter the Patient ID."
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
                    "Patient ID must be a valid number."
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
   ADMIN DASHBOARD ANALYTICS
======================================== */

let adminPredictionChart =
    null;

let adminRiskChart =
    null;


/* ========================================
   ADMIN API REQUEST
======================================== */

async function adminRequest(
    url,
    options = {}
) {

    const token =
        getToken();


    if (!token) {

        throw new Error(
            "Admin login session not found."
        );
    }


    const headers = {

        "Content-Type":
            "application/json",

        ...(options.headers || {})
    };


    headers["Authorization"] =
        `Bearer ${token}`;


    const response =
        await fetch(
            url,
            {
                ...options,
                headers
            }
        );


    const data =
        await parseResponse(
            response
        );


    if (
        response.status === 401
    ) {

        removeToken();

        window.location.href =
            "/auth";

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
   DESTROY EXISTING CHARTS
======================================== */

function destroyAdminCharts() {

    if (
        adminPredictionChart
    ) {

        adminPredictionChart.destroy();

        adminPredictionChart =
            null;
    }


    if (
        adminRiskChart
    ) {

        adminRiskChart.destroy();

        adminRiskChart =
            null;
    }
}


/* ========================================
   CREATE PREDICTION BAR CHART
======================================== */

function createAdminPredictionChart(
    predictions
) {

    const canvas =
        document.getElementById(
            "predictionChart"
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


    const diseaseCounts = {

        diabetes: 0,

        heart: 0,

        kidney: 0,

        liver: 0,

        parkinsons: 0,

        stroke: 0
    };


    if (
        Array.isArray(
            predictions
        )
    ) {

        predictions.forEach(
            function (prediction) {

                const disease =
                    String(
                        prediction.disease ||
                        ""
                    )
                        .toLowerCase()
                        .trim();


                if (
                    disease.includes(
                        "diabetes"
                    )
                ) {

                    diseaseCounts.diabetes++;

                } else if (
                    disease.includes(
                        "heart"
                    )
                ) {

                    diseaseCounts.heart++;

                } else if (
                    disease.includes(
                        "kidney"
                    )
                ) {

                    diseaseCounts.kidney++;

                } else if (
                    disease.includes(
                        "liver"
                    )
                ) {

                    diseaseCounts.liver++;

                } else if (
                    disease.includes(
                        "parkinson"
                    )
                ) {

                    diseaseCounts.parkinsons++;

                } else if (
                    disease.includes(
                        "stroke"
                    )
                ) {

                    diseaseCounts.stroke++;
                }

            }
        );
    }


    const labels = [

        "Diabetes",

        "Heart Disease",

        "Kidney Disease",

        "Liver Disease",

        "Parkinson's Disease",

        "Stroke"
    ];


    const values = [

        diseaseCounts.diabetes,

        diseaseCounts.heart,

        diseaseCounts.kidney,

        diseaseCounts.liver,

        diseaseCounts.parkinsons,

        diseaseCounts.stroke
    ];


    adminPredictionChart =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels:
                        labels,

                    datasets: [

                        {
                            label:
                                "Total Predictions",

                            data:
                                values,

                            borderWidth:
                                1,

                            borderRadius:
                                8
                        }

                    ]
                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display:
                                false
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            " Predictions: " +
                                            context.raw
                                        );
                                    }
                            }
                        }
                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                precision:
                                    0,

                                stepSize:
                                    1
                            }
                        },

                        x: {

                            ticks: {

                                maxRotation:
                                    0,

                                minRotation:
                                    0
                            }
                        }
                    }
                }
            }
        );
}


/* ========================================
   CREATE RISK DOUGHNUT CHART
======================================== */

function createAdminRiskChart(
    statistics
) {

    const canvas =
        document.getElementById(
            "riskChart"
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


    const low =
        Number(
            statistics?.low_risk ||
            0
        );


    const medium =
        Number(
            statistics?.medium_risk ||
            0
        );


    const high =
        Number(
            statistics?.high_risk ||
            0
        );


    adminRiskChart =
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
                            label:
                                "Risk Distribution",

                            data: [
                                low,
                                medium,
                                high
                            ],

                            borderWidth:
                                2,

                            hoverOffset:
                                8
                        }

                    ]
                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    cutout:
                        "65%",

                    plugins: {

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                padding:
                                    18,

                                usePointStyle:
                                    true
                            }
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        const total =
                                            context
                                                .dataset
                                                .data
                                                .reduce(
                                                    function (
                                                        sum,
                                                        value
                                                    ) {

                                                        return (
                                                            sum +
                                                            Number(
                                                                value
                                                            )
                                                        );

                                                    },
                                                    0
                                                );


                                        const value =
                                            Number(
                                                context.raw
                                            );


                                        let percentage =
                                            0;


                                        if (
                                            total > 0
                                        ) {

                                            percentage =
                                                (
                                                    value /
                                                    total
                                                ) *
                                                100;
                                        }


                                        return (
                                            " " +
                                            context.label +
                                            ": " +
                                            value +
                                            " (" +
                                            percentage.toFixed(
                                                1
                                            ) +
                                            "%)"
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
   LOAD ADMIN DASHBOARD CHARTS
======================================== */

async function loadAdminDashboardCharts() {

    /*
     * Only run on admin page.
     */

    if (
        window.location.pathname !==
        "/admin"
    ) {

        return;
    }


    const predictionCanvas =
        document.getElementById(
            "predictionChart"
        );


    const riskCanvas =
        document.getElementById(
            "riskChart"
        );


    if (
        !predictionCanvas &&
        !riskCanvas
    ) {

        console.log(
            "Admin chart containers not found."
        );

        return;
    }


    try {

        const dashboardData =
            await adminRequest(
                "/api/admin/dashboard"
            );


        const predictionData =
            await adminRequest(
                "/api/admin/predictions"
            );


        const statistics =
            dashboardData.statistics ||
            dashboardData.data ||
            {};


        const predictions =
            predictionData.predictions ||
            [];


        console.log(
            "Admin dashboard statistics:",
            statistics
        );


        console.log(
            "Admin predictions:",
            predictions
        );


        destroyAdminCharts();


        createAdminPredictionChart(
            predictions
        );


        createAdminRiskChart(
            statistics
        );


    } catch (error) {

        console.error(
            "Admin dashboard chart error:",
            error
        );
    }
}


/* ========================================
   ADMIN DASHBOARD INITIALIZATION
======================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (
            window.location.pathname !==
            "/admin"
        ) {

            return;
        }


        console.log(
            "Admin dashboard initialized."
        );


        loadAdminDashboardCharts();

    }
);
