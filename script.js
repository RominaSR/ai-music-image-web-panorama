let image = document.getElementById('panoramic-image');
let container = document.querySelector('.image-container');
let scrollPositionDisplay = document.getElementById('scroll-position');
let isDragging = false;
let startX;
let scrollLeft;

// Música de ambiente
let backgroundMusic = document.getElementById('background-music');
let leftSound = document.getElementById('left-sound');
let centerSound = document.getElementById('center-sound');
let rightSound = document.getElementById('right-sound');
let playMessage = document.getElementById('play-message');

// Intentar reproducir la música automáticamente
function playMusic() {
    backgroundMusic.play().then(() => {
        playMessage.style.display = 'none'; // Ocultar el mensaje si la reproducción es exitosa
    }).catch(error => {
        console.log('Reproducción automática bloqueada:', error);
    });

    // Iniciar los otros sonidos
    leftSound.play();
    centerSound.play();
    rightSound.play();

    // Ajustar el volumen de los sonidos según la posición del scroll
    container.addEventListener('scroll', adjustSoundVolumes);
}

window.addEventListener('load', () => {
    function centerImage() {
        const centerX = (image.clientWidth - container.clientWidth) / 2;
        container.scrollLeft = centerX;
    }

    // Asegurarse de que la imagen esté completamente cargada
    image.addEventListener('load', centerImage);
    if (image.complete) {
        centerImage();
    }
});

// Permitir que el usuario inicie la música manualmente
playMessage.addEventListener('click', () => {
    playMessage.style.display = 'none';
    if (backgroundMusic.paused) {
        playMusic();
    }
});

function adjustSoundVolumes() {
    let scrollPosition = container.scrollLeft;
    let containerWidth = container.clientWidth;
    let imageWidth = image.clientWidth;

    // Mostrar la posición del desplazamiento
    scrollPositionDisplay.style.left = `${scrollPosition + 10}px`;
    scrollPositionDisplay.textContent = `Scroll Position: ${scrollPosition}`;

    // Volúmenes iniciales
    let leftVolume = 0;
    let centerVolume = 1;
    let rightVolume = 0;

    // Ajustar volumen del sonido central y izquierdo
    if (scrollPosition <= 679.6) {
        leftVolume = 1;
        centerVolume = 0;
    } else if (scrollPosition <= 749.6) {
        let factor = (scrollPosition - 679.6) / (749.6 - 679.6);
        leftVolume = 1 - factor;
        centerVolume = factor;
    } else if (scrollPosition >= 749.6 && scrollPosition <= 1289) {
        centerVolume = 1;
        leftVolume = 0;
        rightVolume = 0;
    } else if (scrollPosition >= 1289 && scrollPosition <= 1359) {
        let factor = (scrollPosition - 1289) / (1359 - 1289);
        centerVolume = 1 - factor;
        rightVolume = factor;
    } else if (scrollPosition > 1359) {
        centerVolume = 0;
        rightVolume = 1;
    }

    // Aplicar volúmenes
    leftSound.volume = Math.min(Math.max(leftVolume, 0), 1);
    centerSound.volume = Math.min(Math.max(centerVolume, 0), 1);
    rightSound.volume = Math.min(Math.max(rightVolume, 0), 1);
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
    const walk = (x - startX) * 3; //scroll-fast
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
    const walk = (x - startX) * 3; //scroll-fast
    container.scrollLeft = scrollLeft - walk;
});

// Prevenir desplazamiento más allá de los bordes
container.addEventListener('scroll', () => {
    adjustSoundVolumes();
    if (container.scrollLeft <= 0) {
        container.scrollLeft = 0;
    }
    if (container.scrollLeft + container.clientWidth >= image.clientWidth) {
        container.scrollLeft = image.clientWidth - container.clientWidth;
    }
});
