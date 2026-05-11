import { useEffect, useState, type FormEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { api, type RequestDetail } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";

const VALID_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: ["IN_PROGRESS"],
  IN_PROGRESS: ["DONE"],
  REJECTED: [],
  DONE: [],
};

const ACTION_LABELS: Record<string, string> = {
  UNDER_REVIEW: "Start Review",
  APPROVED: "Approve",
  REJECTED: "Reject",
  IN_PROGRESS: "Start Work",
  DONE: "Mark Done",
};

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [transitioning, setTransitioning] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getRequest(id)
      .then(setRequest)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleTransition(newStatus: string) {
    if (!id) return;
    setTransitioning(newStatus);
    try {
      const updated = await api.getRequest(id);
      const transitioned = await api.transitionStatus(id, newStatus);
      setRequest({
        ...updated,
        status: transitioned.status,
        assignee: transitioned.assignee,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setTransitioning("");
    }
  }

  async function handleComment(e: FormEvent) {
    e.preventDefault();
    if (!id || !comment.trim()) return;
    setSubmittingComment(true);
    try {
      const newComment = await api.addComment(id, comment);
      setRequest((prev) =>
        prev ? { ...prev, comments: [...prev.comments, newComment] } : prev,
      );
      setComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-400">Loading…</div>;
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Request not found</p>
        <Link to="/" className="text-indigo-600 text-sm mt-2 inline-block">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const transitions = VALID_TRANSITIONS[request.status] || [];
  const canTransition =
    user?.role === "ADMIN" || user?.role === "REVIEWER";

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/"
        className="text-sm text-indigo-600 hover:text-indigo-700 mb-4 inline-block"
      >
        &larr; Back to dashboard
      </Link>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">{request.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <PriorityBadge priority={request.priority} />
              <StatusBadge status={request.status} />
              <span className="text-sm text-gray-500">{request.category}</span>
            </div>
          </div>
        </div>

        <p className="text-gray-700 whitespace-pre-wrap mb-6">
          {request.description}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
          <div>
            <span className="text-gray-500">Requested by:</span>{" "}
            <span className="font-medium">{request.requester.name}</span>
          </div>
          <div>
            <span className="text-gray-500">Assigned to:</span>{" "}
            <span className="font-medium">
              {request.assignee?.name || "Unassigned"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Created:</span>{" "}
            {new Date(request.createdAt).toLocaleString()}
          </div>
          <div>
            <span className="text-gray-500">Updated:</span>{" "}
            {new Date(request.updatedAt).toLocaleString()}
          </div>
        </div>

        {/* Status transitions */}
        {canTransition && transitions.length > 0 && (
          <div className="border-t mt-4 pt-4">
            <p className="text-sm text-gray-500 mb-2">Actions:</p>
            <div className="flex gap-2">
              {transitions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleTransition(status)}
                  disabled={transitioning === status}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    status === "REJECTED"
                      ? "bg-red-50 text-red-700 hover:bg-red-100"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  } disabled:opacity-50`}
                >
                  {transitioning === status
                    ? "…"
                    : ACTION_LABELS[status] || status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Comments ({request.comments.length})
        </h2>

        {request.comments.length === 0 ? (
          <p className="text-gray-400 text-sm mb-4">No comments yet</p>
        ) : (
          <div className="space-y-4 mb-6">
            {request.comments.map((c) => (
              <div key={c.id} className="border-l-2 border-gray-200 pl-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{c.author.name}</span>
                  <span className="text-gray-400">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 text-sm mt-1">{c.body}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleComment} className="flex gap-3">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={submittingComment || !comment.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {submittingComment ? "…" : "Comment"}
          </button>
        </form>
      </div>
    </div>
  );
}
