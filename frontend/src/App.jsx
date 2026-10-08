import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import MetadataGenerator from "./pages/MetadataGenerator";
import History from "./pages/History";
import Help from "./pages/Help";
import Login from "./pages/Login";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Protected */}
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
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;