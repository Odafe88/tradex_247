import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Trade {
  id: string;
  user_id: string;
  trade_type: 'crypto' | 'forex';
  asset_symbol: string;
  asset_name: string;
  initial_amount: number;
  current_value: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export const useTrades = (tradeType: 'crypto' | 'forex') => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trades', tradeType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('trade_type', tradeType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Trade[];
    },
  });

  const createTrade = useMutation({
    mutationFn: async ({
      asset_symbol,
      asset_name,
      initial_amount,
    }: {
      asset_symbol: string;
      asset_name: string;
      initial_amount: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const start_time = new Date();
      const end_time = new Date(start_time.getTime() + 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          trade_type: tradeType,
          asset_symbol,
          asset_name,
          initial_amount,
          current_value: initial_amount,
          start_time: start_time.toISOString(),
          end_time: end_time.toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades', tradeType] });
      toast({
        title: "Trade Started",
        description: "Your AI bot is now tracking this trade",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculateCurrentValue = (trade: Trade) => {
    const now = new Date();
    const startTime = new Date(trade.start_time);
    const endTime = new Date(trade.end_time);
    
    if (now >= endTime || !trade.is_active) {
      return trade.current_value;
    }

    const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const growthRate = 0.002; // 0.2% per hour
    const currentValue = trade.initial_amount * Math.pow(1 + growthRate, hoursElapsed);
    
    return currentValue;
  };

  return {
    trades,
    isLoading,
    createTrade,
    calculateCurrentValue,
  };
};