from backend.services.metadata_builder import build_metadata


dbf_path = r"data/BLOCK_2024/BLOCK__INDIA_2024.dbf"
master_path = r"data/Metadata Template(1).xlsx"


result = build_metadata(
    dbf_path,
    master_path
)


print("Metadata built successfully!")

print("\nTotal DBF fields:", result["total_fields"])
print("Total records:", result["total_records"])


print("\n--- COMBINED METADATA ---")


for field in result["fields"]:

    print("\n--------------------------------")
    print("Attribute:", field["name"])
    print("DBF Type:", field["dbf_type"])

    # Matching information
    print("Match Type:", field.get("match_type"))
    print("Master Field:", field.get("master_field"))

    print("Min:", field["min"])
    print("Max:", field["max"])
    print("Definition:", field["definition"])
    print("Source:", field["definition_source"])
    print("Master Match:", field["master_match"])
    print("Unit:", field["unit"])