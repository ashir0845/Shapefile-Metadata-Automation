import os
from typing import Any, Dict, List

import openpyxl
import shapefile


# =========================================================
# Helpers
# =========================================================

def safe_string(value: Any) -> str:
    """
    Convert Excel / DBF values safely to strings.
    """

    if value is None:
        return ""

    return str(value).strip()


def normalize_text(value: Any) -> str:
    """
    Normalize text for comparison.
    """

    return (
        safe_string(value)
        .lower()
        .replace("_", " ")
        .replace("-", " ")
        .strip()
    )


def is_attribute_section_start(value: Any) -> bool:
    """
    Detect Attribute #1.
    """

    text = normalize_text(value)

    return text.startswith("attribute #1")


# =========================================================
# Read template main fields
# =========================================================

def read_main_template_fields(
    master_path: str,
) -> List[Dict[str, Any]]:
    """
    Read all metadata template fields before Attribute #1.

    The template structure is:

        Column A = Field
        Column B = Value
        Column C = Status

    Example:

        Originator
        ML Infomap
        Fixed

        Publication Date
        31st March 2025
        Editable

    Attribute #1 marks the beginning of the
    shapefile attribute section.
    """

    if not os.path.exists(master_path):
        raise FileNotFoundError(
            f"Metadata template not found: {master_path}"
        )

    workbook = openpyxl.load_workbook(
        master_path,
        data_only=True
    )

    # -----------------------------------------------------
    # Prefer the actual metadata sheet
    # -----------------------------------------------------

    sheet_name = None

    preferred_names = [
        "Meatadata_State_2001",
        "Metadata_State_2001",
        "Metadata",
    ]

    for name in preferred_names:
        if name in workbook.sheetnames:
            sheet_name = name
            break

    # Fallback to first sheet
    if sheet_name is None:
        sheet_name = workbook.sheetnames[0]

    ws = workbook[sheet_name]

    main_fields: List[Dict[str, Any]] = []

    for row in ws.iter_rows(
        min_row=1,
        max_col=3,
        values_only=True,
    ):
        field_name = row[0]
        value = row[1]
        status = row[2]

        field_name = safe_string(field_name)
        value = safe_string(value)
        status = safe_string(status)

        if not field_name:
            continue

        # -------------------------------------------------
        # Stop at Attribute #1
        # -------------------------------------------------

        if is_attribute_section_start(field_name):
            break

        # -------------------------------------------------
        # Ignore completely empty rows
        # -------------------------------------------------

        if not value and not status:
            continue

        # -------------------------------------------------
        # Section headings
        #
        # Example:
        # Entity #1
        #
        # These are not normal editable fields.
        # -------------------------------------------------

        if field_name.lower().startswith("entity #"):
            continue

        editable = (
            status.lower() == "editable"
        )

        main_fields.append(
            {
                "name": field_name,

                "value": value,

                "source": "Template",

                "remarks": status,

                "editable": editable,

                "type": "main",
            }
        )

    return main_fields


# =========================================================
# Read shapefile attributes
# =========================================================

def read_shapefile_attributes(
    dbf_path: str,
    master_path: str,
) -> List[Dict[str, Any]]:
    """
    Read shapefile DBF fields.

    The master sheet is used to find matching
    definitions and sources.
    """

    if not os.path.exists(dbf_path):
        raise FileNotFoundError(
            f"DBF file not found: {dbf_path}"
        )

    # -----------------------------------------------------
    # Read DBF
    # -----------------------------------------------------

    reader = shapefile.Reader(
        dbf=dbf_path
    )

    fields = reader.fields[1:]

    records = reader.records()

    # -----------------------------------------------------
    # Build master lookup
    # -----------------------------------------------------

    master_lookup = {}

    if os.path.exists(master_path):

        workbook = openpyxl.load_workbook(
            master_path,
            data_only=True
        )

        # Prefer Master sheet
        if "Master" in workbook.sheetnames:
            master_ws = workbook["Master"]
        else:
            master_ws = workbook[
                workbook.sheetnames[-1]
            ]

        # Expected Master columns:
        #
        # A = Entity
        # B = Attribute
        # C = Label
        # D = Attribute Definition
        # E = Attribute Definition Source

        for row in master_ws.iter_rows(
            min_row=2,
            max_col=5,
            values_only=True,
        ):

            entity = safe_string(row[0])

            attribute = safe_string(row[1])

            label = safe_string(row[2])

            definition = safe_string(row[3])

            definition_source = safe_string(
                row[4]
            )

            if not attribute:
                continue

            master_lookup[
                normalize_text(attribute)
            ] = {
                "entity": entity,
                "attribute": attribute,
                "label": label,
                "definition": definition,
                "definition_source": (
                    definition_source
                ),
            }

    # -----------------------------------------------------
    # Convert DBF fields
    # -----------------------------------------------------

    result = []

    for field in fields:

        name = field[0]

        dbf_type = field[1]

        size = field[2]

        decimal = field[3]

        key = normalize_text(name)

        master = master_lookup.get(key)

        master_match = master is not None

        if master_match:

            definition = master.get(
                "definition",
                ""
            )

            definition_source = master.get(
                "definition_source",
                ""
            )

        else:

            definition = ""

            definition_source = ""

        # -------------------------------------------------
        # Determine match type
        # -------------------------------------------------

        match_type = (
            "Exact"
            if master_match
            else None
        )

        # -------------------------------------------------
        # Unit
        # -------------------------------------------------

        unit = ""

        if dbf_type in ("N", "F"):
            unit = "Numbers"

        elif dbf_type == "C":
            unit = "Text"

        elif dbf_type == "D":
            unit = "Date"

        elif dbf_type == "L":
            unit = "Boolean"

        # -------------------------------------------------
        # Result
        # -------------------------------------------------

        result.append(
            {
                "name": name,

                "value": "",

                "source": "From Shape File",

                "remarks": "",

                # Shapefile attributes are not
                # edited in the main metadata section.
                "editable": False,

                "type": "attribute",

                "dbf_type": dbf_type,

                "definition": definition,

                "definition_source": (
                    definition_source
                ),

                "unit": unit,

                "master_match": master_match,

                "match_type": match_type,

                "range_min": "",

                "range_max": "",

                "dbf_size": size,

                "dbf_decimal": decimal,
            }
        )

    return result, len(records)


# =========================================================
# Build complete metadata
# =========================================================

def build_metadata(
    dbf_path: str,
    master_path: str,
) -> Dict[str, Any]:
    """
    Build complete metadata.

    Returns:

        main_fields
        fields
        total_fields
        total_records
    """

    print(
        "Reading main metadata template..."
    )

    main_fields = read_main_template_fields(
        master_path
    )

    print(
        f"Main template fields found: "
        f"{len(main_fields)}"
    )

    print(
        "Reading shapefile attributes..."
    )

    attributes, total_records = (
        read_shapefile_attributes(
            dbf_path,
            master_path
        )
    )

    print(
        f"Shapefile attributes found: "
        f"{len(attributes)}"
    )

    print(
        f"Shapefile records: "
        f"{total_records}"
    )

    return {
        "main_fields": main_fields,

        "fields": attributes,

        "total_fields": len(attributes),

        "total_records": total_records,
    }