import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, DollarSign, AlertTriangle, Target, Zap, BarChart3, Users, Activity, Brain } from 'lucide-react';

interface TradeSuggestion {
  type: 'buy' | 'sell' | 'hold';
  confidence: number;
  reason: string;
  targetPrice: number;
  stopLoss: number;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface CoinData {
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  marketCap: string;
  volume: string;
  suggestions: TradeSuggestion[];
}

function App() {
  const [coinInput, setCoinInput] = useState('');
  const [searchedCoin, setSearchedCoin] = useState<CoinData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock market overview data
  const marketStats = [
    { label: 'Market Cap', value: '$1.2T', change: '+2.4%', positive: true, icon: DollarSign },
    { label: '24h Volume', value: '$85.3B', change: '+12.8%', positive: true, icon: BarChart3 },
    { label: 'Active Traders', value: '1.2M', change: '+5.2%', positive: true, icon: Users },
    { label: 'Fear & Greed', value: '65', change: '-3.1%', positive: false, icon: Activity },
  ];

  // Mock data for demonstration
  const mockCoinData: { [key: string]: CoinData } = {
    'BTCUSDT': {
      symbol: 'BTCUSDT',
      name: 'Bitcoin',
      currentPrice: 43250,
      change24h: 2.45,
      marketCap: '$847.2B',
      volume: '$15.2B',
      suggestions: [
        {
          type: 'buy',
          confidence: 78,
          reason: 'Strong support level reached with bullish divergence on RSI. Volume increasing on bounce.',
          targetPrice: 46500,
          stopLoss: 41800,
          timeframe: '1-2 weeks',
          riskLevel: 'medium'
        },
        {
          type: 'hold',
          confidence: 65,
          reason: 'Consolidating near resistance level. Wait for clear breakout confirmation above $44,000.',
          targetPrice: 45000,
          stopLoss: 42000,
          timeframe: '3-5 days',
          riskLevel: 'low'
        }
      ]
    },
    'ETHUSDT': {
      symbol: 'ETHUSDT',
      name: 'Ethereum',
      currentPrice: 2650,
      change24h: -1.23,
      marketCap: '$318.7B',
      volume: '$8.9B',
      suggestions: [
        {
          type: 'sell',
          confidence: 82,
          reason: 'Bearish pennant formation with weakness below 20-day MA. Declining volume suggests further downside.',
          targetPrice: 2400,
          stopLoss: 2750,
          timeframe: '1 week',
          riskLevel: 'high'
        },
        {
          type: 'buy',
          confidence: 45,
          reason: 'Oversold conditions on daily timeframe. Potential bounce from $2,500 support level.',
          targetPrice: 2800,
          stopLoss: 2500,
          timeframe: '2-3 days',
          riskLevel: 'medium'
        }
      ]
    },
    'SOLUSDT': {
      symbol: 'SOLUSDT',
      name: 'Solana',
      currentPrice: 98.75,
      change24h: 5.67,
      marketCap: '$44.3B',
      volume: '$1.8B',
      suggestions: [
        {
          type: 'buy',
          confidence: 89,
          reason: 'Clean breakout above key resistance with strong ecosystem developments. High momentum continuation expected.',
          targetPrice: 115,
          stopLoss: 92,
          timeframe: '2-3 weeks',
          riskLevel: 'low'
        }
      ]
    }
  };

  const popularCoins = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'DOTUSDT'];

  const validateTradingPair = (input: string): boolean => {
    const upperInput = input.toUpperCase();
    // Check if it ends with common quote currencies
    const quotecurrencies = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB', 'BUSD'];
    return quotecurrencies.some(quote => upperInput.endsWith(quote));
  };

  const sendToWebhook = async (tradingPair: string) => {
    try {
      const response = await fetch('https://n8n.datascienceforbusinessia.com:8445/webhook/CryptoTraderAI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tradingPair: tradingPair.toUpperCase(),
          timestamp: new Date().toISOString(),
          requestId: Math.random().toString(36).substr(2, 9)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Webhook error:', error);
      throw error;
    }
  };

  const handleSearch = () => {
    if (!coinInput.trim()) return;
    
    // Validate trading pair format
    if (!validateTradingPair(coinInput)) {
      setError('Please include the quote currency (e.g., BTCUSDT, ETHUSDT, SOLUSDT)');
      return;
    }

    setError(null);
    setIsLoading(true);
    
    // Send to webhook and handle response
    sendToWebhook(coinInput)
      .then((webhookData) => {
        // For now, still use mock data for display
        // Replace this with actual webhook response data when your n8n workflow is ready
        const coin = mockCoinData[coinInput.toUpperCase()];
        setSearchedCoin(coin || null);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to send data to webhook:', error);
        setError('Failed to analyze trading pair. Please try again.');
        setSearchedCoin(null);
        setIsLoading(false);
      });
  };

  const handlePopularCoinClick = (coin: string) => {
    setCoinInput(coin);
    setError(null);
    setIsLoading(true);
    
    sendToWebhook(coin)
      .then((webhookData) => {
        const coinData = mockCoinData[coin];
        setSearchedCoin(coinData || null);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to send data to webhook:', error);
        setError('Failed to analyze trading pair. Please try again.');
        setSearchedCoin(null);
        setIsLoading(false);
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setCoinInput(value);
    
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePopularCoinClickOld = (coin: string) => {
    setCoinInput(coin);
    setIsLoading(true);
    setTimeout(() => {
      const coinData = mockCoinData[coin];
      setSearchedCoin(coinData || null);
      setIsLoading(false);
    }, 1000);
  };


  const getTypeColor = (type: string) => {
    switch (type) {
      case 'buy': return 'from-emerald-500 to-green-600';
      case 'sell': return 'from-red-500 to-rose-600';
      case 'hold': return 'from-amber-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'high': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'buy': return <TrendingUp className="w-5 h-5" />;
      case 'sell': return <TrendingDown className="w-5 h-5" />;
      case 'hold': return <Target className="w-5 h-5" />;
      default: return <DollarSign className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CryptoTrader AI</h1>
              <p className="text-gray-400 text-sm">Smart trading suggestions powered by AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Market Status</span>
            <span className="text-sm font-semibold text-green-500">LIVE</span>
          </div>
        </div>

        {/* Market Overview */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-white mb-6">Market Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:bg-gray-900/70 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      stat.positive ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stat.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trading Analysis Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Which trading pair do you want to analyze?</h2>
            <p className="text-gray-400 text-lg">Enter a full trading pair to get AI-powered trading suggestions</p>
          </div>

          {/* Warning Message */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <p className="text-orange-400 text-sm">Must include quote currency (e.g., BTCUSDT, ETHUSDT, SOLUSDT)</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Search Input */}
          <div className="relative mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
              <div className={`relative bg-gray-900 border rounded-2xl p-2 ${
                error ? 'border-red-500' : 'border-gray-700'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={coinInput}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder="BTCUSDT"
                      className="w-full pl-12 pr-6 py-4 bg-transparent text-white placeholder-gray-500 focus:outline-none text-lg font-medium"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
                    Analyze {coinInput || 'BTCUSDT'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Coins */}
          <div className="text-center mb-12">
            <p className="text-gray-400 mb-4">Popular coins:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {popularCoins.map((coin) => (
                <button
                  key={coin}
                  onClick={() => handlePopularCoinClick(coin)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm font-medium transition-all hover:border-purple-500"
                >
                  {coin}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {searchedCoin && (
          <div className="max-w-6xl mx-auto mt-16">
            {/* Coin Overview */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-3xl font-bold">{searchedCoin.name}</h2>
                    <span className="text-xl text-gray-400">({searchedCoin.symbol})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold">${searchedCoin.currentPrice.toLocaleString()}</span>
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${
                      searchedCoin.change24h >= 0 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {searchedCoin.change24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(searchedCoin.change24h)}%
                    </span>
                  </div>
                </div>
                <div className="flex gap-8 text-center">
                  <div>
                    <p className="text-gray-400 text-sm">Market Cap</p>
                    <p className="font-semibold text-lg">{searchedCoin.marketCap}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Volume 24h</p>
                    <p className="font-semibold text-lg">{searchedCoin.volume}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Trading Suggestions */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">AI Trading Suggestions</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {searchedCoin.suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:bg-gray-900/70 transition-all">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r ${getTypeColor(suggestion.type)}`}>
                        {getTypeIcon(suggestion.type)}
                        <span className="font-bold text-lg uppercase text-white">{suggestion.type}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm mb-1">Confidence</p>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${getTypeColor(suggestion.type)} transition-all duration-1000`}
                              style={{ width: `${suggestion.confidence}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold text-white">{suggestion.confidence}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-6 leading-relaxed">{suggestion.reason}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-green-400" />
                          <span className="text-gray-400 text-sm">Target Price</span>
                        </div>
                        <span className="font-bold text-lg text-green-400">${suggestion.targetPrice.toLocaleString()}</span>
                      </div>
                      <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span className="text-gray-400 text-sm">Stop Loss</span>
                        </div>
                        <span className="font-bold text-lg text-red-400">${suggestion.stopLoss.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Risk Level:</span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getRiskColor(suggestion.riskLevel)}`}>
                          {suggestion.riskLevel.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-gray-400 text-sm">
                        Timeframe: <span className="text-white font-medium">{suggestion.timeframe}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Results State */}
        {searchedCoin === null && coinInput && !isLoading && (
          <div className="max-w-2xl mx-auto text-center mt-16">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12">
              <AlertTriangle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-2">Trading Pair Not Found</h3>
              <p className="text-gray-400">
                Sorry, we couldn't find data for "{coinInput}". 
                Try searching for BTCUSDT, ETHUSDT, or SOLUSDT to see example results.
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-2xl mx-auto text-center mt-16">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-2xl font-semibold mb-2">Analyzing Market Data</h3>
              <p className="text-gray-400">
                Our AI is processing market trends and generating trading suggestions...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;