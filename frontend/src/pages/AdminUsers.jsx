
import { useEffect, useState } from "react";
import {
  Users,
  Search,
  GraduationCap,
  Building2,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import {
  getAllUsers,
  updateUserStatus,
} from "../services/adminService";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const token = localStorage.getItem("careerpilot_token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllUsers(token);
      setUsers(data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role) => {
    if (role === "student") return GraduationCap;
    if (role === "recruiter") return Building2;
    return ShieldCheck;
  };

  const getRoleStyle = (role) => {
    if (role === "student") return "bg-blue-50 text-blue-700";
    if (role === "recruiter") return "bg-violet-50 text-violet-700";
    return "bg-amber-50 text-amber-700";
  };
  const handleUserStatus = async (userId, isActive) => {
  try {
    setUpdatingId(userId);
    setError("");

    const data = await updateUserStatus(userId, isActive, token);

    setUsers((previous) =>
      previous.map((user) =>
        user._id === userId ? { ...user, isActive: data.user.isActive } : user
      )
    );
  } catch (err) {
    setError(
      err.response?.data?.message || "Unable to update user status."
    );
  } finally {
    setUpdatingId(null);
  }
};

  return (
    <DashboardLayout
      title="User Management"
      subtitle="View and manage CareerPilot accounts"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#111C35]">
            Registered Users
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage student, recruiter and administrator accounts.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <Users className="text-violet-600" size={24} />
          <p className="text-sm text-slate-500 mt-3">Total Users</p>
          <h3 className="text-2xl font-bold text-[#111C35] mt-1">
            {loading ? "..." : users.length}
          </h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <GraduationCap className="text-blue-600" size={24} />
          <p className="text-sm text-slate-500 mt-3">Students</p>
          <h3 className="text-2xl font-bold text-[#111C35] mt-1">
            {loading
              ? "..."
              : users.filter((user) => user.role === "student").length}
          </h3>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="recruiter">Recruiters</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 text-red-700 p-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-10 text-center text-slate-500">
          Loading users...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <Users size={36} className="mx-auto text-slate-400" />
          <h3 className="font-bold text-[#111C35] mt-4">
            No users found
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Try changing your search or role filter.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);

                  return (
                    <tr key={user._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#111C35]">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {user.email}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${getRoleStyle(user.role)}`}
                        >
                          <RoleIcon size={14} />
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                            user.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
  {user.role !== "admin" && (
    <button
      onClick={() => handleUserStatus(user._id, !user.isActive)}
      disabled={updatingId === user._id}
      className={`px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 ${
        user.isActive
          ? "bg-red-50 text-red-700 hover:bg-red-100"
          : "bg-green-50 text-green-700 hover:bg-green-100"
      }`}
    >
      {updatingId === user._id
        ? "Updating..."
        : user.isActive
          ? "Deactivate"
          : "Activate"}
    </button>
  )}
</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default AdminUsers;
