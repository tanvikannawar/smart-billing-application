// Show/Hide Password
function togglePassword() {

    const password = document.getElementById("password");
    const eyeIcon = document.getElementById("eyeIcon");

    if (password.type === "password") {
        password.type = "text";
        eyeIcon.classList.remove("bi-eye");
        eyeIcon.classList.add("bi-eye-slash");
    } else {
        password.type = "password";
        eyeIcon.classList.remove("bi-eye-slash");
        eyeIcon.classList.add("bi-eye");
    }
}

// Login Function
async function login() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMessage = document.getElementById("errorMessage");

    errorMessage.classList.add("d-none");

    if (username === "" || password === "") {

        errorMessage.innerHTML = "Please enter Username and Password";
        errorMessage.classList.remove("d-none");
        return;
    }

    try {

        const response = await fetch("/api/auth/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username: username,
                password: password
            })

        });

        if (response.ok) {

            const result = await response.json();

            sessionStorage.setItem("loggedInUser", result.username);

            window.location.href = "index.html";

        } else {

            errorMessage.innerHTML = "Invalid Username or Password";
            errorMessage.classList.remove("d-none");
        }

    } catch (error) {

        errorMessage.innerHTML = "Server Error!";
        errorMessage.classList.remove("d-none");
    }

}

// Press Enter to Login
document.addEventListener("keydown", function(event){

    if(event.key === "Enter"){
        login();
    }

});