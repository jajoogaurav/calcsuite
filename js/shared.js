/* ===== shared.js — Reusable components & utilities ===== */

/** Format number to Indian Rupee currency */
function formatCurrency(num) {
  if (isNaN(num) || !isFinite(num)) return '₹0';
  return '₹' + Math.round(num).toLocaleString('en-IN');
}

/** Format number with commas (Indian) */
function formatNumber(num) {
  if (isNaN(num) || !isFinite(num)) return '0';
  return Math.round(num).toLocaleString('en-IN');
}

/** Get base path relative to current page */
function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/calculators/') || path.includes('/pages/')) return '../';
  return './';
}

/** Inject semantic site header with <header> and <nav> */
function createHeader() {
  const base = getBasePath();
  const header = document.createElement('header');
  header.className = 'site-header';
  header.setAttribute('role', 'banner');
  header.innerHTML = `
    <div class="header-inner">
      <a href="${base}index.html" class="logo" aria-label="CalcSuite Home">
        <div class="logo-icon">📊</div>
        <span>CalcSuite</span>
      </a>
      <nav class="nav-links" id="navLinks" role="navigation" aria-label="Main navigation">
        <a href="${base}index.html">Home</a>
        <a href="${base}calculators/emi-calculator.html">EMI Calculator</a>
        <a href="${base}calculators/sip-calculator.html">SIP Calculator</a>
        <a href="${base}calculators/loan-prepayment-calculator.html">Loan Prepayment</a>
        <a href="${base}calculators/fd-calculator.html">FD Calculator</a>
        <a href="${base}pages/about.html">About</a>
        <a href="${base}pages/contact.html">Contact</a>
      </nav>
      <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Open navigation menu" aria-expanded="false">☰</button>
    </div>`;
  document.body.prepend(header);

  const btn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('navLinks');
  btn.addEventListener('click', () => {
    nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', nav.classList.contains('open'));
  });
}

/** Inject semantic site footer with internal links */
function createFooter() {
  const base = getBasePath();
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.setAttribute('role', 'contentinfo');
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo"><div class="logo-icon">📊</div><span>CalcSuite</span></div>
          <p>India's free online financial calculator suite. Accurate EMI, SIP, FD, and loan calculators to help you make smarter money decisions. Fast, reliable, and easy to use.</p>
        </div>
        <div class="footer-col">
          <h4>Financial Calculators</h4>
          <a href="${base}calculators/emi-calculator.html">EMI Calculator</a>
          <a href="${base}calculators/sip-calculator.html">SIP Calculator</a>
          <a href="${base}calculators/loan-prepayment-calculator.html">Loan Prepayment Calculator</a>
          <a href="${base}calculators/interest-calculator.html">Interest Calculator</a>
          <a href="${base}calculators/fd-calculator.html">FD Calculator</a>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <a href="${base}pages/about.html">About Us</a>
          <a href="${base}pages/privacy.html">Privacy Policy</a>
          <a href="${base}pages/contact.html">Contact Us</a>
        </div>
        <div class="footer-col">
          <h4>Quick Links</h4>
          <a href="${base}sitemap.xml">Sitemap</a>
          <a href="${base}pages/privacy.html">Terms of Service</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${new Date().getFullYear()} CalcSuite. All rights reserved.</span>
        <span>Made with ❤️ for smart financial planning in India</span>
      </div>
    </div>`;
  document.body.appendChild(footer);
}

/** Sync slider and number input bi-directionally */
function syncSliderInput(sliderId, inputId, callback) {
  const slider = document.getElementById(sliderId);
  const input = document.getElementById(inputId);
  if (!slider || !input) return;

  slider.addEventListener('input', () => {
    input.value = slider.value;
    trackEvent('slider_change', sliderId, slider.value);
    if (callback) callback();
  });

  input.addEventListener('input', () => {
    let v = parseFloat(input.value);
    if (isNaN(v)) return;
    v = Math.max(parseFloat(slider.min), Math.min(parseFloat(slider.max), v));
    slider.value = v;
    trackEvent('input_change', inputId, v);
    if (callback) callback();
  });

  input.addEventListener('blur', () => {
    let v = parseFloat(input.value);
    if (isNaN(v)) v = parseFloat(slider.min);
    v = Math.max(parseFloat(slider.min), Math.min(parseFloat(slider.max), v));
    input.value = v;
    slider.value = v;
    if (callback) callback();
  });
}

/** Create share buttons */
function createShareButtons(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  container.innerHTML = `
    <button class="btn btn-outline" onclick="window.open('https://twitter.com/intent/tweet?url=${url}&text=${title}','_blank','width=600,height=400');trackEvent('share','twitter')">
      <span>𝕏</span> Share
    </button>
    <button class="btn btn-outline" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${url}','_blank','width=600,height=400');trackEvent('share','facebook')">
      <span>f</span> Share
    </button>
    <button class="btn btn-outline" onclick="window.open('https://wa.me/?text=${title}%20${url}','_blank');trackEvent('share','whatsapp')">
      <span>💬</span> WhatsApp
    </button>
    <button class="btn btn-outline" onclick="navigator.clipboard.writeText(decodeURIComponent('${url}')).then(()=>alert('Link copied!'));trackEvent('share','copy_link')">
      <span>🔗</span> Copy Link
    </button>`;
}

/** Google Analytics event tracking (placeholder — replace GA_MEASUREMENT_ID) */
function trackEvent(action, category, label) {
  if (typeof gtag === 'function') {
    gtag('event', action, { event_category: category, event_label: String(label || '') });
  }
}

/** Inject internal link suggestions (cross-calculator links) */
function createInternalLinks(containerId, currentPage) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const base = getBasePath();
  const links = [
    { url: `${base}calculators/emi-calculator.html`, text: 'EMI Calculator – Check Your Loan EMI', icon: '🏠', key: 'emi' },
    { url: `${base}calculators/sip-calculator.html`, text: 'SIP Calculator – Plan Mutual Fund SIP Returns', icon: '📈', key: 'sip' },
    { url: `${base}calculators/loan-prepayment-calculator.html`, text: 'Loan Prepayment Calculator – Save Interest', icon: '💰', key: 'prepay' },
    { url: `${base}calculators/interest-calculator.html`, text: 'Interest Calculator – Simple & Compound', icon: '🧮', key: 'interest' },
    { url: `${base}calculators/fd-calculator.html`, text: 'FD Calculator – Fixed Deposit Returns', icon: '🏦', key: 'fd' },
  ].filter(l => l.key !== currentPage);

  container.innerHTML = `
    <h2>Explore More Financial Calculators</h2>
    <div class="internal-links-grid">
      ${links.map(l => `<a href="${l.url}" class="internal-link-card">${l.icon} ${l.text}</a>`).join('')}
    </div>`;
}

/** Initialize shared components on DOMContentLoaded */
document.addEventListener('DOMContentLoaded', () => {
  createHeader();
  createFooter();
});
