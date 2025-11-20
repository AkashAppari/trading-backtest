import { Signal, MarketData, Trade, BacktestResult } from '@/app/page'

const INITIAL_CAPITAL = 100000 // Starting capital

export function processBacktest(
  signals: Signal[],
  marketData: MarketData[],
  timeWindowSeconds: number
): BacktestResult {
  if (signals.length === 0 || marketData.length === 0) {
    throw new Error('Both signals and market data are required')
  }

  // Sort signals and market data by timestamp
  const sortedSignals = [...signals].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )
  const sortedMarketData = [...marketData].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  // Create a map for quick market data lookup
  const marketDataMap = new Map<string, MarketData>()
  sortedMarketData.forEach((data) => {
    marketDataMap.set(data.timestamp, data)
  })

  const trades: Trade[] = []
  let position: 'long' | 'short' | null = null
  let entryPrice = 0
  let entryTimestamp = ''
  let capital = INITIAL_CAPITAL
  let quantity = 0
  let cumulativePnl = 0
  let tradeId = 1

  // Track equity for drawdown calculation
  const equityHistory: { timestamp: string; equity: number }[] = []
  let peakEquity = INITIAL_CAPITAL

  // Process each signal
  for (const signal of sortedSignals) {
    const signalTime = new Date(signal.timestamp).getTime()

    // Find matching market data within time window
    let matchedMarketData: MarketData | null = null
    let minTimeDiff = Infinity

    // First, try exact match
    if (marketDataMap.has(signal.timestamp)) {
      matchedMarketData = marketDataMap.get(signal.timestamp)!
    } else {
      // Find nearest match within time window
      for (const market of sortedMarketData) {
        const marketTime = new Date(market.timestamp).getTime()
        const timeDiff = Math.abs(signalTime - marketTime)

        if (timeDiff <= timeWindowSeconds * 1000 && timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff
          matchedMarketData = market
        }
      }
    }

    if (!matchedMarketData) {
      // Skip signal if no matching market data found
      continue
    }

    const executionPrice = matchedMarketData.close
    const executionTimestamp = matchedMarketData.timestamp

    // Handle position management
    if (signal.action === 'buy') {
      if (position === 'short') {
        // Close short position
        const pnl = (entryPrice - executionPrice) * quantity
        cumulativePnl += pnl
        capital += pnl

        trades.push({
          id: tradeId++,
          signalTimestamp: signal.timestamp,
          action: 'short', // Record the position type that was closed
          signalPrice: signal.price,
          executionTimestamp,
          executionPrice,
          quantity,
          pnl,
          cumulativePnl,
          isWin: pnl > 0,
        })

        position = null
        quantity = 0
      }

      // Open long position
      if (position === null) {
        quantity = capital / executionPrice
        entryPrice = executionPrice
        entryTimestamp = executionTimestamp
        position = 'long'
      }
    } else if (signal.action === 'sell') {
      if (position === 'long') {
        // Close long position
        const pnl = (executionPrice - entryPrice) * quantity
        cumulativePnl += pnl
        capital += pnl

        trades.push({
          id: tradeId++,
          signalTimestamp: signal.timestamp,
          action: 'long', // Record the position type that was closed
          signalPrice: signal.price,
          executionTimestamp,
          executionPrice,
          quantity,
          pnl,
          cumulativePnl,
          isWin: pnl > 0,
        })

        position = null
        quantity = 0
      }

      // Open short position
      if (position === null) {
        quantity = capital / executionPrice
        entryPrice = executionPrice
        entryTimestamp = executionTimestamp
        position = 'short'
      }
    }

    // Update equity history
    const currentEquity = INITIAL_CAPITAL + cumulativePnl
    equityHistory.push({
      timestamp: executionTimestamp,
      equity: currentEquity,
    })

    if (currentEquity > peakEquity) {
      peakEquity = currentEquity
    }
  }

  // Close any open position at the end
  if (position !== null && sortedMarketData.length > 0) {
    const lastMarketData = sortedMarketData[sortedMarketData.length - 1]
    const finalPrice = lastMarketData.close
    const pnl =
      position === 'long'
        ? (finalPrice - entryPrice) * quantity
        : (entryPrice - finalPrice) * quantity
    cumulativePnl += pnl
    capital += pnl

    trades.push({
      id: tradeId++,
      signalTimestamp: entryTimestamp,
      action: position, // Use the position type directly
      signalPrice: entryPrice,
      executionTimestamp: lastMarketData.timestamp,
      executionPrice: finalPrice,
      quantity,
      pnl,
      cumulativePnl,
      isWin: pnl > 0,
    })

    equityHistory.push({
      timestamp: lastMarketData.timestamp,
      equity: INITIAL_CAPITAL + cumulativePnl,
    })
  }

  // Calculate metrics
  const totalPnl = cumulativePnl
  const totalTrades = trades.length
  const totalWins = trades.filter((t) => t.isWin).length
  const totalLosses = totalTrades - totalWins
  const winRate = totalTrades > 0 ? totalWins / totalTrades : 0

  // Calculate max drawdown
  let maxDrawdown = 0
  let runningPeak = INITIAL_CAPITAL
  const drawdownData: { timestamp: string; drawdown: number }[] = []

  for (const equityPoint of equityHistory) {
    if (equityPoint.equity > runningPeak) {
      runningPeak = equityPoint.equity
    }
    const drawdown = (runningPeak - equityPoint.equity) / runningPeak
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
    drawdownData.push({
      timestamp: equityPoint.timestamp,
      drawdown,
    })
  }

  // Extract trade results for histogram
  const tradeResults = trades.map((t) => t.pnl)

  return {
    trades,
    metrics: {
      totalPnl,
      winRate,
      totalWins,
      totalLosses,
      maxDrawdown,
      finalCapital: capital,
      initialCapital: INITIAL_CAPITAL,
      totalTrades,
    },
    equityCurve: equityHistory,
    drawdown: drawdownData,
    tradeResults,
  }
}

