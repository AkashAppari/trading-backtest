"""
Flask backend for Trading Signal Backtester
"""
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import json
from werkzeug.utils import secure_filename
from backtest_logic import DataExtractor, process_backtest

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

extractor = DataExtractor()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file uploads"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        file_type = request.form.get('type', 'signal')  # 'signal' or 'market'
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Get file info
        file_info = extractor.get_file_info(filepath)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'filepath': filepath,
            'info': file_info
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/extract', methods=['POST'])
def extract_data():
    """Extract data from uploaded file"""
    try:
        data = request.json
        filepath = data.get('filepath')
        file_type = data.get('type', 'signal')
        sheet_name = data.get('sheet_name')
        
        if not filepath or not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        
        if file_type == 'signal':
            signals_df, detection_info = extractor.extract_signals(filepath, sheet_name)
            result = {
                'data': signals_df.to_dict(orient='records'),
                'detection_info': detection_info
            }
        else:
            market_df, detection_info = extractor.extract_market_data(filepath, sheet_name)
            result = {
                'data': market_df.to_dict(orient='records'),
                'detection_info': detection_info
            }
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/backtest', methods=['POST'])
def run_backtest():
    """Run backtest with uploaded data"""
    try:
        data = request.json
        signals_data = data.get('signals')
        market_data = data.get('market_data')
        time_window = data.get('time_window', 0)
        
        if not signals_data or not market_data:
            return jsonify({'error': 'Both signals and market data are required'}), 400
        
        # Convert to DataFrames
        signals_df = pd.DataFrame(signals_data)
        market_df = pd.DataFrame(market_data)
        
        # Convert timestamp strings back to datetime
        signals_df['timestamp'] = pd.to_datetime(signals_df['timestamp'])
        market_df['timestamp'] = pd.to_datetime(market_df['timestamp'])
        
        # Run backtest
        result = process_backtest(signals_df, market_df, time_window)
        
        # Convert results to JSON-serializable format
        result_dict = {
            'trades': result['trades'].to_dict(orient='records'),
            'metrics': result['metrics'],
            'equity_curve': result['equity_curve'],
            'drawdown': result['drawdown'],
            'trade_results': result['trade_results']
        }
        
        return jsonify(result_dict)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)

