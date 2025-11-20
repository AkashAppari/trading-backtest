'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'

interface FileUploadProps {
  title: string
  description: string
  onFileUpload: (data: any[]) => void
  acceptedColumns: string[]
}

export default function FileUpload({
  title,
  description,
  onFileUpload,
  acceptedColumns,
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string>('')
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateColumns = (headers: string[]): boolean => {
    const lowerHeaders = headers.map(h => h.toLowerCase().trim())
    const lowerAccepted = acceptedColumns.map(c => c.toLowerCase().trim())
    
    // Check if we have timestamp or imestamp (typo)
    if (lowerAccepted.includes('timestamp')) {
      const hasTimestamp = lowerHeaders.includes('timestamp') || lowerHeaders.includes('imestamp')
      const otherRequired = lowerAccepted.filter(c => c !== 'timestamp')
      const hasOthers = otherRequired.every(col => lowerHeaders.includes(col))
      return hasTimestamp && hasOthers
    }
    
    return lowerAccepted.every(col => lowerHeaders.includes(col))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setError('')

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`)
          return
        }

        if (results.data.length === 0) {
          setError('File is empty')
          return
        }

        const headers = Object.keys(results.data[0] as object)
        if (!validateColumns(headers)) {
          setError(`Missing required columns. Expected: ${acceptedColumns.join(', ')}`)
          return
        }

        // Normalize column names to lowercase
        const normalizedData = (results.data as any[]).map(row => {
          const normalized: any = {}
          Object.keys(row).forEach(key => {
            normalized[key.toLowerCase().trim()] = row[key]
          })
          return normalized
        })

        // Validate and convert data types
        try {
          const processedData = normalizedData.map((row, index) => {
            const processed: any = {}
            
            if (acceptedColumns.includes('timestamp')) {
              // Handle both "timestamp" and "imestamp" (typo)
              processed.timestamp = row.timestamp || row.imestamp || row.date
              if (!processed.timestamp) {
                throw new Error(`Row ${index + 1}: Missing timestamp`)
              }
            }
            
            if (acceptedColumns.includes('action')) {
              const action = (row.action || '').toLowerCase().trim()
              if (action !== 'buy' && action !== 'sell') {
                throw new Error(`Row ${index + 1}: Invalid action. Must be 'buy' or 'sell' (found: ${row.action})`)
              }
              processed.action = action
            }
            
            if (acceptedColumns.includes('price')) {
              const price = parseFloat(row.price)
              if (isNaN(price) || price <= 0) {
                throw new Error(`Row ${index + 1}: Invalid price`)
              }
              processed.price = price
            }
            
            if (acceptedColumns.includes('open')) {
              const open = parseFloat(row.open)
              if (isNaN(open) || open <= 0) {
                throw new Error(`Row ${index + 1}: Invalid open price`)
              }
              processed.open = open
            }
            
            if (acceptedColumns.includes('high')) {
              const high = parseFloat(row.high)
              if (isNaN(high) || high <= 0) {
                throw new Error(`Row ${index + 1}: Invalid high price`)
              }
              processed.high = high
            }
            
            if (acceptedColumns.includes('low')) {
              const low = parseFloat(row.low)
              if (isNaN(low) || low <= 0) {
                throw new Error(`Row ${index + 1}: Invalid low price`)
              }
              processed.low = low
            }
            
            if (acceptedColumns.includes('close')) {
              const close = parseFloat(row.close)
              if (isNaN(close) || close <= 0) {
                throw new Error(`Row ${index + 1}: Invalid close price`)
              }
              processed.close = close
            }
            
            return processed
          })

          onFileUpload(processedData)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Data validation failed')
        }
      },
      error: (error) => {
        setError(`File reading error: ${error.message}`)
      },
    })
  }

  return (
    <div className="bg-white/10 dark:bg-gray-800/40 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 dark:border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-purple-500/20">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white">
          {title}
        </h3>
      </div>
      <p className="text-sm text-gray-300 mb-6 ml-11">
        {description}
      </p>
      
      <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center bg-gradient-to-br from-purple-500/5 to-blue-500/5 hover:from-purple-500/10 hover:to-blue-500/10 transition-all duration-300 group">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id={`file-input-${title}`}
        />
        <label
          htmlFor={`file-input-${title}`}
          className="cursor-pointer flex flex-col items-center"
        >
          <div className="mb-4 p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full group-hover:scale-110 transition-transform duration-300">
            <svg
              className="w-10 h-10 text-purple-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <span className="text-purple-300 font-semibold text-lg mb-1">
            Click to upload CSV
          </span>
          <span className="text-xs text-gray-400">
            or drag and drop
          </span>
        </label>
      </div>

      {fileName && (
        <div className="mt-4 p-4 bg-green-500/20 backdrop-blur-sm border border-green-500/50 rounded-xl animate-pulse">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-300 font-medium">
              Loaded: {fileName}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-xl">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
    </div>
  )
}

