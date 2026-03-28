/* ===== FD Calculator Logic ===== */

let fdChart = null;

document.addEventListener('DOMContentLoaded', () => {
  syncSliderInput('depositSlider', 'depositInput', calculate);
  syncSliderInput('fdRateSlider', 'fdRateInput', calculate);
  syncSliderInput('fdTenureSlider', 'fdTenureInput', calculate);
  document.getElementById('fdCompoundInput').addEventListener('change', calculate);
  createShareButtons('shareButtons');
  calculate();
});

function calculate() {
  const P = parseFloat(document.getElementById('depositInput').value) || 0;
  const r = parseFloat(document.getElementById('fdRateInput').value) || 0;
  const t = parseFloat(document.getElementById('fdTenureInput').value) || 0;
  const n = parseInt(document.getElementById('fdCompoundInput').value) || 4;

  const maturity = P * Math.pow(1 + (r / 100) / n, n * t);
  const interest = maturity - P;

  document.getElementById('fdDeposit').textContent = formatCurrency(P);
  document.getElementById('fdInterest').textContent = formatCurrency(interest);
  document.getElementById('fdMaturity').textContent = formatCurrency(maturity);

  renderChart(P, interest);
  renderTable(P, r, t, n);
}

function renderChart(deposit, interest) {
  const ctx = document.getElementById('fdChart').getContext('2d');
  if (fdChart) fdChart.destroy();

  fdChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Deposit', 'Interest Earned'],
      datasets: [{
        data: [Math.round(deposit), Math.round(interest)],
        backgroundColor: ['#3b82f6', '#10b981'],
        borderColor: ['#2563eb', '#059669'],
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
    <thead><tr><th>Year</th><th>Opening Balance</th><th>Interest Earned</th><th>Closing Balance</th></tr></thead><tbody>`;

  for (let y = 1; y <= t; y++) {
    const prevBal = P * Math.pow(1 + (r / 100) / n, n * (y - 1));
    const curBal = P * Math.pow(1 + (r / 100) / n, n * y);
    const intEarned = curBal - prevBal;
    html += `<tr><td>Year ${y}</td><td>${formatCurrency(prevBal)}</td><td>${formatCurrency(intEarned)}</td><td>${formatCurrency(curBal)}</td></tr>`;
  }

  html += '</tbody></table>';
  document.getElementById('fdGrowthTable').innerHTML = html;
}
