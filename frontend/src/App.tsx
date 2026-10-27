import { Routes, Route } from "react-router-dom";
import { EventsPage } from "./pages/EventsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EventsPage />} />
    </Routes>
  );
}