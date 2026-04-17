import { Switch, Route, Router as WouterRouter } from "wouter";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import LeadsPage from "@/pages/LeadsPage";
import Layout from "@/components/Layout";

function ProtectedApp() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/leads" component={() => <LeadsPage title="All Leads" />} />
        <Route path="/follow-ups" component={() => <LeadsPage filterFollowUp title="Follow-ups Today" />} />
        <Route path="/hot-leads" component={() => <LeadsPage filterStatus="hot" title="Hot Leads" />} />
        <Route>
          <div className="p-8 text-slate-400">Page not found</div>
        </Route>
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <ProtectedApp />
      </WouterRouter>
    </AuthProvider>
  );
}

export default App;
