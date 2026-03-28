/* ===== Loan Prepayment Calculator Logic ===== */

let prepayChart = null;

document.addEventListener('DOMContentLoaded', () => {
  syncSliderInput('loanAmountSlider', 'loanAmountInput', calculate);
  syncSliderInput('interestRateSlider', 'interestRateInput', calculate);
  syncSliderInput('tenureSlider', 'tenureInput', calculate);
  syncSliderInput('prepayAmountSlider', 'prepayAmountInput', calculate);
  document.getElementById('prepayFreqInput').addEventListener('change', calculate);
  createShareButtons('shareButtons');
  calculate();
});

function calcEMI(P, annualRate, months) {
  const r = annualRate / 12 / 100;
  if (r === 0) return P / months;
  const factor = Math.pow(1 + r, months);
  return P * r * factor / (factor - 1);
}

function calculate() {
  const P = parseFloat(document.getElementById('loanAmountInput').value) || 0;
  const rate = parseFloat(document.getElementById('interestRateInput').value) || 0;
  const years = parseFloat(document.getElementById('tenureInput').value) || 0;
  const prepayAmt = parseFloat(document.getElementById('prepayAmountInput').value) || 0;
  const freq = document.getElementById('prepayFreqInput').value;

  const totalMonths = years * 12;
  const r = rate / 12 / 100;
  const emi = calcEMI(P, rate, totalMonths);

  // Original schedule
  const origTotalPaid = emi * totalMonths;
  const origInterest = origTotalPaid - P;

  // Prepayment schedule
  let balance = P;
  let newMonths = 0;
  let newTotalInterest = 0;

  // Determine prepayment interval in months
  let prepayInterval;
  switch (freq) {
    case 'yearly': prepayInterval = 12; break;
    case 'half-yearly': prepayInterval = 6; break;
    case 'quarterly': prepayInterval = 3; break;
    case 'one-time': prepayInterval = -1; break;
    default: prepayInterval = 12;
  }

  let oneTimeDone = false;

  while (balance > 0 && newMonths < totalMonths * 2) {
    newMonths++;
    const interestThisMonth = balance * r;
    const principalThisMonth = Math.min(emi - interestThisMonth, balance);
    newTotalInterest += interestThisMonth;
    balance -= principalThisMonth;

    if (balance <= 0) break;

    // Apply prepayment
    if (prepayInterval === -1) {
      if (!oneTimeDone && newMonths === 1) {
        balance = Math.max(0, balance - prepayAmt);
        oneTimeDone = true;
      }
    } else if (newMonths % prepayInterval === 0) {
      balance = Math.max(0, balance - prepayAmt);
    }
  }

  const interestSaved = origInterest - newTotalInterest;
  const timeSaved = totalMonths - newMonths;

  document.getElementById('origInterest').textContent = formatCurrency(origInterest);
  document.getElementById('newInterest').textContent = formatCurrency(newTotalInterest);
  document.getElementById('interestSaved').textContent = formatCurrency(Math.max(0, interestSaved));

  if (timeSaved > 0) {
    const savedYears = Math.floor(timeSaved / 12);
    const savedMonths = timeSaved % 12;
    let timeStr = '';
    if (savedYears > 0) timeStr += savedYears + ' year' + (savedYears > 1 ? 's' : '');
    if (savedMonths > 0) timeStr += (timeStr ? ' ' : '') + savedMonths + ' month' + (savedMonths > 1 ? 's' : '');
    document.getElementById('timeSaved').textContent = timeStr;
  } else {
    document.getElementById('timeSaved').textContent = '0 months';
  }

  renderChart(origInterest, newTotalInterest);
}

function renderChart(origInterest, newInterest) {
  const ctx = document.getElementById('prepayChart').getContext('2d');
  if (prepayChart) prepayChart.destroy();

  prepayChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Interest (Without Prepayment)', 'Interest (With Prepayment)'],
      datasets: [{
        data: [Math.round(origInterest), Math.round(newInterest)],
        backgroundColor: ['#f59e0b', '#6366f1'],
        borderColor: ['#d97706', '#4f46e5'],
        borderWidth: 2,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', padding: 16, font: { family: 'Inter', size: 11 } }
        },
        tooltip: {
          backgroundColor: '#1a2035',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          borderColor: '#2a3352',
          borderWidth: 1,
          padding: 12,
          callbacks: { label: ctx => ' ' + ctx.label + ': ' + formatCurrency(ctx.raw) }
        }
      }
    }
  });
}
