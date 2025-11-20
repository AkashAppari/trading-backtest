'use client'

interface TimeWindowSelectorProps {
  value: number
  onChange: (value: number) => void
}

export default function TimeWindowSelector({
  value,
  onChange,
}: TimeWindowSelectorProps) {
  return (
    <div className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 dark:border-gray-700/50">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white">
          Time Window for Signal Matching
        </h3>
      </div>
      <p className="text-sm text-gray-300 mb-6 ml-11">
        Select the maximum time difference (in seconds) allowed when matching signals to market data timestamps.
        A value of 0 means exact timestamp matching only.
      </p>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 ml-11">
        <label className="text-sm font-semibold text-gray-300 whitespace-nowrap">
          Time Window (seconds):
        </label>
        <input
          type="number"
          min="0"
          max="3600"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="px-4 py-2 bg-white/10 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-400 backdrop-blur-sm transition-all"
        />
        <span className="px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg text-sm font-medium border border-purple-500/30">
          {value === 0 ? 'Exact match only' : `±${value}s window`}
        </span>
      </div>
    </div>
  )
}

