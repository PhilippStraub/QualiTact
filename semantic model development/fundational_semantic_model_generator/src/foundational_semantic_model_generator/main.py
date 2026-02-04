import os
import json
import pandas as pd
from rdflib import Namespace, Literal, XSD

EX = Namespace("http://example.org/")
RDF = Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#")
RDFS = Namespace("http://www.w3.org/2000/01/rdf-schema#")
RDFTerm = str 

# Dataclasses für RDF-Tripel
from dataclasses import dataclass
from typing import Union

@dataclass(frozen=True)
class EmbeddedTriple:
    subject: RDFTerm
    predicate: RDFTerm
    obj: RDFTerm

    def __str__(self):
        return f"<< :{self.subject} :{self.predicate} :{self.obj} >>"

@dataclass(frozen=True)
class Triple:
    subject: RDFTerm
    predicate: RDFTerm
    obj: RDFTerm

    def __str__(self):
        if self.predicate.startswith("rdf:") or self.predicate.startswith("rdfs:"):
             return f":{self.subject} {self.predicate} :{self.obj} ."
        if isinstance(self.obj, Literal):
             return f"{self.subject} :{self.predicate} {self.obj.n3()} ."
        return f":{self.subject} :{self.predicate} :{self.obj} ."

def main():
    input_folder = 'Input'
    tactic_excel_file = '00_Tactic Classification Overview.xlsx'
    qa_excel_file = '00_Quality Attribute Classification Overview.xlsx'
    tactic_file_path = os.path.join(input_folder, tactic_excel_file)
    qa_file_path = os.path.join(input_folder, qa_excel_file)

    turtle_content = []

    # Tactics
    try:
        df_tactics = pd.read_excel(tactic_file_path)
        print(f"'INFO | Successfully loaded {tactic_excel_file}'.")

        for index, row in df_tactics.iterrows():
            tactic = row['Tactics']
            
            if pd.notna(tactic):
                subject = str(tactic).replace(" ", "_").replace("/", "_or_").replace(",", "_or_")
                
                triple = Triple(subject, "rdf:type", "Tactic")
                turtle_content.append(str(triple))

    except FileNotFoundError:
        print(f"ERROR | No file {tactic_excel_file} in the folder {input_folder} available.")
    except Exception as e:
        print(f"ERROR | During processing the file {tactic_excel_file}, an error appeared: {e}")

    #QAs
    try:
        df_qa = pd.read_excel(qa_file_path)
        print(f"'INFO | Successfully loaded {qa_excel_file}'.")
        
        for index, row in df_qa.iterrows():
            quality_attribute = row['Quality Attribute']

            if pd.notna(quality_attribute):
                subject = str(quality_attribute).replace(" ", "_").replace("/", "_or_").replace(",", "_or_")

                triple = Triple(subject, "rdf:type", "QualityAttribute")
                turtle_content.append(str(triple))
    except FileNotFoundError:
        print(f"ERROR | No file {qa_excel_file} in the folder {input_folder} available.")
    except Exception as e:
        print(f"ERROR | During processing the file {qa_excel_file}, an error appeared: {e}")



    # Turtle creation
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    output_file_path = os.path.join(output_dir, "model.ttl")

    try:
        with open(output_file_path, "w", encoding="utf-8") as f:
            f.write("@prefix : <http://example.org/> .\n")
            f.write("@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n")
            f.write("@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n")
            f.write("@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n")
            
            f.write(":Tactic rdf:type rdfs:Class .\n")
            f.write(":QualityAttribute rdf:type rdfs:Class .\n\n")
            for line in turtle_content:
                f.write(line + "\n")

        print(f"INFO | Successfully created the turtle file: {os.path.abspath(output_file_path)}")

    except Exception as e:
        print(f"ERROR | In the process creating the turtle file an error appeared: {e}")

if __name__ == "__main__":
    main()
