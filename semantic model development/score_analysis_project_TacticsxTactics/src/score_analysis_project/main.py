import math
import os
import json
import pandas as pd
import numpy as np
from scipy.stats import fisher_exact
from itertools import product
import warnings
from pathlib import Path
warnings.filterwarnings('ignore')

# --- Parameters for configuration ---
MIN_SUPPORT_TACTIC = 1      # (a+b)
MIN_SUPPORT_QA = 1          # (a+c)
USE_PSEUDOCOUNT = False     # Recommended to be False, since research shows this introduces bias
PSEUDOCOUNT = 0.5           
TANH_ALPHA = 0.5            # Scaling factor for logRR normalization
CONFIDENCE_K = 15           # Regulatory factor for confidence calculation
DEFAULT_WEIGHTS = (0.5, 0.5) # (w_logRR, w_phi)
# ------------------------------------


# Drops columns whose sum is < 2 and prints them
def drop_weak_columns(df, df_name):
    counter = 0
    for column in df.columns.copy():
        if pd.api.types.is_numeric_dtype(df[column]):
            columnnsum = df[column].sum()
            if columnnsum < 1:
                counter += 1
                print(f"INFO | Columns removed ({df_name}): '{column}' with sum {columnnsum}")
                df.drop(columns=column, inplace=True)
    print(f"INFO | Column drop counter ({df_name}): {counter}")
    print(f"INFO | Remaining columns in {df_name}: {len(df.columns)}")
    return df

def compute_metrics(x_series, y_series):
    a = int(((x_series == 1) & (y_series == 1)).sum())
    b = int(((x_series == 0) & (y_series == 1)).sum())
    c = int(((x_series == 1) & (y_series == 0)).sum())
    d = int(((x_series == 0) & (y_series == 0)).sum())
    n = a + b + c + d

    n_series_1 = int((x_series == 1).sum())
    n_series_2 = int((y_series == 1).sum())

    if USE_PSEUDOCOUNT:
        a_pc, b_pc, c_pc, d_pc = a + PSEUDOCOUNT, b + PSEUDOCOUNT, c + PSEUDOCOUNT, d + PSEUDOCOUNT
    else:
        a_pc, b_pc, c_pc, d_pc = a, b, c, d

    if (a_pc + b_pc) > 0 and (c_pc + d_pc) > 0 and c_pc > 0:
        rr = (a_pc / (a_pc + b_pc)) / (c_pc / (c_pc + d_pc))
    else:
        rr = np.nan
    log_rr = np.log(rr) if (rr is not None and not np.isnan(rr) and rr > 0) else np.nan

    denom = (a+b)*(a+c)*(b+d)*(c+d)
    phi = (a*d - b*c) / np.sqrt(denom) if denom > 0 else np.nan

    try:
        _, p_value = fisher_exact([[a, b], [c, d]], alternative='two-sided')
    except Exception:
        p_value = np.nan
        
    T = a + b
    Q = a + c
    
    gm = np.sqrt(T * Q)
    confidence = 1 - np.exp(-gm / CONFIDENCE_K)
    
    return {
        'a': a, 'b': b, 'c': c, 'd': d, 'n': n, 
        'n_series_1': n_series_1, 'n_series_2': n_series_2,
        'logRR': log_rr,
        'phi': phi,
        'p_value': p_value,
        'confidence': confidence
    }


def compute_final_score(row, weights):
    w_logrr, w_phi = weights
    p = row['p_value']
    conf = row['confidence']
    
    if any(pd.isna(row[c]) for c in ['logRR_norm','phi_norm']) or pd.isna(p):
        return np.nan
        
    w_p = 1.0 if (p is not None and p <= 0) else min(1.0, -np.log10(p)/3.0)
    base_score = w_logrr * row['logRR_norm'] + w_phi * row['phi_norm']
    raw_score = w_p * base_score
    final_score = raw_score * conf
    
    # Prevents -0.0
    if final_score == 0:
        return 0
    return final_score

def compute_score_minus_conf(row, weights):
    w_logrr, w_phi = weights
    p = row['p_value']
    
    if any(pd.isna(row[c]) for c in ['logRR_norm','phi_norm']) or pd.isna(p):
        return np.nan
        
    w_p = 1.0 if (p is not None and p <= 0) else min(1.0, -np.log10(p)/3.0)
    base_score = w_logrr * row['logRR_norm'] + w_phi * row['phi_norm']
    raw_score = w_p * base_score
    
    # Prevents -0.0
    if raw_score == 0:
        return 0
    return raw_score


def main():
    BASE_DIR = Path(__file__).parent

    print("INFO | Score calculation initiated...")
    version = "SMS"
    print(f'INFO | Use data from {version}')
    taktiken_df = pd.read_excel(BASE_DIR / "data" / version / "data-tactics.xlsx")

    # Drop NaN-values
    taktiken_df = taktiken_df.apply(pd.to_numeric, errors='coerce').fillna(0).astype(int)

    # Drop weak columns
    taktiken_df = drop_weak_columns(taktiken_df, "Taktiken")

    # compute metrics for all qa-tactic pairs
    results = []
    tactic_cols = list(taktiken_df.columns)

    for tactic1, tactic2 in product(tactic_cols, tactic_cols):
        #skip comparing a tactic with itself
        if tactic1 == tactic2:
            continue 

        m = compute_metrics(taktiken_df[tactic1], taktiken_df[tactic2])
        if m['n_series_1'] < MIN_SUPPORT_TACTIC:
            continue
        if m['n_series_2'] < MIN_SUPPORT_TACTIC:
            continue
        m.update({'Tactic1': tactic1, 'Tactic2': tactic2})
        results.append(m)

    metrics_df = pd.DataFrame(results)
    print(f'\nINFO | Pairs considered for score calculation: {len(metrics_df)}')

    # normalization and score calculation
    norm_df = metrics_df.copy()
    norm_df['logRR_norm'] = np.tanh(TANH_ALPHA * norm_df['logRR'])
    norm_df['phi_norm'] = norm_df['phi']
    norm_df['Score'] = norm_df.apply(lambda r: compute_final_score(r, DEFAULT_WEIGHTS), axis=1)
    norm_df['Score_minus_conf'] = norm_df.apply(lambda r: compute_score_minus_conf(r, DEFAULT_WEIGHTS), axis=1)

    # sort according to score
    norm_df.sort_values('Score', ascending=False, inplace=True)


    # Create and save json
    json_output = {"Scores": []}

    for index, row in norm_df.iterrows():
        if pd.isna(row['Score']):
            continue
        
        takt1 = row['Tactic1']
        takt2 = row['Tactic2']
        
        sum1 = int(taktiken_df[takt1].sum())
        sum2 = int(taktiken_df[takt2].sum())

        json_output["Scores"].append({
            "Tactic1": takt1,
            "Tactic1_Sum": sum1,
            "Tactic2": takt2,
            "Tactic2_Sum": sum2,
            "Score": round(row['Score'], 4) if pd.notna(row['Score']) else None,
            "Score_minus_conf": round(row['Score_minus_conf'], 4) if pd.notna(row['Score_minus_conf']) else None,
            "Confidence": round(row['confidence'], 4) if pd.notna(row['confidence']) else None,
        })

    output_dir = BASE_DIR / "output" / version
    output_dir.mkdir(parents=True, exist_ok=True)

    json_path = output_dir / "scores.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(json_output, f, indent=2, ensure_ascii=False)

    print(f"\nINFO | {len(norm_df)} Scores have been saved in '{json_path}'.")

    # Create and save csv
    csv_output_df = norm_df.copy()
    csv_output_df.rename(columns={'Score': 'Score_default', 'Tactic1': 'Tactic_A', 'Tactic2': 'Tactic_B'}, inplace=True) # Rename for consistency with notebook
    final_cols = [
        'Tactic_A', 'Tactic_B', 'a', 'b', 'c', 'd', 'n', 
        'n_series_1', 'n_series_2', 'confidence', 
        'logRR', 'phi', 'p_value', 'logRR_norm', 'phi_norm', 
        'Score_default', 'Score_minus_conf'
    ]
    # When a column does not exist, fill missing with None or NaN
    for col in final_cols:
        if col not in csv_output_df.columns:
            csv_output_df[col] = np.nan

    final_df = csv_output_df[final_cols].sort_values('Score_default', ascending=False).reset_index(drop=True)

    csv_path = output_dir / "scores.csv"
    final_df.to_csv(csv_path, index=False)
    print(f"INFO | Details have been saved in '{csv_path}'.")
    print("INFO | Score calculation finished.")



if __name__ == "__main__":
    main()
