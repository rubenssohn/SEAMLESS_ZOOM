# Load and preprocess event data
# app/backend/data_loader.py
import pandas as pd
import pm4py
from pathlib import Path

def export_event_log(df, filename: str, foldername="processed_event_data") -> pd.DataFrame:
    """Exports a DataFrame to an XES file in the specified folder."""
    if filename.endswith(".xes"):
        data_path = Path(__file__).parent.parent.parent / "data" / foldername / filename
        pm4py.write_xes(df, data_path)
    else:
        raise ValueError("'Filename' must be an .xes file and\n\
                         be in the folder 'data/processed_event_data'.")
    return print("export complete.")