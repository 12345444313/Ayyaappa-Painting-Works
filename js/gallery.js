/* =============================================
   Gallery module - horizontal scrolling strip
   + Lightbox with keyboard navigation
   ============================================= */

(function () {
    'use strict';

    // Sample data used when Supabase is not configured
    const SAMPLE_PROJECTS = [
        { id: 1, title: 'Modern Living Room', description: 'Premium interior finish with soft ivory tones and elegant accent walls.', category: 'Interior', image_url: 'assets/images/work-1.jpg', featured: false },
        { id: 2, title: 'Heritage Home Exterior', description: 'Durable exterior paint protecting against weather for years to come.', category: 'Exterior', image_url: 'assets/images/work-2.jpg', featured: false },
        { id: 3, title: 'Decorative Texture Wall', description: 'Custom decorative texture creating a luxurious feature wall.', category: 'Texture', image_url: 'assets/images/work-3.jpg', featured: false },
        { id: 4, title: 'Boutique Office', description: 'Professional commercial painting for a clean, modern workspace.', category: 'Commercial', image_url: 'assets/images/work-4.jpg', featured: false },
        { id: 5, title: 'Villa Renovation', description: 'Complete repaint and finish for a fully renovated family villa.', category: 'Renovation', image_url: 'assets/images/work-5.jpg', featured: false },
        { id: 6, title: 'Cozy Bedroom Suite', description: 'Soft pastel palette for a calm and welcoming bedroom retreat.', category: 'Residential', image_url: 'assets/images/work-6.jpg', featured: false },
        { id: 7, title: 'Restaurant Interior', description: 'Warm, inviting color scheme for a high-traffic dining space.', category: 'Commercial', image_url: 'assets/images/work-7.jpg', featured: false },
        { id: 8, title: 'Apartment Refresh', description: 'Full refresh of a 3BHK apartment with crisp white ceilings.', category: 'Residential', image_url: 'assets/images/work-8.jpg', featured: false }
    ];

    const SAMPLE_FEATURED = {
        title: 'Premium Villa Painting',
        description: 'A signature complete villa painting project showcasing detailed preparation, premium materials, and a flawless long-lasting finish.',
        category: 'Residential',
        location: 'Sample City',
        image_url: 'assets/images/featured.jpg'
    };

    const PLACEHOLDER = 'assets/images/placeholder-project.svg';

    let galleryData = [];
    let currentLightboxIndex = -1;

    // ============== Build Project Card ==============
    function createCard(project, index) {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `View project: ${escapeHTML(project.title || 'Untitled')}`);
        card.dataset.index = String(index);

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = escapeHTML(project.title || 'Project image');
        img.src = project.image_url || PLACEHOLDER;
        img.onerror = () => { img.src = PLACEHOLDER; };

        const overlay = document.createElement('div');
        overlay.className = 'gallery-card-overlay';

        const tag = document.createElement('span');
        tag.className = 'gallery-card-tag';
        tag.textContent = project.category || 'Project';

        const title = document.createElement('h3');
        title.className = 'gallery-card-title';
        title.textContent = project.title || 'Untitled Project';

        const desc = document.createElement('p');
        desc.className = 'gallery-card-desc';
        desc.textContent = truncate(project.description || '', 80);

        overlay.appendChild(tag);
        overlay.appendChild(title);
        overlay.appendChild(desc);

        card.appendChild(img);
        card.appendChild(overlay);

        card.addEventListener('click', () => openLightbox(index));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });

        return card;
    }

    // ============== Render Gallery ==============
    async function initGallery() {
        const strip = document.getElementById('gallery-strip');
        if (!strip) return;

        // Try to load from Supabase
        if (window.SupabaseAPI && window.SupabaseAPI.isConfigured()) {
            try {
                const projects = await window.SupabaseAPI.fetchProjects();
                if (projects && projects.length) {
                    galleryData = projects;
                }
            } catch (err) {
                console.warn('[Gallery] Failed to load projects:', err);
            }
        }

        // Use sample data if empty
        if (!galleryData.length) {
            galleryData = SAMPLE_PROJECTS;
        }

        strip.innerHTML = '';
        galleryData.forEach((p, i) => strip.appendChild(createCard(p, i)));

        setupGalleryArrows();
    }

    // ============== Gallery Scroll Arrows ==============
    function setupGalleryArrows() {
        const strip = document.getElementById('gallery-strip');
        const prev = document.getElementById('gallery-prev');
        const next = document.getElementById('gallery-next');
        if (!strip || !prev || !next) return;

        function updateArrows() {
            const max = strip.scrollWidth - strip.clientWidth - 2;
            prev.disabled = strip.scrollLeft <= 4;
            next.disabled = strip.scrollLeft >= max;
        }

        function scrollByCard(direction) {
            const card = strip.querySelector('.gallery-card');
            const step = card ? card.getBoundingClientRect().width + 20 : 320;
            strip.scrollBy({ left: step * direction, behavior: 'smooth' });
        }

        prev.addEventListener('click', () => scrollByCard(-1));
        next.addEventListener('click', () => scrollByCard(1));
        strip.addEventListener('scroll', updateArrows, { passive: true });
        window.addEventListener('resize', updateArrows);
        updateArrows();
    }

    // ============== Lightbox ==============
    function openLightbox(index) {
        if (!galleryData.length) return;
        currentLightboxIndex = index;
        const lightbox = document.getElementById('lightbox');
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        updateLightbox();
    }

    function closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        currentLightboxIndex = -1;
    }

    function navigateLightbox(direction) {
        if (currentLightboxIndex < 0) return;
        const total = galleryData.length;
        currentLightboxIndex = (currentLightboxIndex + direction + total) % total;
        updateLightbox();
    }

    function updateLightbox() {
        const project = galleryData[currentLightboxIndex];
        if (!project) return;

        const img = document.getElementById('lightbox-img');
        const title = document.getElementById('lightbox-title');
        const category = document.getElementById('lightbox-category');
        const desc = document.getElementById('lightbox-description');

        img.src = project.image_url || PLACEHOLDER;
        img.alt = project.title || 'Project image';
        img.onerror = () => { img.src = PLACEHOLDER; };
        title.textContent = project.title || 'Untitled Project';
        category.textContent = project.category || 'Project';
        desc.textContent = project.description || '';
    }

    // ============== Lightbox Event Bindings ==============
    function setupLightbox() {
        const lightbox = document.getElementById('lightbox');
        const closeBtn = document.getElementById('lightbox-close');
        const prevBtn = document.getElementById('lightbox-prev');
        const nextBtn = document.getElementById('lightbox-next');

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        if (prevBtn) prevBtn.addEventListener('click', () => navigateLightbox(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => navigateLightbox(1));

        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (!lightbox || !lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            else if (e.key === 'ArrowLeft') navigateLightbox(-1);
            else if (e.key === 'ArrowRight') navigateLightbox(1);
        });
    }

    // ============== Featured Project ==============
    async function initFeatured() {
        const card = document.getElementById('featured-card');
        if (!card) return;

        const skeleton = document.getElementById('featured-skeleton');
        const img = document.getElementById('featured-img');
        const title = document.getElementById('featured-title');
        const cat = document.getElementById('featured-category');
        const loc = document.getElementById('featured-location');
        const desc = document.getElementById('featured-description');

        let featured = null;

        if (window.SupabaseAPI && window.SupabaseAPI.isConfigured()) {
            try {
                featured = await window.SupabaseAPI.fetchFeatured();
            } catch (err) {
                console.warn('[Featured] Failed to load:', err);
            }
        }

        if (!featured) featured = SAMPLE_FEATURED;

        if (img) {
            img.src = featured.image_url || PLACEHOLDER;
            img.alt = featured.title || 'Featured project';
            img.onerror = () => { img.src = PLACEHOLDER; };
            img.style.display = 'block';
        }
        if (skeleton) skeleton.style.display = 'none';
        if (title) title.textContent = featured.title || 'Our Signature Project';
        if (cat) cat.textContent = featured.category || 'Featured';
        if (loc) loc.textContent = featured.location || '';
        if (desc) desc.textContent = featured.description || '';
    }

    // ============== Helpers ==============
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = String(str || '');
        return div.innerHTML;
    }

    function truncate(str, max) {
        if (!str) return '';
        return str.length > max ? str.slice(0, max - 1).trim() + '…' : str;
    }

    // ============== Init ==============
    document.addEventListener('DOMContentLoaded', () => {
        setupLightbox();
        initFeatured();
        initGallery();
    });
})();
