import os
import pandas as pd
import geopandas as gpd


def build_metadata(dbf_path, master_path, shp_path=None):
    """
    Build metadata from:
    1. Metadata Template Excel
    2. Shapefile DBF
    3. Optional SHP geometry information
    """

    # =========================================================
    # READ TEMPLATE
    # =========================================================

    template_df = pd.read_excel(
        master_path,
        sheet_name=0,
        header=0
    )

    template_df = template_df.fillna("")

    main_fields = []

    # =========================================================
    # READ TEMPLATE MAIN METADATA FIELDS
    # Everything before "Attribute #1"
    # =========================================================

    for _, row in template_df.iterrows():

        field_name = str(row.iloc[0]).strip()
        value = row.iloc[1] if len(row) > 1 else ""
        remarks = row.iloc[2] if len(row) > 2 else ""

        if not field_name:
            continue

        # Stop when attribute section begins
        if field_name.lower().startswith("attribute #1"):
            break

        # Ignore section headings that have no value
        # and no status/remark
        if (
            str(value).strip() == ""
            and str(remarks).strip() == ""
        ):
            continue

        remarks = str(remarks).strip()

        # Determine editability from template
        editable = remarks.lower() == "editable"

        main_fields.append({
            "name": field_name,
            "value": "" if pd.isna(value) else str(value),
            "source": "Template",
            "remarks": remarks,
            "editable": editable,
            "type": "main",
        })

    # =========================================================
    # READ SHAPEFILE ATTRIBUTES
    # =========================================================

    dbf_df = pd.read_csv(dbf_path) if dbf_path.lower().endswith(".csv") else None

    # If you're already using pyshp/geopandas for DBF,
    # keep your existing attribute extraction code here.

    attributes = []

    # ---------------------------------------------------------
    # IMPORTANT:
    # Replace this section with your EXISTING shapefile
    # attribute extraction logic.
    # ---------------------------------------------------------

    # Example structure:
    #
    # for column in columns:
    #     attributes.append({
    #         "name": column,
    #         "dbf_type": "...",
    #         "definition": "...",
    #         "definition_source": "...",
    #         "unit": "...",
    #         "master_match": True,
    #         "match_type": "Exact",
    #         "editable": False,
    #         "remarks": "",
    #         "type": "attribute",
    #     })

    return {
        "main_fields": main_fields,
        "fields": attributes,
        "total_fields": len(attributes),
        "total_records": 0,
    }