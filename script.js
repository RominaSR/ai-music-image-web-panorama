let image = document.getElementById('panoramic-image');
let container = document.querySelector('.image-container');
let scrollPositionDisplay = document.getElementById('scroll-position');
let isDragging = false;
let startX;
let scrollLeft;

// Create audio context
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext = new AudioContext();

// Audio elements
let backgroundMusic = document.getElementById('background-music');
let leftSound = document.getElementById('left-sound');
let centerSound = document.getElementById('center-sound');
let rightSound = document.getElementById('right-sound');
let playMessage = document.getElementById('play-message');

// Create media element sources
let backgroundSource = audioContext.createMediaElementSource(backgroundMusic);
let leftSource = audioContext.createMediaElementSource(leftSound);
let centerSource = audioContext.createMediaElementSource(centerSound);
let rightSource = audioContext.createMediaElementSource(rightSound);

// Create gain nodes
let backgroundGain = audioContext.createGain();
let leftGain = audioContext.createGain();
let centerGain = audioContext.createGain();
let rightGain = audioContext.createGain();

// Connect sources to gain nodes
backgroundSource.connect(backgroundGain).connect(audioContext.destination);
leftSource.connect(leftGain).connect(audioContext.destination);
centerSource.connect(centerGain).connect(audioContext.destination);
rightSource.connect(rightGain).connect(audioContext.destination);

// Set initial gain values
backgroundGain.gain.value = 1;
leftGain.gain.value = 0; // Mute left sound
centerGain.gain.value = 1; // Normal volume for center sound
rightGain.gain.value = 0; // Mute right sound

// Function to map a value from one range to another
function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// Function to update volumes based on scroll position
function updateVolume() {
    let scrollPosition = container.scrollLeft;

    // Display scroll position
    scrollPositionDisplay.style.left = `${scrollPosition + 10}px`;
    scrollPositionDisplay.textContent = `Scroll Position: ${scrollPosition}`;

    // Update volume for each audio element based on scroll position
    if (scrollPosition <= 679.6) {
        leftGain.gain.value = 1;
        centerGain.gain.value = 0;
        rightGain.gain.value = 0;
    } else if (scrollPosition > 679.6 && scrollPosition <= 749.6) {
        let factor = mapRange(scrollPosition, 679.6, 749.6, 1, 0);
        leftGain.gain.value = factor;
        centerGain.gain.value = 1 - factor;
        rightGain.gain.value = 0;
    } else if (scrollPosition > 749.6 && scrollPosition <= 1289) {
        leftGain.gain.value = 0;
        centerGain.gain.value = 1;
        rightGain.gain.value = 0;
    } else if (scrollPosition > 1289 && scrollPosition <= 1359) {
        let factor = mapRange(scrollPosition, 1289, 1359, 1, 0);
        centerGain.gain.value = factor;
        rightGain.gain.value = 1 - factor;
        leftGain.gain.value = 0;
    } else if (scrollPosition > 1359 && scrollPosition <= 2039) {
        leftGain.gain.value = 0;
        centerGain.gain.value = 0;
        rightGain.gain.value = 1;
    }
}

// Play music function
function playMusic() {
    // Resume audio context if it's suspended
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

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
    playMusic();
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
