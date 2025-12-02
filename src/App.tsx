import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Layouts
import { ParentLayout } from "@/components/layout/ParentLayout";
import { CreatorLayout } from "@/components/layout/CreatorLayout";

// Pages
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import ParentHome from "./pages/parent/Home";
import Diary from "./pages/parent/Diary";
import DiaryNew from "./pages/parent/DiaryNew";
import StrategyDetail from "./pages/parent/StrategyDetail";
import Profile from "./pages/parent/Profile";
import CreatorDashboard from "./pages/creator/Dashboard";
import CreatorStrategies from "./pages/creator/Strategies";
import StrategyForm from "./pages/creator/StrategyForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Parent Routes */}
            <Route element={<ParentLayout />}>
              <Route path="/home" element={<ParentHome />} />
              <Route path="/diary" element={<Diary />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            
            {/* Parent routes without bottom nav */}
            <Route path="/diary/new" element={<DiaryNew />} />
            <Route path="/strategy/:id" element={<StrategyDetail />} />

            {/* Creator Routes */}
            <Route element={<CreatorLayout />}>
              <Route path="/creator" element={<CreatorDashboard />} />
              <Route path="/creator/strategies" element={<CreatorStrategies />} />
              <Route path="/creator/strategy/new" element={<StrategyForm />} />
              <Route path="/creator/strategy/edit/:id" element={<StrategyForm />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
