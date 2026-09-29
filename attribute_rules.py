def get_attribute_unit(dbf_type, attribute_name):
    """
    Determine the metadata unit of measurement.
    """

    # Text DBF fields
    if dbf_type == "C":
        return "Text"

    # Numeric DBF fields
    if dbf_type == "N":
        return "Numbers"

    # Default
    return ""