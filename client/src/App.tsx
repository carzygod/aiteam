import Home from "@/pages/Home";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sparkles, Shield } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-500/20 bg-[#010409]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-emerald-300" />
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-emerald-200">AIGOV</p>
            <p className="text-lg font-semibold text-white">Autonomous Council</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/60">
          <Shield className="h-5 w-5 text-white/70" />
          <span>No Override · Transparent Votes</span>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-[#010409]">
        <Header />
        <Home />
      </div>
    </QueryClientProvider>
  );
}

export default App;
