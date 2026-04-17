import { cn } from "@/lib/utils";
import { LeadStatus } from "@/lib/supabase";

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
  contacted: { label: "Contacted", className: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  "follow-up": { label: "Follow-up", className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  hot: { label: "Hot", className: "bg-green-500/20 text-green-300 border-green-500/30" },
  closed: { label: "Closed", className: "bg-slate-600/20 text-slate-400 border-slate-600/30" },
};

export default function StatusBadge({ status }: { status: LeadStatus }) {
  const config = statusConfig[status] ?? statusConfig["new"];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", config.className)}>
      {config.label}
    </span>
  );
}
