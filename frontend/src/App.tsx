import { Routes, Route } from "react-router-dom";
import { EventsPage } from "./pages/EventsPage";
import { NewEventPage } from "./pages/NewEventPage";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<EventsPage />} />
      </Route>
      <Route path="/events/new" element={<NewEventPage/>} />
    </Routes>
  );
}