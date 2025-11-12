'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MarketCard from './components/MarketCard';
import LoadingSpinner from './components/LoadingSpinner';

interface Market {
  question_id: string;
  ancillary_data_decoded: string;
  condition_id: string;
  trade_count: number;
  question_time: string;
}

interface SyncStatus {
  inProgress: boolean;
  duration: number;
  tablesEmpty: boolean;
  needsSync: boolean;
  progress?: {
    questionInit: { completed: boolean; count: number };
    condPrep: { completed: boolean; count: number };
    tokenReg: { completed: boolean; count: number };
    orderFilled: { completed: boolean; count: number };
  };
}

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  
  // Timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('[Frontend] Loading timeout - forcing loading to false');
        setLoading(false);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeout);
  }, [loading]);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/sync-status');
      if (!response.ok) {
        console.warn('[Frontend] Sync status API error:', response.status);
        return;
      }
      const data = await response.json();
      if (data.success) {
        setSyncStatus(data.data);
      }
    } catch (err) {
      console.error('[Frontend] Error fetching sync status:', err);
      // Don't block the UI if sync status fails
    }
  };

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch('/api/markets', {
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Frontend] ❌ HTTP error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setMarkets(data.data);
        setError(null);
      } else {
        setError(data.error || 'Invalid response format');
        setMarkets([]);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timeout - please refresh the page');
      } else {
        console.error('[Frontend] ❌ Error fetching markets:', err);
        setError(err.message || 'Failed to fetch markets');
      }
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
    fetchMarkets();
    
    // Poll sync status every 2 seconds (will stop when sync completes)
    const syncInterval = setInterval(() => {
      fetchSyncStatus();
    }, 2000);
    
    // Auto-refresh markets every 30 seconds
    const marketsInterval = setInterval(() => {
      fetchMarkets();
    }, 30000);
    
    return () => {
      clearInterval(syncInterval);
      clearInterval(marketsInterval);
    };
  }, []); // Empty dependency array - only run on mount

  // Always render the main content, show loading state inline
  // Don't block rendering with early returns

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Polymarket Markets</h1>
          <div className="flex items-center gap-4">
            {loading && markets.length === 0 && (
              <div className="flex items-center gap-2">
                <LoadingSpinner />
                <span className="text-sm text-gray-400">Loading...</span>
              </div>
            )}
            {!loading && (
              <span className="text-sm text-gray-500">
                {markets.length} {markets.length === 1 ? 'market' : 'markets'} with trades
              </span>
            )}
          </div>
        </div>

        {/* Show sync status if in progress */}
        {syncStatus?.inProgress && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <LoadingSpinner />
              <div className="w-full">
                <h2 className="text-xl font-semibold text-blue-900 mb-2 text-center">
                  Loading Initial Data
                </h2>
                <p className="text-blue-700 mb-4 text-center">
                  Fetching market data from the blockchain (running in parallel for faster loading)...
                </p>
                {syncStatus.progress && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-800">QuestionInitialized:</span>
                      <span className={syncStatus.progress.questionInit.completed ? 'text-green-600 font-semibold' : 'text-blue-600'}>
                        {syncStatus.progress.questionInit.completed ? `✅ ${syncStatus.progress.questionInit.count} events` : '⏳ Loading...'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-800">ConditionPreparation:</span>
                      <span className={syncStatus.progress.condPrep.completed ? 'text-green-600 font-semibold' : 'text-blue-600'}>
                        {syncStatus.progress.condPrep.completed ? `✅ ${syncStatus.progress.condPrep.count} events` : '⏳ Loading...'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-800">TokenRegistered:</span>
                      <span className={syncStatus.progress.tokenReg.completed ? 'text-green-600 font-semibold' : 'text-blue-600'}>
                        {syncStatus.progress.tokenReg.completed ? `✅ ${syncStatus.progress.tokenReg.count} events` : '⏳ Loading...'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-800">OrderFilled:</span>
                      <span className={syncStatus.progress.orderFilled.completed ? 'text-green-600 font-semibold' : 'text-blue-600'}>
                        {syncStatus.progress.orderFilled.completed ? `✅ ${syncStatus.progress.orderFilled.count} events` : '⏳ Loading...'}
                      </span>
                    </div>
                  </div>
                )}
                {syncStatus.duration > 0 && (
                  <p className="text-sm text-blue-600 mt-4 text-center">Time elapsed: {syncStatus.duration}s</p>
                )}
                {markets.length > 0 && (
                  <p className="text-sm text-green-700 mt-4 text-center font-semibold">
                    🎉 Markets are available! Showing {markets.length} markets below (trades may still be loading...)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Show error if any */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            Error: {error}
          </div>
        )}

        {/* Show markets or empty state */}
        {markets.length === 0 && !loading ? (
          <div className="text-center py-12">
            {syncStatus?.needsSync && syncStatus?.inProgress ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-yellow-800">
                <p className="text-lg font-semibold mb-2">Initial Data Sync In Progress</p>
                <p className="text-sm mb-4">Fetching market data from the blockchain. This may take a few minutes...</p>
                <p className="text-xs text-yellow-600">Please wait while we fetch market data...</p>
              </div>
            ) : (
              <div className="text-gray-500">
                <p className="text-lg mb-2">No markets found</p>
                <p className="text-sm">Markets will appear here once they are available.</p>
              </div>
            )}
          </div>
        ) : markets.length > 0 ? (
          <div>
            {/* Markets with trades */}
            {markets.filter((m: any) => m.trade_count > 0).length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Markets with Trades ({markets.filter((m: any) => m.trade_count > 0).length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {markets
                    .filter((m: any) => m.trade_count > 0)
                    .map((market) => (
                      <MarketCard key={market.question_id} market={market} />
                    ))}
                </div>
              </div>
            )}
            
            {/* Markets without trades */}
            {markets.filter((m: any) => m.trade_count === 0).length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Markets without Trades ({markets.filter((m: any) => m.trade_count === 0).length})
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Click on any market to use the &quot;Refresh Trades&quot; button to fetch trades from the API.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {markets
                    .filter((m: any) => m.trade_count === 0)
                    .map((market) => (
                      <MarketCard key={market.question_id} market={market} />
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="text-gray-500 mt-4">Loading markets...</p>
          </div>
        )}
      </div>
    </div>
  );
}
