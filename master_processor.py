import openpyxl


def load_master(master_path):

    workbook = openpyxl.load_workbook(
        master_path,
        data_only=True
    )

    worksheet = workbook["Master"]

    master_data = {}

    # Skip header row
    for row in worksheet.iter_rows(
        min_row=2,
        values_only=True
    ):

        # Master sheet structure:
        # A = Entity
        # B = Attribute (Yes/No)
        # C = Label
        # D = Attribute Definition
        # E = Attribute Definition Source

        entity = row[0]
        attribute_flag = row[1]
        attribute_label = row[2]
        attribute_definition = row[3]
        attribute_source = row[4]

        # Only process actual attributes
        if (
            attribute_flag == "Yes"
            and attribute_label
        ):

            label = str(attribute_label).strip()

            master_data[label] = {
                "definition": attribute_definition,
                "definition_source": attribute_source
            }

    return master_data