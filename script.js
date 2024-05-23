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

// Create AudioContext
let audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Create GainNodes
let leftGain = audioContext.createGain();
let centerGain = audioContext.createGain();
let rightGain = audioContext.createGain();

// Set initial gain values
leftGain.gain.value = 0;
centerGain.gain.value = 1;
rightGain.gain.value = 0;

// Function to connect audio elements to GainNodes
function connectAudioElementToGainNode(audioElement, gainNode) {
    let source = audioContext.createMediaElementSource(audioElement);
    source.connect(gainNode).connect(audioContext.destination);
}

// Connect audio elements to GainNodes
connectAudioElementToGainNode(leftSound, leftGain);
connectAudioElementToGainNode(centerSound, centerGain);
connectAudioElementToGainNode(rightSound, rightGain);

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
        container.addEventListener('scroll', adjustSoundVolumes);
        adjustSoundVolumes(); // Call once to set the initial volumes
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

function adjustSoundVolumes() {
    let scrollPosition = container.scrollLeft;

    // Display scroll position
    scrollPositionDisplay.style.left = `${scrollPosition + 10}px`;
    scrollPositionDisplay.textContent = `Scroll Position: ${scrollPosition}`;

    let leftVolume = 0;
    let centerVolume = 1;
    let rightVolume = 0;

    if (scrollPosition <= 679.6) {
        leftVolume = 1;
        centerVolume = 0;
    } else if (scrollPosition <= 749.6) {
        let factor = (scrollPosition - 679.6) / (749.6 - 679.6);
        leftVolume = 1 - factor;
        centerVolume = factor;
    } else if (scrollPosition <= 1289) {
        centerVolume = 1;
    } else if (scrollPosition <= 1359) {
        let factor = (scrollPosition - 1289) / (1359 - 1289);
        centerVolume = 1 - factor;
        rightVolume = factor;
    } else if (scrollPosition > 1359) {
        rightVolume = 1;
    }

    // Update gain values
    leftGain.gain.setValueAtTime(leftVolume, audioContext.currentTime);
    centerGain.gain.setValueAtTime(centerVolume, audioContext.currentTime);
    rightGain.gain.setValueAtTime(rightVolume, audioContext.currentTime);

    console.log(`scrollPosition: ${scrollPosition}, leftVolume: ${leftVolume}, centerVolume: ${centerVolume}, rightVolume: ${rightVolume}`);
}

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
    adjustSoundVolumes();
    if (container.scrollLeft <= 0) {
        container.scrollLeft = 0;
    }
    if (container.scrollLeft + container.clientWidth >= image.clientWidth) {
        container.scrollLeft = image.clientWidth - container.clientWidth;
    }
});
