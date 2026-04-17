import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { useLeads } from "@/hooks/useLeads";
import { Lead, LeadStatus } from "@/lib/supabase";
import { format } from "date-fns";
import { isToday, isPast, parseISO } from "date-fns";
import StatusBadge from "@/components/StatusBadge";
import LeadDetail from "@/components/LeadDetail";
import LeadModal from "@/components/LeadModal";
import LogCallModal from "@/components/LogCallModal";

interface LeadsPageProps {
  filterStatus?: LeadStatus;
  filterFollowUp?: boolean;
  title?: string;
}

export default function LeadsPage({ filterStatus, filterFollowUp, title = "All Leads" }: LeadsPageProps) {
  const { leads, loading, refetch } = useLeads();
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showNewLead, setShowNewLead] = useState(false);
  const [logCallFor, setLogCallFor] = useState<Lead | null>(null);
  const searchString = useSearch();

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const openId = params.get("open");
    if (openId && leads.length > 0) {
      const lead = leads.find((l) => l.id === openId);
      if (lead) setSelectedLead(lead);
    }
  }, [searchString, leads]);

  const filtered = leads.filter((lead) => {
    if (filterStatus && lead.status !== filterStatus) return false;
    if (filterFollowUp) {
      if (!lead.next_follow_up) return false;
      const date = parseISO(lead.next_follow_up);
      if (!isToday(date)) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        lead.name.toLowerCase().includes(q) ||
        (lead.contact_person?.toLowerCase().includes(q) ?? false) ||
        (lead.phone?.includes(q) ?? false) ||
        (lead.email?.toLowerCase().includes(q) ?? false) ||
        (lead.location?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const isOverdue = (dateStr: string | null) => {
    if (!dateStr) return false;
    return isPast(parseISO(dateStr)) && !isToday(parseISO(dateStr));
  };

  return (
    <>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            <p className="text-slate-400 text-sm mt-1">{filtered.length} leads</p>
          </div>
          <button
            onClick={() => setShowNewLead(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Lead
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="px-6 py-12 text-center text-slate-500 text-sm">Loading leads...</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-400 text-sm font-medium">No leads found</p>
              {!filterStatus && !filterFollowUp && (
                <button
                  onClick={() => setShowNewLead(true)}
                  className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Add your first lead
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs font-medium text-slate-500 px-5 py-3">Company</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3 hidden sm:table-cell">Contact</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3 hidden md:table-cell">Phone</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3 hidden lg:table-cell">Follow-up</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-3 hidden lg:table-cell">Last outcome</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">{lead.name}</p>
                        {lead.location && <p className="text-xs text-slate-500 mt-0.5">{lead.location}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <p className="text-sm text-slate-300">{lead.contact_person ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-slate-300">{lead.phone ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      {lead.next_follow_up ? (
                        <span className={`text-xs font-medium ${
                          isToday(parseISO(lead.next_follow_up)) ? "text-yellow-400" :
                          isOverdue(lead.next_follow_up) ? "text-red-400" :
                          "text-slate-400"
                        }`}>
                          {isToday(parseISO(lead.next_follow_up)) ? "Today" : format(parseISO(lead.next_follow_up), "MMM d")}
                          {isOverdue(lead.next_follow_up) && " (overdue)"}
                        </span>
                      ) : <span className="text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-slate-400">{lead.call_outcome ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); setLogCallFor(lead); }}
                        className="opacity-0 group-hover:opacity-100 px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-indigo-400 hover:text-white rounded-lg text-xs font-medium transition-all"
                      >
                        Log Call
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedLead && (
        <LeadDetail
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onDeleted={() => { setSelectedLead(null); refetch(); }}
          onUpdated={() => refetch()}
        />
      )}

      {showNewLead && (
        <LeadModal
          onClose={() => setShowNewLead(false)}
          onSuccess={refetch}
        />
      )}

      {logCallFor && (
        <LogCallModal
          leadId={logCallFor.id}
          leadName={logCallFor.name}
          onClose={() => setLogCallFor(null)}
          onSuccess={refetch}
        />
      )}
    </>
  );
}
