document.addEventListener('DOMContentLoaded', () => {
    // Configuration constants
    const HEADER_HEIGHT_PX = 80;       // Height of the fixed header in pixels
    const HEADER_SCROLL_TRIGGER = 50;  // Scroll distance (px) before header changes style
    const COUNTER_STEPS = 200;         // Number of steps in the stat counter animation
    const COUNTER_INTERVAL_MS = 15;    // Milliseconds between each counter step
    const OBSERVER_THRESHOLD = 0.3;    // Fraction of section visible to trigger animation

    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        nav.classList.toggle('active');
        hamburger.classList.toggle('active');

        const isOpen = nav.classList.contains('active');
        hamburger.setAttribute('aria-expanded', isOpen);
        hamburger.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', 'Abrir menú');
            document.body.style.overflow = '';
        });
    });

    // Smooth scrolling for anchor links is handled by CSS (scroll-behavior: smooth), 
    // but header offset needs JS if strictly needed. 
    // Usually CSS scroll-padding-top on html is better.
    document.documentElement.style.scrollPaddingTop = `${HEADER_HEIGHT_PX}px`; // Offset for fixed header

    // Navbar scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > HEADER_SCROLL_TRIGGER) {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            header.style.background = 'rgba(15, 23, 42, 0.98)';
        } else {
            header.style.boxShadow = 'none';
            header.style.background = 'rgba(15, 23, 42, 0.95)';
        }
    });

    // Number Counter Animation
    const stats = document.querySelectorAll('.stat-number, .stat-val');

    const animateStats = () => {
        stats.forEach(stat => {
            const target = +stat.getAttribute('data-target');
            if (isNaN(target)) return;

            const increment = target / COUNTER_STEPS;

            let current = 0; // Start from 0 explicitly

            const updateCount = () => {
                if (current < target) {
                    current += increment;
                    stat.innerText = Math.ceil(current);
                    setTimeout(updateCount, COUNTER_INTERVAL_MS);
                } else {
                    stat.innerText = target + (stat.classList.contains('stat-number') ? '+' : '');
                }
            };
            updateCount();
        });
    };

    // Intersection Observer for stats animation
    let animated = false;
    const statsSection = document.querySelector('.about'); // Trigger on about for first numbers
    const statsBanner = document.querySelector('.stats-banner');

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                // Check if it's the specific section if needed, or just trigger globally once
                // For simplicity, we trigger all stats when any stat section is visible
                animateStats();
                animated = true;
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, { threshold: OBSERVER_THRESHOLD });
    if (statsSection) observer.observe(statsSection);
    if (statsBanner) observer.observe(statsBanner);

    // Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerText = 'Enviando...';

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.innerText = '¡Gracias! Tu mensaje ha sido enviado con éxito.';
                    formStatus.className = 'form-status success';
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    if (Object.hasOwn(data, 'errors')) {
                        formStatus.innerText = data.errors.map(error => error.message).join(", ");
                    } else {
                        formStatus.innerText = 'Ups! Hubo un problema al enviar el mensaje. Inténtalo de nuevo.';
                    }
                    formStatus.className = 'form-status error';
                }
            } catch (error) {
                formStatus.innerText = 'Error de conexión. Por favor, verifica tu internet.';
                formStatus.className = 'form-status error';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = 'Enviar Mensaje';
            }
        });
    }

});
