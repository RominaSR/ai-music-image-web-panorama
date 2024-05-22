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
        playMessage.style.display = 'block'; // Mostrar el mensaje si la reproducción está bloqueada
    });

    // Iniciar los otros sonidos
    leftSound.play();
    centerSound.play();
    rightSound.play();
}

window.addEventListener('load', () => {
    playMusic();

    function centerImage() {
        const centerX = (image.clientWidth - container.clientWidth) / 2;
        container.scrollLeft = centerX;
    }

    // Asegurarse de que la imagen esté completamente cargada
    image.addEventListener('load', centerImage);
    if (image.complete) {
        centerImage();
    }

    // Ajustar el volumen de los sonidos según la posición del scroll
    container.addEventListener('scroll', adjustSoundVolumes);
});

function adjustSoundVolumes() {
    let scrollPosition = container.scrollLeft;
    let containerWidth = container.clientWidth;
    let imageWidth = image.clientWidth;

    // Calcular los tercios
    let thirdWidth = imageWidth / 3;

    // Ajustar volumen del sonido izquierdo
    if (scrollPosition < thirdWidth) {
        leftSound.volume = 1 - scrollPosition / thirdWidth;
        centerSound.volume = scrollPosition / thirdWidth;
    } else {
        leftSound.volume = 0;
    }

    // Ajustar volumen del sonido central
    if (scrollPosition >= thirdWidth && scrollPosition < 2 * thirdWidth) {
        centerSound.volume = 1 - Math.abs(scrollPosition - thirdWidth) / thirdWidth;
        if (scrollPosition < 1.5 * thirdWidth) {
            leftSound.volume = (1.5 * thirdWidth - scrollPosition) / thirdWidth;
        } else {
            rightSound.volume = (scrollPosition - 1.5 * thirdWidth) / thirdWidth;
        }
    } else if (scrollPosition < thirdWidth) {
        centerSound.volume = scrollPosition / thirdWidth;
    } else if (scrollPosition >= 2 * thirdWidth) {
        centerSound.volume = (2 * thirdWidth - scrollPosition) / thirdWidth;
    }

    // Ajustar volumen del sonido derecho
    if (scrollPosition >= 2 * thirdWidth) {
        rightSound.volume = (scrollPosition - 2 * thirdWidth) / thirdWidth;
        centerSound.volume = 1 - (scrollPosition - 2 * thirdWidth) / thirdWidth;
    } else {
        rightSound.volume = 0;
    }
}

// Permitir que el usuario inicie la música manualmente
document.body.addEventListener('click', () => {
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
