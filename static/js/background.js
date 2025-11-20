// Animated trading chart background
const canvas = document.getElementById('tradingChart');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Generate random price data
function generatePriceData(length) {
    const data = [];
    let price = 100;
    for (let i = 0; i < length; i++) {
        price += (Math.random() - 0.5) * 2;
        data.push(price);
    }
    return data;
}

// Draw candlestick chart
function drawCandlestick(x, open, high, low, close, width) {
    const yScale = canvas.height / 200;
    const yBase = canvas.height / 2;
    
    const openY = yBase - (open - 100) * yScale;
    const highY = yBase - (high - 100) * yScale;
    const lowY = yBase - (low - 100) * yScale;
    const closeY = yBase - (close - 100) * yScale;
    
    const isGreen = close > open;
    ctx.strokeStyle = isGreen ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 51, 102, 0.3)';
    ctx.fillStyle = isGreen ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 51, 102, 0.2)';
    
    // Draw wick
    ctx.beginPath();
    ctx.moveTo(x, highY);
    ctx.lineTo(x, lowY);
    ctx.stroke();
    
    // Draw body
    const bodyTop = Math.min(openY, closeY);
    const bodyHeight = Math.abs(closeY - openY);
    ctx.fillRect(x - width/2, bodyTop, width, bodyHeight);
    ctx.strokeRect(x - width/2, bodyTop, width, bodyHeight);
}

// Generate OHLC data
function generateOHLCData(length) {
    const data = [];
    let price = 100;
    for (let i = 0; i < length; i++) {
        const change = (Math.random() - 0.5) * 4;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        data.push({ open, high, low, close });
        price = close;
    }
    return data;
}

let ohlcData = generateOHLCData(50);
let offset = 0;

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        const y = (canvas.height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Draw candlesticks
    const candleWidth = canvas.width / 50;
    const spacing = candleWidth * 1.2;
    
    for (let i = 0; i < ohlcData.length; i++) {
        const x = (i * spacing) - offset;
        if (x > -candleWidth && x < canvas.width + candleWidth) {
            const candle = ohlcData[i];
            drawCandlestick(x, candle.open, candle.high, candle.low, candle.close, candleWidth * 0.8);
        }
    }
    
    // Animate scrolling
    offset += 0.5;
    if (offset > spacing) {
        offset = 0;
        ohlcData.shift();
        const lastPrice = ohlcData[ohlcData.length - 1].close;
        const change = (Math.random() - 0.5) * 4;
        const open = lastPrice;
        const close = lastPrice + change;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        ohlcData.push({ open, high, low, close });
    }
    
    requestAnimationFrame(animate);
}

animate();

// Add floating numbers
function createFloatingNumber() {
    const number = document.createElement('div');
    number.textContent = (Math.random() > 0.5 ? '+' : '-') + (Math.random() * 100).toFixed(2);
    number.style.position = 'fixed';
    number.style.left = Math.random() * window.innerWidth + 'px';
    number.style.top = window.innerHeight + 'px';
    number.style.color = Math.random() > 0.5 ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 51, 102, 0.5)';
    number.style.fontSize = '1.5rem';
    number.style.fontWeight = 'bold';
    number.style.pointerEvents = 'none';
    number.style.zIndex = '0';
    number.style.transition = 'all 3s linear';
    document.body.appendChild(number);
    
    setTimeout(() => {
        number.style.top = '-50px';
        number.style.opacity = '0';
    }, 100);
    
    setTimeout(() => {
        number.remove();
    }, 3100);
}

setInterval(createFloatingNumber, 2000);

