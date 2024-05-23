let image = document.getElementById('panoramic-image');
let container = document.querySelector('.image-container');
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

    // Calcular los tercios
    let thirdWidth = imageWidth / 3;

    // Calcular la posición central de la vista
    let viewCenter = scrollPosition + containerWidth / 2;

    console.log(`scrollPosition: ${scrollPosition}, viewCenter: ${viewCenter}, thirdWidth: ${thirdWidth}`);

    // Ajustar volumen del sonido izquierdo
    if (viewCenter < thirdWidth) {
        leftSound.volume = 1;
        centerSound.volume = 0;
        rightSound.volume = 0;
    } else if (viewCenter >= thirdWidth && viewCenter < 2 * thirdWidth) {
        let relativePosition = (viewCenter - thirdWidth) / thirdWidth;
        leftSound.volume = Math.max(0, 1 - relativePosition);
        centerSound.volume = Math.max(0, relativePosition);
        rightSound.volume = 0;
    } else if (viewCenter >= 2 * thirdWidth) {
        let relativePosition = (viewCenter - 2 * thirdWidth) / thirdWidth;
        centerSound.volume = Math.max(0, 1 - relativePosition);
        rightSound.volume = Math.max(0, relativePosition);
        leftSound.volume = 0;
    }
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
    if (container.scrollLeft <= 0) {
        container.scrollLeft = 0;
    }
    if (container.scrollLeft + container.clientWidth >= image.clientWidth) {
        container.scrollLeft = image.clientWidth - container.clientWidth;
    }
});
