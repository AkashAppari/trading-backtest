# Trading Signal Backtester

A simple Python tool to test trading strategies using historical data. Upload your trading signals and market data, then see how your strategy would have performed.

## What This Project Does

This tool helps you:
- **Test trading strategies** by simulating trades on historical data
- **Analyze performance** with metrics like profit/loss, win rate, and drawdown
- **Visualize results** with interactive charts
- **Export data** for further analysis

## Features

- 📁 **Easy File Upload**: Upload Excel or CSV files with your data
- 🔍 **Smart Detection**: Automatically finds the right columns in your files
- 📊 **Visual Results**: See your performance with interactive charts
- 💾 **Export Data**: Download results as CSV files

## Getting Started

### Option 1: Web Interface (Recommended)

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Web Server**
   ```bash
   python app.py
   ```

3. **Open in Browser**
   Navigate to `http://localhost:5000` in your web browser

### Option 2: Jupyter Notebook

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start Jupyter**
   ```bash
   jupyter notebook
   ```

3. **Open the Notebook**
   Navigate to the `notebooks/` folder and open `backtest.ipynb`, then run all cells.

## How to Use

1. **Upload Signal File**: Your buy/sell signals (Excel or CSV)
   - Needs: timestamp, action (buy/sell), price
   
2. **Upload Market Data File**: Historical price data (Excel or CSV)
   - Needs: timestamp, open, high, low, close prices

3. **Run Backtest**: Click the "Run Backtest" button

4. **View Results**: See your performance metrics and charts

## File Format Examples

### Signal File
```csv
timestamp,action,price
2024-01-01 10:00:00,buy,100.50
2024-01-01 11:00:00,sell,102.30
```

### Market Data File
```csv
timestamp,open,high,low,close
2024-01-01 10:00:00,100.00,101.00,99.50,100.50
2024-01-01 11:00:00,100.50,102.50,100.00,102.30
```

**Note**: The tool automatically detects column names, so variations like "time", "date", "buy/sell", "long/short" will work too!

## What Gets Calculated

- **Total P&L**: Total profit or loss
- **Win Rate**: Percentage of winning trades
- **Max Drawdown**: Biggest loss from peak value
- **Trade Breakdown**: Details of every trade made
- **Equity Curve**: How your money changed over time

## Project Structure

```
trading-backtester/
├── app.py                    # Flask web server
├── backtest_logic.py         # Backtesting logic
├── templates/
│   └── index.html           # Web interface
├── static/
│   ├── css/
│   │   └── style.css        # Styling with trading visuals
│   └── js/
│       ├── app.js           # Main application logic
│       └── background.js    # Animated trading chart background
├── notebooks/
│   └── backtest.ipynb       # Jupyter notebook interface (optional)
├── requirements.txt         # Required Python packages
└── README.md                # This file
```

## Technologies Used

- **Python 3.8+**: Programming language
- **Flask**: Web framework
- **Pandas**: Data manipulation
- **Plotly**: Interactive charts
- **HTML/CSS/JavaScript**: Frontend with animated trading visuals
- **Jupyter** (optional): Interactive notebook environment

## License

MIT
