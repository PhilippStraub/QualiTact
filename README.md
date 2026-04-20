# QualiTact: A Semantic Model for Quality-driven Development of AI-based Systems based on Architectural Tactics

## Introduction
In this repository, the *QualiTact* model can be accessed, which supports the quality-driven development of AI-based systems based on tactic identification and planning. In a dedicated journal article, we present our approach for developing the RDF-based semantic model and illustrate how the model supports the identification of applied tactics in the source code of three cases of AI-based systems. *Currently, the contributed article is under review.* However, all data supporting the findings of our study as well as the model can be publicly accessed in this repository. 

This link routes you to the model: [QualiTact Webpage](https://philippstraub.github.io/QualiTact/)

**Select the quality attributes you aim to achieve in your AI-based system project and receive immediate recommendations in the form of architectural tactics.**

## Background on the model's semantics (What is the "score"?)

The QualiTact model in this branch is based on linked quality attributes and tactics, which have been collected in a previous conducted literature study [1] and three empirical cases [under review]. To quantify the influence an individual tactic has on a quality attribute, we we calculated a score metric. The score is computed based on (i) the structural association, (ii) the relative effect, (iii) weighted by the statistical significance and (iv) the confidence based on available data supporting the findings. The final score metric is normalized to the interval [-1, 1], while the applied weights ensure insignificance and low confidence are penalized, in favor for trustworthy recommendations. This score provides the semantics to our model [under review].


## Overview
```
.
├── index.html                                #Model webpage
├── style.css                                 #Webpage style
├── references.xlsx                           #References for meanings of tactics
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


## Prerequisites: Local Setup of the webpage
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


## Model Usage

Overview of Features:
- Quality Attribute Selection
- Architectural Tactic Selection
- Score filtering between Quality Attributes and Tactics
- Score filtering between Tactics
- Export

### Score filtering between Quality Attributes and Tactics

This filter allows to set the threshold for the score between quality attributes and tactics. The score is normalized to the interval [-1, 1]. **We recommend to consider values above 0.06 as recommendations**. Please be aware that the score, due to its computation, does not allow us to conclude that one tactic is better suited for achieving a quality attribute than another simply because, for example, the score is higher. Dedicated additional filters allow you to display only positive or negaitve scores between quality attributes and tactics.

### Score filtering between Tactics (hidden behind "More Filters")

This filter allows to set the threshold for the score between tactics. The score is normalized to the interval [-1, 1]. This provides you with additional information such as: What tactics are combined more often? Since this additional information adds many links to the model, it is hidden by default, with the value set to 1. To display it, lower the value to the desired level. 

### Quality Attribute Selection

Select the quality attributes your project aims to achieve. Based on the configured filter for the score between quality attributes and tactics, the model displays the nodes to which the selected filters apply. 

### Architectural Tactic Selection

Select the architectural tactics your project whishes to apply or applies. Based on the configured filter for the score between quality attributes and tactics, the model displays the nodes to which the selected filters apply. Futhermore, based on the configured filter for the score between tactics, the model displays the nodes.

### Export

All exports can be complemented with tactic's relations by clicking the dedicated button underneath the export-area.

#### Export of Tactics sorted by Quality Attributes

Allows you to export the current view structured according to quality attributes, with tactics listed underneath. Example Export for the quality attributes Modularity and Fault tolerance with Score = 0.2:

```json
{
  "Scores": {
    "Modularity": {
      "Tactics": [
        {
          "Tactic": "Event-based_processing",
          "Type": "DesignTactic",
          "Score": 0.2114,
          "Definition": "The tactic Event-based processing addresses the stimulus ongoing receipt of sensor input data by applying the architectural modification of observing the input data stream for detecting data changes as processing events to the artifact software system during the development phase of Design Definition Process, resulting in the system response of executing the computation only when different information is available."
        },
        {
          "Tactic": "Containerization",
          "Type": "DesignTactic",
          "Score": 0.2211,
          "Definition": "The tactic Containerization addresses the stimulus system startup by applying the architectural modification of encapsulation of models or logic-based components and their runtime dependencies into isolated, portable execution environments to the artifact software system during the development phase of System Architecture Definition, resulting in the system response of executing the containers as an independent units, abstracting hardware or the operating system."
        },
        {
          "Tactic": "Failure_prevention_or_mitigation",
          "Type": "DesignTactic",
          "Score": 0.2294,
          "Definition": "The tactic Failure prevention or mitigation addresses the stimulus hardware fault or faulty input by applying the architectural modification of integrating fault detection routines for the identification of corrupted data at runtime, followed by masking operations that neutralize the impact to the artifact software system during the development phase of Design Definition Process, resulting in the system response of detecting fault and neutralizing fault impact."
        },
        {
          "Tactic": "Modular_system_design",
          "Type": "DesignTactic",
          "Score": 0.2528,
          "Definition": "The tactic Modular system design addresses the stimulus system startup or runtime by applying the architectural modification of separating the system into independent components, each encapsulating a specific functionality with well-defined interfaces to abstract these functionalities to their surroundings to the artifact system during the development phase of System Architecture Definition, resulting in the system response of providing functionalities through executing components cohesively."
        },
        {
          "Tactic": "Deployment_pipeline_creation",
          "Type": "DesignTactic",
          "Score": 0.2528,
          "Definition": "The tactic Deployment pipeline creation addresses the stimulus model deployment by applying the architectural modification of packaging routines that bundle the trained model and conduct model transfer, setup, and activation based on a model repository to an inference device to the artifact software system during the development phase of Operation, resulting in the system response of replacing productive AI model deployments automatically."
        }
      ]
    },
    "Fault_tolerance": {
      "Tactics": [
        {
          "Tactic": "Normalization",
          "Type": "DesignTactic",
          "Score": 0.2354,
          "Definition": "The tactic Normalization addresses the stimulus receipt of input data or faulty input by applying the architectural modification of integrating normalization in the processing pipeline to the artifact AI model during the development phase of Design Definition Process, resulting in the system response of reducing the amount of information passed through the processing pipeline."
        },
        {
          "Tactic": "Fault_tolerant_training",
          "Type": "DesignTactic",
          "Score": 0.2792,
          "Definition": "The tactic Fault tolerant training addresses the stimulus hardware fault by applying the architectural modification of applying training procedures that detect, simulate, or adapt to hardware-induced faults to the artifact AI model during the development phase of model training, resulting in the system response of adapting the behavior through retraining, neuron remapping, or threshold-based accuracy evaluation."
        },
        {
          "Tactic": "Failure_prevention_or_mitigation",
          "Type": "DesignTactic",
          "Score": 0.2921,
          "Definition": "The tactic Failure prevention or mitigation addresses the stimulus hardware fault or faulty input by applying the architectural modification of integrating fault detection routines for the identification of corrupted data at runtime, followed by masking operations that neutralize the impact to the artifact software system during the development phase of Design Definition Process, resulting in the system response of detecting fault and neutralizing fault impact."
        }
      ]
    }
  }
}
```

#### Export only tactics

Allows you to export the current view with exclusion of quality attributes, listing only tactics. Example Export for the quality attributes Modularity and Fault tolerance with Score = 0.2:

```json 
{
  "Tactics": [
    {
      "Tactic": "Event-based_processing",
      "Type": "DesignTactic",
      "Definition": "The tactic Event-based processing addresses the stimulus ongoing receipt of sensor input data by applying the architectural modification of observing the input data stream for detecting data changes as processing events to the artifact software system during the development phase of Design Definition Process, resulting in the system response of executing the computation only when different information is available."
    },
    {
      "Tactic": "Containerization",
      "Type": "DesignTactic",
      "Definition": "The tactic Containerization addresses the stimulus system startup by applying the architectural modification of encapsulation of models or logic-based components and their runtime dependencies into isolated, portable execution environments to the artifact software system during the development phase of System Architecture Definition, resulting in the system response of executing the containers as an independent units, abstracting hardware or the operating system."
    },
    {
      "Tactic": "Failure_prevention_or_mitigation",
      "Type": "DesignTactic",
      "Definition": "The tactic Failure prevention or mitigation addresses the stimulus hardware fault or faulty input by applying the architectural modification of integrating fault detection routines for the identification of corrupted data at runtime, followed by masking operations that neutralize the impact to the artifact software system during the development phase of Design Definition Process, resulting in the system response of detecting fault and neutralizing fault impact."
    },
    {
      "Tactic": "Normalization",
      "Type": "DesignTactic",
      "Definition": "The tactic Normalization addresses the stimulus receipt of input data or faulty input by applying the architectural modification of integrating normalization in the processing pipeline to the artifact AI model during the development phase of Design Definition Process, resulting in the system response of reducing the amount of information passed through the processing pipeline."
    },
    {
      "Tactic": "Modular_system_design",
      "Type": "DesignTactic",
      "Definition": "The tactic Modular system design addresses the stimulus system startup or runtime by applying the architectural modification of separating the system into independent components, each encapsulating a specific functionality with well-defined interfaces to abstract these functionalities to their surroundings to the artifact system during the development phase of System Architecture Definition, resulting in the system response of providing functionalities through executing components cohesively."
    },
    {
      "Tactic": "Deployment_pipeline_creation",
      "Type": "DesignTactic",
      "Definition": "The tactic Deployment pipeline creation addresses the stimulus model deployment by applying the architectural modification of packaging routines that bundle the trained model and conduct model transfer, setup, and activation based on a model repository to an inference device to the artifact software system during the development phase of Operation, resulting in the system response of replacing productive AI model deployments automatically."
    },
    {
      "Tactic": "Fault_tolerant_training",
      "Type": "DesignTactic",
      "Definition": "The tactic Fault tolerant training addresses the stimulus hardware fault by applying the architectural modification of applying training procedures that detect, simulate, or adapt to hardware-induced faults to the artifact AI model during the development phase of model training, resulting in the system response of adapting the behavior through retraining, neuron remapping, or threshold-based accuracy evaluation."
    }
  ]
}
```


### !! Common Issues !!
**If you notice that the model is loading indefinitely**, it is very likely that (i) no part of the model is available for the selected filters (future feature in planning) or (ii) the selected filters cover too large a part of the model, for example, if the score is set to 0.02. 
To resolve this issue, we recommend increasing the number of quality attributes and/or tactics selected, and setting the score filter between quality attributes and tactics to 0.06, as well as setting the score filter between tactics to 1.00.

**If you notice that the progress bar jumps back and forth between different loading stages** while the model is loading, it means the model could not be loaded quickly enough for the filters applied. This occurs when a low score is set as the threshold. For low scores, we recommend typing the desired value directly into the corresponding input field. To reduce the loading time, you can reload the page and reapply the filters.


## References
[1] Straub, P., Decker, C., Kuhrmann, M. (2026). On Architectural Tactics for Resource-Constrained and Safety-Critical AI-Based Systems. In: Taibi, D., Smite, D. (eds) Software Engineering and Advanced Applications. SEAA 2025. Lecture Notes in Computer Science, vol 16082. Springer, Cham. https://doi.org/10.1007/978-3-032-04200-2_16

## Reference this repository 
*On acceptance, an article reference will be provided here.*