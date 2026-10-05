import { useRef, useState } from "react";
import {
  UploadCloud,
  FileArchive,
  X,
} from "lucide-react";
import { uploadShapefile } from "../services/api";

function UploadZone({ onUploadSuccess }) {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (selectedFile) => {
    setError("");

    if (!selectedFile) {
      return;
    }

    if (
      !selectedFile.name
        .toLowerCase()
        .endsWith(".zip")
    ) {
      setError(
        "Please upload a Shapefile ZIP file."
      );
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024 * 1024) {
      setError(
        "File size must be less than 50 MB."
      );
      return;
    }

    setFile(selectedFile);
  };

  const handleInputChange = (event) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const droppedFile =
      event.dataTransfer.files?.[0];

    handleFile(droppedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError(
        "Please select a ZIP file first."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result =
        await uploadShapefile(file);

      console.log(
        "Metadata received:",
        result
      );

      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to upload the shapefile."
      );
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div>
      {/* DROP ZONE */}
      {!file && (
        <div
          onDragOver={(event) =>
            event.preventDefault()
          }
          onDrop={handleDrop}
          onClick={() =>
            inputRef.current?.click()
          }
          className="group flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-5 py-8 transition hover:border-blue-400 hover:bg-blue-50/30"
        >
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <UploadCloud
              size={31}
              className="text-blue-600"
            />
          </div>

          <h3 className="text-sm font-bold text-slate-800 sm:text-base">
            Drag and drop your ZIP file here
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            or
          </p>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              inputRef.current?.click();
            }}
            className="mt-3 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Choose File
          </button>

          <p className="mt-3 text-xs text-slate-400">
            Supported format: .zip
            <span className="mx-2">|</span>
            Max size: 50 MB
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".zip"
            hidden
            onChange={handleInputChange}
          />
        </div>
      )}

      {/* SELECTED FILE */}
      {file && (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                <FileArchive
                  size={22}
                  className="text-emerald-600"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {file.name}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  {(file.size / 1024 / 1024).toFixed(
                    2
                  )}{" "}
                  MB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={removeFile}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* BUTTON */}
      {file && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading
            ? "Analyzing Shapefile..."
            : "Validate Shapefile"}
        </button>
      )}
    </div>
  );
}

export default UploadZone;