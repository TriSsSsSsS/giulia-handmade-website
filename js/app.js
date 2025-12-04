// Configuration
const ASSETS_BASE_URL = 'https://TriSsSsSsS.github.io/giulia-handmade-assets';

// DOM Elements
const gridElement = document.querySelector('.product-grid');
const modal = document.getElementById('product-modal');
const closeModalBtn = document.querySelector('.close-modal');
const filtersContainer = document.querySelector('.filters');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const featuredWrapper = document.getElementById('featured-wrapper');

// State
let products = [];
let iso;
let swiper;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initHamburgerMenu();
    initSmoothScroll();
    fetchProducts();
    setupEventListeners();
    initScrollAnimations();
    initScrollIndicator();
});

// Hamburger Menu
function initHamburgerMenu() {
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
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
}

// Fetch Data
async function fetchProducts() {
    try {
        const response = await fetch(`${ASSETS_BASE_URL}/json/products.json?t=${Date.now()}`);
        products = await response.json();
        
        // Render grid only if element exists (collezione page)
        if (gridElement) {
            renderGrid(products);
        }
        
        // Render featured carousel only if element exists (index page)
        if (featuredWrapper) {
            renderFeaturedProducts(products);
        }
    } catch (error) {
        console.error('Errore nel caricamento dei prodotti:', error);
        if (gridElement) {
            gridElement.innerHTML = '<p style="text-align:center; width:100%; color: red;">Impossibile caricare i prodotti. Riprova più tardi.</p>';
        }
    } finally {
        console.log('Fetch products completed. Products count:', products.length);
        if (gridElement && products.length === 0) {
            gridElement.innerHTML = '<p style="text-align:center; width:100%;">Nessun prodotto trovato.</p>';
        }
    }
}

// Render Grid
function renderGrid(items) {
    gridElement.innerHTML = '';

    items.forEach(product => {
        const item = document.createElement('div');
        // Add classes for filtering by material
        const classes = ['product-item'];
        if (product.material) classes.push(product.material);
        if (product.colors) classes.push(...product.colors);

        item.className = classes.join(' ');

        const imagePath = product.images && product.images.length > 0
            ? `${ASSETS_BASE_URL}/${product.images[0]}`
            : 'https://via.placeholder.com/400x400?text=Nessuna+Immagine';

        item.innerHTML = `
            <div class="product-card">
                <img src="${imagePath}" alt="${product.name}" class="product-img">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p style="font-size: 0.9rem; color: #666; margin-top: 5px;">Clicca per i dettagli</p>
                </div>
            </div>
        `;

        item.addEventListener('click', () => openModal(product));
        gridElement.appendChild(item);
    });

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
    // Filters (only if filters exist on page)
    if (filtersContainer) {
        filtersContainer.addEventListener('click', (e) => {
            if (!e.target.classList.contains('filter-btn')) return;

            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            const filterValue = e.target.getAttribute('data-filter');
            iso.arrange({ filter: filterValue });
        });
    }

    // Modal (only if modal exists)
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
}

// Render Featured Products Carousel
function renderFeaturedProducts(items) {
    // Show max 8 featured products
    const featuredItems = items.slice(0, 8);
    
    featuredItems.forEach(product => {
        const imagePath = product.images && product.images.length > 0
            ? `${ASSETS_BASE_URL}/${product.images[0]}`
            : 'https://via.placeholder.com/400x400?text=Nessuna+Immagine';

        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `
            <div class="featured-slide">
                <img src="${imagePath}" alt="${product.name}">
                <div class="featured-slide-overlay">
                    <h3>${product.name}</h3>
                    <p>${product.material || 'Fatto a mano'}</p>
                </div>
            </div>
        `;
        
        // NO click handler - just for viewing
        featuredWrapper.appendChild(slide);
    });

    // Initialize Swiper with autoplay and elegant effect
    setTimeout(() => {
        new Swiper('.featured-swiper', {
            effect: 'coverflow',
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            loop: true,
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            coverflowEffect: {
                rotate: 20,
                stretch: 0,
                depth: 200,
                modifier: 1,
                slideShadows: true,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }, 100);
}

// Scroll Indicator
function initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const nextSection = document.getElementById('chi-sono');
            if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// Open Modal
function openModal(product) {
    document.getElementById('modal-title').textContent = product.name;
    document.getElementById('modal-description').textContent = product.description;

    // Product Meta (materiale, colori, stile)
    const modalMaterial = document.getElementById('modal-material');
    const modalColors = document.getElementById('modal-colors');
    const modalStyle = document.getElementById('modal-style');
    
    if (modalMaterial) modalMaterial.textContent = product.material || 'N/A';
    if (modalColors) modalColors.textContent = product.colors ? product.colors.join(', ') : 'N/A';
    if (modalStyle) modalStyle.textContent = product.style ? product.style.join(', ') : 'N/A';

    // Tags
    const tagsContainer = document.getElementById('modal-tags');
    tagsContainer.innerHTML = '';
    if (product.material) tagsContainer.innerHTML += `<span>${product.material}</span>`;
    if (product.style) product.style.forEach(s => tagsContainer.innerHTML += `<span>${s}</span>`);

    // Buy Button
    const buyBtn = document.getElementById('modal-buy-btn');
    buyBtn.href = product.linkVinted || '#';

    // Swiper Images - use the modal's swiper wrapper specifically
    const swiperWrapper = document.querySelector('.product-swiper .swiper-wrapper');
    swiperWrapper.innerHTML = '';

    if (product.images && product.images.length > 0) {
        product.images.forEach(img => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `<img src="${ASSETS_BASE_URL}/${img}" alt="${product.name}">`;
            swiperWrapper.appendChild(slide);
        });
    } else {
        swiperWrapper.innerHTML = '<div class="swiper-slide"><img src="https://via.placeholder.com/400x400?text=Nessuna+Immagine"></div>';
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    if (swiper) swiper.destroy();
    swiper = new Swiper('.product-swiper', {
        pagination: {
            el: '.swiper-pagination',
        },
        loop: true
    });

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
