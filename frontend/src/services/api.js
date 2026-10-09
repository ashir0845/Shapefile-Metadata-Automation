const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

// ============================================================
// AUTH HELPERS
// ============================================================

function getAuthHeaders(extraHeaders = {}) {
  const token = sessionStorage.getItem("access_token");

  return token
    ? { ...extraHeaders, Authorization: `Bearer ${token}` }
    : extraHeaders;
}

function clearSessionAndRedirect() {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("username");
  sessionStorage.removeItem("role");

  window.location.href = "/login";
}

// Adds the token and logs out automatically on 401.
async function authorizedFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: getAuthHeaders(options.headers || {}),
  });

  if (response.status === 401) {
    clearSessionAndRedirect();
    throw new Error(
      "Your session has expired. Please log in again.",
    );
  }

  return response;
}

async function getErrorMessage(response, fallback) {
  try {
    const data = await response.json();

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (typeof data?.message === "string") {
      return data.message;
    }
  } catch {
    // Keep fallback message
  }

  return fallback;
}

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
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to upload shapefile.",
      ),
    );
  }

  return response.json();
}

// ============================================================
// GENERATE + DOWNLOAD EXCEL
// ============================================================

export async function generateExcel(metadata) {
  const response = await authorizedFetch(
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
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to generate Excel file.",
      ),
    );
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
// GET OWN HISTORY
// ============================================================

export async function getHistory() {
  const response = await authorizedFetch(
    `${API_BASE_URL}/api/history`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to fetch history.",
      ),
    );
  }

  return response.json();
}

// ============================================================
// DOWNLOAD HISTORY EXCEL
// ============================================================

export async function downloadHistory(historyId) {
  const response = await authorizedFetch(
    `${API_BASE_URL}/api/history/${historyId}/download`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to download file.",
      ),
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
  const response = await authorizedFetch(
    `${API_BASE_URL}/api/history/${historyId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Failed to delete history.",
      ),
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

// ============================================================
// CHANGE PASSWORD (any logged-in user)
// ============================================================

export async function changePassword(
  currentPassword,
  newPassword,
) {
  const response = await authorizedFetch(
    `${API_BASE_URL}/auth/change-password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to change password.",
      ),
    );
  }

  return response.json();
}

// ============================================================
// ADMIN: USERS
// ============================================================

export async function getAdminUsers() {
  const response = await authorizedFetch(
    `${API_BASE_URL}/admin/users`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to load users.",
      ),
    );
  }

  return response.json();
}

export async function createAdminUser({
  username,
  password,
  role,
  email,
}) {
  const response = await authorizedFetch(
    `${API_BASE_URL}/admin/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        role,
        email: email || null,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to create user.",
      ),
    );
  }

  return response.json();
}

export async function updateAdminUser(
  userId,
  { username, email, password, role },
) {
  const response = await authorizedFetch(
    `${API_BASE_URL}/admin/users/${userId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email: email ?? "",
        password: password ?? "",
        role,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to update user.",
      ),
    );
  }

  return response.json();
}
// ============================================================
// ADMIN: HISTORY OF ALL USERS
// ============================================================

export async function getAdminHistory(userId) {
  const query = userId
    ? `?user_id=${encodeURIComponent(userId)}`
    : "";

  const response = await authorizedFetch(
    `${API_BASE_URL}/admin/history${query}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to load history.",
      ),
    );
  }

  return response.json();
}

// ============================================================
// ADMIN: DELETE USER (their history is kept)
// ============================================================

// ============================================================
// ADMIN: ACTIVATE / DEACTIVATE USER (history is kept)
// ============================================================

export async function setAdminUserActive(userId, isActive) {
  const action = isActive ? "reactivate" : "deactivate";

  const response = await authorizedFetch(
    `${API_BASE_URL}/admin/users/${userId}/${action}`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        `Unable to ${action} user.`,
      ),
    );
  }

  return response.json();
}