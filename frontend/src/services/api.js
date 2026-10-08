const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

// ============================================================
// UPLOAD SHAPEFILE
// ============================================================

export async function uploadShapefile(file) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/metadata/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    let message = "Failed to upload shapefile.";

    try {
      const errorData = await response.json();

      message =
        errorData?.detail ||
        errorData?.message ||
        message;
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
  const response = await fetch(
    `${API_BASE_URL}/metadata/generate-excel`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        total_fields:
          metadata?.total_fields || 0,

        total_records:
          metadata?.total_records || 0,

        main_fields:
          metadata?.main_fields || [],

        fields:
          metadata?.fields || [],
      }),
    },
  );

  if (!response.ok) {
    let message =
      "Unable to generate Excel file.";

    try {
      const errorData =
        await response.json();

      message =
        errorData?.detail || message;
    } catch {
      // Ignore JSON parsing errors
    }

    throw new Error(message);
  }

  const blob = await response.blob();

  const url =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = "Generated_Metadata.xlsx";

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}

// ============================================================
// GET HISTORY
// ============================================================

export async function getHistory() {
  const response = await fetch(
    `${API_BASE_URL}/api/history`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    let message = "Unable to fetch history.";

    try {
      const errorData =
        await response.json();

      message =
        errorData?.detail ||
        errorData?.message ||
        message;
    } catch {
      // Keep default message
    }

    throw new Error(message);
  }

  return response.json();
}

// ============================================================
// DOWNLOAD HISTORY EXCEL
// ============================================================

export async function downloadHistory(historyId) {
  const response = await fetch(
    `${API_BASE_URL}/api/history/${historyId}/download`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to download file.",
    );
  }

  const blob = await response.blob();

  const contentDisposition =
    response.headers.get(
      "content-disposition",
    );

  let filename = "metadata.xlsx";

  if (contentDisposition) {
    const match =
      contentDisposition.match(
        /filename="?([^"]+)"?/i,
      );

    if (match?.[1]) {
      filename = match[1];
    }
  }

  const url =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
}

// ============================================================
// DELETE HISTORY
// ============================================================

export async function deleteHistory(historyId) {
  const response = await fetch(
    `${API_BASE_URL}/api/history/${historyId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Failed to delete history.",
    );
  }

  return response.json();
}

// ============================================================
// LOGIN USER
// ============================================================

export async function loginUser(username, password) {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail || "Invalid username or password.",
    );
  }

  return data;
}