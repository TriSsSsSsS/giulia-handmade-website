// Configuration
const ASSETS_BASE_URL = 'https://TriSsSsSsS.github.io/giulia-handmade-assets';

// DOM Elements
const gridElement = document.querySelector('.product-grid');
const modal = document.getElementById('product-modal');
const closeModalBtn = document.querySelector('.close-modal');
const filtersContainer = document.querySelector('.filters');
const cursor = document.querySelector('.cursor');

// State
let products = [];
let iso;
let swiper;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initSmoothScroll();
    initCustomCursor();
    fetchProducts();
    setupEventListeners();
    initScrollAnimations();
});

// Preloader Animation
function initPreloader() {
    const tl = gsap.timeline();

    tl.to('.preloader-text', {
        opacity: 1,
        duration: 1,
        y: 0,
        ease: 'power3.out'
    })
        .to('.preloader-text', {
            opacity: 0,
            duration: 0.5,
            delay: 0.5
        })
        .to('.preloader', {
            height: 0,
            duration: 1,
            ease: 'power3.inOut'
        });
}

// Smooth Scroll (Lenis)
function initSmoothScroll() {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
}

// Custom Cursor
function initCustomCursor() {
    document.addEventListener('mousemove', (e) => {
        gsap.to(cursor, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: 'power2.out'
        });
    });

    // Magnetic Buttons & Hover States
    const magneticElements = document.querySelectorAll('.magnetic');
    magneticElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
            gsap.to(el, { scale: 1.1, duration: 0.3 });
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
            gsap.to(el, { scale: 1, duration: 0.3 });
            gsap.to(el, { x: 0, y: 0, duration: 0.3 }); // Reset magnetic
        });

        // Magnetic Effect
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(el, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Text Reveal
    const splitTypes = document.querySelectorAll('.reveal-text');
    splitTypes.forEach((char, i) => {
        const text = new SplitType(char, { types: 'chars, words' });

        gsap.from(text.chars, {
            scrollTrigger: {
                trigger: char,
                start: 'top 80%',
                end: 'top 20%',
                scrub: false,
                markers: false
            },
            opacity: 0,
            y: 20,
            stagger: 0.05,
            duration: 0.8,
            ease: 'back.out(1.7)'
        });
    });

    // Parallax Images
    gsap.utils.toArray('.parallax-img').forEach((container, i) => {
        gsap.to(container, {
            backgroundPosition: `50% ${innerHeight / 2}px`,
            ease: "none",
            scrollTrigger: {
                trigger: container,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });
}

// Fetch Data
async function fetchProducts() {
    try {
        const response = await fetch(`${ASSETS_BASE_URL}/json/products.json`);
        products = await response.json();
        renderGrid(products);
    } catch (error) {
        console.error('Error loading products:', error);
        gridElement.innerHTML = '<p style="text-align:center; width:100%;">Failed to load products.</p>';
    }
}

// Render Grid
function renderGrid(items) {
    // Clear grid
    gridElement.innerHTML = '';

    items.forEach(product => {
        const item = document.createElement('div');
        // Add classes for filtering (Category, Colors, etc.)
        const classes = ['product-item'];
        if (product.category) classes.push(product.category);
        if (product.colors) classes.push(...product.colors);

        item.className = classes.join(' ');

        // Use first image or placeholder
        const imagePath = product.images && product.images.length > 0
            ? `${ASSETS_BASE_URL}/${product.images[0]}`
            : 'https://via.placeholder.com/400x400?text=No+Image';

        item.innerHTML = `
            <div class="product-card magnetic">
                <img src="${imagePath}" alt="${product.name}" class="product-img">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                </div>
            </div>
        `;

        item.addEventListener('click', () => openModal(product));

        // Add hover effect for cursor
        item.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        item.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));

        gridElement.appendChild(item);
    });

    // Initialize Isotope after images load
    setTimeout(() => {
        initIsotope();
    }, 100);
}

// Initialize Isotope
function initIsotope() {
    iso = new Isotope(gridElement, {
        itemSelector: '.product-item',
        layoutMode: 'masonry',
        percentPosition: true
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Filters
    filtersContainer.addEventListener('click', (e) => {
        if (!e.target.classList.contains('filter-btn')) return;

        // Update active class
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        // Filter isotope
        const filterValue = e.target.getAttribute('data-filter');
        iso.arrange({ filter: filterValue });
    });

    // Modal
    closeModalBtn.addEventListener('click', closeModal);
}

// Open Modal
function openModal(product) {
    // Populate details
    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-description').textContent = product.description;

    // Tags
    const tagsContainer = document.getElementById('modal-tags');
    tagsContainer.innerHTML = '';
    if (product.material) tagsContainer.innerHTML += `<span>${product.material}</span>`;
    if (product.style) product.style.forEach(s => tagsContainer.innerHTML += `<span>${s}</span>`);

    // Buy Button
    const buyBtn = document.getElementById('modal-buy-btn');
    buyBtn.href = product.linkVinted || '#';

    // Swiper Images
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    swiperWrapper.innerHTML = '';

    if (product.images && product.images.length > 0) {
        product.images.forEach(img => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `<img src="${ASSETS_BASE_URL}/${img}" alt="${product.name}">`;
            swiperWrapper.appendChild(slide);
        });
    } else {
        swiperWrapper.innerHTML = '<div class="swiper-slide"><img src="https://via.placeholder.com/400x400?text=No+Image"></div>';
    }

    // Show Modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Disable background scroll

    // Init Swiper
    if (swiper) swiper.destroy();
    swiper = new Swiper('.product-swiper', {
        pagination: {
            el: '.swiper-pagination',
        },
        loop: true
    });

    // Animation
    gsap.from('.modal-content', { y: 50, opacity: 0, duration: 0.3 });
}

// Close Modal
function closeModal() {
    gsap.to('.modal-content', {
        y: 50, opacity: 0, duration: 0.3, onComplete: () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            gsap.set('.modal-content', { clearProps: 'all' });
        }
    });
}
