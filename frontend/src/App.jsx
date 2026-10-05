import { BrowserRouter, Route, Routes } from "react-router-dom";

import MetadataGenerator from "./pages/MetadataGenerator";
import History from "./pages/History";
import Help from "./pages/Help";

import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Common Layout */}
        <Route element={<Layout />}>
          
          {/* Home */}
          <Route
            path="/"
            element={<MetadataGenerator />}
          />

          {/* History */}
          <Route
            path="/history"
            element={<History />}
          />

          {/* Help */}
          <Route
            path="/help"
            element={<Help />}
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;