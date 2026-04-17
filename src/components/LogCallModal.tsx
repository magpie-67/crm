import { useState } from "react";
import { logCall } from "@/services/leads";
import { CallOutcome } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface LogCallModalProps {
  leadId: string;
  leadName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const outcomes: CallOutcome[] = ["No Answer", "Missed", "Spoke", "Interested"];

const outcomeColors: Record<CallOutcome, string> = {
  "No Answer": "bg-slate-500/20 text-slate-300 border-slate-500/40 data-[selected=true]:bg-slate-500/40 data-[selected=true]:border-slate-400",
  "Missed": "bg-red-500/20 text-red-300 border-red-500/40 data-[selected=true]:bg-red-500/40 data-[selected=true]:border-red-400",
  "Spoke": "bg-blue-500/20 text-blue-300 border-blue-500/40 data-[selected=true]:bg-blue-500/40 data-[selected=true]:border-blue-400",
  "Interested": "bg-green-500/20 text-green-300 border-green-500/40 data-[selected=true]:bg-green-500/40 data-[selected=true]:border-green-400",
};

export default function LogCallModal({ leadId, leadName, onClose, onSuccess }: LogCallModalProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<CallOutcome | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutcome) return;
    setLoading(true);
    setError(null);
    try {
      await logCall(leadId, selectedOutcome, note);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log call");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white">Log Call</h2>
            <p className="text-sm text-slate-400 mt-0.5">{leadName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Call outcome</label>
            <div className="grid grid-cols-2 gap-2">
              {outcomes.map((outcome) => (
                <button
                  key={outcome}
                  type="button"
                  data-selected={selectedOutcome === outcome}
                  onClick={() => setSelectedOutcome(outcome)}
                  className={cn(
                    "px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left",
                    outcomeColors[outcome]
                  )}
                >
                  {outcome}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add call notes..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedOutcome || loading}
              className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Saving..." : "Log Call"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
