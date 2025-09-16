const resultDiv = document.getElementById('result');

// ----- Local Login -----
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      resultDiv.textContent = `Login successful! Welcome ${data.name || data.email}`;
      resultDiv.style.color = 'green';
      setTimeout(() => {
        window.location.href = '/public/home.html'; // local account page
      }, 1000);
    } else {
      resultDiv.textContent = `Error: ${data.error}`;
    }
  } catch (err) {
    resultDiv.textContent = 'Network error';
    console.error(err);
  }
});

// ----- Google Login -----
document.getElementById('googleLoginBtn').addEventListener('click', () => {
  // Open popup window
  const width = 500;
  const height = 600;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  const popup = window.open(
    'http://localhost:3000/auth/google',
    'Google Login',
    `width=${width},height=${height},top=${top},left=${left}`
  );

  // Listen for message from popup
  window.addEventListener('message', (event) => {
    if (event.origin !== 'http://localhost:3000') return; // security
    if (event.data.success) {
      // Redirect parent page
      window.location.href = '/account.html';
    }
  });
});

const params = new URLSearchParams(window.location.search);
if (params.has('error')) {
  resultDiv.textContent = `Google login failed: ${params.get('error')}`;
}
