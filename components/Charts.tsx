'use client'

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ChartsProps {
  equityCurve: { timestamp: string; equity: number }[]
  drawdown: { timestamp: string; drawdown: number }[]
  tradeResults: number[]
}

export default function Charts({
  equityCurve,
  drawdown,
  tradeResults,
}: ChartsProps) {
  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timestamp
    }
  }

  // Prepare histogram data
  const histogramData = tradeResults.reduce((acc: { [key: string]: number }, value) => {
    const bucket = Math.floor(value / 100) * 100 // Bucket by $100
    acc[bucket] = (acc[bucket] || 0) + 1
    return acc
  }, {})

  const histogramChartData = Object.entries(histogramData)
    .map(([bucket, count]) => ({
      range: `$${bucket}`,
      count,
    }))
    .sort((a, b) => parseInt(a.range.replace('$', '')) - parseInt(b.range.replace('$', '')))

  return (
    <div className="space-y-6">
      {/* Equity Curve */}
      <div className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
            Equity Curve
          </h2>
        </div>
        <div className="h-[300px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityCurve}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTimestamp}
              stroke="#9ca3af"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
            <Tooltip
              formatter={(value: number) => `$${value.toFixed(2)}`}
              labelFormatter={formatTimestamp}
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ color: '#fff' }} />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.4}
              name="Equity"
              strokeWidth={2}
            />
          </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drawdown */}
      <div className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
            Drawdown
          </h2>
        </div>
        <div className="h-[300px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={drawdown}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTimestamp}
              stroke="#9ca3af"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
            <Tooltip
              formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
              labelFormatter={formatTimestamp}
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ color: '#fff' }} />
            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.4}
              name="Drawdown"
              strokeWidth={2}
            />
          </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trade Results Histogram */}
      <div className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-6 border border-white/20 dark:border-gray-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Trade Results Distribution
          </h2>
        </div>
        <div className="h-[300px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="range" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ color: '#fff' }} />
            <Bar dataKey="count" fill="#8b5cf6" name="Number of Trades" radius={[8, 8, 0, 0]} />
          </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

