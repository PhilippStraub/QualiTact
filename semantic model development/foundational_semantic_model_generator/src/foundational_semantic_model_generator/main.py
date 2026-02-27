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
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_folder = os.path.join(script_dir, 'input', 'SMS + Multicase')
    tactic_excel_file = 'tactic-classification-overview.xlsx'
    qa_excel_file = 'quality-attribute-classification-overview.xlsx'
    tactic_file_path = os.path.join(input_folder, tactic_excel_file)
    qa_file_path = os.path.join(input_folder, qa_excel_file)

    turtle_content = []

    # Tactics
    try:
        df_tactics = pd.read_excel(tactic_file_path)
        print(f"'INFO | Successfully loaded {tactic_excel_file}'.")

        # Extract unique types and create subClassOf triples
        unique_types = df_tactics['Type'].dropna().unique()
        for tactic_type in unique_types:
            type_subject = str(tactic_type).replace(" ", "_")
            # type_triple = Triple(type_subject, "rdf:type", "rdfs:Class")
            subclass_triple = Triple(type_subject, "rdfs:subClassOf", "Tactic")
            # turtle_content.append(str(type_triple))
            turtle_content.append(str(subclass_triple))

        # Extract unique categories
        unique_categories = df_tactics['Category'].dropna().unique()
        for category_type in unique_categories:
            category_subject = str(category_type).replace(" ", "_")
            category_triple = Triple(category_subject, "rdf:type", "Category")
            turtle_content.append(str(category_triple))


        # Extract each tactic as triple
        for index, row in df_tactics.iterrows():
            tactic = row['Tactics']
            tactic_type = row['Type']
            tactic_category = row['Category']
            
            if pd.notna(tactic):
                subject = str(tactic).replace(" ", "_").replace("/", "_or_").replace(",", "_or_")
                obj_type = str(tactic_type).replace(" ", "_")
                obj_category = str(tactic_category).replace(" ", "_")
                
                triple_type = Triple(subject, "rdf:type", obj_type)
                triple_cat = Triple(subject, "hasCategory", obj_category)
                turtle_content.append(str(triple_type))
                turtle_content.append(str(triple_cat))
        

    except FileNotFoundError:
        print(f"ERROR | No file {tactic_excel_file} in the folder {input_folder} available.")
    except Exception as e:
        print(f"ERROR | During processing the file {tactic_excel_file}, an error appeared: {e}")

    #QAs
    try:
        df_qa = pd.read_excel(qa_file_path)
        print(f"'INFO | Successfully loaded {qa_excel_file}'.")
        

        # Extract each qa as triple
        for index, row in df_qa.iterrows():
            quality_attribute = row['Quality Attribute']
            qa_type = row['Type according to ISO25059']
            qa_part_of_characteristic = row['Part of Charateristic']

            if pd.notna(quality_attribute):
                subject = str(quality_attribute).replace(" ", "_").replace("/", "_or_").replace(",", "_or_")
                obj_type = str(qa_type).replace(" ", "_").replace("/", "_or_").replace(",", "_or_")

                triple = Triple(subject, "rdf:type", obj_type)
                turtle_content.append(str(triple))
                if obj_type == "SubCharacteristic":
                    subject_char = str(qa_part_of_characteristic).replace(" ", "_").replace("/", "_or_").replace(",", "_or_")
                    object = subject
                    triple_char = Triple(subject_char, "hasSubQualityAttribute", object)
                    turtle_content.append(str(triple_char))
                    


    except FileNotFoundError:
        print(f"ERROR | No file {qa_excel_file} in the folder {input_folder} available.")
    except Exception as e:
        print(f"ERROR | During processing the file {qa_excel_file}, an error appeared: {e}")



    # Turtle creation
    output_dir = os.path.join(script_dir, "output")
    os.makedirs(output_dir, exist_ok=True)
    output_file_path = os.path.join(output_dir, "model.ttl")

    try:
        with open(output_file_path, "w", encoding="utf-8") as f:
            f.write("@prefix : <http://example.org/> .\n")
            f.write("@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n")
            f.write("@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n")
            f.write("@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n")
            
            f.write(":Tactic rdf:type rdfs:Class .\n")
            f.write(":Category rdf:type rdfs:Class .\n")
            # f.write(":DesignTactic rdfs:subClassOf :Tactic .\n")
            # f.write(":ImplementationTactic rdfs:subClassOf :Tactic .\n")
            f.write(":hasCategory rdf:type rdf:Property ; rdfs:domain :Tactic ; rdfs:range :Category .\n\n")
            
            f.write(":QualityAttribute rdf:type rdfs:Class .\n\n")
            f.write(":Characteristic rdf:type rdfs:Class ; rdfs:subClassOf :QualityAttribute .\n\n")
            f.write(":SubCharacteristic rdf:type rdfs:Class ; rdfs:subClassOf :Characteristic .\n\n")
            f.write(":hasSubQualityAttribute rdf:type rdf:Property ; rdfs:domain :QualityAttribute ; rdfs:range :QualityAttribute .\n\n")


            for line in turtle_content:
                f.write(line + "\n")

        print(f"INFO | Successfully created the turtle file: {os.path.abspath(output_file_path)}")

    except Exception as e:
        print(f"ERROR | In the process creating the turtle file an error appeared: {e}")

if __name__ == "__main__":
    main()
