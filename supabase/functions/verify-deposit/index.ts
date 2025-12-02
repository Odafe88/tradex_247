import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ETHERSCAN_API_KEY = Deno.env.get('ETHERSCAN_API_KEY') || import.meta.env.VITE_ETHERSCAN_API_KEY;
const SOLSCAN_API_KEY = Deno.env.get('SOLSCAN_API_KEY') || import.meta.env.VITE_SOLSCAN_API_KEY;
const EXPECTED_ETH_ADDRESS = '0x504b5de09385b6b776baab7076a08d7cc34f3217';
const EXPECTED_SOL_ADDRESS = '33qzZwAYnz8GDGcoYWAyxhGQQ1pnFwQtM9SJwodPiu9L';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? import.meta.env.VITE_SUPABASE_URL,
      Deno.env.get('SUPABASE_ANON_KEY') ?? import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { transactionHash, chain } = await req.json();

    if (!transactionHash || !chain) {
      throw new Error('Missing transaction hash or chain');
    }

    console.log(`Verifying ${chain} deposit for user ${user.id}, tx: ${transactionHash}`);

    let verified = false;
    let amount = 0;
    let walletAddress = '';

    if (chain === 'ETH' || chain === 'USDT') {
      // Verify Ethereum transaction
      const response = await fetch(
        `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${transactionHash}&apikey=${ETHERSCAN_API_KEY}`
      );
      const data = await response.json();
      
      console.log('Etherscan response:', data);

      if (data.result && data.result.to) {
        const toAddress = data.result.to.toLowerCase();
        const expectedAddress = EXPECTED_ETH_ADDRESS.toLowerCase();
        
        if (toAddress === expectedAddress) {
          // Convert hex value to decimal ETH
          const valueInWei = parseInt(data.result.value, 16);
          amount = valueInWei / 1e18; // Convert to ETH
          walletAddress = data.result.from;
          verified = true;
        } else {
          throw new Error('Transaction sent to wrong address');
        }
      } else {
        throw new Error('Transaction not found or still pending');
      }
    } else if (chain === 'SOL') {
      // Verify Solana transaction
      const response = await fetch(
        `https://api.solscan.io/transaction?tx=${transactionHash}`,
        {
          headers: {
            'token': SOLSCAN_API_KEY || ''
          }
        }
      );
      const data = await response.json();
      
      console.log('Solscan response:', data);

      if (data && data.lamport) {
        // Check if transaction is to our address
        if (data.dst && data.dst.toLowerCase() === EXPECTED_SOL_ADDRESS.toLowerCase()) {
          amount = data.lamport / 1e9; // Convert lamports to SOL
          walletAddress = data.src || '';
          verified = true;
        } else {
          throw new Error('Transaction sent to wrong address');
        }
      } else {
        throw new Error('Transaction not found or still pending');
      }
    } else if (chain === 'BTC') {
      throw new Error('Bitcoin verification not yet implemented');
    } else {
      throw new Error('Unsupported chain');
    }

    if (!verified) {
      throw new Error('Transaction could not be verified');
    }

    // Check if transaction already recorded
    const { data: existingDeposit } = await supabase
      .from('deposits')
      .select('id')
      .eq('transaction_hash', transactionHash)
      .single();

    if (existingDeposit) {
      throw new Error('Transaction already processed');
    }

    // Record the deposit
    const { error: depositError } = await supabase
      .from('deposits')
      .insert({
        user_id: user.id,
        chain,
        amount,
        transaction_hash: transactionHash,
        wallet_address: walletAddress,
        status: 'confirmed',
        verified_at: new Date().toISOString()
      });

    if (depositError) {
      console.error('Error recording deposit:', depositError);
      throw new Error('Failed to record deposit');
    }

    // Credit user's crypto balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance_crypto')
      .eq('id', user.id)
      .single();

    const newBalance = (profile?.balance_crypto || 0) + amount;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ balance_crypto: newBalance })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating balance:', updateError);
      throw new Error('Failed to update balance');
    }

    console.log(`Successfully verified and credited ${amount} ${chain} to user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        amount, 
        chain,
        message: `Successfully verified and credited ${amount} ${chain}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-deposit function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});