// ========================================
// REGISTER
// ========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const message = document.getElementById("registerMessage");

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                message.textContent = data.message;
                message.style.color = "green";

                // Redirect to login after successful registration
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1000);
            } else {
                message.textContent = data.message;
                message.style.color = "red";
            }

        } catch (error) {
            console.error("Registration error:", error);
            message.textContent = "Something went wrong. Please try again.";
            message.style.color = "red";
        }
    });
}


// ========================================
// LOGIN
// ========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const message = document.getElementById("loginMessage");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {

                // Store JWT token
                localStorage.setItem("access_token", data.access_token);

                // Store user information
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                message.textContent = "Login successful!";
                message.style.color = "green";

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 700);

            } else {
                message.textContent = data.message;
                message.style.color = "red";
            }

        } catch (error) {
            console.error("Login error:", error);
            message.textContent = "Something went wrong. Please try again.";
            message.style.color = "red";
        }
    });
}


// ========================================
// LOGOUT
// ========================================

function logout() {

    // Remove stored login information
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    // Redirect to login page
    window.location.href = "/login";
}
