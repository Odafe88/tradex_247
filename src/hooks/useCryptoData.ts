import { useQuery } from "@tanstack/react-query";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  image: string;
}

interface ForexData {
  pair: string;
  rate: number;
  change_24h: number;
}

export const useCryptoData = () => {
  return useQuery({
    queryKey: ["cryptoData"],
    queryFn: async (): Promise<CoinData[]> => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false"
      );
      if (!response.ok) throw new Error("Failed to fetch crypto data");
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useForexData = () => {
  return useQuery({
    queryKey: ["forexData"],
    queryFn: async (): Promise<ForexData[]> => {
      // Using a free forex API - replace with your preferred provider
      const pairs = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD"];
      const rates = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD"
      );
      if (!rates.ok) throw new Error("Failed to fetch forex data");
      const data = await rates.json();
      
      return pairs.map(pair => ({
        pair,
        rate: data.rates[pair.split('/')[1]] || 1,
        change_24h: (Math.random() - 0.5) * 2, // Mock change data
      }));
    },
    refetchInterval: 60000, // Refetch every minute
  });
};
