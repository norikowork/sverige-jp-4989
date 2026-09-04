import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import PostDetail from "./pages/PostDetail";
import ForumPage from "./pages/ForumPage";
import ForumTopicDetail from "./pages/ForumTopicDetail";
import ResetPassword from "./pages/ResetPassword";
import Messages from "./pages/Messages";
import Help from "./pages/Help";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Safety from "./pages/Safety";
import Prohibited from "./pages/Prohibited";
import Scams from "./pages/Scams";
import ScamsAvoiding from "./pages/ScamsAvoiding";
import ScamsIdentifying from "./pages/ScamsIdentifying";
import ScamsReporting from "./pages/ScamsReporting";
import ScamsEmailExamples from "./pages/ScamsEmailExamples";
import ScamsPhoneExamples from "./pages/ScamsPhoneExamples";
import ScamsPhishing from "./pages/ScamsPhishing";
import PasswordResetHelp from "./pages/PasswordResetHelp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/post/:postId" element={<PostDetail />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/forum/:id" element={<ForumTopicDetail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/help" element={<Help />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/prohibited" element={<Prohibited />} />
          <Route path="/scams" element={<Scams />} />
          <Route path="/scams/avoiding" element={<ScamsAvoiding />} />
          <Route path="/scams/identifying" element={<ScamsIdentifying />} />
          <Route path="/scams/reporting" element={<ScamsReporting />} />
          <Route path="/scams/email-examples" element={<ScamsEmailExamples />} />
          <Route path="/scams/phone-examples" element={<ScamsPhoneExamples />} />
          <Route path="/scams/phishing" element={<ScamsPhishing />} />
          <Route path="/help/password-reset" element={<PasswordResetHelp />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
