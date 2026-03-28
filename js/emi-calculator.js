/* ===== EMI Calculator Logic — Multi-Keyword Enhanced ===== */

let emiChart = null;
let barChart = null;
let tenureUnit = 'years';
let lastAmortData = { monthly: [], yearly: {} };
let currentLoanType = 'home';

/* Loan type presets: amount, rate, tenure, max/min ranges, tooltip text */
const LOAN_PRESETS = {
  home: {
    label: 'Home Loan',
    icon: '🏠',
    amount: 5000000, rate: 8.5, tenure: 20,
    amtMin: 100000, amtMax: 100000000, amtStep: 100000,
    rateMin: 6, rateMax: 15,
    tenureMax: 30,
    tooltipAmt: 'Home loan amounts typically range from ₹10L to ₹5Cr+ for buying a house or flat.',
    tooltipRate: 'Home loan rates: 8–10% (SBI, HDFC, ICICI). Women borrowers may get 0.05% discount.',
    tooltipTenure: 'Home loans allow up to 30 years tenure. Longer tenure = lower EMI but more total interest.',
    heading: 'Home Loan EMI Calculator – Calculate Housing Loan EMI',
    subtitle: 'Calculate your home loan EMI for buying a house, flat, or property. Compare banks like SBI, HDFC, ICICI & Axis.'
  },
  car: {
    label: 'Car Loan',
    icon: '🚗',
    amount: 800000, rate: 9, tenure: 5,
    amtMin: 50000, amtMax: 10000000, amtStep: 10000,
    rateMin: 7, rateMax: 16,
    tenureMax: 7,
    tooltipAmt: 'Car loan for new or used vehicle. Typical range: ₹2L to ₹50L.',
    tooltipRate: 'New car: 7–10%. Used car: 10–14%. Rates depend on bank and credit score.',
    tooltipTenure: 'Car loans typically range from 1 to 7 years.',
    heading: 'Car Loan EMI Calculator – Finance Your Dream Car',
    subtitle: 'Calculate your car loan EMI. Plan financing for Maruti, Hyundai, Tata, Honda, or luxury cars.'
  },
  personal: {
    label: 'Personal Loan',
    icon: '💳',
    amount: 500000, rate: 14, tenure: 3,
    amtMin: 10000, amtMax: 5000000, amtStep: 10000,
    rateMin: 10, rateMax: 28,
    tenureMax: 5,
    tooltipAmt: 'Unsecured loan up to ₹50L. No collateral needed.',
    tooltipRate: 'Personal loan rates: 10–24%. Depends on CIBIL score, income, & employer.',
    tooltipTenure: 'Personal loans usually have 1–5 year tenures.',
    heading: 'Personal Loan EMI Calculator – Plan Unsecured Loan EMI',
    subtitle: 'Calculate personal loan EMI for weddings, travel, medical expenses, or debt consolidation.'
  },
  bike: {
    label: 'Bike Loan',
    icon: '🏍️',
    amount: 150000, rate: 10, tenure: 3,
    amtMin: 10000, amtMax: 500000, amtStep: 5000,
    rateMin: 8, rateMax: 18,
    tenureMax: 5,
    tooltipAmt: 'Two-wheeler loan amount. Range: ₹30K to ₹5L.',
    tooltipRate: 'Bike loan rates: 8–15% from HDFC, Bajaj Finance, ICICI.',
    tooltipTenure: 'Two-wheeler loans: 1–5 years.',
    heading: 'Bike Loan EMI Calculator – Two-Wheeler Loan Planning',
    subtitle: 'Calculate your bike loan EMI for Royal Enfield, Honda, TVS, Bajaj, or Hero.'
  },
  education: {
    label: 'Education Loan',
    icon: '🎓',
    amount: 1000000, rate: 9, tenure: 7,
    amtMin: 50000, amtMax: 20000000, amtStep: 50000,
    rateMin: 7, rateMax: 14,
    tenureMax: 15,
    tooltipAmt: 'Education loan for India or abroad studies. Up to ₹2Cr for top universities.',
    tooltipRate: 'Education loan rates: 8–13%. SBI, Bank of Baroda, HDFC Credila.',
    tooltipTenure: 'Repayment starts after moratorium. Tenure: up to 15 years.',
    heading: 'Education Loan EMI Calculator – Plan Study Loan Repayment',
    subtitle: 'Calculate your education loan EMI for studying in India or abroad. Includes moratorium period consideration.'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  syncSliderInput('loanAmountSlider', 'loanAmountInput', calculate);
  syncSliderInput('interestRateSlider', 'interestRateInput', calculate);
  syncSliderInput('tenureSlider', 'tenureInput', calculate);
  syncSliderInput('earlyTenureSlider', 'earlyTenureInput', calculateEarlyClosure);

  document.getElementById('tenureYears').addEventListener('click', () => switchTenureUnit('years'));
  document.getElementById('tenureMonths').addEventListener('click', () => switchTenureUnit('months'));

  document.getElementById('earlyClosureToggle').addEventListener('change', function() {
    const content = document.getElementById('earlyClosureContent');
    content.classList.toggle('visible', this.checked);
    const compSection = document.getElementById('comparisonSection');
    const banner = document.getElementById('interestSavedBanner');
    if (this.checked) {
      calculateEarlyClosure();
    } else {
      compSection.style.display = 'none';
      banner.classList.remove('visible');
    }
  });

  createShareButtons('shareButtons');

  // Check URL hash for loan type
  const hash = window.location.hash.replace('#', '').replace('-loan', '');
  if (LOAN_PRESETS[hash]) switchLoanType(hash, false);
  else switchLoanType('home', false);

  renderLoanComparison();
});

/** Switch loan type — update presets, UI, heading, and recalculate */
function switchLoanType(type, scrollToTop = true) {
  const preset = LOAN_PRESETS[type];
  if (!preset) return;
  currentLoanType = type;

  // Update heading
  document.getElementById('mainHeading').textContent = preset.heading;
  document.getElementById('mainSubtitle').textContent = preset.subtitle;

  // Update active button
  document.querySelectorAll('.loan-type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });

  // Update slider ranges
  const amtSlider = document.getElementById('loanAmountSlider');
  const amtInput = document.getElementById('loanAmountInput');
  amtSlider.min = preset.amtMin; amtSlider.max = preset.amtMax; amtSlider.step = preset.amtStep;
  amtInput.min = preset.amtMin; amtInput.max = preset.amtMax; amtInput.step = preset.amtStep;
  amtSlider.value = preset.amount; amtInput.value = preset.amount;

  const rateSlider = document.getElementById('interestRateSlider');
  const rateInput = document.getElementById('interestRateInput');
  rateSlider.min = preset.rateMin; rateSlider.max = preset.rateMax;
  rateInput.min = preset.rateMin; rateInput.max = preset.rateMax;
  rateSlider.value = preset.rate; rateInput.value = preset.rate;

  const tenureSlider = document.getElementById('tenureSlider');
  const tenureInput = document.getElementById('tenureInput');
  if (tenureUnit === 'years') {
    tenureSlider.max = preset.tenureMax;
    tenureInput.max = preset.tenureMax;
  } else {
    tenureSlider.max = preset.tenureMax * 12;
    tenureInput.max = preset.tenureMax * 12;
  }
  const tenureVal = tenureUnit === 'years' ? preset.tenure : preset.tenure * 12;
  tenureSlider.value = tenureVal; tenureInput.value = tenureVal;

  // Update early tenure max
  const earlySlider = document.getElementById('earlyTenureSlider');
  const earlyInput = document.getElementById('earlyTenureInput');
  earlySlider.max = tenureUnit === 'years' ? preset.tenureMax - 1 : (preset.tenureMax * 12) - 1;
  earlyInput.max = earlySlider.max;
  const earlyVal = Math.min(parseInt(earlyInput.value), parseInt(earlySlider.max));
  earlySlider.value = earlyVal; earlyInput.value = earlyVal;

  // Update tooltips
  const tipAmt = document.getElementById('tooltipLoanAmt');
  const tipRate = document.getElementById('tooltipRate');
  const tipTenure = document.getElementById('tooltipTenure');
  if (tipAmt) tipAmt.textContent = preset.tooltipAmt;
  if (tipRate) tipRate.textContent = preset.tooltipRate;
  if (tipTenure) tipTenure.textContent = preset.tooltipTenure;

  // Update URL hash
  history.replaceState(null, '', '#' + type + '-loan');

  // Track
  trackEvent('loan_type_switch', 'emi_calculator', type);

  calculate();
  renderLoanComparison();

  if (scrollToTop) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/** Render "Compare Loan Types" section using ₹10L as standard */
function renderLoanComparison() {
  const grid = document.getElementById('loanCompareGrid');
  if (!grid) return;

  const compareAmount = 1000000; // ₹10 lakh standard
  const colors = { home: '#6366f1', car: '#3b82f6', personal: '#f59e0b', bike: '#10b981', education: '#8b5cf6' };

  let html = '';
  for (const key in LOAN_PRESETS) {
    const p = LOAN_PRESETS[key];
    const months = p.tenure * 12;
    const emi = calcEMI(compareAmount, p.rate, months);
    const total = emi * months;
    const interest = total - compareAmount;

    html += `
      <div class="loan-compare-card" style="border-top-color:${colors[key]}">
        <h3>${p.icon} ${p.label}</h3>
        <div class="compare-row"><span>EMI (₹10L)</span><span class="compare-val">${formatCurrency(emi)}</span></div>
        <div class="compare-row"><span>Rate</span><span class="compare-val">${p.rate}%</span></div>
        <div class="compare-row"><span>Tenure</span><span class="compare-val">${p.tenure} yrs</span></div>
        <div class="compare-row"><span>Total Interest</span><span class="compare-val">${formatCurrency(interest)}</span></div>
        <div class="compare-row"><span>Total Payment</span><span class="compare-val">${formatCurrency(total)}</span></div>
      </div>`;
  }
  grid.innerHTML = html;
}

function switchTenureUnit(unit) {
  tenureUnit = unit;
  document.getElementById('tenureYears').classList.toggle('active', unit === 'years');
  document.getElementById('tenureMonths').classList.toggle('active', unit === 'months');
  const slider = document.getElementById('tenureSlider');
  const input = document.getElementById('tenureInput');
  const preset = LOAN_PRESETS[currentLoanType];
  if (unit === 'years') {
    slider.min = 1; slider.max = preset.tenureMax; slider.step = 1;
    input.min = 1; input.max = preset.tenureMax; input.step = 1;
    input.value = Math.round(parseFloat(input.value) / 12) || 1;
    slider.value = input.value;
  } else {
    slider.min = 1; slider.max = preset.tenureMax * 12; slider.step = 1;
    input.min = 1; input.max = preset.tenureMax * 12; input.step = 1;
    input.value = Math.round(parseFloat(input.value) * 12);
    slider.value = input.value;
  }
  calculate();
}

function getMonths() {
  const val = parseFloat(document.getElementById('tenureInput').value) || 1;
  return tenureUnit === 'years' ? val * 12 : val;
}

function calcEMI(P, annualRate, months) {
  if (P <= 0 || months <= 0) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return P / months;
  const factor = Math.pow(1 + r, months);
  return P * r * factor / (factor - 1);
}

function validateInputs() {
  const P = parseFloat(document.getElementById('loanAmountInput').value);
  const rate = parseFloat(document.getElementById('interestRateInput').value);
  const tenure = parseFloat(document.getElementById('tenureInput').value);
  if (isNaN(P) || P <= 0) return 'Invalid input: Loan amount must be greater than 0';
  if (isNaN(rate) || rate < 0) return 'Invalid input: Interest rate cannot be negative';
  if (rate > 100) return 'Invalid input: Interest rate cannot exceed 100%';
  if (isNaN(tenure) || tenure <= 0) return 'Invalid input: Tenure must be greater than 0';
  return null;
}

function showError(msg) {
  document.getElementById('monthlyEMI').textContent = '—';
  document.getElementById('totalInterest').textContent = '—';
  document.getElementById('totalAmount').textContent = '—';
  document.getElementById('yearlyTable').innerHTML = `<p style="color:var(--accent-red);padding:1rem;">${msg}</p>`;
  document.getElementById('monthlyTable').innerHTML = '';
  if (emiChart) { emiChart.destroy(); emiChart = null; }
  if (barChart) { barChart.destroy(); barChart = null; }
}

function calculate() {
  const error = validateInputs();
  if (error) { showError(error); return; }

  const P = parseFloat(document.getElementById('loanAmountInput').value) || 0;
  const rate = parseFloat(document.getElementById('interestRateInput').value) || 0;
  const months = getMonths();

  const emi = calcEMI(P, rate, months);
  const totalAmount = emi * months;
  const totalInterest = totalAmount - P;

  document.getElementById('monthlyEMI').textContent = formatCurrency(emi);
  document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
  document.getElementById('totalAmount').textContent = formatCurrency(totalAmount);

  renderDoughnutChart(P, totalInterest);
  const amort = buildAmortization(P, rate, months, emi);
  lastAmortData = amort;
  renderAmortizationTables(amort);
  renderBarChart(amort.yearly);

  if (document.getElementById('earlyClosureToggle').checked) {
    calculateEarlyClosure();
  }
}

// ===== EARLY CLOSURE + COMPARISON =====

function calculateEarlyClosure() {
  const P = parseFloat(document.getElementById('loanAmountInput').value) || 0;
  const rate = parseFloat(document.getElementById('interestRateInput').value) || 0;
  const originalMonths = getMonths();
  let earlyVal = parseFloat(document.getElementById('earlyTenureInput').value) || 1;
  const earlyMonths = tenureUnit === 'years' ? earlyVal * 12 : earlyVal;

  if (earlyMonths >= originalMonths) {
    document.getElementById('earlyResults').innerHTML = '<div class="early-result-card"><div class="label">Note</div><div class="value" style="color:var(--accent-orange);font-size:0.95rem">Desired tenure must be less than current tenure</div></div>';
    document.getElementById('comparisonSection').style.display = 'none';
    document.getElementById('interestSavedBanner').classList.remove('visible');
    return;
  }

  const origEMI = calcEMI(P, rate, originalMonths);
  const earlyEMI = calcEMI(P, rate, earlyMonths);
  const origTotal = origEMI * originalMonths;
  const earlyTotal = earlyEMI * earlyMonths;
  const origInterest = origTotal - P;
  const earlyInterest = earlyTotal - P;
  const interestSaved = origTotal - earlyTotal;
  const emiDiff = earlyEMI - origEMI;

  document.getElementById('earlyResults').innerHTML = `
    <div class="early-result-card">
      <div class="label">New Monthly EMI</div>
      <div class="value">${formatCurrency(earlyEMI)}</div>
    </div>
    <div class="early-result-card">
      <div class="label">EMI Increase</div>
      <div class="value" style="color:var(--accent-orange)">${formatCurrency(emiDiff)}</div>
    </div>
    <div class="early-result-card">
      <div class="label">Interest Saved</div>
      <div class="value">${formatCurrency(interestSaved)}</div>
    </div>
    <div class="early-result-card">
      <div class="label">New Total Amount</div>
      <div class="value" style="color:var(--accent-primary-light)">${formatCurrency(earlyTotal)}</div>
    </div>`;

  const banner = document.getElementById('interestSavedBanner');
  document.getElementById('savedAmountText').textContent = formatCurrency(interestSaved);
  const origYrs = Math.floor(originalMonths / 12);
  const earlyYrs = Math.floor(earlyMonths / 12);
  const origMo = originalMonths % 12;
  const earlyMo = earlyMonths % 12;
  const origLabel = origMo ? `${origYrs}yr ${origMo}mo` : `${origYrs} years`;
  const earlyLabel = earlyMo ? `${earlyYrs}yr ${earlyMo}mo` : `${earlyYrs} years`;
  document.getElementById('savedLabelText').textContent =
    `Interest saved by choosing ${earlyLabel} instead of ${origLabel}`;
  banner.classList.add('visible');

  renderComparison(P, rate, originalMonths, earlyMonths, origEMI, earlyEMI, origInterest, earlyInterest, origTotal, earlyTotal);
}

function renderComparison(P, rate, origMonths, earlyMonths, origEMI, earlyEMI, origInterest, earlyInterest, origTotal, earlyTotal) {
  const section = document.getElementById('comparisonSection');
  section.style.display = '';

  const origYrs = tenureUnit === 'years' ? (origMonths / 12) : origMonths;
  const earlyYrs = tenureUnit === 'years' ? (earlyMonths / 12) : earlyMonths;
  const unitLabel = tenureUnit === 'years' ? 'Years' : 'Months';

  document.getElementById('comparisonGrid').innerHTML = `
    <div class="comparison-card original">
      <span class="card-tag">Original — ${origYrs} ${unitLabel}</span>
      <div class="comparison-row"><span class="comp-label">Monthly EMI</span><span class="comp-value">${formatCurrency(origEMI)}</span></div>
      <div class="comparison-row"><span class="comp-label">Total Interest</span><span class="comp-value" style="color:var(--accent-orange)">${formatCurrency(origInterest)}</span></div>
      <div class="comparison-row"><span class="comp-label">Total Amount</span><span class="comp-value">${formatCurrency(origTotal)}</span></div>
      <div class="comparison-row"><span class="comp-label">Interest %</span><span class="comp-value">${((origInterest / origTotal) * 100).toFixed(1)}%</span></div>
    </div>
    <div class="comparison-card reduced">
      <span class="card-tag">Reduced — ${earlyYrs} ${unitLabel}</span>
      <div class="comparison-row"><span class="comp-label">Monthly EMI</span><span class="comp-value">${formatCurrency(earlyEMI)}</span></div>
      <div class="comparison-row"><span class="comp-label">Total Interest</span><span class="comp-value" style="color:var(--accent-green)">${formatCurrency(earlyInterest)}</span></div>
      <div class="comparison-row"><span class="comp-label">Total Amount</span><span class="comp-value">${formatCurrency(earlyTotal)}</span></div>
      <div class="comparison-row"><span class="comp-label">Interest %</span><span class="comp-value" style="color:var(--accent-green)">${((earlyInterest / earlyTotal) * 100).toFixed(1)}%</span></div>
    </div>`;
}

// ===== CHARTS =====

function renderDoughnutChart(principal, interest) {
  const ctx = document.getElementById('emiChart').getContext('2d');
  if (emiChart) emiChart.destroy();
  emiChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Principal', 'Interest'],
      datasets: [{
        data: [Math.round(principal), Math.max(0, Math.round(interest))],
        backgroundColor: ['#6366f1', '#f59e0b'],
        borderColor: ['#4f46e5', '#d97706'],
        borderWidth: 2, hoverOffset: 8
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: true, cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, font: { family: 'Inter', size: 12 } } },
        tooltip: {
          backgroundColor: '#1a2035', titleColor: '#f1f5f9', bodyColor: '#94a3b8',
          borderColor: '#2a3352', borderWidth: 1, padding: 12,
          callbacks: { label: c => ' ' + c.label + ': ' + formatCurrency(c.raw) }
        }
      }
    }
  });
}

function renderBarChart(yearly) {
  const ctx = document.getElementById('barChart').getContext('2d');
  if (barChart) barChart.destroy();

  const years = Object.keys(yearly);
  const principals = years.map(y => Math.round(yearly[y].principal));
  const interests = years.map(y => Math.round(yearly[y].interest));

  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years.map(y => 'Yr ' + y),
      datasets: [
        { label: 'Principal', data: principals, backgroundColor: 'rgba(99,102,241,0.8)', borderColor: '#6366f1', borderWidth: 1, borderRadius: 4 },
        { label: 'Interest', data: interests, backgroundColor: 'rgba(245,158,11,0.8)', borderColor: '#f59e0b', borderWidth: 1, borderRadius: 4 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          stacked: true,
          ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
          grid: { color: 'rgba(42,51,82,0.3)' }
        },
        y: {
          stacked: true,
          ticks: {
            color: '#64748b', font: { family: 'Inter', size: 11 },
            callback: v => '₹' + (v >= 100000 ? (v / 100000).toFixed(1) + 'L' : v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v)
          },
          grid: { color: 'rgba(42,51,82,0.3)' }
        }
      },
      plugins: {
        legend: { labels: { color: '#94a3b8', padding: 16, font: { family: 'Inter', size: 12 } } },
        tooltip: {
          backgroundColor: '#1a2035', titleColor: '#f1f5f9', bodyColor: '#94a3b8',
          borderColor: '#2a3352', borderWidth: 1, padding: 12,
          callbacks: { label: c => ' ' + c.dataset.label + ': ' + formatCurrency(c.raw) }
        }
      }
    }
  });
}

// ===== AMORTIZATION =====

function buildAmortization(P, annualRate, totalMonths, emi) {
  const r = annualRate / 12 / 100;
  let balance = P;
  const monthly = [];
  const yearly = {};

  for (let m = 1; m <= totalMonths; m++) {
    const interestPaid = balance * r;
    let principalPaid = emi - interestPaid;
    if (m === totalMonths) principalPaid = balance;
    const closing = Math.max(0, balance - principalPaid);

    monthly.push({
      month: m, opening: balance,
      emi: (m === totalMonths) ? (principalPaid + interestPaid) : emi,
      interest: interestPaid, principal: principalPaid, closing
    });

    const year = Math.ceil(m / 12);
    if (!yearly[year]) yearly[year] = { interest: 0, principal: 0, opening: balance, closing: 0 };
    yearly[year].interest += interestPaid;
    yearly[year].principal += principalPaid;
    yearly[year].closing = closing;
    balance = closing;
  }
  return { monthly, yearly };
}

function renderAmortizationTables({ monthly, yearly }) {
  let yHTML = `<table class="amort-table">
    <thead><tr><th>Year</th><th>Opening Balance</th><th>Interest Paid</th><th>Principal Paid</th><th>Closing Balance</th></tr></thead><tbody>`;
  for (const y in yearly) {
    const d = yearly[y];
    yHTML += `<tr><td>Year ${y}</td><td>${formatCurrency(d.opening)}</td><td>${formatCurrency(d.interest)}</td><td>${formatCurrency(d.principal)}</td><td>${formatCurrency(d.closing)}</td></tr>`;
  }
  yHTML += '</tbody></table>';
  document.getElementById('yearlyTable').innerHTML = yHTML;

  let mHTML = `<table class="amort-table">
    <thead><tr><th>Month</th><th>Opening Balance</th><th>EMI</th><th>Interest Paid</th><th>Principal Paid</th><th>Closing Balance</th></tr></thead><tbody>`;
  for (const r of monthly) {
    mHTML += `<tr><td>${r.month}</td><td>${formatCurrency(r.opening)}</td><td>${formatCurrency(r.emi)}</td><td>${formatCurrency(r.interest)}</td><td>${formatCurrency(r.principal)}</td><td>${formatCurrency(r.closing)}</td></tr>`;
  }
  mHTML += '</tbody></table>';
  document.getElementById('monthlyTable').innerHTML = mHTML;
}

function showAmortTab(tab) {
  document.getElementById('yearlyTable').style.display = tab === 'yearly' ? '' : 'none';
  document.getElementById('monthlyTable').style.display = tab === 'monthly' ? '' : 'none';
  document.getElementById('tabYearly').classList.toggle('active', tab === 'yearly');
  document.getElementById('tabMonthly').classList.toggle('active', tab === 'monthly');
}

// ===== CSV DOWNLOAD =====

function downloadCSV(type) {
  let csv = '';
  let filename = '';
  const loanLabel = LOAN_PRESETS[currentLoanType]?.label || 'EMI';

  if (type === 'yearly') {
    csv = 'Year,Opening Balance,Interest Paid,Principal Paid,Closing Balance\n';
    for (const y in lastAmortData.yearly) {
      const d = lastAmortData.yearly[y];
      csv += `Year ${y},${Math.round(d.opening)},${Math.round(d.interest)},${Math.round(d.principal)},${Math.round(d.closing)}\n`;
    }
    filename = `${loanLabel}_Yearly_Amortization.csv`;
  } else {
    csv = 'Month,Opening Balance,EMI,Interest Paid,Principal Paid,Closing Balance\n';
    for (const r of lastAmortData.monthly) {
      csv += `${r.month},${Math.round(r.opening)},${Math.round(r.emi)},${Math.round(r.interest)},${Math.round(r.principal)},${Math.round(r.closing)}\n`;
    }
    filename = `${loanLabel}_Monthly_Amortization.csv`;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
