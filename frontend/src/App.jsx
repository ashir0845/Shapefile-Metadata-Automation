import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import MetadataGenerator from "./pages/MetadataGenerator";
import History from "./pages/History";
import Help from "./pages/Help";
import Login from "./pages/Login";
import AdminPanel from "./pages/AdminPanel";

import Layout from "./components/metadatagenerator/Layout";
import ProtectedRoute from "./components/metadatagenerator/ProtectedRoute";
import AdminRoute from "./components/metadatagenerator/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Protected (any logged-in user) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route
              path="/"
              element={<MetadataGenerator />}
            />

            <Route
              path="/history"
              element={<History />}
            />

            <Route
              path="/help"
              element={<Help />}
            />

            {/* Admin only */}
            <Route element={<AdminRoute />}>
              <Route
                path="/admin"
                element={<AdminPanel />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;