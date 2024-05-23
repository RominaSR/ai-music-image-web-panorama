let image = document.getElementById('panoramic-image');
let container = document.querySelector('.image-container');
let scrollPositionDisplay = document.getElementById('scroll-position');
let isDragging = false;
let startX;
let scrollLeft;

// Audio elements
let backgroundMusic = document.getElementById('background-music');
let leftSound = document.getElementById('left-sound');
let centerSound = document.getElementById('center-sound');
let rightSound = document.getElementById('right-sound');
let playMessage = document.getElementById('play-message');

// Store audio elements in an array
let audios = [leftSound, centerSound, rightSound];

// Set initial volume values
leftSound.volume = 0; // Mute left sound
centerSound.volume = 1; // Normal volume for center sound
rightSound.volume = 0; // Mute right sound

// Function to update volumes based on scroll position
function updateVolume() {
    let scrollPosition = container.scrollLeft;

    // Display scroll position
    scrollPositionDisplay.style.left = `${scrollPosition + 10}px`;
    scrollPositionDisplay.textContent = `Scroll Position: ${scrollPosition}`;

    // Update volume for each audio element based on scroll position
    if (scrollPosition <= 679.6) {
        leftSound.volume = 1;
        centerSound.volume = 0;
        rightSound.volume = 0;
    } else if (scrollPosition > 679.6 && scrollPosition <= 749.6) {
        let factor = (scrollPosition - 679.6) / (749.6 - 679.6);
        leftSound.volume = 1 - factor;
        centerSound.volume = factor;
        rightSound.volume = 0;
    } else if (scrollPosition > 749.6 && scrollPosition <= 1289) {
        leftSound.volume = 0;
        centerSound.volume = 1;
        rightSound.volume = 0;
    } else if (scrollPosition > 1289 && scrollPosition <= 1359) {
        let factor = (scrollPosition - 1289) / (1359 - 1289);
        leftSound.volume = 0;
        centerSound.volume = 1 - factor;
        rightSound.volume = factor;
    } else if (scrollPosition > 1359 && scrollPosition <= 2039) {
        leftSound.volume = 0;
        centerSound.volume = 0;
        rightSound.volume = 1;
    }

    // Log current volumes for debugging
    console.log(`scrollPosition: ${scrollPosition}, leftVolume: ${leftSound.volume}, centerVolume: ${centerSound.volume}, rightVolume: ${rightSound.volume}`);
}

// Play music function
function playMusic() {
    // Play all sounds initially to avoid blocking issues
    Promise.all([
        backgroundMusic.play().catch(error => console.log('Reproducción automática bloqueada:', error)),
        leftSound.play().catch(error => console.log('Reproducción automática bloqueada:', error)),
        centerSound.play().catch(error => console.log('Reproducción automática bloqueada:', error)),
        rightSound.play().catch(error => console.log('Reproducción automática bloqueada:', error))
    ]).then(() => {
        playMessage.style.display = 'none';
        container.addEventListener('scroll', updateVolume);
        updateVolume(); // Call once to set the initial volumes
    });
}

// Center the image on load
window.addEventListener('load', () => {
    function centerImage() {
        const centerX = (image.clientWidth - container.clientWidth) / 2;
        container.scrollLeft = centerX;
    }

    image.addEventListener('load', centerImage);
    if (image.complete) {
        centerImage();
    }
});

// Play music on user interaction
playMessage.addEventListener('click', () => {
    playMessage.style.display = 'none';
    if (backgroundMusic.paused) {
        playMusic();
    }
});

container.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
});

container.addEventListener('mouseleave', () => {
    isDragging = false;
});

container.addEventListener('mouseup', () => {
    isDragging = false;
});

container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 3;
    container.scrollLeft = scrollLeft - walk;
});

container.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
});

container.addEventListener('touchend', () => {
    isDragging = false;
});

container.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = (x - startX) * 3;
    container.scrollLeft = scrollLeft - walk;
});

container.addEventListener('scroll', () => {
    updateVolume();
    if (container.scrollLeft <= 0) {
        container.scrollLeft = 0;
    }
    if (container.scrollLeft + container.clientWidth >= image.clientWidth) {
        container.scrollLeft = image.clientWidth - container.clientWidth;
    }
});
