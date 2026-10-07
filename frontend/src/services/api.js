const API_BASE_URL = "http://192.168.1.11:8000";

export async function uploadShapefile(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/metadata/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Failed to upload shapefile.";

    try {
      const errorData = await response.json();

      message = errorData.detail || errorData.message || message;
    } catch {
      // Keep default message
    }

    throw new Error(message);
  }

  return response.json();
}

// ============================================================
// GENERATE + DOWNLOAD EXCEL
// ============================================================

export async function generateExcel(metadata) {
  const response = await fetch(`${API_BASE_URL}/metadata/generate-excel`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      total_fields: metadata?.total_fields || 0,

      total_records: metadata?.total_records || 0,

      main_fields: metadata?.main_fields || [],

      fields: metadata?.fields || [],
    }),
  });

  if (!response.ok) {
    let message = "Unable to generate Excel file.";

    try {
      const errorData = await response.json();

      message = errorData?.detail || message;
    } catch {
      // Ignore JSON parsing errors
    }

    throw new Error(message);
  }

  const blob = await response.blob();

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = "Generated_Metadata.xlsx";

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}
