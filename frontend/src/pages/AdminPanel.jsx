import { useEffect, useState } from "react";
import {
  Download,
  Eye,
  EyeOff,
  History as HistoryIcon,
  Pencil,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";

import {
  createAdminUser,
  deleteHistory,
  downloadHistory,
  getAdminHistory,
  getAdminUsers,
  setAdminUserActive,
  updateAdminUser,
} from "../services/api";

const MIN_PASSWORD_LENGTH = 8;

const TABS = [
  { id: "users", label: "Manage Users", icon: Users },
  { id: "history", label: "User History", icon: HistoryIcon },
];

const EMPTY_FORM = {
  username: "",
  email: "",
  password: "",
  role: "User",
};

const INPUT_CLASS =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-[#285596] focus:outline-none focus:ring-2 focus:ring-[#285596]/20";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString();
}

function Notice({ type = "error", text }) {
  if (!text) return null;

  const styles =
    type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${styles}`}
    >
      {text}
    </div>
  );
}

function RoleBadge({ role }) {
  const styles =
    role === "Admin"
      ? "bg-[#285596] text-white"
      : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}
    >
      {role}
    </span>
  );
}

function StatusBadge({ isActive }) {
  return isActive ? (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
      Active
    </span>
  ) : (
    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
      Deactivated
    </span>
  );
}

/* ============================================================
   MANAGE USERS TAB
============================================================ */

function UsersTab({ users, loading, onUsersChanged }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState({
    type: "error",
    text: "",
  });
  const [listNotice, setListNotice] = useState({
    type: "error",
    text: "",
  });

  const currentUsername = sessionStorage.getItem("username");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      email: user.email || "",
      password: "",
      role: user.role,
    });
    setShowPassword(false);
    setNotice({ type: "error", text: "" });
    setListNotice({ type: "error", text: "" });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setShowPassword(false);
    setNotice({ type: "error", text: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const username = form.username.trim();
    const email = form.email.trim();

    if (!username) {
      setNotice({
        type: "error",
        text: "Username is required.",
      });
      return;
    }

    // Password is required for new users. When editing, blank keeps the current one.
    const needsPassword = !editingUser || form.password.length > 0;

    if (
      needsPassword &&
      form.password.length < MIN_PASSWORD_LENGTH
    ) {
      setNotice({
        type: "error",
        text: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      });
      return;
    }

    setSubmitting(true);
    setNotice({ type: "error", text: "" });

    try {
      if (editingUser) {
        await updateAdminUser(editingUser.id, {
          username,
          email,
          password: form.password,
          role: form.role,
        });

        // Keep the header in sync when the admin edits their own name.
        if (editingUser.username === currentUsername) {
          sessionStorage.setItem("username", username);
        }

        setNotice({
          type: "success",
          text: `User "${username}" updated successfully.`,
        });

        setEditingUser(null);
      } else {
        await createAdminUser({
          username,
          password: form.password,
          role: form.role,
          email,
        });

        setNotice({
          type: "success",
          text: `User "${username}" created successfully.`,
        });
      }

      setForm(EMPTY_FORM);
      setShowPassword(false);
      onUsersChanged();
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user) => {
    const confirmed = window.confirm(
      user.is_active
        ? `Deactivate user "${user.username}"? They will not be able to log in, but their history is kept.`
        : `Reactivate user "${user.username}"? They will be able to log in again.`,
    );

    if (!confirmed) return;

    setBusyId(user.id);
    setListNotice({ type: "error", text: "" });

    try {
      await setAdminUserActive(user.id, !user.is_active);

      setListNotice({
        type: "success",
        text: `User "${user.username}" ${
          user.is_active ? "deactivated" : "reactivated"
        }.`,
      });

      onUsersChanged();
    } catch (error) {
      setListNotice({
        type: "error",
        text: error.message,
      });
    } finally {
      setBusyId(null);
    }
  };

  const isEditing = Boolean(editingUser);

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      {/* CREATE / EDIT USER */}
      <section className="h-fit rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-base font-semibold text-[#0b1f3a]">
          {isEditing ? (
            <Pencil size={18} />
          ) : (
            <UserPlus size={18} />
          )}
          {isEditing
            ? `Edit user: ${editingUser.username}`
            : "Create user"}
        </h3>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-4 space-y-4"
        >
          <Notice
            type={notice.type}
            text={notice.text}
          />

          <label className="block text-sm font-medium text-gray-700">
            Username
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="off"
              className={INPUT_CLASS}
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Email <span className="font-normal text-gray-400">(optional)</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="off"
              className={INPUT_CLASS}
            />
          </label>

          <label className="block text-sm font-medium text-gray-700">
            {isEditing
              ? "New password (leave blank to keep current)"
              : "Password"}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                className={`${INPUT_CLASS} pr-10`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 transition hover:text-[#285596]"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </label>

          <label className="block text-sm font-medium text-gray-700">
            Role
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className={INPUT_CLASS}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#285596] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b1f3a] disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : isEditing
                ? "Save changes"
                : "Create user"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={cancelEdit}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </form>
      </section>

      {/* USER LIST */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <h3 className="text-base font-semibold text-[#0b1f3a]">
            All users
          </h3>

          <p className="text-sm text-gray-500">
            {users.length} total
          </p>
        </div>

        {listNotice.text && (
          <div className="px-5 pt-4">
            <Notice
              type={listNotice.type}
              text={listNotice.text}
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Username</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading && users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-6 text-center text-gray-500"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-6 text-center text-gray-500"
                  >
                    No users yet.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isProtected =
                    user.role === "Admin" ||
                    user.username === currentUsername;

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50 ${
                        editingUser?.id === user.id
                          ? "bg-blue-50/60"
                          : ""
                      }`}
                    >
                      <td
                        className={`px-5 py-3 font-medium ${
                          user.is_active
                            ? "text-[#0b1f3a]"
                            : "text-gray-400 line-through"
                        }`}
                      >
                        {user.username}
                      </td>

                      <td className="px-5 py-3 text-gray-600">
                        {user.email || "—"}
                      </td>

                      <td className="px-5 py-3">
                        <RoleBadge role={user.role} />
                      </td>

                      <td className="px-5 py-3">
                        <StatusBadge isActive={user.is_active} />
                      </td>

                      <td className="px-5 py-3 text-gray-600">
                        {formatDate(user.created_at)}
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(user)}
                            title="Edit user"
                            aria-label={`Edit ${user.username}`}
                            className="flex items-center gap-1 rounded-lg border border-[#285596]/30 px-3 py-1.5 text-xs font-semibold text-[#285596] transition hover:bg-blue-50"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          {isProtected ? (
                            <span
                              className="self-center text-xs text-gray-400"
                              title="Admin accounts and your own account cannot be deactivated here"
                            >
                              Protected
                            </span>
                          ) : user.is_active ? (
                            <button
                              type="button"
                              onClick={() => handleToggleActive(user)}
                              disabled={busyId === user.id}
                              className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              <UserX size={14} />
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleActive(user)}
                              disabled={busyId === user.id}
                              className="flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                            >
                              <UserCheck size={14} />
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   USER HISTORY TAB
============================================================ */

function HistoryTab({ users }) {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getAdminHistory(selectedUserId);

        if (!cancelled) setRecords(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [selectedUserId]);

  const handleDownload = async (record) => {
    setBusyId(record.id);
    setError("");

    try {
      await downloadHistory(record.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (record) => {
    const confirmed = window.confirm(
      `Delete "${record.filename}" (owner: ${record.username ?? "unassigned"})?`,
    );

    if (!confirmed) return;

    setBusyId(record.id);
    setError("");

    try {
      await deleteHistory(record.id);

      setRecords((previous) =>
        previous.filter((item) => item.id !== record.id),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#0b1f3a]">
            Generated files
          </h3>

          <p className="text-sm text-gray-500">
            {records.length} record(s)
          </p>
        </div>

        <select
          value={selectedUserId}
          onChange={(event) =>
            setSelectedUserId(event.target.value)
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#285596]/20"
        >
          <option value="">All users</option>

          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
              {user.is_active ? "" : " (deactivated)"}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="px-5 pt-4">
          <Notice text={error} />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3">Owner</th>
              <th className="px-5 py-3">File</th>
              <th className="px-5 py-3">Entity</th>
              <th className="px-5 py-3">Publication date</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3">Records</th>
              <th className="px-5 py-3">Attributes</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-6 text-center text-gray-500"
                >
                  Loading history...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-6 text-center text-gray-500"
                >
                  No generated files found.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-5 py-3 font-medium text-[#0b1f3a]">
                    {record.username ?? "Unassigned"}
                  </td>

                  <td className="px-5 py-3 text-gray-700">
                    {record.filename}
                  </td>

                  <td className="px-5 py-3 text-gray-600">
                    {record.entity || "—"}
                  </td>

                  <td className="px-5 py-3 text-gray-600">
                    {record.publication_date || "—"}
                  </td>

                  <td className="px-5 py-3 text-gray-600">
                    {formatDate(record.created_at)}
                  </td>

                  <td className="px-5 py-3 text-gray-600">
                    {record.records_count}
                  </td>

                  <td className="px-5 py-3 text-gray-600">
                    {record.attributes_count}
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload(record)}
                        disabled={busyId === record.id}
                        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-[#285596] transition hover:bg-blue-50 disabled:opacity-50"
                      >
                        <Download size={14} />
                        Download
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(record)}
                        disabled={busyId === record.id}
                        className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ============================================================
   ADMIN MANAGEMENT PAGE
============================================================ */

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");

  const loadUsers = async () => {
    setUsersLoading(true);

    try {
      const data = await getAdminUsers();

      setUsers(data);
      setUsersError("");
    } catch (error) {
      setUsersError(error.message);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="min-h-full bg-[#f4f7fb] p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold text-[#0b1f3a]">
          Admin Management
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Create user accounts and review every user's generated history.
        </p>

        {/* TABS */}
        <div className="mt-6 flex gap-2 border-b border-gray-200">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-[#285596] text-[#0b1f3a]"
                    : "border-transparent text-gray-500 hover:text-[#0b1f3a]"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-4">
          <Notice text={usersError} />

          {activeTab === "users" ? (
            <UsersTab
              users={users}
              loading={usersLoading}
              onUsersChanged={loadUsers}
            />
          ) : (
            <HistoryTab users={users} />
          )}
        </div>
      </div>
    </div>
  );
}