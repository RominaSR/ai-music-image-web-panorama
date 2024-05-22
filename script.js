let image = document.getElementById('panoramic-image');
let container = document.querySelector('.image-container');
let isDragging = false;
let startX;
let scrollLeft;

function centerImage() {
    container.scrollLeft = (image.clientWidth - container.clientWidth) / 2;
}

window.addEventListener('load', () => {
    centerImage();
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
    if(!isDragging) return;
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
    if(!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = (x - startX) * 3; //scroll-fast
    container.scrollLeft = scrollLeft - walk;
});

// Prevent scrolling beyond the edges
container.addEventListener('scroll', () => {
    if (container.scrollLeft <= 0) {
        container.scrollLeft = 0;
    }
    if (container.scrollLeft + container.clientWidth >= image.clientWidth) {
        container.scrollLeft = image.clientWidth - container.clientWidth;
    }
});
