import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type RequestItem } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";

const STATUSES = [
  "",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "IN_PROGRESS",
  "DONE",
];

const STATUS_LABELS: Record<string, string> = {
  "": "All Statuses",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [criticalCount, setCriticalCount] = useState(0);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    if (categoryFilter) params.category = categoryFilter;
    if (sortBy) params.sort = sortBy;

    setLoading(true);
    api
      .listRequests(params)
      .then(setRequests)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter, priorityFilter, categoryFilter, sortBy]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    api
      .listRequests({})
      .then((all) => {
        const count = all.filter(
          (r) => r.priority === 'CRITICAL' && r.status === 'SUBMITTED'
        ).length;
        setCriticalCount(count);
      })
      .catch(console.error);
  }, [user]);

  return (
    <div>
      {user?.role === 'ADMIN' && criticalCount > 0 && (
        <div
          data-testid="critical-banner"
          className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800"
        >
          ⚠️ {criticalCount} critical request(s) awaiting review
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Feature Requests</h1>
        <Link
          to="/requests/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          + New Request
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="status-filter"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="priority-filter"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Priority
            </label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="category-filter"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Category
            </label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              <option value="FRONTEND">Frontend</option>
              <option value="BACKEND">Backend</option>
              <option value="INFRASTRUCTURE">Infrastructure</option>
              <option value="DATA">Data</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="sort-by"
              className="block text-xs font-medium text-gray-500 mb-1"
            >
              Sort By
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Request list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading…</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No requests found
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg divide-y">
          {requests.map((r) => (
            <Link
              key={r.id}
              to={`/requests/${r.id}`}
              className="block px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <PriorityBadge priority={r.priority} />
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {r.title}
                    </h3>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                    <span>{r.requester.name}</span>
                    <span>{r.category}</span>
                    <span>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                    {r._count && r._count.comments > 0 && (
                      <span>{r._count.comments} comments</span>
                    )}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
