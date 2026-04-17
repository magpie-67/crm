import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getDashboardStats, getTodayFollowUps } from "@/services/leads";
import { Lead } from "@/lib/supabase";
import StatusBadge from "@/components/StatusBadge";

interface Stats {
  callsToday: number;
  followUpsToday: number;
  hotLeads: number;
  totalLeads: number;
}

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [followUps, setFollowUps] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getTodayFollowUps()]).then(([s, f]) => {
      setStats(s);
      setFollowUps(f);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Calls Today"
          value={loading ? "—" : stats?.callsToday ?? 0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          }
          color="indigo"
        />
        <StatCard
          label="Follow-ups Due"
          value={loading ? "—" : stats?.followUpsToday ?? 0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="yellow"
        />
        <StatCard
          label="Hot Leads"
          value={loading ? "—" : stats?.hotLeads ?? 0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          label="Total Leads"
          value={loading ? "—" : stats?.totalLeads ?? 0}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          color="slate"
        />
      </div>

      {/* Today's Follow-ups */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-white">Today's Follow-ups</h2>
          {followUps.length > 0 && (
            <button
              onClick={() => navigate("/follow-ups")}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View all
            </button>
          )}
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-slate-500 text-sm">Loading...</div>
        ) : followUps.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-slate-400 text-sm font-medium">All caught up!</p>
            <p className="text-slate-500 text-xs mt-1">No follow-ups due today.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {followUps.map((lead) => (
              <div
                key={lead.id}
                onClick={() => navigate(`/leads?open=${lead.id}`)}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{lead.name}</p>
                  <p className="text-xs text-slate-400 truncate">{lead.contact_person ?? lead.phone ?? lead.email ?? ""}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <StatusBadge status={lead.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: ReactNode; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: "text-indigo-400 bg-indigo-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
    green: "text-green-400 bg-green-500/10",
    slate: "text-slate-400 bg-slate-500/10",
  };
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3 ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

type ReactNode = import("react").ReactNode;
