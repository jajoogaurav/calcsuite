/* ===== SIP Calculator Logic ===== */

let sipChart = null;

document.addEventListener('DOMContentLoaded', () => {
  syncSliderInput('monthlyInvestSlider', 'monthlyInvestInput', calculate);
  syncSliderInput('expectedReturnSlider', 'expectedReturnInput', calculate);
  syncSliderInput('timePeriodSlider', 'timePeriodInput', calculate);
  createShareButtons('shareButtons');
  calculate();
});

function calculate() {
  const monthlyInvest = parseFloat(document.getElementById('monthlyInvestInput').value) || 0;
  const annualReturn = parseFloat(document.getElementById('expectedReturnInput').value) || 0;
  const years = parseFloat(document.getElementById('timePeriodInput').value) || 0;

  const months = years * 12;
  const monthlyRate = annualReturn / 12 / 100;

  let totalValue = 0;
  if (monthlyRate > 0) {
    totalValue = monthlyInvest * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  } else {
    totalValue = monthlyInvest * months;
  }

  const invested = monthlyInvest * months;
  const returns = totalValue - invested;

  document.getElementById('investedAmount').textContent = formatCurrency(invested);
  document.getElementById('estimatedReturns').textContent = formatCurrency(returns);
  document.getElementById('totalValue').textContent = formatCurrency(totalValue);

  renderChart(invested, returns);
  renderGrowthTable(monthlyInvest, monthlyRate, years);
}

function renderChart(invested, returns) {
  const ctx = document.getElementById('sipChart').getContext('2d');
  if (sipChart) sipChart.destroy();

  sipChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Invested Amount', 'Returns'],
      datasets: [{
        data: [Math.round(invested), Math.round(returns)],
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

function renderGrowthTable(monthlyInvest, monthlyRate, years) {
  let html = `<table class="amort-table">
    <thead><tr><th>Year</th><th>Invested</th><th>Returns</th><th>Total Value</th></tr></thead><tbody>`;

  for (let y = 1; y <= years; y++) {
    const m = y * 12;
    const invested = monthlyInvest * m;
    let total = 0;
    if (monthlyRate > 0) {
      total = monthlyInvest * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate);
    } else {
      total = invested;
    }
    const returns = total - invested;
    html += `<tr><td>Year ${y}</td><td>${formatCurrency(invested)}</td><td>${formatCurrency(returns)}</td><td>${formatCurrency(total)}</td></tr>`;
  }

  html += '</tbody></table>';
  document.getElementById('growthTable').innerHTML = html;
}
