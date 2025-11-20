'use client'

import { BacktestResult } from '@/app/page'
import Papa from 'papaparse'

interface ExportButtonProps {
  result: BacktestResult
}

export default function ExportButton({ result }: ExportButtonProps) {
  const exportToCSV = (data: any[], filename: string) => {
    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportTrades = () => {
    exportToCSV(result.trades, 'backtest_trades.csv')
  }

  const handleExportMetrics = () => {
    const metricsData = [
      {
        Metric: 'Total P&L',
        Value: result.metrics.totalPnl,
      },
      {
        Metric: 'Win Rate',
        Value: `${(result.metrics.winRate * 100).toFixed(2)}%`,
      },
      {
        Metric: 'Total Wins',
        Value: result.metrics.totalWins,
      },
      {
        Metric: 'Total Losses',
        Value: result.metrics.totalLosses,
      },
      {
        Metric: 'Max Drawdown',
        Value: `${(result.metrics.maxDrawdown * 100).toFixed(2)}%`,
      },
      {
        Metric: 'Initial Capital',
        Value: result.metrics.initialCapital,
      },
      {
        Metric: 'Final Capital',
        Value: result.metrics.finalCapital,
      },
      {
        Metric: 'Total Trades',
        Value: result.metrics.totalTrades,
      },
    ]
    exportToCSV(metricsData, 'backtest_metrics.csv')
  }

  const handleExportEquityCurve = () => {
    exportToCSV(result.equityCurve, 'backtest_equity_curve.csv')
  }

  return (
    <div className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 dark:border-gray-700/50">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white">
          Export Results
        </h3>
      </div>
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <button
          onClick={handleExportTrades}
          className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 w-full sm:w-auto hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Trades (CSV)
        </button>
        <button
          onClick={handleExportMetrics}
          className="group px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 w-full sm:w-auto hover:scale-105 hover:shadow-lg hover:shadow-pink-500/50 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Metrics (CSV)
        </button>
        <button
          onClick={handleExportEquityCurve}
          className="group px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 w-full sm:w-auto hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Equity Curve (CSV)
        </button>
      </div>
    </div>
  )
}

