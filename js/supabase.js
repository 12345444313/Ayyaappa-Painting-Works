/* =============================================
   Supabase client wrapper
   - Safely initializes the Supabase client
   - Falls back to placeholders if not configured
   ============================================= */

(function () {
    'use strict';

    const cfg = window.SUPABASE_CONFIG || {};
    let client = null;
    let isConfigured = false;

    function isReady() {
        if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
            return false;
        }
        if (!cfg.url || cfg.url.includes('YOUR_PROJECT_REF')) return false;
        if (!cfg.anonKey || cfg.anonKey.includes('YOUR_SUPABASE')) return false;
        return true;
    }

    function getClient() {
        if (!isConfigured) return null;
        if (!client && isReady()) {
            try {
                client = window.supabase.createClient(cfg.url, cfg.anonKey, {
                    auth: { persistSession: false }
                });
            } catch (err) {
                console.warn('[Supabase] Failed to initialize client:', err);
                client = null;
            }
        }
        return client;
    }

    if (isReady()) {
        isConfigured = true;
    } else {
        console.info('[Supabase] Not configured. Site will run with sample/placeholder content. Update js/config.js to enable.');
    }

    // ----- Public API -----
    window.SupabaseAPI = {
        isConfigured: () => isConfigured,
        getClient: getClient,

        // Fetch projects ordered by created_at desc
        async fetchProjects() {
            const c = getClient();
            if (!c) return [];
            const { data, error } = await c
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                console.warn('[Supabase] fetchProjects error:', error);
                return [];
            }
            return data || [];
        },

        // Fetch the featured project (first one with featured = true)
        async fetchFeatured() {
            const c = getClient();
            if (!c) return null;
            const { data, error } = await c
                .from('projects')
                .select('*')
                .eq('featured', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            if (error) {
                console.warn('[Supabase] fetchFeatured error:', error);
                return null;
            }
            return data;
        },

        // Fetch approved reviews
        async fetchApprovedReviews() {
            const c = getClient();
            if (!c) return [];
            const { data, error } = await c
                .from('reviews')
                .select('*')
                .eq('approved', true)
                .order('created_at', { ascending: false });
            if (error) {
                console.warn('[Supabase] fetchApprovedReviews error:', error);
                return [];
            }
            return data || [];
        },

        // Submit a new review (always with approved = false)
        async submitReview(review) {
            const c = getClient();
            if (!c) {
                return { ok: false, error: 'Supabase not configured.' };
            }
            const payload = {
                customer_name: review.customer_name,
                rating: review.rating,
                review: review.review,
                approved: false
            };
            const { error } = await c.from('reviews').insert([payload]);
            if (error) {
                return { ok: false, error: error.message || 'Failed to submit review.' };
            }
            return { ok: true };
        }
    };
})();
