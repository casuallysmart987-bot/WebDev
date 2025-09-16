const words = ["Powerful ", "Versatile", "Stylish"];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingSpeed = 120;
const erasingSpeed = 60;
const delayBetweenWords = 1000;

function typeLoop() {
  const typewriter = document.getElementById("typewriter-text");
  if (!typewriter) return; // Safety check

  const currentWord = words[wordIndex];
  if (!isDeleting) {
    typewriter.textContent = currentWord.substring(0, charIndex + 1);
    charIndex++;
    if (charIndex === currentWord.length) {
      isDeleting = true;
      setTimeout(typeLoop, delayBetweenWords);
    } else {
      setTimeout(typeLoop, typingSpeed);
    }
  } else {
    typewriter.textContent = currentWord.substring(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      setTimeout(typeLoop, typingSpeed);
    } else {
      setTimeout(typeLoop, erasingSpeed);
    }
}
}

document.addEventListener("DOMContentLoaded", typeLoop);