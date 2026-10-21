import { Routes, Route } from "react-router-dom";
import { MotionConfig } from "motion/react";
import Home from "@/pages/Home";
import Finder from "@/pages/Finder";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/sonner";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/encontre-sua-bateria" element={<Finder />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster richColors offset={{ bottom: 96, right: 24 }} />
    </MotionConfig>
  );
}
