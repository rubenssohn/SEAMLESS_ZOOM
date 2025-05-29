from src.utils.data_processing import simplifyLog, relativeTimestamps
from src.algo.global_ranking import global_ranking_of_eventdata
from src.utils.data_processing import rename_cols_for_d3csv, convert_timecols_to_string

def process_log_for_d3js(df):
    """
    Pre-process the event log for visualization in d3.js.
    """
    df_proc = df.copy()
    # Process data
    df_proc = simplifyLog(df_proc)
    df_proc = relativeTimestamps(df_proc)
    df_proc, _ = global_ranking_of_eventdata(df_proc)
    df_proc = rename_cols_for_d3csv(df_proc)
    df_proc = convert_timecols_to_string(df_proc) # Convert Timedelta to string (JSON cannot handle Timedelta or Datetime)
    df_proc = df_proc.fillna("nan") # In case some values are NaN, replace them with "nan" string for JSON compatibility
    return df_proc