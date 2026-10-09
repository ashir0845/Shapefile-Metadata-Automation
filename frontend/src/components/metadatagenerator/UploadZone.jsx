
import { useRef, useState } from "react";
import { UploadCloud, FileArchive, X } from "lucide-react";
import JSZip from "jszip";
import { uploadShapefile } from "../../services/api";

const REQUIRED_FILES = [".shp", ".shx", ".dbf", ".prj"];

async function validateShapefileZip(file) {
  let zip;

  try {
    zip = await JSZip.loadAsync(file);
  } catch {
    throw new Error(
      "The selected file is not a valid ZIP archive."
    );
  }

  const extensions = new Set();

  Object.entries(zip.files).forEach(([path, entry]) => {
    if (entry.dir) return;

    // Ignore macOS metadata files.
    if (
      path.includes("__MACOSX/") ||
      path.split("/").pop().startsWith("._")
    ) {
      return;
    }

    const filename = path.split("/").pop();
    const extension = filename.includes(".")
      ? `.${filename.split(".").pop().toLowerCase()}`
      : "";

    if (extension) {
      extensions.add(extension);
    }
  });

  const missingFiles = REQUIRED_FILES.filter(
    (extension) => !extensions.has(extension)
  );

  if (missingFiles.length > 0) {
    throw new Error(
      `Missing required shapefile file(s): ${missingFiles.join(", ")}. Please add all four files (.shp, .shx, .dbf, .prj) and upload the ZIP again.`
    );
  }
}

function UploadZone({ onUploadSuccess }) {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (selectedFile) => {
    setError("");
    setFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".zip")) {
      setError("Please upload a Shapefile ZIP file.");
      return;
    }

    try {
      setLoading(true);

      await validateShapefileZip(selectedFile);

      setFile(selectedFile);
    } catch (err) {
      setError(err.message || "Unable to validate the ZIP file.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a ZIP file containing all four required files.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Validate again before calling the backend.
      await validateShapefileZip(file);

      const result = await uploadShapefile(file);

      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      console.error("Shapefile upload error:", err);
      setError(err.message || "Unable to upload the shapefile.");
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
      {!file && (
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          onClick={() => {
            if (!loading) inputRef.current?.click();
          }}
          className="group flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-5 py-8 transition hover:border-blue-400 hover:bg-blue-50/30"
        >
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <UploadCloud size={31} className="text-blue-600" />
          </div>

          <h3 className="text-sm font-bold text-slate-800 sm:text-base">
            Drag and drop your ZIP file here
          </h3>

          <p className="mt-1 text-xs text-slate-500">or</p>

          <button
            type="button"
            disabled={loading}
            onClick={(event) => {
              event.stopPropagation();
              inputRef.current?.click();
            }}
            className="mt-3 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Checking ZIP..." : "Choose File"}
          </button>

          <p className="mt-3 text-xs text-slate-400">
            Supported format: .zip
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".zip,application/zip"
            hidden
            onChange={handleInputChange}
          />
        </div>
      )}

      {file && (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                <FileArchive size={22} className="text-emerald-600" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {file.name}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={removeFile}
              aria-label="Remove selected ZIP file"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {file && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={loading}
          className="mt-4 flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? "Analyzing Shapefile..." : "Validate Shapefile"}
        </button>
      )}
    </div>
  );
}

export default UploadZone;