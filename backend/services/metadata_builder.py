from backend.services.dbf_processor import process_dbf
from backend.services.master_processor import load_master
from backend.services.attribute_rules import get_attribute_unit

# ---------------------------------------------------------
# Explicit mappings for DBF fields whose names differ
# from the corresponding Master attribute names.
# ---------------------------------------------------------

FIELD_MAPPING = {
    "TOT_HH": "TOT_NM_HH",
}


def build_metadata(dbf_path, master_path):

    dbf_data = process_dbf(dbf_path)
    master_data = load_master(master_path)

    combined_fields = []

    for field in dbf_data["fields"]:

        field_name = field["name"]

        # -------------------------------------------------
        # Check exact match first
        # -------------------------------------------------

        if field_name in master_data:

            master_field_name = field_name
            match_type = "Exact"

        # -------------------------------------------------
        # If exact match doesn't exist,
        # check explicit field mapping
        # -------------------------------------------------

        elif field_name in FIELD_MAPPING:

            master_field_name = FIELD_MAPPING[field_name]
            match_type = "Mapped"

        # -------------------------------------------------
        # No match
        # -------------------------------------------------

        else:

            master_field_name = None
            match_type = "No Match"

        # -------------------------------------------------
        # Get Master metadata
        # -------------------------------------------------

        master_match = (
            master_data.get(master_field_name)
            if master_field_name
            else None
        )

        # -------------------------------------------------
        # Determine unit
        # -------------------------------------------------

        unit = get_attribute_unit(
            field["dbf_type"],
            field_name
        )

        # -------------------------------------------------
        # Build combined metadata
        # -------------------------------------------------

        combined_field = {

            "name": field_name,

            "dbf_type": field["dbf_type"],

            "size": field["size"],

            "decimal": field["decimal"],

            "record_count": field["record_count"],

            "min": field["min"],

            "max": field["max"],

            "unit": unit,

            "definition": None,

            "definition_source": None,

            "master_match": False,

            "match_type": match_type,

            "master_field": master_field_name,

        }

        # -------------------------------------------------
        # Apply Master metadata when a match exists
        # -------------------------------------------------

        if master_match:

            combined_field["definition"] = (
                master_match["definition"]
            )

            combined_field["definition_source"] = (
                master_match["definition_source"]
            )

            combined_field["master_match"] = True

        combined_fields.append(
            combined_field
        )

    return {

        "total_fields": dbf_data["total_fields"],

        "total_records": dbf_data["total_records"],

        "fields": combined_fields,

    }