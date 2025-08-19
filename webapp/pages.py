'''
SEAMLESS_ZOOM — A technique for seamless zooming between process models and process instances.
Copyright (C) 2025  Christoffer Rubensson

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

Website: https://hu-berlin.de/rubensson
E-Mail: {firstname.lastname}@hu-berlin.de
'''

import csv
import sys
import io
import os
import pandas as pd
import tempfile
from flask import Blueprint, render_template, request, jsonify
from pathlib import Path
from src.utils.data_importing import load_event_log_from_tempfile
from src.orchestrator import process_log_for_d3js

# App directory
project_root = Path(__file__).resolve().parent.parent
sys.path.append(str(project_root))

bp = Blueprint("pages", __name__)

# Import allowance fo file extensions
ALLOWED_EXTENSIONS = {'csv', 'xes'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route("/")
def home():
    return render_template("pages/index.html")

@bp.route('/api/get_data')
def get_data():
    data_path = project_root / 'data' / 'example_data' / 'data-runningexample.csv'
    with data_path.open(newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        data = list(reader)
    return jsonify(data)

@bp.route('/api/upload_data', methods=['POST'])
def upload_data():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    filename = file.filename
    ext = filename.rsplit('.', 1)[1].lower()

    if filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(filename):
        return jsonify({'error': 'Invalid file type. Only {ALLOWED_EXTENSIONS} allowed.'}), 400
    
    try:
        if ext == 'csv':
            stream = io.StringIO(file.stream.read().decode("utf-8"), newline=None)
            reader = csv.DictReader(stream)
            data = list(reader)
        elif ext == 'xes':
            with tempfile.NamedTemporaryFile(delete=False, suffix=".xes") as tmp:
                file.save(tmp)
                tmp_path = tmp.name
            df = load_event_log_from_tempfile(tmp_path)
            df = process_log_for_d3js(df)
            data = df.to_dict(orient='records')
            # Clean up temporary file
            os.remove(tmp_path)
        else:
            return jsonify({'error': 'Unsupported file type'}), 400
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500