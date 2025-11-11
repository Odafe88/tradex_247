-- Create atomic trade creation function to prevent race conditions
-- This function uses row-level locking to ensure balance checks and updates are atomic
CREATE OR REPLACE FUNCTION public.create_trade_atomic(
  p_trade_type TEXT,
  p_asset_symbol TEXT,
  p_asset_name TEXT,
  p_initial_amount NUMERIC,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_balance NUMERIC;
  v_balance_field TEXT;
  v_trade_id UUID;
  v_result json;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Determine balance field based on trade type
  IF p_trade_type = 'crypto' THEN
    v_balance_field := 'balance_crypto';
  ELSIF p_trade_type = 'forex' THEN
    v_balance_field := 'balance_forex';
  ELSE
    RAISE EXCEPTION 'Invalid trade type';
  END IF;

  -- Lock the user's profile row and get balance
  -- This prevents concurrent trades from racing
  EXECUTE format(
    'SELECT %I FROM profiles WHERE id = $1 FOR UPDATE',
    v_balance_field
  ) INTO v_balance USING v_user_id;

  -- Check if user has sufficient balance
  IF v_balance IS NULL OR v_balance < p_initial_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Deduct balance atomically
  EXECUTE format(
    'UPDATE profiles SET %I = %I - $1 WHERE id = $2',
    v_balance_field, v_balance_field
  ) USING p_initial_amount, v_user_id;

  -- Create trade
  INSERT INTO trades (
    user_id,
    trade_type,
    asset_symbol,
    asset_name,
    initial_amount,
    current_value,
    start_time,
    end_time,
    is_active
  ) VALUES (
    v_user_id,
    p_trade_type,
    p_asset_symbol,
    p_asset_name,
    p_initial_amount,
    p_initial_amount,
    p_start_time,
    p_end_time,
    true
  ) RETURNING id INTO v_trade_id;

  -- Return trade data as JSON
  SELECT json_build_object(
    'id', id,
    'user_id', user_id,
    'trade_type', trade_type,
    'asset_symbol', asset_symbol,
    'asset_name', asset_name,
    'initial_amount', initial_amount,
    'current_value', current_value,
    'start_time', start_time,
    'end_time', end_time,
    'is_active', is_active,
    'created_at', created_at
  )
  INTO v_result
  FROM trades
  WHERE id = v_trade_id;

  RETURN v_result;
END;
$$;