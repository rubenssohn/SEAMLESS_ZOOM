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

# Load and preprocess event data
# app/backend/data_loader.py
from pathlib import Path

import pandas as pd
import pm4py
from pm4py.objects.log.importer.xes import importer as xes_importer
from pm4py.objects.log.util import dataframe_utils
from pm4py.objects.conversion.log import converter as log_converter

#import streamlit.runtime.uploaded_file_manager


def load_data_test(filename):
    """Load data from the specified file in the data directory."""
    data_path = Path(__file__).parent.parent.parent / "data" / "event_data" / filename
    return data_path


def load_event_log(filename: str, foldername="event_data") -> pd.DataFrame:
    """Loads an event log from the specified folder and filename."""
    if filename.endswith(".xes"):
        data_path = Path(__file__).parent.parent.parent / "data" / foldername / filename
        df = pm4py.read_xes(str(data_path))
    else:
        raise ValueError("'Filename' must be an .xes file and\n\
                         be in the folder 'data/processed_event_data'.")
    return df

def load_event_log_from_tempfile(file_path: str) -> pd.DataFrame:
    """Loads an event log from a temporary file path."""
    if not file_path.endswith(".xes"):
        raise ValueError("Only .xes files are supported.")
    log = xes_importer.apply(file_path)
    df = log_converter.apply(log, variant=log_converter.Variants.TO_DATA_FRAME)
    df = dataframe_utils.convert_timestamp_columns_in_df(df)
    return df
