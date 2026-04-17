import { useState } from "react";
import { Lead } from "@/lib/supabase";
import { useLeadNotes } from "@/hooks/useLeads";
import { deleteLead } from "@/services/leads";
import { format } from "date-fns";
import StatusBadge from "./StatusBadge";
import LogCallModal from "./LogCallModal";
import LeadModal from "./LeadModal";

interface LeadDetailProps {
  lead: Lead;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
}

export default function LeadDetail({ lead, onClose, onDeleted, onUpdated }: LeadDetailProps) {
  const { notes, loading: notesLoading, refetch } = useLeadNotes(lead.id);
  const [showLogCall, setShowLogCall] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteLead(lead.id);
      onDeleted();
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-start justify-end p-4" onClick={onClose}>
        <div
          className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg h-full max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-slate-800 flex-shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-semibold text-white">{lead.name}</h2>
                <StatusBadge status={lead.status} />
              </div>
              {lead.contact_person && <p className="text-sm text-slate-400">{lead.contact_person}</p>}
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Actions */}
            <div className="flex gap-2 px-6 py-4 border-b border-slate-800">
              <button
                onClick={() => setShowLogCall(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Log Call
              </button>
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="ml-auto flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              ) : (
                <div className="ml-auto flex gap-1">
                  <button onClick={() => setConfirmDelete(false)} className="px-3 py-2 text-slate-400 hover:text-slate-200 rounded-lg text-sm">
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium"
                  >
                    {deleting ? "Deleting..." : "Confirm"}
                  </button>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="px-6 py-4 space-y-3 border-b border-slate-800">
              <div className="grid grid-cols-2 gap-3">
                {lead.phone && (
                  <InfoItem label="Phone" value={lead.phone} icon="📞" />
                )}
                {lead.email && (
                  <InfoItem label="Email" value={lead.email} icon="✉" />
                )}
                {lead.location && (
                  <InfoItem label="Location" value={lead.location} icon="📍" />
                )}
                {lead.website_status && (
                  <InfoItem label="Website" value={lead.website_status} icon="🌐" />
                )}
                {lead.next_follow_up && (
                  <InfoItem label="Next follow-up" value={lead.next_follow_up} icon="📅" />
                )}
                {lead.call_outcome && (
                  <InfoItem label="Last outcome" value={lead.call_outcome} icon="📋" />
                )}
              </div>
              {lead.website_url && (
                <a href={lead.website_url} target="_blank" rel="noopener noreferrer" className="block text-xs text-indigo-400 hover:text-indigo-300 truncate">
                  {lead.website_url}
                </a>
              )}
              {lead.demo_link && (
                <a href={lead.demo_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View demo
                </a>
              )}
            </div>

            {/* Call history */}
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Call History</h3>
              {notesLoading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : notes.length === 0 ? (
                <p className="text-sm text-slate-500">No calls logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {notes.map((note, i) => (
                    <div key={note.id} className="relative pl-5">
                      {i < notes.length - 1 && (
                        <div className="absolute left-1.5 top-5 bottom-0 w-px bg-slate-800" />
                      )}
                      <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-indigo-500 bg-slate-900" />
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                            note.outcome === "Interested" ? "text-green-300 bg-green-500/20" :
                            note.outcome === "Spoke" ? "text-blue-300 bg-blue-500/20" :
                            note.outcome === "Missed" ? "text-red-300 bg-red-500/20" :
                            "text-slate-300 bg-slate-500/20"
                          }`}>
                            {note.outcome}
                          </span>
                          <span className="text-xs text-slate-500">
                            {format(new Date(note.created_at), "MMM d, h:mm a")}
                          </span>
                        </div>
                        {note.content && (
                          <p className="text-sm text-slate-300">{note.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showLogCall && (
        <LogCallModal
          leadId={lead.id}
          leadName={lead.name}
          onClose={() => setShowLogCall(false)}
          onSuccess={() => { refetch(); onUpdated(); }}
        />
      )}

      {showEdit && (
        <LeadModal
          lead={lead}
          onClose={() => setShowEdit(false)}
          onSuccess={onUpdated}
        />
      )}
    </>
  );
}

function InfoItem({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-2.5">
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm text-slate-200 truncate">{value}</p>
    </div>
  );
}
