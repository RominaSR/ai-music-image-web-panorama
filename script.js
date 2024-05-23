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

// Set initial volume values
leftSound.volume = 0; // Mute left sound
centerSound.volume = 1; // Normal volume for center sound
rightSound.volume = 0; // Mute right sound

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

    // Log the current scroll position for debugging
    console.log(`Scroll Position: ${scrollPosition}`);
    alert(`Scroll Position: ${scrollPosition}`); // Debugging alert

    // Update volume for each audio element based on scroll position
    if (scrollPosition <= 679.6) {
        leftSound.volume = 1;
        centerSound.volume = 0;
        rightSound.volume = 0;
    } else if (scrollPosition > 679.6 && scrollPosition <= 749.6) {
        let factor = mapRange(scrollPosition, 679.6, 749.6, 1, 0);
        leftSound.volume = factor;
        centerSound.volume = 1 - factor;
        rightSound.volume = 0;
        console.log(`Crossfading left to center: leftVolume = ${leftSound.volume}, centerVolume = ${centerSound.volume}`);
        alert(`Crossfading left to center: leftVolume = ${leftSound.volume}, centerVolume = ${centerSound.volume}`); // Debugging alert
    } else if (scrollPosition > 749.6 && scrollPosition <= 1289) {
        leftSound.volume = 0;
        centerSound.volume = 1;
        rightSound.volume = 0;
    } else if (scrollPosition > 1289 && scrollPosition <= 1359) {
        let factor = mapRange(scrollPosition, 1289, 1359, 1, 0);
        centerSound.volume = factor;
        rightSound.volume = 1 - factor;
        leftSound.volume = 0;
        console.log(`Crossfading center to right: centerVolume = ${centerSound.volume}, rightVolume = ${rightSound.vo
