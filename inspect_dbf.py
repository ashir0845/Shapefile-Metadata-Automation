from dbf_processor import process_dbf


dbf_path = r"data/BLOCK__INDIA_2024.dbf"

result = process_dbf(dbf_path)

print("DBF loaded successfully!")

print(f"Total fields: {result['total_fields']}")
print(f"Total records: {result['total_records']}")

print("\n--- FIELDS ---")

for field in result["fields"]:
    print(field)