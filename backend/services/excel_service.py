import os
import tempfile
from typing import Any, Dict, List, Optional, Tuple

import openpyxl
from openpyxl.cell.cell import MergedCell


# =========================================================
# Paths
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

TEMPLATE_PATHS = [
    os.path.join(
        BASE_DIR,
        "backend",
        "templates",
        "Metadata Template(1).xlsx",
    ),
    os.path.join(
        BASE_DIR,
        "data",
        "Metadata Template(1).xlsx",
    ),
]


# =========================================================
# Find template
# =========================================================

def find_template() -> str:
    """
    Find the metadata Excel template.
    """

    for path in TEMPLATE_PATHS:

        if os.path.exists(path):

            print(
                f"Excel template found: {path}"
            )

            return path

    raise FileNotFoundError(
        "Metadata Excel template not found. "
        "Expected one of:\n"
        + "\n".join(TEMPLATE_PATHS)
    )


# =========================================================
# Safe string
# =========================================================

def safe_string(value: Any) -> str:
    """
    Convert a value safely to string.
    """

    if value is None:
        return ""

    return str(value)


# =========================================================
# Normalize text
# =========================================================

def normalize_text(value: Any) -> str:
    """
    Normalize field names for comparison.
    """

    return (
        safe_string(value)
        .strip()
        .lower()
        .replace("_", " ")
        .replace("-", " ")
    )


# =========================================================
# Merged-cell helper
# =========================================================

def get_writable_cell(
    ws,
    row: int,
    column: int,
):
    """
    Return a writable cell.

    If the requested cell belongs to a merged
    range, return the top-left cell of that
    merged range.

    This prevents:

        AttributeError:
        'MergedCell' object attribute 'value'
        is read-only
    """

    cell = ws.cell(
        row=row,
        column=column,
    )

    # -----------------------------------------------------
    # Normal cell
    # -----------------------------------------------------

    if not isinstance(cell, MergedCell):

        return cell

    # -----------------------------------------------------
    # Merged cell
    # -----------------------------------------------------

    for merged_range in ws.merged_cells.ranges:

        if cell.coordinate in merged_range:

            return ws.cell(
                row=merged_range.min_row,
                column=merged_range.min_col,
            )

    return cell


# =========================================================
# Safe set value
# =========================================================

def set_cell_value(
    ws,
    row: int,
    column: int,
    value: Any,
):
    """
    Safely write a value to an Excel cell.

    Handles merged cells automatically.
    """

    cell = get_writable_cell(
        ws,
        row,
        column,
    )

    cell.value = value

    return cell


# =========================================================
# Find field rows
# =========================================================

def find_field_rows(
    ws,
) -> Dict[str, int]:
    """
    Find metadata field names in column A.

    Returns:

        {
            "Originator": 2,
            "Publication Date": 3,
            ...
        }

    The comparison is normalized so small differences
    such as underscores / hyphens do not break matching.
    """

    result: Dict[str, int] = {}

    for row in range(
        1,
        ws.max_row + 1,
    ):

        value = ws.cell(
            row=row,
            column=1,
        ).value

        if value is None:
            continue

        key = normalize_text(value)

        if not key:
            continue

        result[key] = row

    return result


# =========================================================
# Find metadata sheet
# =========================================================

def find_metadata_sheet(
    workbook,
):
    """
    Find the actual metadata sheet.
    """

    preferred_names = [
        "Meatadata_State_2001",
        "Metadata_State_2001",
        "Metadata",
    ]

    for name in preferred_names:

        if name in workbook.sheetnames:

            print(
                f"Using metadata sheet: {name}"
            )

            return workbook[name]

    # -----------------------------------------------------
    # Fallback
    # -----------------------------------------------------

    print(
        f"Using first sheet: "
        f"{workbook.sheetnames[0]}"
    )

    return workbook[
        workbook.sheetnames[0]
    ]


# =========================================================
# Find attribute section
# =========================================================

def find_attribute_start_row(
    ws,
) -> Optional[int]:
    """
    Find Attribute #1 in column A.
    """

    for row in range(
        1,
        ws.max_row + 1,
    ):

        value = ws.cell(
            row=row,
            column=1,
        ).value

        if value is None:
            continue

        text = normalize_text(value)

        if text.startswith(
            "attribute #1"
        ):

            return row

    return None


# =========================================================
# Write main metadata fields
# =========================================================

def write_main_fields(
    ws,
    main_fields: List[Dict[str, Any]],
):
    """
    Write main metadata fields into the
    existing Excel template.

    IMPORTANT:
    We search for the field name already
    present in the template instead of
    blindly writing by row number.

    This preserves the template structure.
    """

    field_rows = find_field_rows(ws)

    print(
        "--------------------------------"
    )

    print(
        "Writing main metadata fields..."
    )

    written = 0
    skipped = 0

    for field in main_fields:

        name = safe_string(
            field.get("name")
        )

        value = field.get(
            "value",
            "",
        )

        if not name:
            continue

        key = normalize_text(name)

        row = field_rows.get(key)

        if row is None:

            print(
                f"Field not found in template: "
                f"{name}"
            )

            skipped += 1

            continue

        # -------------------------------------------------
        # Column B = Value
        # -------------------------------------------------

        try:

            set_cell_value(
                ws,
                row,
                2,
                value,
            )

            written += 1

        except Exception as error:

            print(
                f"Could not write field "
                f"'{name}' at row {row}: "
                f"{repr(error)}"
            )

            skipped += 1

    print(
        f"Main fields written: {written}"
    )

    print(
        f"Main fields skipped: {skipped}"
    )


# =========================================================
# Find attribute rows
# =========================================================

def find_attribute_rows(
    ws,
) -> Dict[str, int]:
    """
    Find Attribute # rows in the template.

    Example:

        Attribute #1
        Attribute #2
        Attribute #3

    Returns:

        {
            "attribute #1": 40,
            "attribute #2": 41,
            ...
        }
    """

    result: Dict[str, int] = {}

    for row in range(
        1,
        ws.max_row + 1,
    ):

        value = ws.cell(
            row=row,
            column=1,
        ).value

        if value is None:
            continue

        text = normalize_text(value)

        if text.startswith(
            "attribute #"
        ):

            result[text] = row

    return result


# =========================================================
# Write shapefile attributes
# =========================================================

def write_attributes(
    ws,
    fields: List[Dict[str, Any]],
):
    """
    Write shapefile attributes into the
    existing attribute section.

    The function starts from Attribute #1
    and fills the template sequentially.
    """

    attribute_start = find_attribute_start_row(
        ws
    )

    if attribute_start is None:

        print(
            "Attribute #1 was not found "
            "in the template."
        )

        return

    print(
        "Attribute section starts at Excel row "
        f"{attribute_start}"
    )

    # -----------------------------------------------------
    # Find columns from the attribute section
    # -----------------------------------------------------

    header_row = attribute_start

    print(
        f"Writing {len(fields)} "
        "shapefile attributes..."
    )

    # -----------------------------------------------------
    # Determine how many columns exist
    # -----------------------------------------------------

    max_column = ws.max_column

    # -----------------------------------------------------
    # Write attributes sequentially
    #
    # We preserve the existing template rows.
    # -----------------------------------------------------

    written = 0

    for index, field in enumerate(fields):

        target_row = (
            attribute_start + index
        )

        name = safe_string(
            field.get("name")
        )

        definition = safe_string(
            field.get("definition")
        )

        definition_source = safe_string(
            field.get(
                "definition_source"
            )
        )

        unit = safe_string(
            field.get("unit")
        )

        match_type = safe_string(
            field.get("match_type")
        )

        # -------------------------------------------------
        # If template does not have enough rows,
        # create rows.
        # -------------------------------------------------

        if target_row > ws.max_row:

            ws.insert_rows(
                ws.max_row + 1,
                1,
            )

        # -------------------------------------------------
        # Column mapping
        #
        # The exact template may differ, therefore
        # we use the common structure:
        #
        # A = Attribute
        # B = Value
        # C = Source / Definition
        # D = Definition Source
        # E = Unit
        # F = Match Type
        #
        # Existing template formatting is preserved
        # as much as possible.
        # -------------------------------------------------

        values = [
            name,
            field.get("value", ""),
            definition,
            definition_source,
            unit,
            match_type,
        ]

        for column, value in enumerate(
            values,
            start=1,
        ):

            try:

                cell = get_writable_cell(
                    ws,
                    target_row,
                    column,
                )

                # -----------------------------------------
                # Do not overwrite merged cells that
                # belong to another row.
                # -----------------------------------------

                if isinstance(
                    cell,
                    MergedCell,
                ):

                    continue

                cell.value = value

            except Exception as error:

                print(
                    f"Attribute write error "
                    f"row={target_row}, "
                    f"column={column}, "
                    f"field={name}: "
                    f"{repr(error)}"
                )

        written += 1

    print(
        f"Attributes written: {written}"
    )


# =========================================================
# Generate Excel
# =========================================================

def generate_excel(
    metadata: Dict[str, Any],
) -> str:
    """
    Generate the final metadata Excel file.

    The original template is loaded and populated.
    The template itself is never modified.
    """

    template_path = find_template()

    # -----------------------------------------------------
    # Load template
    # -----------------------------------------------------

    print(
        "Loading Excel template..."
    )

    workbook = openpyxl.load_workbook(
        template_path
    )

    print(
        "Workbook sheets:",
        workbook.sheetnames,
    )

    # -----------------------------------------------------
    # Metadata sheet
    # -----------------------------------------------------

    ws = find_metadata_sheet(
        workbook
    )

    # -----------------------------------------------------
    # Get metadata
    # -----------------------------------------------------

    main_fields = metadata.get(
        "main_fields",
        [],
    )

    fields = metadata.get(
        "fields",
        [],
    )

    print(
        "========================================"
    )

    print(
        f"Main metadata fields: "
        f"{len(main_fields)}"
    )

    print(
        f"Shapefile attributes: "
        f"{len(fields)}"
    )

    print(
        f"Total records: "
        f"{metadata.get('total_records', 0)}"
    )

    print(
        "========================================"
    )

    # -----------------------------------------------------
    # Write main metadata
    # -----------------------------------------------------

    write_main_fields(
        ws,
        main_fields,
    )

    # -----------------------------------------------------
    # Write shapefile attributes
    # -----------------------------------------------------

    write_attributes(
        ws,
        fields,
    )

    # -----------------------------------------------------
    # Create output file
    # -----------------------------------------------------

    output_dir = os.path.join(
        BASE_DIR,
        "generated",
    )

    os.makedirs(
        output_dir,
        exist_ok=True,
    )

    fd, output_path = tempfile.mkstemp(
        prefix="Generated_Metadata_",
        suffix=".xlsx",
        dir=output_dir,
    )

    os.close(fd)

    # -----------------------------------------------------
    # Save workbook
    # -----------------------------------------------------

    print(
        f"Saving Excel file: "
        f"{output_path}"
    )

    workbook.save(
        output_path
    )

    # -----------------------------------------------------
    # Verify
    # -----------------------------------------------------

    if not os.path.exists(
        output_path
    ):

        raise FileNotFoundError(
            "Excel file was not created."
        )

    print(
        "Excel generated successfully."
    )

    print(
        f"Output: {output_path}"
    )

    return output_path