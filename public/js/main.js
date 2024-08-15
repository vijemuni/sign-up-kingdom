//main.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const verifyCodeForm = document.getElementById('verifyCodeForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }

    if (verifyCodeForm) {
        verifyCodeForm.addEventListener('submit', handleVerifyCode);
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPassword);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.location.href = data.redirectUrl;
        } else {
            showAlert(data.message, 'danger');
        }
    } catch (error) {
        showAlert('An error occurred. Please try again.', 'danger');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Signup successful. Please login.', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            showAlert(data.message, 'danger');
        }
    } catch (error) {
        showAlert('An error occurred. Please try again.', 'danger');
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;

    try {
        const response = await fetch('/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('resetUserId', data.userId);
            showAlert('Verification code sent. Please check your email.', 'success');
            window.location.href = '/verify-code';
        } else {
            showAlert(data.message, 'danger');
        }
    } catch (error) {
        showAlert('An error occurred. Please try again.', 'danger');
    }
}

async function handleVerifyCode(e) {
    e.preventDefault();
    const code = document.getElementById('verificationCode').value;
    const userId = localStorage.getItem('resetUserId');

    try {
        const response = await fetch('/auth/verify-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, code })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('resetToken', data.token);
            showAlert('Code verified. Please reset your password.', 'success');
            window.location.href = '/reset-password';
        } else {
            showAlert(data.message, 'danger');
        }
    } catch (error) {
        showAlert('An error occurred. Please try again.', 'danger');
    }
}

async function handleResetPassword(e) {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const token = localStorage.getItem('resetToken');

    if (newPassword !== confirmPassword) {
        showAlert('Passwords do not match.', 'danger');
        return;
    }

    try {
        const response = await fetch('/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Password reset successful. Please login with your new password.', 'success');
            localStorage.removeItem('resetUserId');
            localStorage.removeItem('resetToken');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            showAlert(data.message, 'danger');
        }
    } catch (error) {
        showAlert('An error occurred. Please try again.', 'danger');
    }
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.role = 'alert';
    alertDiv.textContent = message;

    const form = document.querySelector('form');
    form.parentNode.insertBefore(alertDiv, form);

    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}