## Prerequisites

- **Python 3.12 or higher** installed on your system
- **Poetry** - Python's dependency manager

## Installation

1. **Clone or navigate to the project directory**
   ```powershell
   cd path\to\score_analysis_project_QAxTactics
   ```

2. **Install dependencies with Poetry**
   ```powershell
   poetry install
   ```

   This creates a virtual environment and installs all required packages automatically.

## Running the Analysis



```powershell
poetry run score-analysis-project-qas-tactics
```

## What happens when you run it?

The script will:
1. Load your Excel data from `src/score_analysis_project/data/SMS/`
2. Filter out columns with no data
3. Calculate association metrics for all quality attribute × tactic pairs
4. Creates two output files in `src/score_analysis_project/output/SMS/`:
   - `scores.json` - Clean, structured scores for each combination 
   - `scores.csv` - Detailed statistical breakdown with all metrics

For further processing, only the `scores.json` is required.

## Project Structure

```
score_analysis_project_QAxTactics/
├── src/
│   └── score_analysis_project/
│       ├── main.py              # Main analysis script
│       ├── data/
│       │   ├── SMS/             # Input Excel files
│       └── output/              # Generated results
├── pyproject.toml               # Poetry configuration
└── README.md                    # You are here!
```

## Customizing the Analysis

Want to tweak the analysis? Open `src/score_analysis_project/main.py` and adjust these parameters at the top:

- `MIN_SUPPORT_TACTIC` - Minimum tactic usage count (default: 1)
- `MIN_SUPPORT_QA` - Minimum quality attribute cases (default: 1)
- `USE_PSEUDOCOUNT` - Add stability to rare events (default: False)
- `TANH_ALPHA` - Adjust Scaling factor for logRR normalization (default: 0.5)
- `CONFIDENCE_K` - Adjust regulatory factor for confidence calculation (default: 15)
- `DEFAULT_WEIGHTS` - Adjust impact of the weights w_logRR, w_phi on the computed score
- `VERSION` - Switch between datasets: "SMS" or others

