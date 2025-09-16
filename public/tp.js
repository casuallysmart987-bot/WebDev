const signupForm = document.getElementById('signupForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');
const resultDiv = document.getElementById('result');

const minLength = 6;
const hasLowercase = /[a-z]/;
const hasUppercase = /[A-Z]/;
const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

// Helper function to set rule class
function setRule(id, isValid) {
  const el = document.getElementById(id);
  el.classList.remove('neutral','invalid','valid');
  el.classList.add(isValid ? 'valid' : 'invalid');
}

// Validate Name
nameInput.addEventListener('focus', () => {
  if (nameInput.value.trim() === '') setRule('rule-name', false);
});
nameInput.addEventListener('input', () => setRule('rule-name', nameInput.value.trim() !== ''));

// Validate Email
emailInput.addEventListener('focus', () => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) setRule('rule-email', false);
});
emailInput.addEventListener('input', () => setRule('rule-email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)));

// Validate Password
passwordInput.addEventListener('focus', () => {
  setRule('rule-length', passwordInput.value.length >= minLength);
  setRule('rule-lowercase', hasLowercase.test(passwordInput.value));
  setRule('rule-uppercase', hasUppercase.test(passwordInput.value));
  setRule('rule-special', hasSpecialChar.test(passwordInput.value));
});
passwordInput.addEventListener('input', () => {
  const pwd = passwordInput.value;
  setRule('rule-length', pwd.length >= minLength);
  setRule('rule-lowercase', hasLowercase.test(pwd));
  setRule('rule-uppercase', hasUppercase.test(pwd));
  setRule('rule-special', hasSpecialChar.test(pwd));

  // Validate confirm password live
  setRule('rule-match', pwd === confirmInput.value && confirmInput.value.length > 0);
});

// Validate Confirm Password
confirmInput.addEventListener('focus', () => {
  setRule('rule-match', passwordInput.value === confirmInput.value && confirmInput.value.length > 0);
});
confirmInput.addEventListener('input', () => setRule('rule-match', passwordInput.value === confirmInput.value && confirmInput.value.length > 0));

// Submit Form

const form = document.getElementById('signupForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();

  let canSubmit = true;

  const fields = document.querySelectorAll('.field');

  fields.forEach(field => {
    const ruleMessages = field.querySelectorAll('p');
    let isValid = true;

    ruleMessages.forEach(p => {
      if (!p.classList.contains('valid')) {
        isValid = false;
      }
    });

    if (!isValid) {
      canSubmit = false;

      const input = field.querySelector('input');
      if (input) {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 300);
        resultDiv.classList.add('shake');
        setTimeout(() => {
          resultDiv.classList.remove('shake');
        }, 300);

      }
    }
  });

  if (!canSubmit) {
    resultDiv.textContent = 'Please fix all errors before submitting.';
    return;
  }

  // Proceed with form submission or success logic
  resultDiv.textContent = 'Form submitted successfully!';
});
