'use client'

import { useState } from 'react'
import { Trade } from '@/app/page'

interface TradeTableProps {
  trades: Trade[]
}

export default function TradeTable({ trades }: TradeTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Trade
    direction: 'asc' | 'desc'
  } | null>(null)

  const handleSort = (key: keyof Trade) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'asc'
    ) {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedTrades = [...trades].sort((a, b) => {
    if (!sortConfig) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString()
    } catch {
      return timestamp
    }
  }

  const SortIcon = ({ column }: { column: keyof Trade }) => {
    if (!sortConfig || sortConfig.key !== column) {
      return <span className="text-gray-500">↕</span>
    }
    return sortConfig.direction === 'asc' ? (
      <span className="text-purple-400">↑</span>
    ) : (
      <span className="text-purple-400">↓</span>
    )
  }

  return (
    <div className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 dark:border-gray-700/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          Trade-by-Trade Breakdown
        </h2>
      </div>
      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <table className="min-w-full divide-y divide-white/10 text-xs sm:text-sm">
          <thead className="bg-white/5 backdrop-blur-sm">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-2">
                  ID <SortIcon column="id" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('signalTimestamp')}
              >
                <div className="flex items-center gap-2">
                  Signal Time <SortIcon column="signalTimestamp" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('action')}
              >
                <div className="flex items-center gap-2">
                  Action <SortIcon column="action" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('signalPrice')}
              >
                <div className="flex items-center gap-2">
                  Signal Price <SortIcon column="signalPrice" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('executionTimestamp')}
              >
                <div className="flex items-center gap-2">
                  Execution Time <SortIcon column="executionTimestamp" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('executionPrice')}
              >
                <div className="flex items-center gap-2">
                  Execution Price <SortIcon column="executionPrice" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('quantity')}
              >
                <div className="flex items-center gap-2">
                  Quantity <SortIcon column="quantity" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('pnl')}
              >
                <div className="flex items-center gap-2">
                  P&L <SortIcon column="pnl" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('cumulativePnl')}
              >
                <div className="flex items-center gap-2">
                  Cumulative P&L <SortIcon column="cumulativePnl" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => handleSort('isWin')}
              >
                <div className="flex items-center gap-2">
                  Result <SortIcon column="isWin" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-white/10">
            {sortedTrades.map((trade) => (
              <tr
                key={trade.id}
                className="hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">
                  {trade.id}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                  {formatDate(trade.signalTimestamp)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      trade.action === 'long'
                        ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                        : 'bg-red-500/20 text-red-300 border border-red-500/50'
                    }`}
                  >
                    {trade.action.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200 font-medium">
                  {formatCurrency(trade.signalPrice)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                  {formatDate(trade.executionTimestamp)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200 font-medium">
                  {formatCurrency(trade.executionPrice)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">
                  {trade.quantity.toFixed(4)}
                </td>
                <td
                  className={`px-4 py-3 whitespace-nowrap text-sm font-bold ${
                    trade.pnl >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {formatCurrency(trade.pnl)}
                </td>
                <td
                  className={`px-4 py-3 whitespace-nowrap text-sm font-bold ${
                    trade.cumulativePnl >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {formatCurrency(trade.cumulativePnl)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      trade.isWin
                        ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                        : 'bg-red-500/20 text-red-300 border border-red-500/50'
                    }`}
                  >
                    {trade.isWin ? 'WIN' : 'LOSS'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

