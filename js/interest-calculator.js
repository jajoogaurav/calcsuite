/* ===== Interest Calculator Logic ===== */

let interestChart = null;

document.addEventListener('DOMContentLoaded', () => {
  syncSliderInput('principalSlider', 'principalInput', calculate);
  syncSliderInput('rateSlider', 'rateInput', calculate);
  syncSliderInput('timeSlider', 'timeInput', calculate);
  document.getElementById('compoundFreqInput').addEventListener('change', calculate);
  createShareButtons('shareButtons');
  calculate();
});

function calculate() {
  const P = parseFloat(document.getElementById('principalInput').value) || 0;
  const r = parseFloat(document.getElementById('rateInput').value) || 0;
  const t = parseFloat(document.getElementById('timeInput').value) || 0;
  const n = parseInt(document.getElementById('compoundFreqInput').value) || 1;

  const SI = P * r * t / 100;
  const CI_maturity = P * Math.pow(1 + (r / 100) / n, n * t);
  const CI = CI_maturity - P;

  document.getElementById('simpleInterest').textContent = formatCurrency(SI);
  document.getElementById('compoundInterest').textContent = formatCurrency(CI);
  document.getElementById('maturitySimple').textContent = formatCurrency(P + SI);
  document.getElementById('maturityCompound').textContent = formatCurrency(CI_maturity);

  renderChart(SI, CI);
  renderTable(P, r, t, n);
}

function renderChart(SI, CI) {
  const ctx = document.getElementById('interestChart').getContext('2d');
  if (interestChart) interestChart.destroy();

  interestChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Simple Interest', 'Compound Interest'],
      datasets: [{
        data: [Math.round(SI), Math.round(CI)],
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
          labels: { color: '#94a3b8', padding: 16, font: { family: 'Inter', size: 12 } }
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

function renderTable(P, r, t, n) {
  let html = `<table class="amort-table">
    <thead><tr><th>Year</th><th>Simple Interest</th><th>SI Maturity</th><th>Compound Interest</th><th>CI Maturity</th></tr></thead><tbody>`;

  for (let y = 1; y <= t; y++) {
    const si = P * r * y / 100;
    const ciMat = P * Math.pow(1 + (r / 100) / n, n * y);
    const ci = ciMat - P;
    html += `<tr><td>Year ${y}</td><td>${formatCurrency(si)}</td><td>${formatCurrency(P + si)}</td><td>${formatCurrency(ci)}</td><td>${formatCurrency(ciMat)}</td></tr>`;
  }

  html += '</tbody></table>';
  document.getElementById('comparisonTable').innerHTML = html;
}
