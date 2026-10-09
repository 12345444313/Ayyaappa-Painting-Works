/* =============================================
   Main - navigation, scroll effects, contact
   ============================================= */

(function () {
    'use strict';

    // ============== Apply Business Config to DOM ==============
    function applyConfig() {
        const c = window.BUSINESS_CONFIG;
        if (!c) return;

        const setText = (id, val) => {
            const el = document.getElementById(id);
            if (el && val != null) el.textContent = val;
        };
        const setHTML = (id, val) => {
            const el = document.getElementById(id);
            if (el && val != null) el.innerHTML = val;
        };
        const setHref = (id, val) => {
            const el = document.getElementById(id);
            if (el && val) el.setAttribute('href', val);
        };

        setText('contact-name', c.contractorName);
        setText('contact-phone', c.phoneDisplay || c.phone);
        setText('contact-whatsapp', '+' + c.whatsapp);
        setText('contact-location', c.location);
        setText('contact-hours', c.workingHours);

        setText('footer-phone', c.phoneDisplay || c.phone);
        setText('footer-whatsapp', '+' + c.whatsapp);
        setText('footer-location', c.location);
        setText('footer-year', String(new Date().getFullYear()));

        // WhatsApp links
        const waURL = window.buildWhatsAppURL(c.whatsappMessage);
        setHref('whatsapp-float', waURL);
        setHref('nav-whatsapp', waURL);
        setHref('hero-whatsapp', waURL);
        setHref('contact-whatsapp-btn', waURL);
        const footerWa = document.getElementById('footer-whatsapp');
        if (footerWa) {
            footerWa.setAttribute('href', waURL);
            footerWa.style.cursor = 'pointer';
        }

        // Phone link
        const telURL = window.buildPhoneURL();
        setHref('contact-call', telURL);
        const footerPhone = document.getElementById('footer-phone');
        if (footerPhone) {
            footerPhone.setAttribute('href', telURL);
            footerPhone.style.cursor = 'pointer';
        }

        // Maps link
        setHref('contact-directions', window.buildMapsURL());

        // About stats
        const expEl = document.querySelector('[data-stat="experience"]');
        const projEl = document.querySelector('[data-stat="projects"]');
        if (expEl) expEl.textContent = (c.experience || '10+') + (c.experience && !String(c.experience).includes('+') ? '+' : '');
        if (projEl) projEl.textContent = (c.projectsCompleted || '100+') + (c.projectsCompleted && !String(c.projectsCompleted).includes('+') ? '+' : '');
    }

    // ============== Navbar Scroll ==============
    function setupNavbar() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        function onScroll() {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // ============== Mobile Menu ==============
    function setupMobileMenu() {
        const toggle = document.getElementById('nav-toggle');
        const menu = document.getElementById('nav-menu');
        if (!toggle || !menu) return;

        function close() {
            menu.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }

        toggle.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('active');
            toggle.classList.toggle('active');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        // Close when clicking a link (except WhatsApp CTA which opens elsewhere)
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                // Only close for in-page anchors
                if (link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
                    close();
                }
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!menu.classList.contains('active')) return;
            if (!menu.contains(e.target) && !toggle.contains(e.target)) close();
        });

        // Close on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 900) close();
        });
    }

    // ============== Smooth Scroll (with offset for fixed nav) ==============
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (!href || href === '#' || href.length < 2) return;
                const target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                const nav = document.getElementById('navbar');
                const offset = nav ? nav.offsetHeight - 10 : 0;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            });
        });
    }

    // ============== Active Nav Link ==============
    function setupActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        if (!sections.length || !navLinks.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
            });
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

        sections.forEach(s => observer.observe(s));
    }

    // ============== Reveal on Scroll ==============
    function setupReveal() {
        const elements = document.querySelectorAll('.reveal');
        if (!elements.length) return;

        if (!('IntersectionObserver' in window)) {
            elements.forEach(el => el.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

        elements.forEach(el => observer.observe(el));
    }

    // ============== Init ==============
    document.addEventListener('DOMContentLoaded', () => {
        applyConfig();
        setupNavbar();
        setupMobileMenu();
        setupSmoothScroll();
        setupActiveNav();
        setupReveal();
    });
})();
