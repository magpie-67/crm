import { useState } from "react";
import { Lead, LeadStatus } from "@/lib/supabase";
import { createLead, updateLead } from "@/services/leads";

interface LeadModalProps {
  lead?: Lead | null;
  onClose: () => void;
  onSuccess: () => void;
}

const statusOptions: LeadStatus[] = ["new", "contacted", "follow-up", "hot", "closed"];

export default function LeadModal({ lead, onClose, onSuccess }: LeadModalProps) {
  const [form, setForm] = useState({
    name: lead?.name ?? "",
    contact_person: lead?.contact_person ?? "",
    location: lead?.location ?? "",
    phone: lead?.phone ?? "",
    email: lead?.email ?? "",
    website_status: lead?.website_status ?? "",
    website_url: lead?.website_url ?? "",
    status: (lead?.status ?? "new") as LeadStatus,
    demo_link: lead?.demo_link ?? "",
    next_follow_up: lead?.next_follow_up ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (lead) {
        await updateLead(lead.id, form);
      } else {
        await createLead({
          ...form,
          last_call: null,
          call_outcome: null,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save lead");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, field, type = "text", placeholder = "" }: { label: string; field: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        value={(form as Record<string, string>)[field]}
        onChange={set(field)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 flex-shrink-0">
          <h2 className="text-base font-semibold text-white">{lead ? "Edit Lead" : "New Lead"}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Company name *" field="name" placeholder="Acme Corp" />
            <InputField label="Contact person" field="contact_person" placeholder="John Smith" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Phone" field="phone" type="tel" placeholder="+1 555 000 0000" />
            <InputField label="Email" field="email" type="email" placeholder="john@acme.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Location" field="location" placeholder="New York, NY" />
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={set("status")}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Website status" field="website_status" placeholder="No website" />
            <InputField label="Website URL" field="website_url" type="url" placeholder="https://acme.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField label="Demo link" field="demo_link" type="url" placeholder="https://demo.link" />
            <InputField label="Next follow-up" field="next_follow_up" type="date" />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </form>

        <div className="flex gap-3 px-6 py-4 border-t border-slate-800 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim() || loading}
            className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? "Saving..." : lead ? "Update Lead" : "Create Lead"}
          </button>
        </div>
      </div>
    </div>
  );
}
