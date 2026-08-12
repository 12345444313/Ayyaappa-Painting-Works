/* =============================================
   Ayyaappa Painting Works - Central Configuration
   EDIT THIS FILE to update business information.
   ============================================= */

const BUSINESS_CONFIG = {
    // ----- Business identity -----
    name: "Ayyaappa Painting Works",
    tagline: "Quality • Trust • Craftsmanship",
    contractorName: "CONTRACTOR NAME",          // TODO: Replace with contractor's name

    // ----- Contact details -----
    // IMPORTANT: Use international format WITHOUT '+' for wa.me and tel:
    // Example: "919876543210" for India
    phone: "919876543210",                        // TODO: Replace with real phone (no '+')
    phoneDisplay: "+91 98765 43210",              // TODO: Display version
    whatsapp: "919876543210",                     // TODO: Replace with WhatsApp number (no '+')
    email: "",                                    // TODO: Optional - add email

    // ----- Location & hours -----
    location: "Your City, State",                 // TODO: Replace
    workingHours: "Mon - Sat, 9:00 AM - 7:00 PM", // TODO: Replace
    workingAreas: "Your City & Surrounding Areas",

    // ----- About stats (placeholders) -----
    experience: "10+",                            // TODO: e.g. "12+"
    projectsCompleted: "100+",                    // TODO: e.g. "250+"

    // ----- WhatsApp pre-filled message -----
    whatsappMessage: "Hello, I am interested in your painting services. I would like to discuss my project."
};

// ----- Supabase configuration -----
// The anon key is safe to expose in frontend code. NEVER use the service role key here.
const SUPABASE_CONFIG = {
    url: "https://YOUR_PROJECT_REF.supabase.co",   // TODO: Replace with your Supabase project URL
    anonKey: "YOUR_SUPABASE_ANON_KEY"              // TODO: Replace with your Supabase anon/public key
};

/* =============================================
   Helper functions - do not edit unless needed
   ============================================= */

function buildWhatsAppURL(message) {
    const text = encodeURIComponent(message || BUSINESS_CONFIG.whatsappMessage);
    return `https://wa.me/${BUSINESS_CONFIG.whatsapp}?text=${text}`;
}

function buildPhoneURL() {
    return `tel:${BUSINESS_CONFIG.phone}`;
}

function buildMapsURL() {
    const query = encodeURIComponent(BUSINESS_CONFIG.location);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

// Expose to global scope
window.BUSINESS_CONFIG = BUSINESS_CONFIG;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.buildWhatsAppURL = buildWhatsAppURL;
window.buildPhoneURL = buildPhoneURL;
window.buildMapsURL = buildMapsURL;
