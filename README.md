# Trading Signal Backtester

A fully responsive web application for backtesting trading signals against market data with comprehensive performance metrics and visualizations.

## Features

- **File Upload**: Upload signal files (timestamp, action, price) and market data files (timestamp, open, high, low, close)
- **Smart Matching**: Automatically pairs signals with nearest matching market prices within a configurable time window
- **Performance Metrics**: Calculates and displays:
  - Total profit/loss
  - Win/loss ratio
  - Maximum drawdown
  - Final capital
  - Trade-by-trade breakdown
- **Interactive Visualizations**:
  - Equity curve
  - Drawdown chart
  - Trade results histogram
- **Export Functionality**: Export results, metrics, and equity curve to CSV
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Input Validation**: Comprehensive validation and error messaging
- **Secure File Handling**: Client-side processing ensures data privacy

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## File Format

### Signal File (CSV)
Required columns:
- `timestamp`: Date/time of the signal (ISO format or standard date format)
- `action`: Either "buy" or "sell"
- `price`: Signal price

Example:
```csv
timestamp,action,price
2024-01-01 10:00:00,buy,100.50
2024-01-01 11:00:00,sell,102.30
```

### Market Data File (CSV)
Required columns:
- `timestamp`: Date/time of the market data point
- `open`: Opening price
- `high`: High price
- `low`: Low price
- `close`: Closing price

Example:
```csv
timestamp,open,high,low,close
2024-01-01 10:00:00,100.00,101.00,99.50,100.50
2024-01-01 11:00:00,100.50,102.50,100.00,102.30
```

## How It Works

1. **Upload Files**: Upload your signal and market data CSV files
2. **Set Time Window**: Configure the maximum time difference (in seconds) for matching signals to market data
3. **Run Backtest**: Click "Run Backtest" to process the data
4. **View Results**: Review performance metrics, charts, and detailed trade breakdown
5. **Export**: Download results as CSV files for further analysis

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **CSV Processing**: PapaParse
- **Date Handling**: date-fns

## License

MIT

