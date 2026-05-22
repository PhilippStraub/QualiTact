# QualiTact: A Semantic Model for Quality-driven Development of AI-based Systems based on Architectural Tactics


## Context
In this repository, the *QualiTact* model can be accessed, which supports the quality-driven development of AI-based systems based on tactic identification and planning. In a dedicated journal article, we present our approach for developing the RDF-based semantic model and illustrate how the model supports the identification of applied tactics in the source code of three cases of AI-based systems. *Currently, the contributed article is under review.* However, all data supporting the findings of our study as well as the model can be publicly accessed in this repository. 

This link routes you to the model: [QualiTact Webpage](https://philippstraub.github.io/QualiTact/)

**Select the quality attributes you aim to achieve in your AI-based system project and receive immediate recommendations in the form of architectural tactics.**

## Overview
```
.
├── index.html                                #Model webpage
├── style.css                                 #Webpage style
├── references.xlsx                           #References for meanings of tactics
├── quality attribute assessment sheet.xlsx   #Assessment sheet used for studies' quality attribute retrieval
├── README.md                                 #You are here!
├── js/                                       #Javascript modules webpage
├── semantic model development/               #Tools for semantic model creation
│   ├── foundational_semantic_model_generator/
│   ├── semantic_model_generator/
│   ├── score_analysis_project_QAxTactics/
│   └── score_analysis_project_TacticsxTactics/
└── data/                                     #Experimental data of our study
```
For each tool to create the semantic model, a *dedicated readme* is provided within the project. 


## Local Setup of the webpage
For local execution of the webpage, we recommend to apply the following steps (to prevent blocking due to CORS):

1. Download the repository into a your directory `/your/folder`
2. Open Terminal and switch into your directory:
   ```powershell
   cd "/your/folder"
   ```
3. Start a python webserver:
   ```powershell
   python -m http.server 8000
   ```
4. Access the page on: `http://localhost:8000/index.html`

## Reference this repository 
*On acceptance, an article reference will be provided here.*