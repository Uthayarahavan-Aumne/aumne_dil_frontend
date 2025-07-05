
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProjectList from "./pages/ProjectList";
import ProjectOverview from "./pages/ProjectOverview";
import ProjectFiles from "./pages/ProjectFiles";
import ProjectDataInput from "./pages/ProjectDataInput";
import ProjectDataProcessing from "./pages/ProjectDataProcessing";
import ProjectKBConfiguration from "./pages/ProjectKBConfiguration";
import ProjectSettings from "./pages/ProjectSettings";
import TestPage from "./pages/TestPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/:projectKey" element={<ProjectOverview />} />
          <Route path="/projects/:projectKey/files" element={<ProjectFiles />} />
          <Route path="/projects/:projectKey/data-input" element={<ProjectDataInput />} />
          <Route path="/projects/:projectKey/data-processing" element={<ProjectDataProcessing />} />
          <Route path="/projects/:projectKey/kb-configuration" element={<ProjectKBConfiguration />} />
          <Route path="/projects/:projectKey/settings" element={<ProjectSettings />} />
          <Route path="/test" element={<TestPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
