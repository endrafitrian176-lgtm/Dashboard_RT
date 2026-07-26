let flowChartObj = null;
let trendChartObj = null;

async function renderCharts() {
    const kasData = await loadData('kas');
    
    // Sort transactions by date
    kasData.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    
    // Process Data
    const monthlyData = {};
    let runningBalance = 0;
    
    kasData.forEach(tx => {
        const date = new Date(tx.tanggal);
        const monthYear = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
        
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = {
                monthLabel: monthYear,
                pemasukan: 0,
                pengeluaran: 0,
                saldo: 0
            };
        }
        
        if (tx.jenis === 'Pemasukan') {
            monthlyData[monthYear].pemasukan += tx.nominal;
            runningBalance += tx.nominal;
        } else {
            monthlyData[monthYear].pengeluaran += tx.nominal;
            runningBalance -= tx.nominal;
        }
        monthlyData[monthYear].saldo = runningBalance;
    });

    const months = Object.keys(monthlyData);
    const pemasukanArr = months.map(m => monthlyData[m].pemasukan);
    const penguelaranArr = months.map(m => monthlyData[m].pengeluaran);
    const saldoArr = months.map(m => monthlyData[m].saldo);

    // Get Theme styles
    const isDark = document.body.classList.contains('dark-mode');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#334155' : '#e2e8f0';

    // Chart 1: Pemasukan vs Pengeluaran Bar Chart
    const ctxFlow = document.getElementById('flowChart');
    if (ctxFlow) {
        if (flowChartObj) flowChartObj.destroy();
        flowChartObj = new Chart(ctxFlow, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        label: 'Pemasukan',
                        data: pemasukanArr,
                        backgroundColor: '#10b981', // green-500
                        borderRadius: 6,
                    },
                    {
                        label: 'Pengeluaran',
                        data: penguelaranArr,
                        backgroundColor: '#ef4444', // red-500
                        borderRadius: 6,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: textColor }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + formatRupiah(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return value >= 1000000 ? (value / 1000000) + ' Jt' : value;
                            }
                        }
                    }
                }
            }
        });
    }

    // Chart 2: Saldo Trend Line Chart
    const ctxTrend = document.getElementById('trendChart');
    if (ctxTrend) {
        if (trendChartObj) trendChartObj.destroy();
        trendChartObj = new Chart(ctxTrend, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Saldo Kas RT',
                    data: saldoArr,
                    borderColor: '#3b82f6', // blue-500
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#3b82f6',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: textColor }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Saldo: ' + formatRupiah(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: textColor }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return value >= 1000000 ? (value / 1000000) + ' Jt' : value;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Listen to dark mode changes
window.addEventListener('themeChanged', () => {
    renderCharts();
});

// Run chart rendering once data functions are bound
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('flowChart') || document.getElementById('trendChart')) {
        renderCharts();
    }
});
