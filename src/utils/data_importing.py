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
