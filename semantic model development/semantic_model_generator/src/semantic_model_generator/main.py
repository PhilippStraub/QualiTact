import os
import json
from rdflib import Namespace, Literal, XSD


WorkingDirectory = 'SMS + Multicase'



# Namespaces
EX = Namespace("http://example.org/")
# Typen für RDF-Terme
RDFTerm = str  # str = URIRef/Literal/BNode

# Dataclasses für RDF-Tripel
from dataclasses import dataclass
from typing import Union

@dataclass(frozen=True)
class EmbeddedTriple:
    subject: RDFTerm
    predicate: RDFTerm
    obj: RDFTerm

    def __str__(self):
        # RDF*-Triple: << :subject :predicate :object >>
        return f"<< :{self.subject} :{self.predicate} :{self.obj} >>"

@dataclass(frozen=True)
class Triple:
    subject: RDFTerm
    predicate: RDFTerm
    obj: RDFTerm

    def __str__(self):
        # Standard Triple: subject :predicate "object"^^xsd:float
        return f"{self.subject} :{self.predicate} \"{self.obj}\"^^xsd:float ."

def main():
    # Pfad zur JSON-Datei
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_folder = os.path.join(script_dir, 'input', WorkingDirectory)
    json_file = 'scores.json'
    file_path = os.path.join(input_folder, json_file)

    turtle_content = []

    try:
        with open(file_path, 'r') as file:
            data = json.load(file)

            if "Tactic1" in data["Scores"][0]:
                print("INFO | Structure recognized: Process JSON for Tactic-Tactic associations..")
                name1 = 'Tactic1'
                name2 = 'Tactic2'
                predicate = 'affects'

            elif "QualityAttribute" in data["Scores"][0]:
                print("INFO | Structure recognized: Process JSON for QualityAttribute-Tactic associations..")
                name1 = 'Tactic'
                name2 = 'QualityAttribute'
                predicate = 'impacts'


            else:
                print("ERROR | JSON structure not recognized.")
                exit()
            
            # Create triples
            for tactic_data in data['Scores']:
                tactic1 = tactic_data[name1]
                tactic2 = tactic_data[name2]
                score = tactic_data['Score']
                confidence = tactic_data['Confidence']
                score_minus_conf = tactic_data['Score_minus_conf']


                # RDF*-Triple erzeugen
                subject = tactic1.replace(" ", "_").replace("/", "_or_").replace(",", "_or_")
                obj     = tactic2.replace(" ", "_").replace("/", "_or_").replace(",", "_or_")


                # create EmbeddedTriple
                inner = EmbeddedTriple(subject, predicate, obj)
                # create triple around the EmbeddedTriple
                outer = Triple(inner, "Score", Literal(score, datatype=XSD.float))
                turtle_content.append(str(outer)) # save
        
                outer = Triple(inner, "Confidence", Literal(confidence, datatype=XSD.float))
                turtle_content.append(str(outer))
                
                outer = Triple(inner, "ScoreMinusConf", Literal(score_minus_conf, datatype=XSD.float))
                turtle_content.append(str(outer))

        # create output
        output_dir = os.path.join(script_dir, "output", WorkingDirectory)
        os.makedirs(output_dir, exist_ok=True)
        output_file_path = os.path.join(output_dir, "model.ttl")

        with open(output_file_path, "w", encoding="utf-8") as f:
            f.write("@prefix : <http://example.org/> .\n")
            f.write("@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n\n")

            # write all triples
            for line in turtle_content:
                f.write(line + "\n")

        print(f"INFO | Tutle files has been saved successfully: {os.path.abspath(output_file_path)}")

    except FileNotFoundError:
        print(f"ERROR | No input files {json_file} found in folder {input_folder}.")
    except json.JSONDecodeError:
        print("ERROR | Could not process the provided JSON, please check for correct structure.")

if __name__ == "__main__":
    main()
