import os
from typing import Any, Dict, List, Optional, Tuple

import openpyxl
import shapefile


# =========================================================
# HELPERS
# =========================================================

def safe_string(value: Any) -> str:
    """
    Safely convert values to strings.
    """

    if value is None:
        return ""

    return str(value).strip()


def normalize_text(value: Any) -> str:
    """
    Normalize text for comparison.

    Examples:
        BLOCK_ID -> block id
        block-id -> block id
        Block ID -> block id
    """

    return (
        safe_string(value)
        .lower()
        .replace("_", " ")
        .replace("-", " ")
        .replace("/", " ")
        .strip()
    )


def find_metadata_sheet(workbook):
    """
    Find the metadata worksheet.
    """

    preferred_names = [
        "Meatadata_State_2001",
        "Metadata_State_2001",
        "Metadata",
    ]

    for name in preferred_names:
        if name in workbook.sheetnames:
            return workbook[name]

    return workbook[workbook.sheetnames[0]]


def find_master_sheet(workbook):
    """
    Find the Master worksheet.
    """

    if "Master" in workbook.sheetnames:
        return workbook["Master"]

    return workbook[workbook.sheetnames[-1]]


def is_attribute_section_start(value: Any) -> bool:
    """
    Detect Attribute #1.
    """

    text = normalize_text(value)

    return text.startswith("attribute #1")


def detect_unit(dbf_type: str) -> str:
    """
    Determine a human-readable type/unit
    from DBF field type.
    """

    dbf_type = safe_string(dbf_type).upper()

    if dbf_type in ("N", "F", "I"):
        return "Numbers"

    if dbf_type == "C":
        return "Text"

    if dbf_type == "D":
        return "Date"

    if dbf_type == "L":
        return "Boolean"

    return ""


# =========================================================
# GEOMETRY TYPE
# =========================================================

def get_geometry_type(
    shapefile_reader,
) -> str:
    """
    Convert shapefile shape type to a human-readable
    geometry type.
    """

    shape_type = shapefile_reader.shapeType

    geometry_map = {
        shapefile.NULL: "Null",
        shapefile.POINT: "Point",
        shapefile.POLYLINE: "Polyline",
        shapefile.POLYGON: "Polygon",
        shapefile.MULTIPOINT: "Multipoint",
        shapefile.POINTZ: "Point",
        shapefile.POLYLINEZ: "Polyline",
        shapefile.POLYGONZ: "Polygon",
        shapefile.MULTIPOINTZ: "Multipoint",
        shapefile.POINTM: "Point",
        shapefile.POLYLINEM: "Polyline",
        shapefile.POLYGONM: "Polygon",
        shapefile.MULTIPOINTM: "Multipoint",
    }

    return geometry_map.get(
        shape_type,
        "Unknown",
    )


# =========================================================
# CALCULATE SHAPEFILE BOUNDING BOX
# =========================================================

def calculate_shapefile_bounds(
    shp_path: str,
) -> Dict[str, Any]:
    """
    Calculate bounding coordinates directly from
    the uploaded SHP file.

    pyshp bbox format:

        [xmin, ymin, xmax, ymax]

    Therefore:

        xmin = West
        xmax = East
        ymin = South
        ymax = North
    """

    if not shp_path:
        return {
            "west": "",
            "east": "",
            "north": "",
            "south": "",
        }

    if not os.path.exists(shp_path):
        raise FileNotFoundError(
            f"SHP file not found: {shp_path}"
        )

    reader = shapefile.Reader(
        shp=shp_path
    )

    bbox = reader.bbox

    reader.close()

    # Fail loudly instead of silently writing blank cells
    if not bbox or len(bbox) < 4:
        raise ValueError(
            "Could not read the bounding box "
            "from the .shp file."
        )

    # Warn if the CRS is not geographic (degrees)
    prj_path = os.path.splitext(shp_path)[0] + ".prj"

    if os.path.exists(prj_path):
        try:
            with open(
                prj_path,
                "r",
                encoding="utf-8",
                errors="ignore",
            ) as prj_file:
                prj_text = prj_file.read()

            if "GEOGCS" not in prj_text.upper():
                print(
                    "WARNING: Shapefile CRS is not "
                    "geographic (degrees). Bounding "
                    "coordinates may not be lat/long."
                )
        except OSError:
            pass
    else:
        print(
            "WARNING: No .prj file found; "
            "cannot verify coordinate system."
        )

    west = bbox[0]
    south = bbox[1]
    east = bbox[2]
    north = bbox[3]

    return {
        "west": west,
        "east": east,
        "north": north,
        "south": south,
    }


# =========================================================
# FORMAT NUMBERS
# =========================================================

def clean_numeric_value(
    value: Any,
) -> Any:
    """
    Convert values such as:

        68.1101000000 -> 68.1101
        35.0 -> 35

    while keeping the value numeric.
    """

    if value is None:
        return ""

    try:
        number = float(value)
    except (
        TypeError,
        ValueError,
    ):
        return value

    if number.is_integer():
        return int(number)

    return round(
        number,
        10,
    )


# =========================================================
# READ MAIN TEMPLATE FIELDS
# =========================================================

def read_main_template_fields(
    master_path: str,
) -> List[Dict[str, Any]]:

    if not os.path.exists(master_path):
        raise FileNotFoundError(
            f"Metadata template not found: {master_path}"
        )

    workbook = openpyxl.load_workbook(
        master_path,
        data_only=True,
    )

    ws = find_metadata_sheet(workbook)

    main_fields: List[Dict[str, Any]] = []

    attribute_start_row = None

    # -----------------------------------------------------
    # Find Attribute #1
    # -----------------------------------------------------

    for row_number in range(
        1,
        ws.max_row + 1,
    ):

        value = ws.cell(
            row=row_number,
            column=1,
        ).value

        if is_attribute_section_start(value):
            attribute_start_row = row_number
            break

    print(
        f"Using metadata sheet: {ws.title}"
    )

    print(
        f"Attribute section starts at Excel row "
        f"{attribute_start_row}"
    )

    # -----------------------------------------------------
    # Read main fields
    # -----------------------------------------------------

    end_row = (
        attribute_start_row
        if attribute_start_row
        else ws.max_row + 1
    )

    for row_number in range(
        1,
        end_row,
    ):

        field_name = safe_string(
            ws.cell(
                row=row_number,
                column=1,
            ).value
        )

        value = safe_string(
            ws.cell(
                row=row_number,
                column=2,
            ).value
        )

        status = safe_string(
            ws.cell(
                row=row_number,
                column=3,
            ).value
        )

        if not field_name:
            continue

        # Ignore table header
        if normalize_text(field_name) == "field":
            continue

        # Ignore Entity headings
        if normalize_text(
            field_name
        ).startswith("entity #"):
            continue

        # Ignore completely empty rows
        if not value and not status:
            continue

        editable = (
            normalize_text(status)
            == "editable"
        )

        main_fields.append(
            {
                "name": field_name,
                "value": value,
                "source": "Template",
                "remarks": status,
                "editable": editable,
                "type": "main",
                "template_row": row_number,
            }
        )

    return main_fields


# =========================================================
# READ MASTER DEFINITIONS
# =========================================================

def read_master_lookup(
    master_path: str,
) -> Dict[str, Dict[str, Any]]:
    """
    Read attribute definitions from the Master sheet.

    Expected Master sheet:

        Column A = Entity
        Column B = Yes / No
        Column C = Attribute Name / Label
        Column D = Attribute Definition
        Column E = Attribute Definition Source
    """

    lookup: Dict[str, Dict[str, Any]] = {}

    if not os.path.exists(master_path):
        return lookup

    workbook = openpyxl.load_workbook(
        master_path,
        data_only=True,
    )

    master_ws = find_master_sheet(workbook)

    print(
        f"Using Master sheet: {master_ws.title}"
    )

    for row_number in range(
        2,
        master_ws.max_row + 1,
    ):

        entity = safe_string(
            master_ws.cell(
                row=row_number,
                column=1,
            ).value
        )

        attribute_flag = safe_string(
            master_ws.cell(
                row=row_number,
                column=2,
            ).value
        )

        attribute = safe_string(
            master_ws.cell(
                row=row_number,
                column=3,
            ).value
        )

        definition = safe_string(
            master_ws.cell(
                row=row_number,
                column=4,
            ).value
        )

        definition_source = safe_string(
            master_ws.cell(
                row=row_number,
                column=5,
            ).value
        )

        if not attribute:
            continue

        key = normalize_text(attribute)

        current_score = sum(
            bool(value)
            for value in [
                definition,
                definition_source,
                entity,
                attribute_flag,
            ]
        )

        existing = lookup.get(key)

        if existing:

            existing_score = sum(
                bool(existing.get(value))
                for value in [
                    "definition",
                    "definition_source",
                    "entity",
                    "attribute_flag",
                ]
            )

            if current_score <= existing_score:
                continue

        lookup[key] = {
            "entity": entity,
            "attribute": attribute,
            "label": attribute,
            "definition": definition,
            "definition_source": definition_source,
            "attribute_flag": attribute_flag,
        }

    print(
        f"Master definitions loaded: "
        f"{len(lookup)}"
    )

    for key, item in lookup.items():

        print(
            f"  Master: {item['attribute']} | "
            f"Definition={item['definition']} | "
            f"Source={item['definition_source']}"
        )

    return lookup


# =========================================================
# CALCULATE NUMERIC RANGE
# =========================================================

def calculate_numeric_range(
    values: List[Any],
) -> Tuple[Any, Any]:

    numeric_values = []

    for value in values:

        if value is None:
            continue

        try:
            numeric_value = float(value)
            numeric_values.append(
                numeric_value
            )

        except (
            TypeError,
            ValueError,
        ):
            continue

    if not numeric_values:
        return "", ""

    range_min = min(
        numeric_values
    )

    range_max = max(
        numeric_values
    )

    if (
        isinstance(range_min, float)
        and range_min.is_integer()
    ):
        range_min = int(range_min)

    if (
        isinstance(range_max, float)
        and range_max.is_integer()
    ):
        range_max = int(range_max)

    return (
        range_min,
        range_max,
    )


# =========================================================
# READ SHAPEFILE TEXT VALUES
# =========================================================

def collect_place_keywords(
    fields,
    records,
) -> str:
    """
    Try to generate Place Keyword from actual DBF data.

    Priority is given to fields whose names look like
    geographic/name fields.

    Examples:
        STATE
        STATE_NAME
        DISTRICT
        DIST_NAME
        NAME
        PLACE
        REGION
        LOCATION

    If none are found, no artificial place keyword
    is generated.
    """

    preferred_keywords = [
        "state",
        "state name",
        "statename",
        "district",
        "district name",
        "dist name",
        "name",
        "place",
        "region",
        "location",
        "locality",
        "village",
        "city",
        "town",
    ]

    candidate_indexes = []

    for index, field in enumerate(fields):

        field_name = normalize_text(
            field[0]
        )

        if field_name in preferred_keywords:
            candidate_indexes.append(index)
            continue

        if any(
            keyword in field_name
            for keyword in [
                "state",
                "district",
                "place",
                "location",
                "region",
                "village",
                "city",
                "town",
            ]
        ):
            candidate_indexes.append(index)

    if not candidate_indexes:
        return ""

    values = []

    for record in records:

        for index in candidate_indexes:

            try:
                value = record[index]
            except Exception:
                continue

            value = safe_string(value)

            if not value:
                continue

            if value not in values:
                values.append(value)

    return ", ".join(values)


# =========================================================
# BUILD TOPIC KEYWORDS FROM SHAPEFILE
# =========================================================

def simplify_keyword(
    definition: str,
) -> str:
    """
    Reduce a gender/total variant to its common term.

        Total Population            -> Population
        Male Population             -> Population
        Total Pop Below 6 Years     -> Pop Below 6 Years
        Male Total Workers          -> Workers
        Rural Male Population       -> Rural Population

    Removes the whole words Total / Male / Female wherever
    they appear. If nothing is left, the original text is
    kept.
    """

    words = [
        word
        for word in safe_string(definition).split()
        if word.lower() not in ("total", "male", "female")
    ]

    simplified = " ".join(words).strip()

    return simplified if simplified else safe_string(definition)


def build_topic_keywords(
    fields,
    master_lookup: Optional[
        Dict[str, Dict[str, Any]]
    ] = None,
) -> str:
    """
    Generate Topic Keyword from the Attribute Definitions
    in the Master sheet (instead of raw DBF column names).

    Example:

        TOT_POP  -> Total Population
        M_POP    -> Male Population

    becomes:

        Total Population, Male Population, ...

    Only columns that have a definition in the Master sheet
    are included. Columns without one are skipped (and listed
    in a terminal warning), so updating the Master sheet later
    is enough to make them appear.
    """

    master_lookup = master_lookup or {}

    keywords = []

    missing = []

    for field in fields:

        name = safe_string(
            field[0]
        )

        if not name:
            continue

        master = master_lookup.get(
            normalize_text(name)
        )

        definition = ""

        if master:
            definition = safe_string(
                master.get(
                    "definition",
                    "",
                )
            )

        # Only columns defined in the Master sheet are used.
        # Columns the Master does not define yet are skipped;
        # they appear automatically once the Master is updated.
        if not definition:
            missing.append(name)
            continue

        keyword = simplify_keyword(
            definition
        )

        # Total / Male / Female variants collapse into one term
        if keyword not in keywords:
            keywords.append(keyword)

    if missing:
        print(
            "NOTE: Skipped in Topic Keyword (not in Master): "
            + ", ".join(missing)
        )

    return ", ".join(keywords)


# =========================================================
# READ SHAPEFILE ATTRIBUTES
# =========================================================

def read_shapefile_attributes(
    dbf_path: str,
    shp_path: str,
    master_path: str,
) -> Tuple[
    List[Dict[str, Any]],
    int,
    Dict[str, Any],
]:
    """
    Read DBF attributes and SHP geometry.

    Returns:

        attributes
        total_records
        shapefile_information
    """

    if not os.path.exists(dbf_path):

        raise FileNotFoundError(
            f"DBF file not found: {dbf_path}"
        )

    if not os.path.exists(shp_path):

        raise FileNotFoundError(
            f"SHP file not found: {shp_path}"
        )

    # -----------------------------------------------------
    # Read DBF
    # -----------------------------------------------------

    reader = shapefile.Reader(
        dbf=dbf_path,
        shp=shp_path,
    )

    fields = reader.fields[1:]

    records = reader.records()

    print(
        f"DBF fields detected: {len(fields)}"
    )

    print(
        f"DBF records detected: {len(records)}"
    )

    # -----------------------------------------------------
    # Geometry
    # -----------------------------------------------------

    geometry_type = get_geometry_type(
        reader
    )

    shape_count = len(reader)

    # Everything needed from the shapefile is already in memory.
    # Close it so the files can be deleted (important on Windows).
    reader.close()

    bounds = calculate_shapefile_bounds(
        shp_path
    )

    # -----------------------------------------------------
    # Keywords
    # -----------------------------------------------------

    master_lookup = read_master_lookup(
        master_path
    )

    topic_keywords = build_topic_keywords(
        fields,
        master_lookup,
    )

    place_keywords = collect_place_keywords(
        fields,
        records,
    )

    print(
        "========================================"
    )

    print(
        f"Geometry type: {geometry_type}"
    )

    print(
        f"Geometry count: {shape_count}"
    )

    print(
        f"West: {bounds['west']}"
    )

    print(
        f"East: {bounds['east']}"
    )

    print(
        f"North: {bounds['north']}"
    )

    print(
        f"South: {bounds['south']}"
    )

    print(
        f"Topic keywords: {topic_keywords}"
    )

    print(
        f"Place keywords: {place_keywords}"
    )

    print(
        "========================================"
    )

    # -----------------------------------------------------
    # Read Master definitions
    # -----------------------------------------------------

    result: List[Dict[str, Any]] = []

    # =====================================================
    # PROCESS EACH DBF FIELD
    # =====================================================

    for field_index, field in enumerate(
        fields
    ):

        name = safe_string(
            field[0]
        )

        dbf_type = safe_string(
            field[1]
        ).upper()

        size = field[2]

        decimal = field[3]

        key = normalize_text(
            name
        )

        # -------------------------------------------------
        # Find Master definition
        # -------------------------------------------------

        master = master_lookup.get(
            key
        )

        master_match = (
            master is not None
        )

        if master_match:

            definition = safe_string(
                master.get(
                    "definition",
                    "",
                )
            )

            definition_source = safe_string(
                master.get(
                    "definition_source",
                    "",
                )
            )

            label = safe_string(
                master.get(
                    "label",
                    "",
                )
            )

            entity = safe_string(
                master.get(
                    "entity",
                    "",
                )
            )

        else:

            definition = ""

            definition_source = ""

            label = ""

            entity = ""

        # -------------------------------------------------
        # Extract DBF values
        # -------------------------------------------------

        values: List[Any] = []

        for record in records:

            try:

                value = record[
                    field_index
                ]

            except Exception:

                value = None

            if value is None:
                continue

            if isinstance(
                value,
                str,
            ):

                value = value.strip()

                if not value:
                    continue

            values.append(
                value
            )

        # -------------------------------------------------
        # Numeric range
        # -------------------------------------------------

        range_min = ""

        range_max = ""

        if dbf_type in (
            "N",
            "F",
            "I",
        ):

            (
                range_min,
                range_max,
            ) = calculate_numeric_range(
                values
            )

        # -------------------------------------------------
        # Detect unit/type
        # -------------------------------------------------

        unit = detect_unit(
            dbf_type
        )

        # -------------------------------------------------
        # Match type
        # -------------------------------------------------

        match_type = (
            "Exact"
            if master_match
            else ""
        )

        # -------------------------------------------------
        # Complete attribute
        # -------------------------------------------------

        attribute_data = {

            "name": name,

            "value": "",

            "source": "From Shape File",

            "remarks": "",

            "editable": False,

            "type": "attribute",

            "entity": entity,

            "label": (
                label
                if label
                else name
            ),

            "definition": definition,

            "definition_source":
                definition_source,

            "dbf_type": dbf_type,

            "dbf_size": size,

            "dbf_decimal": decimal,

            "unit": unit,

            "range_min": range_min,

            "range_max": range_max,

            "master_match":
                master_match,

            "match_type":
                match_type,
        }

        result.append(
            attribute_data
        )

    # -----------------------------------------------------
    # Debug
    # -----------------------------------------------------

    for index, attribute in enumerate(
        result,
        start=1,
    ):

        print(
            f"  Attribute #{index}: "
            f"{attribute['name']} | "
            f"Label={attribute['label']} | "
            f"Entity={attribute['entity']} | "
            f"Type={attribute['dbf_type']} | "
            f"Unit={attribute['unit']} | "
            f"Range="
            f"{attribute['range_min']}"
            f" - "
            f"{attribute['range_max']} | "
            f"Match={attribute['match_type']}"
        )

    shapefile_information = {

        "geometry_type":
            geometry_type,

        "geometry_count":
            shape_count,

        "west":
            clean_numeric_value(
                bounds["west"]
            ),

        "east":
            clean_numeric_value(
                bounds["east"]
            ),

        "north":
            clean_numeric_value(
                bounds["north"]
            ),

        "south":
            clean_numeric_value(
                bounds["south"]
            ),

        "topic_keywords":
            topic_keywords,

        "place_keywords":
            place_keywords,
    }

    return (
        result,
        len(records),
        shapefile_information,
    )


# =========================================================
# APPLY SHAPEFILE VALUES TO MAIN FIELDS
# =========================================================

def apply_shapefile_main_fields(
    main_fields: List[Dict[str, Any]],
    shapefile_information: Dict[str, Any],
) -> None:
    """
    Replace template values for fields whose Remarks
    contain 'From Shape File'.

    This is the important part that prevents static
    template values from being returned.
    """

    values = {

        "west bounding coordinates":
            shapefile_information.get(
                "west",
                "",
            ),

        "east bounding coordinates":
            shapefile_information.get(
                "east",
                "",
            ),

        "north bounding coordinates":
            shapefile_information.get(
                "north",
                "",
            ),

        "south bounding coordinates":
            shapefile_information.get(
                "south",
                "",
            ),

        "topic keyword":
            shapefile_information.get(
                "topic_keywords",
                "",
            ),

        "place keyword":
            shapefile_information.get(
                "place_keywords",
                "",
            ),

        "point and vector object type":
            shapefile_information.get(
                "geometry_type",
                "",
            ),

        "point and vector object count":
            shapefile_information.get(
                "geometry_count",
                "",
            ),
    }

    for field in main_fields:

        name = normalize_text(
            field.get(
                "name",
                "",
            )
        )

        remarks = normalize_text(
            field.get(
                "remarks",
                "",
            )
        )

        if "from shape file" not in remarks:
            continue

        if name not in values:
            continue

        new_value = values[name]

        field["value"] = new_value

        field["source"] = "From Shape File"

        field["remarks"] = "From Shape File"

        field["editable"] = False

        print(
            f"Shape File field updated: "
            f"{field['name']} = {new_value}"
        )


# =========================================================
# BUILD COMPLETE METADATA
# =========================================================

def build_metadata(
    dbf_path: str,
    shp_path: str,
    master_path: str,
) -> Dict[str, Any]:

    print(
        "========================================"
    )

    print(
        "BUILDING COMPLETE GIS METADATA"
    )

    print(
        "========================================"
    )

    # -----------------------------------------------------
    # Main template metadata
    # -----------------------------------------------------

    print(
        "Reading main metadata template..."
    )

    main_fields = (
        read_main_template_fields(
            master_path
        )
    )

    print(
        f"Main fields before SHP processing: "
        f"{len(main_fields)}"
    )

    # -----------------------------------------------------
    # Shapefile
    # -----------------------------------------------------

    print(
        "Reading shapefile attributes and geometry..."
    )

    (
        attributes,
        total_records,
        shapefile_information,
    ) = read_shapefile_attributes(
        dbf_path=dbf_path,
        shp_path=shp_path,
        master_path=master_path,
    )

    # -----------------------------------------------------
    # IMPORTANT:
    #
    # Replace static template values for all fields
    # marked "From Shape File".
    # -----------------------------------------------------

    apply_shapefile_main_fields(
        main_fields,
        shapefile_information,
    )

    # -----------------------------------------------------
    # Print final main fields
    # -----------------------------------------------------

    print(
        "========================================"
    )

    print(
        "FINAL MAIN FIELDS"
    )

    print(
        "========================================"
    )

    for index, field in enumerate(
        main_fields,
        start=1,
    ):

        print(
            f"{index}. "
            f"{field['name']} = "
            f"{field['value']} | "
            f"{field['remarks']}"
        )

    print(
        "========================================"
    )

    print(
        f"Attributes: {len(attributes)}"
    )

    print(
        f"Records: {total_records}"
    )

    print(
        "========================================"
    )

    # -----------------------------------------------------
    # Return complete metadata
    # -----------------------------------------------------

    return {

        "main_fields":
            main_fields,

        "fields":
            attributes,

        "total_fields":
            len(attributes),

        "total_records":
            total_records,

        "shapefile_information":
            shapefile_information,
    }