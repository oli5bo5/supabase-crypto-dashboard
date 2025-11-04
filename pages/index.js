import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import useSWR from 'swr'
import '../styles/globals.css'

const fetcher = async (url) => {
  const res = await fetch(url)
  return res.json()
}

export default function Home() {
  const [cryptos, setCryptos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch crypto data from Supabase
  useEffect(() => {
    fetchCryptos()

    // Set up real-time subscription
    const subscription = supabase
      .channel('crypto_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'crypto_prices' },
        (payload) => {
          console.log('Change received!', payload)
          fetchCryptos()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchCryptos() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('crypto_prices')
        .select('*')
        .order('market_cap', { ascending: false })
        .limit(20)

      if (error) throw error
      setCryptos(data || [])
    } catch (error) {
      console.error('Error fetching cryptos:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch live prices from CoinGecko API
  const { data: liveData } = useSWR(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false',
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  )

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(num)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const displayData = liveData || cryptos

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Crypto Dashboard
          </h1>
          <p className="text-gray-300">Real-time cryptocurrency prices powered by Supabase</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Live updates enabled</span>
          </div>
        </header>

        {loading && !displayData.length ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Coin</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">24h Change</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Market Cap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {displayData.map((crypto, index) => {
                    const price = crypto.current_price || crypto.price || 0
                    const change = crypto.price_change_percentage_24h || crypto.change_24h || 0
                    const marketCap = crypto.market_cap || 0
                    const isPositive = change >= 0

                    return (
                      <tr key={crypto.id || index} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {crypto.image && (
                              <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full mr-3" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-white">{crypto.name || 'Unknown'}</div>
                              <div className="text-sm text-gray-400 uppercase">{crypto.symbol || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-white">
                          {formatPrice(price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                          ${formatNumber(marketCap)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <footer className="mt-8 text-center text-gray-400 text-sm">
          <p>Data updates every 30 seconds • Powered by Supabase &amp; CoinGecko API</p>
        </footer>
      </div>
    </div>
  )
}
