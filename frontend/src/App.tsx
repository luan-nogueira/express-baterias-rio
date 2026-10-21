import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Finder from "@/pages/Finder";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/sonner";

// The admin panel (tables, charts, importer) stays out of the public bundle.
const Admin = lazy(() => import("@/pages/Admin"));

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/encontre-sua-bateria" element={<Finder />} />
        <Route path="/admin" element={<Suspense fallback={null}><Admin /></Suspense>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster richColors offset={{ bottom: 96, right: 24 }} />
    </>
  );
}
