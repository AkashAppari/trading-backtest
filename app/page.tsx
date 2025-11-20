'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import TimeWindowSelector from '@/components/TimeWindowSelector'
import PerformanceMetrics from '@/components/PerformanceMetrics'
import Charts from '@/components/Charts'
import TradeTable from '@/components/TradeTable'
import ExportButton from '@/components/ExportButton'
import { processBacktest } from '@/lib/backtest'

export interface Signal {
  timestamp: string
  action: 'buy' | 'sell'
  price: number
}

export interface MarketData {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
}

export interface Trade {
  id: number
  signalTimestamp: string
  action: 'long' | 'short'
  signalPrice: number
  executionTimestamp: string
  executionPrice: number
  quantity: number
  pnl: number
  cumulativePnl: number
  isWin: boolean
}

export interface BacktestResult {
  trades: Trade[]
  metrics: {
    totalPnl: number
    winRate: number
    totalWins: number
    totalLosses: number
    maxDrawdown: number
    finalCapital: number
    initialCapital: number
    totalTrades: number
  }
  equityCurve: { timestamp: string; equity: number }[]
  drawdown: { timestamp: string; drawdown: number }[]
  tradeResults: number[]
}

export default function Home() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [timeWindow, setTimeWindow] = useState<number>(0)
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleProcess = async () => {
    if (signals.length === 0 || marketData.length === 0) {
      setError('Please upload both signal and market data files')
      return
    }

    setLoading(true)
    setError('')

    try {
      const backtestResult = processBacktest(signals, marketData, timeWindow)
      setResult(backtestResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during processing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-3 drop-shadow-lg">
              Trading Signal Backtester
            </h1>
          </div>
          <p className="text-base sm:text-lg text-gray-300 px-4 max-w-2xl mx-auto">
            Analyze your trading signals against market data with comprehensive performance metrics
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold border border-blue-500/30">Real-time Analysis</span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold border border-purple-500/30">Advanced Metrics</span>
            <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-xs font-semibold border border-pink-500/30">Interactive Charts</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/50 text-red-200 rounded-xl shadow-lg animate-pulse">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <FileUpload
            title="Signal File"
            description="Upload CSV with columns: timestamp, action (buy/sell), price"
            onFileUpload={(data) => {
              setSignals(data as Signal[])
              setError('')
            }}
            acceptedColumns={['timestamp', 'action', 'price']}
          />
          <FileUpload
            title="Market Data File"
            description="Upload CSV with columns: timestamp, open, high, low, close"
            onFileUpload={(data) => {
              setMarketData(data as MarketData[])
              setError('')
            }}
            acceptedColumns={['timestamp', 'open', 'high', 'low', 'close']}
          />
        </div>

        <div className="mb-6">
          <TimeWindowSelector
            value={timeWindow}
            onChange={setTimeWindow}
          />
        </div>

        <div className="mb-8 text-center">
          <button
            onClick={handleProcess}
            disabled={loading || signals.length === 0 || marketData.length === 0}
            className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-2xl disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50 active:scale-95 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Run Backtest
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {result && (
          <>
            <div className="mb-6">
              <ExportButton result={result} />
            </div>

            <div className="mb-8">
              <PerformanceMetrics metrics={result.metrics} />
            </div>

            <div className="mb-8">
              <Charts
                equityCurve={result.equityCurve}
                drawdown={result.drawdown}
                tradeResults={result.tradeResults}
              />
            </div>

            <div className="mb-8">
              <TradeTable trades={result.trades} />
            </div>
          </>
        )}
      </div>
    </main>
  )
}

