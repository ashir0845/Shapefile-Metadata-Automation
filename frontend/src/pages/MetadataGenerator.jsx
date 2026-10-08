import { useEffect, useState } from "react";

import Stepper from "../components/metadatagenerator/Stepper";
import UploadZone from "../components/metadatagenerator/UploadZone";
import RequiredFiles from "../components/metadatagenerator/RequiredFiles";
import DetectedInfo from "../components/metadatagenerator/DetectedInfo";
import RecentActivity from "../components/metadatagenerator/RecentActivity";

import { generateExcel } from "../services/api";

/* ============================================================
   LOCAL STORAGE KEY
============================================================ */

const METADATA_GENERATOR_STORAGE_KEY = "gis_metadata_generator_state";

/* ============================================================
   RESTORE SAVED STATE
============================================================ */

function getSavedState() {
  try {
    const savedState = localStorage.getItem(METADATA_GENERATOR_STORAGE_KEY);

    if (!savedState) {
      return {
        currentStep: 1,
        metadata: null,
      };
    }

    const parsedState = JSON.parse(savedState);

    return {
      currentStep:
        Number.isInteger(parsedState?.currentStep) &&
        parsedState.currentStep >= 1 &&
        parsedState.currentStep <= 4
          ? parsedState.currentStep
          : 1,

      metadata: parsedState?.metadata || null,
    };
  } catch (error) {
    console.error("Unable to restore metadata generator state:", error);

    return {
      currentStep: 1,
      metadata: null,
    };
  }
}

/* ============================================================
   MAIN
============================================================ */

function MetadataGenerator() {
  /* ==========================================================
     INITIAL STATE

     Restore the previously saved workflow when the page
     is opened again.

     This is important when the user:
     - switches to History
     - switches back to Home
     - refreshes the browser
  ========================================================== */

  const [savedState] = useState(() => getSavedState());

  const [currentStep, setCurrentStep] = useState(savedState.currentStep);

  const [metadata, setMetadata] = useState(savedState.metadata);

  /* ==========================================================
     RESET AFTER SUCCESSFUL EXCEL DOWNLOAD

     IMPORTANT:
     This is the ONLY place where the workflow is
     intentionally cleared.

     Clicking Home does NOT call this function.
  ========================================================== */

  const resetAfterDownload = () => {
    /* --------------------------------------------------------
       Reset React state.
    -------------------------------------------------------- */

    setCurrentStep(1);
    setMetadata(null);

    /* --------------------------------------------------------
       Clear saved workflow.
    -------------------------------------------------------- */

    try {
      localStorage.removeItem(METADATA_GENERATOR_STORAGE_KEY);
    } catch (error) {
      console.error("Unable to clear metadata generator state:", error);
    }
  };

  /* ==========================================================
     SAVE CURRENT WORKFLOW

     Saves:
     - current step
     - uploaded metadata
     - edited metadata
     - shapefile attributes
     - match information

     This allows the workflow to survive navigation between
     Home and History.
  ========================================================== */

  useEffect(() => {
    try {
      /* ------------------------------------------------------
         If the application is completely reset, there is
         nothing to save.
      ------------------------------------------------------ */

      if (currentStep === 1 && metadata === null) {
        localStorage.removeItem(METADATA_GENERATOR_STORAGE_KEY);

        return;
      }

      /* ------------------------------------------------------
         Save the current workflow.
      ------------------------------------------------------ */

      localStorage.setItem(
        METADATA_GENERATOR_STORAGE_KEY,
        JSON.stringify({
          currentStep,
          metadata,
        }),
      );
    } catch (error) {
      console.error("Unable to save metadata generator state:", error);
    }
  }, [currentStep, metadata]);

  /* ==========================================================
     UPLOAD SUCCESS
  ========================================================== */

  const handleUploadSuccess = (result) => {
    console.log("Metadata received:", result);

    /* --------------------------------------------------------
       NORMALIZE SHAPEFILE FIELDS

       Empty remarks are treated as:
       "From Shape File"
    -------------------------------------------------------- */

    const normalizedFields = (result?.fields || []).map((field) => ({
      ...field,

      remarks:
        field?.remarks !== undefined &&
        field?.remarks !== null &&
        String(field.remarks).trim() !== ""
          ? String(field.remarks)
          : "From Shape File",

      definition:
        field?.definition !== undefined && field?.definition !== null
          ? field.definition
          : "",

      definition_source:
        field?.definition_source !== undefined &&
        field?.definition_source !== null
          ? field.definition_source
          : "",

      unit: field?.unit !== undefined && field?.unit !== null ? field.unit : "",
    }));

    /* --------------------------------------------------------
       NORMALIZE MAIN FIELDS
    -------------------------------------------------------- */

    const normalizedMainFields = (result?.main_fields || []).map((field) => ({
      ...field,

      value:
        field?.value !== undefined && field?.value !== null ? field.value : "",

      remarks:
        field?.remarks !== undefined && field?.remarks !== null
          ? String(field.remarks)
          : "",
    }));

    /* --------------------------------------------------------
       SAVE METADATA
    -------------------------------------------------------- */

    setMetadata({
      ...result,

      main_fields: normalizedMainFields,

      fields: normalizedFields,
    });

    /* --------------------------------------------------------
       MOVE TO STEP 2
    -------------------------------------------------------- */

    setCurrentStep(2);
  };

  /* ==========================================================
     REVIEW CONTINUE
  ========================================================== */

  const handleReviewContinue = ({ mainFields, fields }) => {
    console.log("Updated main fields:", mainFields);

    console.log("Updated shapefile fields:", fields);

    /* --------------------------------------------------------
       NORMALIZE MAIN FIELDS
    -------------------------------------------------------- */

    const normalizedMainFields = (mainFields || []).map((field) => ({
      ...field,

      value:
        field?.value !== undefined && field?.value !== null ? field.value : "",

      remarks:
        field?.remarks !== undefined && field?.remarks !== null
          ? String(field.remarks)
          : "",
    }));

    /* --------------------------------------------------------
       NORMALIZE SHAPEFILE FIELDS
    -------------------------------------------------------- */

    const normalizedFields = (fields || []).map((field) => ({
      ...field,

      remarks:
        field?.remarks !== undefined &&
        field?.remarks !== null &&
        String(field.remarks).trim() !== ""
          ? String(field.remarks)
          : "From Shape File",

      definition:
        field?.definition !== undefined && field?.definition !== null
          ? field.definition
          : "",

      definition_source:
        field?.definition_source !== undefined &&
        field?.definition_source !== null
          ? field.definition_source
          : "",

      unit: field?.unit !== undefined && field?.unit !== null ? field.unit : "",
    }));

    console.log("Normalized attributes:", normalizedFields);

    /* --------------------------------------------------------
       UPDATE METADATA
    -------------------------------------------------------- */

    setMetadata((previous) => ({
      ...previous,

      main_fields: normalizedMainFields,

      fields: normalizedFields,
    }));

    /* --------------------------------------------------------
       MOVE TO STEP 3
    -------------------------------------------------------- */

    setCurrentStep(3);
  };

  /* ==========================================================
     GENERATE CONTINUE
  ========================================================== */

  const handleGenerateContinue = () => {
    setCurrentStep(4);
  };

  return (
    <div className="flex min-h-screen bg-[#f4f8fc] p-0">
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-7">
          {/* ==================================================
              HERO
          ================================================== */}

          <HeroBanner />

          {/* ==================================================
              STEPPER
          ================================================== */}

          <div className="mt-5">
            <Stepper currentStep={currentStep} />
          </div>

          {/* ==================================================
              STEP 1
          ================================================== */}

          {currentStep === 1 && (
            <StepOne onUploadSuccess={handleUploadSuccess} />
          )}

          {/* ==================================================
              STEP 2
          ================================================== */}

          {currentStep === 2 && metadata && (
            <StepTwo
              metadata={metadata}
              onBack={() => setCurrentStep(1)}
              onContinue={handleReviewContinue}
            />
          )}

          {/* ==================================================
              STEP 3
          ================================================== */}

          {currentStep === 3 && metadata && (
            <StepThree
              metadata={metadata}
              onBack={() => setCurrentStep(2)}
              onContinue={handleGenerateContinue}
            />
          )}

          {/* ==================================================
              STEP 4
          ================================================== */}

          {currentStep === 4 && metadata && (
            <StepFour
              metadata={metadata}
              onBack={() => setCurrentStep(3)}
              onDownloadSuccess={resetAfterDownload}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   HERO
============================================================ */

function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#e5f1ff] via-[#e9f5ff] to-[#dff8f2] px-6 py-5 shadow-sm sm:px-8">
      <div className="relative z-10 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100">
          <span className="text-3xl">🗺️</span>
        </div>

        <div>
          <h2 className="text-lg font-bold text-[#102b55] sm:text-xl">
            Turn Your GIS Data into Useful Metadata
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-600">
            Quick. Simple. Accurate.
          </p>
        </div>
      </div>

      <div className="absolute -right-12 -top-20 h-52 w-52 rounded-full bg-blue-200/30 blur-2xl" />

      <div className="absolute -bottom-20 right-20 h-44 w-44 rounded-full bg-emerald-200/30 blur-2xl" />
    </div>
  );
}

/* ============================================================
   STEP 1
============================================================ */

function StepOne({ onUploadSuccess }) {
  return (
    <>
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.8fr)_390px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50">
              <span className="text-xl">☁️</span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#102b55]">
                Upload Shapefile (ZIP)
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Please upload a ZIP file containing the complete shapefile
                (.shp, .shx, .dbf, .prj).
              </p>
            </div>
          </div>

          <UploadZone onUploadSuccess={onUploadSuccess} />
        </section>

        <div className="space-y-5">
          <RequiredFiles />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.8fr)_390px]">
        <DetectedInfo metadata={null} />

        <GenerateButton disabled />
      </div>

      <div className="mt-5">
        <RecentActivity metadata={null} />
      </div>
    </>
  );
}

/* ============================================================
   STEP 2
============================================================ */

function StepTwo({ metadata, onBack, onContinue }) {
  return (
    <div className="mt-5">
      <MetadataReview
        metadata={metadata}
        onBack={onBack}
        onContinue={onContinue}
      />
    </div>
  );
}

/* ============================================================
   STEP 3
============================================================ */

function StepThree({ metadata, onBack, onContinue }) {
  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          Step 3
        </p>

        <h2 className="mt-1 text-2xl font-bold text-[#102b55]">
          Generate Metadata
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Your metadata has been reviewed. Continue to prepare the final
          metadata Excel file.
        </p>
      </div>

      <div className="rounded-xl bg-blue-50 p-5">
        <p className="text-sm font-semibold text-blue-900">
          {metadata?.filename}
        </p>

        <p className="mt-1 text-sm text-blue-700">
          {metadata?.main_fields?.length || 0} main fields
          {" · "}
          {metadata?.total_fields || 0} attributes
          {" · "}
          {metadata?.total_records?.toLocaleString() || 0} records
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
        <p className="text-sm font-semibold text-emerald-800">
          ✓ Review completed
        </p>

        <p className="mt-1 text-sm text-emerald-700">
          Your edited template metadata and shapefile attributes have been saved
          and will be included in the final Excel file.
        </p>
      </div>

      <div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          ← Back to Review
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Generate Metadata →
        </button>
      </div>
    </section>
  );
}

/* ============================================================
   STEP 4
============================================================ */

function StepFour({ metadata, onBack, onDownloadSuccess }) {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);

  /* ==========================================================
     DOWNLOAD EXCEL
  ========================================================== */

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError("");

      const exportMetadata = {
        ...metadata,

        main_fields: (metadata?.main_fields || []).map((field) => ({
          ...field,

          remarks:
            field?.remarks !== undefined && field?.remarks !== null
              ? String(field.remarks)
              : "",
        })),

        fields: (metadata?.fields || []).map((field) => ({
          ...field,

          remarks:
            field?.remarks !== undefined &&
            field?.remarks !== null &&
            String(field.remarks).trim() !== ""
              ? String(field.remarks)
              : "From Shape File",

          definition:
            field?.definition !== undefined && field?.definition !== null
              ? field.definition
              : "",

          definition_source:
            field?.definition_source !== undefined &&
            field?.definition_source !== null
              ? field.definition_source
              : "",

          unit:
            field?.unit !== undefined && field?.unit !== null ? field.unit : "",
        })),
      };

      console.log("Generating Excel with metadata:", exportMetadata);

      console.log(
        "Remarks being sent:",
        exportMetadata.fields.map((field) => ({
          name: field.name,
          remarks: field.remarks,
        })),
      );

      /* ------------------------------------------------------
         GENERATE EXCEL

         The workflow is reset ONLY after this
         operation succeeds.
      ------------------------------------------------------ */

      await generateExcel(exportMetadata);

      console.log("Excel generated successfully");

      /* ------------------------------------------------------
         RESET AFTER SUCCESS
      ------------------------------------------------------ */

      if (typeof onDownloadSuccess === "function") {
        onDownloadSuccess();
      }
    } catch (err) {
      console.error("Excel download error:", err);

      setError(err?.message || "Unable to generate Excel file.");
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     CONFIRM DOWNLOAD
  ========================================================== */

  const handleConfirmDownload = async () => {
    setShowDownloadConfirm(false);

    await handleDownload();
  };

  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      {/* SUCCESS ICON */}

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl text-emerald-600">
        ✓
      </div>

      {/* TITLE */}

      <h2 className="mt-4 text-2xl font-bold text-[#102b55]">Metadata Ready</h2>

      <p className="mt-2 text-sm text-slate-500">
        Your GIS metadata has been prepared successfully.
      </p>

      {/* FILE INFORMATION */}

      {metadata && (
        <div className="mx-auto mt-6 max-w-md rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Source File
          </p>

          <p className="mt-1 font-semibold text-slate-800">
            {metadata.filename}
          </p>

          <div className="mt-3 grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-slate-400">Main Fields</p>

              <p className="font-semibold text-slate-700">
                {metadata.main_fields?.length || 0}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Attributes</p>

              <p className="font-semibold text-slate-700">
                {metadata.total_fields || 0}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Records</p>

              <p className="font-semibold text-slate-700">
                {metadata.total_records?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="mx-auto mt-4 max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* DOWNLOAD BUTTON */}

      <button
        type="button"
        disabled={loading}
        onClick={() => setShowDownloadConfirm(true)}
        className={`mt-6 rounded-xl px-6 py-3 font-semibold text-white shadow-md transition ${
          loading
            ? "cursor-not-allowed bg-blue-300"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Generating Excel..." : "↓ Download Excel"}
      </button>

      {/* BACK BUTTON */}

      <div className="mt-5">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Back to Generate
        </button>
      </div>

      {/* DOWNLOAD CONFIRMATION POPUP */}

      {showDownloadConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowDownloadConfirm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              <span className="text-2xl text-blue-600">↓</span>
            </div>

            <h2 className="mt-4 text-center text-xl font-bold text-[#102b55]">
              Confirm Download
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-slate-500">
              Are you sure you want to download the generated GIS metadata Excel
              file?
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDownloadConfirm(false)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDownload}
                disabled={loading}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {loading ? "Generating..." : "Yes, Download"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ============================================================
   GENERATE BUTTON
============================================================ */

function GenerateButton({ disabled = false }) {
  return (
    <div className="flex min-h-[115px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <button
        type="button"
        disabled={disabled}
        className="w-full rounded-xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-400"
      >
        Generate Metadata
      </button>
    </div>
  );
}

/* ============================================================
   CHECK WHETHER REMARKS COME FROM SHAPE FILE
============================================================ */

function isFromShapeFile(field) {
  const remarks = String(field?.remarks ?? field?.remark ?? "")
    .trim()
    .toLowerCase();

  return remarks.includes("from shape file");
}

/* ============================================================
   CHECK WHETHER VALUE EXISTS
============================================================ */

function hasValue(value) {
  if (value === null || value === undefined) {
    return false;
  }

  return String(value).trim() !== "";
}

/* ============================================================
   MAIN METADATA MATCH STATUS
============================================================ */

function getMainMatchStatus(field) {
  if (!isFromShapeFile(field)) {
    return null;
  }

  return hasValue(field?.value) ? "Match" : "No Match";
}

/* ============================================================
   MAIN METADATA MATCH BADGE
============================================================ */

function MatchBadge({ field }) {
  const matchStatus = getMainMatchStatus(field);

  if (!matchStatus) {
    return <span className="text-sm text-slate-300">—</span>;
  }

  if (matchStatus === "Match") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        Match
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
      No Match
    </span>
  );
}

/* ============================================================
   SHAPE ATTRIBUTE MATCH BADGE
============================================================ */

function ShapeAttributeMatchBadge({ field }) {
  if (!isFromShapeFile(field)) {
    return <span className="text-sm text-slate-300">—</span>;
  }

  if (field?.master_match) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        Yes
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
      No
    </span>
  );
}

/* ============================================================
   REVIEW & EDIT
============================================================ */

function MetadataReview({ metadata, onBack, onContinue }) {
  const [mainFields, setMainFields] = useState(metadata?.main_fields || []);

  const [fields, setFields] = useState(metadata?.fields || []);

  /* ==========================================================
     KEEP STATE SYNCHRONIZED
  ========================================================== */

  useEffect(() => {
    setMainFields(metadata?.main_fields || []);

    setFields(metadata?.fields || []);
  }, [metadata]);

  /* ==========================================================
     UPDATE MAIN FIELD
  ========================================================== */

  const updateMainField = (index, value) => {
    setMainFields((previous) =>
      previous.map((field, fieldIndex) =>
        fieldIndex === index
          ? {
              ...field,
              value,
            }
          : field,
      ),
    );
  };

  /* ==========================================================
     UPDATE ATTRIBUTE FIELD
  ========================================================== */

  const updateField = (index, key, value) => {
    setFields((previous) => {
      const updated = [...previous];

      updated[index] = {
        ...updated[index],
        [key]: value,
      };

      return updated;
    });
  };

  /* ==========================================================
     CONTINUE
  ========================================================== */

  const handleContinue = () => {
    const normalizedMainFields = mainFields.map((field) => ({
      ...field,

      value:
        field?.value !== undefined && field?.value !== null ? field.value : "",

      remarks:
        field?.remarks !== undefined && field?.remarks !== null
          ? String(field.remarks)
          : "",
    }));

    const normalizedFields = fields.map((field) => ({
      ...field,

      remarks:
        field?.remarks !== undefined &&
        field?.remarks !== null &&
        String(field.remarks).trim() !== ""
          ? String(field.remarks)
          : "From Shape File",

      definition:
        field?.definition !== undefined && field?.definition !== null
          ? field.definition
          : "",

      definition_source:
        field?.definition_source !== undefined &&
        field?.definition_source !== null
          ? field.definition_source
          : "",

      unit: field?.unit !== undefined && field?.unit !== null ? field.unit : "",
    }));

    console.log("Main fields:", normalizedMainFields);

    console.log("Attributes:", normalizedFields);

    console.log(
      "Attribute remarks:",
      normalizedFields.map((field) => ({
        name: field.name,
        remarks: field.remarks,
        master_match: field.master_match,
        match_type: field.match_type,
      })),
    );

    onContinue({
      mainFields: normalizedMainFields,

      fields: normalizedFields,
    });
  };

  return (
    <section>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          Step 2
        </p>

        <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-[#102b55] sm:text-2xl">
              Preview & Edit Metadata
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review all template metadata fields and shapefile attributes. Only
              fields marked as Editable can be changed.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase text-slate-400">
              Map File
            </p>

            <p className="mt-1 text-sm font-bold text-slate-700">
              {metadata?.filename}
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="File" value={metadata?.filename} />

        <Summary label="Main Fields" value={mainFields.length} />

        <Summary
          label="Data Attributes"
          value={metadata?.total_fields || fields.length}
        />

        <Summary
          label="Records"
          value={metadata?.total_records?.toLocaleString() || 0}
        />
      </div>

      {/* ======================================================
          MAIN METADATA
      ====================================================== */}

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-[#102b55]">Main Metadata</h3>

            <p className="mt-1 text-xs text-slate-500">
              These fields come directly from the Excel metadata template.
            </p>
          </div>

          <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {mainFields.length} Fields
          </span>
        </div>

        <div className="max-h-[600px] overflow-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr>
                <TableHead>#</TableHead>

                <TableHead>Field</TableHead>

                <TableHead>Value</TableHead>

                <TableHead>Match</TableHead>

                <TableHead>Source</TableHead>

                <TableHead>Remarks</TableHead>
              </tr>
            </thead>

            <tbody>
              {mainFields.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    No template metadata fields were returned by the backend.
                  </td>
                </tr>
              ) : (
                mainFields.map((field, index) => (
                  <tr
                    key={`${field.name}-${index}`}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    {/* # */}

                    <td className="px-4 py-3 text-sm text-slate-400">
                      {index + 1}
                    </td>

                    {/* FIELD */}

                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">
                        {field.name}
                      </p>
                    </td>

                    {/* VALUE */}

                    <td className="px-4 py-3">
                      {field.editable ? (
                        <input
                          value={field.value || ""}
                          onChange={(event) =>
                            updateMainField(index, event.target.value)
                          }
                          placeholder={`Enter ${field.name}`}
                          className="w-80 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      ) : (
                        <div className="w-80 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                          {field.value || "—"}
                        </div>
                      )}
                    </td>

                    {/* MATCH */}

                    <td className="px-4 py-3">
                      <MatchBadge field={field} />
                    </td>

                    {/* SOURCE */}

                    <td className="px-4 py-3 text-sm text-slate-600">
                      {field.source || "Template"}
                    </td>

                    {/* REMARKS */}

                    <td className="px-4 py-3">
                      {field.editable ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Editable
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                          {field.remarks || "Read only"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================
          SHAPEFILE ATTRIBUTES
      ====================================================== */}

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-bold text-[#102b55]">Shapefile Attributes</h3>

            <p className="mt-1 text-xs text-slate-500">
              These values are extracted from the uploaded Shapefile.
            </p>
          </div>

          <span className="w-fit rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700">
            {fields.length} Attributes
          </span>
        </div>

        <div className="max-h-[600px] overflow-auto">
          <table className="w-full min-w-[1150px]">
            <thead className="sticky top-0 z-10 bg-white shadow-sm">
              <tr>
                <TableHead>#</TableHead>

                <TableHead>Field Name</TableHead>

                <TableHead>Type</TableHead>

                <TableHead>Definition</TableHead>

                <TableHead>Source</TableHead>

                <TableHead>Unit</TableHead>

                <TableHead>Match</TableHead>

                <TableHead>Remarks</TableHead>
              </tr>
            </thead>

            <tbody>
              {fields.map((field, index) => (
                <tr
                  key={`${field.name}-${index}`}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  {/* # */}

                  <td className="px-4 py-3 text-sm text-slate-400">
                    {index + 1}
                  </td>

                  {/* FIELD NAME */}

                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{field.name}</p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      DBF: {field.dbf_type || "—"}
                    </p>
                  </td>

                  {/* TYPE */}

                  <td className="px-4 py-3">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      {field.dbf_type || "—"}
                    </span>
                  </td>

                  {/* DEFINITION */}

                  <td className="px-4 py-3">
                    {field.editable ? (
                      <input
                        value={field.definition || ""}
                        onChange={(event) =>
                          updateField(index, "definition", event.target.value)
                        }
                        placeholder="Enter definition"
                        className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    ) : (
                      <div className="w-64 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        {field.definition || "—"}
                      </div>
                    )}
                  </td>

                  {/* SOURCE */}

                  <td className="px-4 py-3 text-sm text-slate-600">
                    {field.definition_source || "—"}
                  </td>

                  {/* UNIT */}

                  <td className="px-4 py-3">
                    {field.editable ? (
                      <select
                        value={field.unit || ""}
                        onChange={(event) =>
                          updateField(index, "unit", event.target.value)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Select</option>

                        <option value="Numbers">Numbers</option>

                        <option value="Text">Text</option>

                        <option value="Percentage">Percentage</option>

                        <option value="Meters">Meters</option>

                        <option value="Kilometers">Kilometers</option>
                      </select>
                    ) : (
                      <span className="text-sm text-slate-600">
                        {field.unit || "—"}
                      </span>
                    )}
                  </td>

                  {/* MATCH */}

                  <td className="px-4 py-3">
                    <ShapeAttributeMatchBadge field={field} />
                  </td>

                  {/* REMARKS */}

                  <td className="px-4 py-3">
                    <div className="w-48 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      {field.remarks || "From Shape File"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================
          ACTIONS
      ====================================================== */}

      <div className="mt-5 flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Continue to Generate Metadata →
        </button>
      </div>
    </section>
  );
}

/* ============================================================
   SUMMARY
============================================================ */

function Summary({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 truncate text-lg font-bold text-slate-800">{value}</p>
    </div>
  );
}

/* ============================================================
   TABLE HEAD
============================================================ */

function TableHead({ children }) {
  return (
    <th className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

/* ============================================================
   EXPORT
============================================================ */

export default MetadataGenerator;
