## Prerequisites

- **Python 3.12 or higher** installed on your system
- **Poetry** - Python's dependency manager

## Installation

1. **Clone or navigate to the project directory**
   ```powershell
   cd path\to\semantic_model_generator
   ```

2. **Install dependencies with Poetry**
   ```powershell
   poetry install
   ```

   This creates a virtual environment and installs all required packages automatically.

## Running the Generation


```powershell
poetry run semantic-model-generator
```

## What happens when you run it?

The script will:
1. Load your JSON data from `src/semantic_model_generator/input/`
2. Checks whether the JSON was created by the `score_analysis_project_QAxTactics` OR the `score_analysis_project_TacticsxTactics`
3. Creates a single output file in `src/semantic_model_generator/output/`:
   - `model.ttl` - Clean, structured semantic model based on the provided JSON

## Project Structure

```
semantic_model_generator/
├── src/
│   └── semantic_model_generator/
│       ├── main.py              # Main analysis script
│       ├── input/               # Input JSON files            
│       └── output/              # Generated results
├── pyproject.toml               # Poetry configuration
└── README.md                    # You are here!
```

