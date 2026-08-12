/* =============================================
   Reviews module - load + display approved reviews
   + Submit form with validation & spam protection
   ============================================= */

(function () {
    'use strict';

    // Sample reviews (used when Supabase is not configured)
    // These are clearly placeholder content for development.
    const SAMPLE_REVIEWS = [
        { customer_name: 'Sample Customer', rating: 5, review: 'Excellent workmanship and very professional service. The team was punctual and the finish was beautiful.', created_at: '2025-12-01' },
        { customer_name: 'Sample Homeowner', rating: 5, review: 'Very happy with the painting work. Clean lines, neat handover, and great attention to detail.', created_at: '2025-11-15' },
        { customer_name: 'Sample Business', rating: 4, review: 'Good quality work for our office. Will use again for future projects.', created_at: '2025-10-20' }
    ];

    // Simple in-memory rate limit
    const RATE_LIMIT_MS = 60_000; // 1 minute between submissions per session
    const RATE_KEY = 'apw_last_review_submit';
    const MIN_REVIEW_LEN = 10;
    const MAX_REVIEW_LEN = 600;
    const MAX_NAME_LEN = 80;

    // ============== Render ==============
    function createReviewCard(review) {
        const card = document.createElement('article');
        card.className = 'review-card';

        const rating = document.createElement('div');
        rating.className = 'review-rating';
        rating.setAttribute('aria-label', `${review.rating} out of 5 stars`);
        rating.textContent = '★'.repeat(Math.max(0, Math.min(5, review.rating || 0))) + '☆'.repeat(Math.max(0, 5 - Math.min(5, review.rating || 0)));

        const text = document.createElement('p');
        text.className = 'review-text';
        text.textContent = `"${review.review || ''}"`;

        const author = document.createElement('div');
        author.className = 'review-author';

        const name = document.createElement('span');
        name.className = 'review-name';
        name.textContent = `— ${review.customer_name || 'Anonymous'}`;

        author.appendChild(name);

        if (review.created_at) {
            const date = document.createElement('span');
            date.className = 'review-date';
            date.textContent = formatDate(review.created_at);
            author.appendChild(date);
        }

        card.appendChild(rating);
        card.appendChild(text);
        card.appendChild(author);
        return card;
    }

    function showEmptyState(container) {
        container.innerHTML = '';
        const empty = document.createElement('div');
        empty.className = 'reviews-empty';
        empty.textContent = 'Be the first to share your experience.';
        container.appendChild(empty);
    }

    async function initReviews() {
        const grid = document.getElementById('reviews-grid');
        if (!grid) return;

        // Skeletons already in HTML. Wait briefly for first paint, then load.
        await new Promise(r => setTimeout(r, 100));

        let reviews = [];
        if (window.SupabaseAPI && window.SupabaseAPI.isConfigured()) {
            try {
                reviews = await window.SupabaseAPI.fetchApprovedReviews();
            } catch (err) {
                console.warn('[Reviews] Failed to load:', err);
            }
        }
        if (!reviews || !reviews.length) reviews = SAMPLE_REVIEWS;

        grid.innerHTML = '';
        if (!reviews.length) {
            showEmptyState(grid);
            return;
        }
        reviews.forEach(r => grid.appendChild(createReviewCard(r)));
    }

    // ============== Modal ==============
    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        const first = modal.querySelector('input, textarea, button');
        if (first) setTimeout(() => first.focus(), 100);
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
    }

    function setupModal() {
        const modal = document.getElementById('review-modal');
        const thanksModal = document.getElementById('thanks-modal');
        const openBtn = document.getElementById('open-review-modal');
        const closeBtn = document.getElementById('modal-close');
        const overlay = document.getElementById('modal-overlay');
        const thanksCloseBtns = thanksModal ? thanksModal.querySelectorAll('[data-close-thanks]') : [];

        if (openBtn && modal) {
            openBtn.addEventListener('click', () => {
                resetForm();
                openModal(modal);
            });
        }
        if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
        if (overlay) overlay.addEventListener('click', () => closeModal(modal));
        thanksCloseBtns.forEach(b => b.addEventListener('click', () => closeModal(thanksModal)));

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            if (modal && modal.classList.contains('active')) closeModal(modal);
            if (thanksModal && thanksModal.classList.contains('active')) closeModal(thanksModal);
        });
    }

    // ============== Star Rating ==============
    function setupRating() {
        const stars = document.querySelectorAll('.rating-input .star');
        const hidden = document.getElementById('review-rating');
        if (!stars.length || !hidden) return;

        function setRating(value) {
            hidden.value = String(value);
            stars.forEach(s => {
                const v = parseInt(s.dataset.value, 10);
                s.classList.toggle('active', v <= value);
            });
        }

        // Default to 5
        setRating(5);

        stars.forEach(star => {
            star.addEventListener('click', () => {
                setRating(parseInt(star.dataset.value, 10));
            });
            star.addEventListener('mouseenter', () => {
                stars.forEach(s => {
                    const v = parseInt(s.dataset.value, 10);
                    s.style.color = v <= parseInt(star.dataset.value, 10) ? 'var(--color-accent)' : '';
                });
            });
            star.addEventListener('mouseleave', () => {
                stars.forEach(s => s.style.color = '');
            });
            star.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setRating(parseInt(star.dataset.value, 10));
                }
            });
        });
    }

    // ============== Form Submission ==============
    function setupForm() {
        const form = document.getElementById('review-form');
        if (!form) return;
        form.addEventListener('submit', handleSubmit);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const status = document.getElementById('form-status');
        const submit = document.getElementById('review-submit');
        if (!status || !submit) return;

        // Honeypot
        const honeypot = document.getElementById('website');
        if (honeypot && honeypot.value) {
            showStatus(status, 'Submission blocked.', 'error');
            return;
        }

        // Rate limit
        const last = parseInt(localStorage.getItem(RATE_KEY) || '0', 10);
        if (Date.now() - last < RATE_LIMIT_MS) {
            const wait = Math.ceil((RATE_LIMIT_MS - (Date.now() - last)) / 1000);
            showStatus(status, `Please wait ${wait}s before submitting another review.`, 'error');
            return;
        }

        const name = (document.getElementById('review-name')?.value || '').trim();
        const rating = parseInt(document.getElementById('review-rating')?.value || '0', 10);
        const review = (document.getElementById('review-text')?.value || '').trim();

        // Validation
        if (!name || name.length < 2) {
            showStatus(status, 'Please enter your name.', 'error');
            return;
        }
        if (name.length > MAX_NAME_LEN) {
            showStatus(status, `Name is too long (max ${MAX_NAME_LEN} characters).`, 'error');
            return;
        }
        if (!rating || rating < 1 || rating > 5) {
            showStatus(status, 'Please select a rating.', 'error');
            return;
        }
        if (review.length < MIN_REVIEW_LEN) {
            showStatus(status, `Review must be at least ${MIN_REVIEW_LEN} characters.`, 'error');
            return;
        }
        if (review.length > MAX_REVIEW_LEN) {
            showStatus(status, `Review is too long (max ${MAX_REVIEW_LEN} characters).`, 'error');
            return;
        }

        submit.disabled = true;
        submit.textContent = 'Submitting…';
        showStatus(status, '', '');

        let result = { ok: false, error: 'Supabase not configured.' };

        if (window.SupabaseAPI && window.SupabaseAPI.isConfigured()) {
            try {
                result = await window.SupabaseAPI.submitReview({
                    customer_name: name,
                    rating,
                    review
                });
            } catch (err) {
                result = { ok: false, error: 'Network error. Please try again.' };
            }
        }

        if (result.ok) {
            localStorage.setItem(RATE_KEY, String(Date.now()));
            closeModal(document.getElementById('review-modal'));
            openModal(document.getElementById('thanks-modal'));
            form.reset();
            // Reset rating
            document.querySelectorAll('.rating-input .star').forEach(s => s.classList.remove('active'));
            const hidden = document.getElementById('review-rating');
            if (hidden) hidden.value = '5';
        } else {
            showStatus(status, result.error || 'Failed to submit. Please try again.', 'error');
        }

        submit.disabled = false;
        submit.textContent = 'Submit Review';
    }

    function resetForm() {
        const form = document.getElementById('review-form');
        const status = document.getElementById('form-status');
        if (form) form.reset();
        if (status) { status.textContent = ''; status.className = 'form-status'; }
        // reset stars to 5
        const hidden = document.getElementById('review-rating');
        if (hidden) hidden.value = '5';
        document.querySelectorAll('.rating-input .star').forEach((s, i) => {
            s.classList.toggle('active', i < 5);
        });
    }

    function showStatus(el, msg, type) {
        el.textContent = msg;
        el.className = 'form-status' + (type ? ' ' + type : '');
    }

    function formatDate(iso) {
        try {
            const d = new Date(iso);
            if (isNaN(d.getTime())) return '';
            return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short' });
        } catch (_) {
            return '';
        }
    }

    // ============== Init ==============
    document.addEventListener('DOMContentLoaded', () => {
        initReviews();
        setupModal();
        setupRating();
        setupForm();
    });
})();
