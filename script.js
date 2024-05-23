let image = document.getElementById('panoramic-image');
let container = document.querySelector('.image-container');
let scrollPositionDisplay = document.getElementById('scroll-position');
let isDragging = false;
let startX;
let scrollLeft;

let playMessage = document.getElementById('play-message');

// Initialize Howl objects for each sound
let backgroundMusic = new Howl({
    src: ['https://cdn.glitch.global/4eaf3a50-5bc4-42c1-9d47-a1db4ac88667/Ambiance_musique_app_impressionniste_musique.mp3?v=1716415645214'],
    loop: true,
    volume: 1
});

let leftSound = new Howl({
    src: ['https://cdn.glitch.global/4eaf3a50-5bc4-42c1-9d47-a1db4ac88667/Left_birds_app_impressionniste_musique.mp3?v=1716415536747'],
    loop: true,
    volume: 0
});

let centerSound = new Howl({
    src: ['https://cdn.glitch.global/4eaf3a50-5bc4-42c1-9d47-a1db4ac88667/Center_wind_app_impressionniste_musique.mp3?v=1716415536489'],
    loop: true,
    volume: 1
});

let rightSound = new Howl({
    src: ['https://cdn.glitch.global/4eaf3a50-5bc4-42c1-9d47-a1db4ac88667/Right_water_app_impressionniste_musique.mp3?v=1716415536988'],
    loop: true,
    volume: 0
});

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
        leftSound.volume(1);
        centerSound.volume(0);
        rightSound.volume(0);
    } else if (scrollPosition > 679.6 && scrollPosition <= 749.6) {
        let factor = mapRange(scrollPosition, 679.6, 749.6, 1, 0);
        leftSound.volume(factor);
        centerSound.volume(1 - factor);
        rightSound.volume(0);
    } else if (scrollPosition > 749.6 && scrollPosition <= 1289) {
        leftSound.volume(0);
        centerSound.volume(1);
        rightSound.volume(0);
    } else if (scrollPosition > 1289 && scrollPosition <= 1359) {
        let factor = mapRange(scrollPosition, 1289, 1359, 1, 0);
        centerSound.volume(factor);
        rightSound.volume(1 - factor);
        leftSound.volume(0);
    } else if (scrollPosition > 1359 && scrollPosition <= 2039) {
        leftSound.volume(0);
        centerSound.volume(0);
        rightSound.volume(1);
    }
}

// Play music function
function playMusic() {
    backgroundMusic.play();
    leftSound.play();
    centerSound.play();
    rightSound.play();
    playMessage.style.display = 'none';
    container.addEventListener('scroll', updateVolume);
    updateVolume(); // Call once to set the initial volumes
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
