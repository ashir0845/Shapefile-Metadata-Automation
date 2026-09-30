from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

import os
import shutil
import uuid
import zipfile
import tempfile

from backend.services.excel_service import generate_excel


router = APIRouter(
    prefix="/metadata",
    tags=["Metadata"]
)


@router.post("/upload")
def upload_shapefile(file: UploadFile = File(...)):

    # -----------------------------------------
    # Validate ZIP
    # -----------------------------------------

    if not file.filename.lower().endswith(".zip"):
        raise HTTPException(
            status_code=400,
            detail="Only .zip Shapefile packages are allowed."
        )

    temp_dir = tempfile.mkdtemp(
        prefix="gis_metadata_"
    )

    try:

        # -----------------------------------------
        # Save ZIP temporarily
        # -----------------------------------------

        zip_path = os.path.join(
            temp_dir,
            file.filename
        )

        with open(zip_path, "wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer
            )

        # Close uploaded file
        awaitable = file.close()

        print(
            f"Temporary ZIP created: {zip_path}"
        )

        # -----------------------------------------
        # Extract ZIP
        # -----------------------------------------

        extracted_dir = os.path.join(
            temp_dir,
            "extracted"
        )

        os.makedirs(
            extracted_dir,
            exist_ok=True
        )

        with zipfile.ZipFile(
            zip_path,
            "r"
        ) as zip_ref:

            zip_ref.extractall(
                extracted_dir
            )

        # -----------------------------------------
        # Find DBF
        # -----------------------------------------

        dbf_path = None

        for root, dirs, files in os.walk(
            extracted_dir
        ):

            for filename in files:

                if filename.lower().endswith(".dbf"):

                    dbf_path = os.path.join(
                        root,
                        filename
                    )

                    break

            if dbf_path:
                break

        if not dbf_path:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid Shapefile ZIP. "
                    "No .dbf file was found."
                )
            )

        # -----------------------------------------
        # Validate SHP
        # -----------------------------------------

        shp_path = os.path.splitext(
            dbf_path
        )[0] + ".shp"

        if not os.path.exists(shp_path):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid Shapefile ZIP. "
                    "Required .shp file is missing."
                )
            )

        # -----------------------------------------
        # Validate SHX
        # -----------------------------------------

        shx_path = os.path.splitext(
            dbf_path
        )[0] + ".shx"

        if not os.path.exists(shx_path):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid Shapefile ZIP. "
                    "Required .shx file is missing."
                )
            )

        # -----------------------------------------
        # Validate PRJ
        # -----------------------------------------

        prj_path = os.path.splitext(
            dbf_path
        )[0] + ".prj"

        if not os.path.exists(prj_path):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid Shapefile ZIP. "
                    "Required .prj file is missing."
                )
            )

        print(
            "Shapefile validation successful!"
        )

        # -----------------------------------------
        # Generate Excel
        # -----------------------------------------

        output_path = generate_excel(
            dbf_path=dbf_path
        )

        print(
            f"Generated Excel: {output_path}"
        )

        # -----------------------------------------
        # Return Excel
        # -----------------------------------------

        return FileResponse(
            path=output_path,
            filename="Generated_Metadata.xlsx",
            media_type=(
                "application/vnd.openxmlformats-officedocument"
                ".spreadsheetml.sheet"
            )
        )

    except HTTPException:
        raise

    except Exception as e:

        print(
            f"UPLOAD ERROR: {repr(e)}"
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        # -----------------------------------------
        # Cleanup temporary uploaded files
        # -----------------------------------------

        try:

            if os.path.exists(temp_dir):

                shutil.rmtree(
                    temp_dir,
                    ignore_errors=True
                )

                print(
                    f"Temporary files cleaned: {temp_dir}"
                )

        except Exception as cleanup_error:

            print(
                f"Cleanup warning: "
                f"{repr(cleanup_error)}"
            )