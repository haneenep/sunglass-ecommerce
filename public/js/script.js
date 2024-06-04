document.addEventListener("DOMContentLoaded", function() {
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const submitBtn = document.getElementById("submitBtn");

    function validateName() {
        const name = nameInput.value.trim();
        const nameError = document.getElementById("name-error");
        if (name === "" || /\s/.test(name)) {
            nameError.textContent = "Name is required and cannot contain spaces";
            return false;
        } else {
            nameError.textContent = "";
            return true;
        }
    }

    function validateEmail() {
        const email = emailInput.value.trim();
        const emailError = document.getElementById("email-error");
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            emailError.textContent = "Valid email is required: ex@abc.xyz";
            return false;
        } else {
            emailError.textContent = "";
            return true;
        }
    }

    function validatePassword() {
        const password = passwordInput.value;
        const passwordError = document.getElementById("password-error");
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*\W).{8,}$/;
        if (!passwordRegex.test(password)) {
            passwordError.textContent = "Password must be at least 8 characters,contain at least one uppercase letter,1 number and 1 special character";
            return false;
        } else {
            passwordError.textContent = ""; 
            return true;
        }
    }

    function validateConfirmPassword() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const confirmPasswordError = document.getElementById("confirmPassword-error");
        if (confirmPassword !== password) {
            confirmPasswordError.textContent = "Passwords not match";
            return false;
        } else {
            confirmPasswordError.textContent = "";
            return true;
        }
    }

    function validateForm() {
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();

        submitBtn.disabled = !(isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid);
    }

    nameInput.addEventListener("input", validateForm);
    emailInput.addEventListener("input", validateForm);
    passwordInput.addEventListener("input", validateForm);
    confirmPasswordInput.addEventListener("input", validateForm);

    document.getElementById("signupForm").addEventListener("submit", function(event) {
        if (submitBtn.disabled) {
            event.preventDefault();
        }
    });
});


// ..............



