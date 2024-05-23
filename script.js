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

// Crear elementos observables
const leftSection = document.createElement('div');
leftSection.style.position = 'absolute';
leftSection.style.left = '0';
leftSection.style.top = '0';
leftSection.style.width = '33.33%';
leftSection.style.height = '100%';

const centerSection = document.createElement('div');
centerSection.style.position = 'absolute';
centerSection.style.left = '33.33%';
centerSection.style.top = '0';
centerSection.style.width = '33.33%';
centerSection.style.height = '100%';

const rightSection = document.createElement('div');
rightSection.style.position = 'absolute';
rightSection.style.left = '66.66%';
rightSection.style.top = '0';
rightSection.style.width = '33.33%';
rightSection.style.height = '100%';

image.parentElement.appendChild(leftSection);
image.parentElement.appendChild(centerSection);
image.parentElement.appendChild(rightSection);

const observerOptions = {
    root: container,
    rootMargin: '0px',
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target === leftSection) {
                leftSound.volume = 1;
                centerSound.volume = 0;
                rightSound.volume = 0;
            } else if (entry.target === centerSection) {
                leftSound.volume = 0;
                centerSound.volume = 1;
                rightSound.volume = 0;
            } else if (entry.target === rightSection) {
                leftSound.volume = 0;
                centerSound.volume = 0;
                rightSound.volume = 1;
            }
        }
    });
}, observerOptions);

observer.observe(leftSection);
observer.observe(centerSection);
observer.observe(rightSection);

function adjustSoundVolumes() {
    // Dejar vacío o usar como sea necesario
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
