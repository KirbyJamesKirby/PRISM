import { Routes, Route } from "react-router-dom";
import { FleetDashboard } from "./pages/FleetDashboard";
import { SiteDetail } from "./pages/SiteDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FleetDashboard />} />
      <Route path="/sites/:siteId" element={<SiteDetail />} />
    </Routes>
  );
}
