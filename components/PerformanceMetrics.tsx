'use client'

interface Metrics {
  totalPnl: number
  winRate: number
  totalWins: number
  totalLosses: number
  maxDrawdown: number
  finalCapital: number
  initialCapital: number
  totalTrades: number
}

interface PerformanceMetricsProps {
  metrics: Metrics
}

export default function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  const cards = [
    {
      title: 'Total P&L',
      value: formatCurrency(metrics.totalPnl),
      color: metrics.totalPnl >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: metrics.totalPnl >= 0 ? 'bg-green-50' : 'bg-red-50',
      darkBgColor: metrics.totalPnl >= 0 ? 'dark:bg-green-900/20' : 'dark:bg-red-900/20',
    },
    {
      title: 'Win Rate',
      value: formatPercent(metrics.winRate),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      darkBgColor: 'dark:bg-blue-900/20',
    },
    {
      title: 'Total Trades',
      value: metrics.totalTrades.toString(),
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      darkBgColor: 'dark:bg-gray-800',
    },
    {
      title: 'Wins / Losses',
      value: `${metrics.totalWins} / ${metrics.totalLosses}`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      darkBgColor: 'dark:bg-purple-900/20',
    },
    {
      title: 'Max Drawdown',
      value: formatPercent(metrics.maxDrawdown),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      darkBgColor: 'dark:bg-orange-900/20',
    },
    {
      title: 'Final Capital',
      value: formatCurrency(metrics.finalCapital),
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      darkBgColor: 'dark:bg-indigo-900/20',
    },
  ]

  return (
    <div className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 dark:border-gray-700/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
          Performance Metrics
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {card.title}
            </h3>
            <p className={`text-3xl font-extrabold ${card.color} drop-shadow-lg`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

