import shapefile


def process_dbf(dbf_path):

    reader = None

    try:

        reader = shapefile.Reader(
            dbf=dbf_path
        )

        fields = reader.fields[1:]

        field_names = [
            field.name
            for field in fields
        ]

        records = reader.records()

        metadata = []

        for field in fields:

            field_name = field.name
            field_type = str(field.field_type)

            column_index = field_names.index(
                field_name
            )

            values = [
                record[column_index]
                for record in records
                if record[column_index] is not None
            ]

            field_info = {

                "name": field_name,

                "dbf_type": field_type,

                "size": field.size,

                "decimal": field.decimal,

                "record_count": len(values),

                "min": None,

                "max": None,
            }

            if field_type == "N" and values:

                field_info["min"] = min(values)

                field_info["max"] = max(values)

            metadata.append(
                field_info
            )

        return {

            "total_fields": len(fields),

            "total_records": len(records),

            "fields": metadata,

        }

    finally:

        # Important on Windows:
        # release the DBF file before cleanup
        if reader is not None:

            try:
                reader.close()
            except Exception:
                pass