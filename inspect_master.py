from master_processor import load_master


master_path = r"data/Metadata Template(1).xlsx"

master_data = load_master(master_path)

print("Master sheet loaded successfully!")

print("Total master attributes:", len(master_data))

print("\n--- SAMPLE MASTER DATA ---")

for attribute, details in list(master_data.items())[:10]:

    print(f"\nAttribute: {attribute}")
    print(f"Definition: {details['definition']}")
    print(f"Source: {details['definition_source']}")