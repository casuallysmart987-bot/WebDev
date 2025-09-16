// DOM elements
const signupForm = document.getElementById('signupForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');
const resultDiv = document.getElementById('result');

// Password rules
const minLength = 6;
const hasLowercase = /[a-z]/;
const hasUppercase = /[A-Z]/;
const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

// Utility function to toggle class
function toggleRule(id, condition) {
  const el = document.getElementById(id);
  if (condition) {
    el.classList.remove('invalid');
    el.classList.add('valid');
  } else {
    el.classList.remove('valid');
    el.classList.add('invalid');
  }
}

// Validate name
nameInput.addEventListener('input', () => {
  toggleRule('rule-name', nameInput.value.trim().length > 0);
});

// Validate email
emailInput.addEventListener('input', () => {
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
  toggleRule('rule-email', valid);
});

// Validate password on typing
confirmInput.addEventListener('input', validatePassword);
passwordInput.addEventListener('input', () => validatePassword());

// Password validation function
function validatePassword() {
  const pwd = passwordInput.value;
  toggleRule('rule-length', pwd.length >= minLength);
  toggleRule('rule-lowercase', hasLowercase.test(pwd));
  toggleRule('rule-uppercase', hasUppercase.test(pwd));
  toggleRule('rule-special', hasSpecialChar.test(pwd));

  // Also check confirm password
  toggleRule('rule-match', pwd === confirmInput.value && pwd.length > 0);
}

// Form submit
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  validatePassword();
  // Check if all rules are valid
  const invalids = resultDiv.getElementsByClassName('invalid');
  if (invalids.length > 0) {
    alert('Please fix all errors before submitting.');
    return;
  }

  // Send to server
  try {
    const res = await fetch('http://localhost:3000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value
      })
    });
    if (!res.ok) {
      const errData = await response.json();
      return alert(errData.error || 'Signup failed');
    }
    window.location.href='/public/verify.html';
  } catch (err) {
    console.error(err);
    alert('Network error.');
  }
});

