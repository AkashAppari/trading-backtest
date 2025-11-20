"""
Backtest logic extracted from notebook
"""
import pandas as pd
import numpy as np

class DataExtractor:
    """Simple data extractor for TradingView-style CSV/Excel files."""
    
    def _read_file(self, file_path, sheet_name=None):
        """Read Excel or CSV file."""
        if file_path.lower().endswith(('.xlsx', '.xls', '.xlsm')):
            if sheet_name:
                return pd.read_excel(file_path, sheet_name=sheet_name)
            else:
                excel_file = pd.ExcelFile(file_path)
                return pd.read_excel(file_path, sheet_name=excel_file.sheet_names[0])
        elif file_path.lower().endswith('.csv'):
            return pd.read_csv(file_path)
        else:
            raise ValueError("Please use .xlsx, .xls, or .csv files")
    
    def extract_signals(self, file_path, sheet_name=None):
        """Extract signal data from file."""
        df = self._read_file(file_path, sheet_name)
        if df.empty:
            raise ValueError("File is empty")
        
        df.columns = [str(col).strip().lower() for col in df.columns]
        
        timestamp_col = None
        for col in ['time', 'timestamp', 'date', 'datetime']:
            if col in df.columns:
                timestamp_col = col
                break
        
        action_col = None
        for col in ['action', 'signal', 'side', 'type']:
            if col in df.columns:
                action_col = col
                break
        
        price_col = None
        for col in ['price', 'value', 'close']:
            if col in df.columns:
                price_col = col
                break
        
        if not timestamp_col:
            raise ValueError(f"Could not find timestamp column. Found columns: {list(df.columns)}")
        if not action_col:
            raise ValueError(f"Could not find action column. Found columns: {list(df.columns)}")
        if not price_col:
            raise ValueError(f"Could not find price column. Found columns: {list(df.columns)}")
        
        signals_df = pd.DataFrame()
        signals_df['timestamp'] = pd.to_datetime(df[timestamp_col], errors='coerce')
        signals_df['action'] = df[action_col].astype(str).str.lower().str.strip()
        signals_df['price'] = pd.to_numeric(df[price_col], errors='coerce')
        
        signals_df['action'] = signals_df['action'].replace({
            'buy': 'buy', 'b': 'buy', 'long': 'buy', 'l': 'buy',
            'sell': 'sell', 's': 'sell', 'short': 'sell', 'sh': 'sell'
        })
        
        initial_count = len(signals_df)
        signals_df = signals_df.dropna()
        signals_df = signals_df[signals_df['action'].isin(['buy', 'sell'])]
        signals_df = signals_df.sort_values('timestamp').reset_index(drop=True)
        
        removed_count = initial_count - len(signals_df)
        
        return signals_df, {
            'timestamp_column': timestamp_col,
            'action_column': action_col,
            'price_column': price_col,
            'rows_processed': len(signals_df),
            'rows_removed': removed_count
        }
    
    def extract_market_data(self, file_path, sheet_name=None):
        """Extract market data (OHLC) from file."""
        df = self._read_file(file_path, sheet_name)
        if df.empty:
            raise ValueError("File is empty")
        
        df.columns = [str(col).strip().lower() for col in df.columns]
        
        timestamp_col = None
        for col in ['time', 'timestamp', 'date', 'datetime']:
            if col in df.columns:
                timestamp_col = col
                break
        
        open_col = 'open' if 'open' in df.columns else None
        high_col = 'high' if 'high' in df.columns else None
        low_col = 'low' if 'low' in df.columns else None
        close_col = 'close' if 'close' in df.columns else None
        
        if not timestamp_col:
            raise ValueError(f"Could not find timestamp column. Found columns: {list(df.columns)}")
        if not all([open_col, high_col, low_col, close_col]):
            missing = [col for col, val in [('open', open_col), ('high', high_col), 
                                            ('low', low_col), ('close', close_col)] if not val]
            raise ValueError(f"Missing columns: {missing}. Found columns: {list(df.columns)}")
        
        market_df = pd.DataFrame()
        market_df['timestamp'] = pd.to_datetime(df[timestamp_col], errors='coerce')
        market_df['open'] = pd.to_numeric(df[open_col], errors='coerce')
        market_df['high'] = pd.to_numeric(df[high_col], errors='coerce')
        market_df['low'] = pd.to_numeric(df[low_col], errors='coerce')
        market_df['close'] = pd.to_numeric(df[close_col], errors='coerce')
        
        initial_count = len(market_df)
        market_df = market_df.dropna()
        market_df = market_df.sort_values('timestamp').reset_index(drop=True)
        
        removed_count = initial_count - len(market_df)
        
        return market_df, {
            'timestamp_column': timestamp_col,
            'ohlc_columns': {'open': open_col, 'high': high_col, 'low': low_col, 'close': close_col},
            'rows_processed': len(market_df),
            'rows_removed': removed_count
        }
    
    def get_file_info(self, file_path, sheet_name=None):
        """Get basic info about the file."""
        try:
            df = self._read_file(file_path, sheet_name)
            info = {
                'rows': len(df),
                'columns': list(df.columns)
            }
            if file_path.lower().endswith(('.xlsx', '.xls', '.xlsm')):
                try:
                    excel_file = pd.ExcelFile(file_path)
                    info['sheets'] = excel_file.sheet_names
                except:
                    pass
            return info
        except Exception as e:
            return {'error': str(e)}


INITIAL_CAPITAL = 100000

def process_backtest(signals, market_data, time_window_seconds=0):
    """Run a backtest simulation."""
    if signals.empty or market_data.empty:
        raise ValueError('Both signals and market data are required')
    
    signals = signals.copy()
    market_data = market_data.copy()
    signals['timestamp'] = pd.to_datetime(signals['timestamp'])
    market_data['timestamp'] = pd.to_datetime(market_data['timestamp'])
    
    signals = signals.sort_values('timestamp').reset_index(drop=True)
    market_data = market_data.sort_values('timestamp').reset_index(drop=True)
    
    market_data_map = {row['timestamp']: row for _, row in market_data.iterrows()}
    
    trades = []
    position = None
    entry_price = 0.0
    entry_timestamp = None
    capital = INITIAL_CAPITAL
    quantity = 0.0
    cumulative_pnl = 0.0
    trade_id = 1
    equity_history = []
    peak_equity = INITIAL_CAPITAL
    
    for _, signal_row in signals.iterrows():
        signal_time = signal_row['timestamp']
        signal_action = signal_row['action'].lower()
        signal_price = signal_row['price']
        
        matched_market_data = None
        min_time_diff = float('inf')
        if signal_time in market_data_map:
            matched_market_data = market_data_map[signal_time]
        else:
            for _, market_row in market_data.iterrows():
                market_time = market_row['timestamp']
                time_diff = abs((signal_time - market_time).total_seconds())
                if time_diff <= time_window_seconds and time_diff < min_time_diff:
                    min_time_diff = time_diff
                    matched_market_data = market_row
        
        if matched_market_data is None:
            continue
        
        execution_price = matched_market_data['close']
        execution_timestamp = matched_market_data['timestamp']
        
        if signal_action == 'buy':
            if position == 'short':
                pnl = (entry_price - execution_price) * quantity
                cumulative_pnl += pnl
                capital += pnl
                trades.append({
                    'id': trade_id, 'signal_timestamp': str(signal_row['timestamp']),
                    'action': 'short', 'signal_price': signal_price,
                    'execution_timestamp': str(execution_timestamp),
                    'execution_price': execution_price, 'quantity': quantity,
                    'pnl': pnl, 'cumulative_pnl': cumulative_pnl, 'is_win': pnl > 0,
                })
                trade_id += 1
                position = None
                quantity = 0.0
            if position is None:
                quantity = capital / execution_price
                entry_price = execution_price
                entry_timestamp = execution_timestamp
                position = 'long'
        elif signal_action == 'sell':
            if position == 'long':
                pnl = (execution_price - entry_price) * quantity
                cumulative_pnl += pnl
                capital += pnl
                trades.append({
                    'id': trade_id, 'signal_timestamp': str(signal_row['timestamp']),
                    'action': 'long', 'signal_price': signal_price,
                    'execution_timestamp': str(execution_timestamp),
                    'execution_price': execution_price, 'quantity': quantity,
                    'pnl': pnl, 'cumulative_pnl': cumulative_pnl, 'is_win': pnl > 0,
                })
                trade_id += 1
                position = None
                quantity = 0.0
            if position is None:
                quantity = capital / execution_price
                entry_price = execution_price
                entry_timestamp = execution_timestamp
                position = 'short'
        
        current_equity = INITIAL_CAPITAL + cumulative_pnl
        equity_history.append({'timestamp': str(execution_timestamp), 'equity': current_equity})
        if current_equity > peak_equity:
            peak_equity = current_equity
    
    if position is not None and not market_data.empty:
        last_market_data = market_data.iloc[-1]
        final_price = last_market_data['close']
        if position == 'long':
            pnl = (final_price - entry_price) * quantity
        else:
            pnl = (entry_price - final_price) * quantity
        cumulative_pnl += pnl
        capital += pnl
        trades.append({
            'id': trade_id, 'signal_timestamp': str(entry_timestamp), 'action': position,
            'signal_price': entry_price, 'execution_timestamp': str(last_market_data['timestamp']),
            'execution_price': final_price, 'quantity': quantity,
            'pnl': pnl, 'cumulative_pnl': cumulative_pnl, 'is_win': pnl > 0,
        })
        equity_history.append({
            'timestamp': str(last_market_data['timestamp']),
            'equity': INITIAL_CAPITAL + cumulative_pnl,
        })
    
    trades_df = pd.DataFrame(trades)
    total_pnl = cumulative_pnl
    total_trades = len(trades)
    total_wins = len(trades_df[trades_df['is_win']]) if not trades_df.empty else 0
    total_losses = total_trades - total_wins
    win_rate = total_wins / total_trades if total_trades > 0 else 0.0
    
    equity_df = pd.DataFrame(equity_history)
    if not equity_df.empty:
        equity_df['equity'] = pd.to_numeric(equity_df['equity'])
        equity_df['peak'] = equity_df['equity'].cummax()
        equity_df['drawdown'] = (equity_df['peak'] - equity_df['equity']) / equity_df['peak']
        max_drawdown = equity_df['drawdown'].max()
        drawdown_data = equity_df[['timestamp', 'drawdown']].to_dict(orient='records')
    else:
        max_drawdown = 0.0
        drawdown_data = []
    
    trade_results = trades_df['pnl'].tolist() if not trades_df.empty else []
    
    return {
        'trades': trades_df,
        'metrics': {
            'total_pnl': float(total_pnl), 'win_rate': float(win_rate),
            'total_wins': int(total_wins), 'total_losses': int(total_losses),
            'max_drawdown': float(max_drawdown), 'final_capital': float(capital),
            'initial_capital': INITIAL_CAPITAL, 'total_trades': int(total_trades),
        },
        'equity_curve': equity_history,
        'drawdown': drawdown_data,
        'trade_results': trade_results,
    }

