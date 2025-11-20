// Global state
let signalFile = null;
let marketFile = null;
let signalData = null;
let marketData = null;

// File upload handlers
document.getElementById('signalFile').addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'signal'));
document.getElementById('marketFile').addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'market'));

// Drag and drop
['signalUploadArea', 'marketUploadArea'].forEach(id => {
    const area = document.getElementById(id);
    area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.classList.add('dragover');
    });
    area.addEventListener('dragleave', () => {
        area.classList.remove('dragover');
    });
    area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (id === 'signalUploadArea') {
            document.getElementById('signalFile').files = e.dataTransfer.files;
            handleFileUpload(file, 'signal');
        } else {
            document.getElementById('marketFile').files = e.dataTransfer.files;
            handleFileUpload(file, 'market');
        }
    });
});

// Time window input validation
document.getElementById('timeWindow').addEventListener('input', (e) => {
    let value = parseInt(e.target.value) || 0;
    if (value < 0) value = 0;
    if (value > 3600) value = 3600;
    e.target.value = value;
});

// Handle file upload
async function handleFileUpload(file, type) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const infoDiv = document.getElementById(type === 'signal' ? 'signalInfo' : 'marketInfo');
    infoDiv.innerHTML = 'Uploading...';
    
    try {
        // Upload file
        const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!uploadRes.ok) {
            throw new Error('Upload failed');
        }
        
        const uploadData = await uploadRes.json();
        
        // Extract data
        const extractRes = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filepath: uploadData.filepath,
                type: type
            })
        });
        
        if (!extractRes.ok) {
            throw new Error('Extraction failed');
        }
        
        const extractData = await extractRes.json();
        
        // Store data
        if (type === 'signal') {
            signalFile = uploadData.filename;
            signalData = extractData.data;
        } else {
            marketFile = uploadData.filename;
            marketData = extractData.data;
        }
        
        // Show info
        const info = extractData.detection_info;
        infoDiv.innerHTML = `
            <div class="success">
                ✅ File loaded: ${uploadData.filename}<br>
                Rows processed: ${info.rows_processed}<br>
                ${info.rows_removed > 0 ? `Removed ${info.rows_removed} invalid rows` : ''}
            </div>
        `;
        infoDiv.classList.add('success');
        
        // Enable run button if both files are loaded
        if (signalData && marketData) {
            document.getElementById('runBacktest').disabled = false;
        }
    } catch (error) {
        infoDiv.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
        infoDiv.classList.remove('success');
    }
}

// Run backtest
document.getElementById('runBacktest').addEventListener('click', async () => {
    if (!signalData || !marketData) {
        showError('Please upload both signal and market data files');
        return;
    }
    
    const timeWindow = parseInt(document.getElementById('timeWindow').value);
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const error = document.getElementById('error');
    
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    error.classList.add('hidden');
    
    try {
        const res = await fetch('/api/backtest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                signals: signalData,
                market_data: marketData,
                time_window: timeWindow
            })
        });
        
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Backtest failed');
        }
        
        const data = await res.json();
        displayResults(data);
        
    } catch (err) {
        showError(err.message);
    } finally {
        loading.classList.add('hidden');
    }
});

// Display results
function displayResults(data) {
    const results = document.getElementById('results');
    results.classList.remove('hidden');
    
    // Update metrics
    const metrics = data.metrics;
    const pnlElement = document.getElementById('totalPnl');
    pnlElement.textContent = `$${metrics.total_pnl.toFixed(2)}`;
    pnlElement.className = 'metric-value ' + (metrics.total_pnl >= 0 ? 'positive' : 'negative');
    
    document.getElementById('winRate').textContent = `${(metrics.win_rate * 100).toFixed(1)}%`;
    document.getElementById('totalTrades').textContent = metrics.total_trades;
    document.getElementById('maxDrawdown').textContent = `${(metrics.max_drawdown * 100).toFixed(2)}%`;
    
    // Draw charts
    drawEquityChart(data.equity_curve);
    drawDrawdownChart(data.drawdown);
    drawTradeHistogram(data.trade_results);
    
    // Display trades table
    displayTradesTable(data.trades);
}

// Draw equity curve
function drawEquityChart(equityCurve) {
    const timestamps = equityCurve.map(d => d.timestamp);
    const equity = equityCurve.map(d => d.equity);
    
    const trace = {
        x: timestamps,
        y: equity,
        type: 'scatter',
        mode: 'lines',
        name: 'Equity',
        line: { color: '#00ff88', width: 2 }
    };
    
    const layout = {
        title: 'Equity Curve',
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#ffffff' },
        xaxis: { gridcolor: 'rgba(0,212,255,0.2)' },
        yaxis: { gridcolor: 'rgba(0,212,255,0.2)' }
    };
    
    Plotly.newPlot('equityChart', [trace], layout, { responsive: true });
}

// Draw drawdown chart
function drawDrawdownChart(drawdown) {
    if (!drawdown || drawdown.length === 0) return;
    
    const timestamps = drawdown.map(d => d.timestamp);
    const drawdownValues = drawdown.map(d => d.drawdown * 100);
    
    const trace = {
        x: timestamps,
        y: drawdownValues,
        type: 'scatter',
        mode: 'lines',
        fill: 'tozeroy',
        name: 'Drawdown',
        line: { color: '#ff3366' },
        fillcolor: 'rgba(255,51,102,0.3)'
    };
    
    const layout = {
        title: 'Drawdown',
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#ffffff' },
        xaxis: { gridcolor: 'rgba(0,212,255,0.2)' },
        yaxis: { gridcolor: 'rgba(0,212,255,0.2)', title: 'Drawdown %' }
    };
    
    Plotly.newPlot('drawdownChart', [trace], layout, { responsive: true });
}

// Draw trade histogram
function drawTradeHistogram(tradeResults) {
    if (!tradeResults || tradeResults.length === 0) return;
    
    const trace = {
        x: tradeResults,
        type: 'histogram',
        marker: {
            color: tradeResults.map(v => v >= 0 ? '#00ff88' : '#ff3366')
        }
    };
    
    const layout = {
        title: 'Trade P&L Distribution',
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { color: '#ffffff' },
        xaxis: { gridcolor: 'rgba(0,212,255,0.2)', title: 'P&L' },
        yaxis: { gridcolor: 'rgba(0,212,255,0.2)', title: 'Frequency' }
    };
    
    Plotly.newPlot('tradeHistogram', [trace], layout, { responsive: true });
}

// Display trades table
function displayTradesTable(trades) {
    const tbody = document.querySelector('#tradesTable tbody');
    tbody.innerHTML = '';
    
    trades.forEach(trade => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${trade.id}</td>
            <td>${trade.action}</td>
            <td>$${parseFloat(trade.signal_price).toFixed(2)}</td>
            <td>$${parseFloat(trade.execution_price).toFixed(2)}</td>
            <td class="${trade.pnl >= 0 ? 'positive' : 'negative'}">$${parseFloat(trade.pnl).toFixed(2)}</td>
            <td>${trade.is_win ? '✅ Win' : '❌ Loss'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Show error
function showError(message) {
    const error = document.getElementById('error');
    error.textContent = `❌ ${message}`;
    error.classList.remove('hidden');
}

