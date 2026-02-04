## Prerequisites

- **Python 3.12 or higher** installed on your system
- **Poetry** - Python's dependency manager

## Installation

1. **Clone or navigate to the project directory**
   ```powershell
   cd path\to\foundational_semantic_model_generator
   ```

2. **Install dependencies with Poetry**
   ```powershell
   poetry install
   ```

   This creates a virtual environment and installs all required packages automatically.

## Running the Generation


```powershell
poetry run foundational-semantic-model-generator
```

## What happens when you run it?

The script will:
1. Load your Excel files from `src/foundational_semantic_model_generator/input/`
2. Analyzes the classifications and translates them into a semantic model
3. Creates a single output file in `src/foundational_semantic_model_generator/output/`:
   - `model.ttl` - Clean, structured semantic model based on the provided Excel files

## Project Structure

```
foundational_semantic_model_generator/
├── src/
│   └── foundational_semantic_model_generator/
│       ├── main.py              # Main analysis script
│       ├── input/               # Input Excel files 
│       |   ├── quality-attribute classification.xlsx
│       |   └── tactic classification.xlsx
│       └── output/              # Generated results
├── pyproject.toml               # Poetry configuration
└── README.md                    # You are here!
```

