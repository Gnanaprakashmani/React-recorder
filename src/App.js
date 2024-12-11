import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./privateRoute";
import AuthUI from "./Auth";
import { ROUTE_CONSTANT } from "./constant/routeConstant";
import AudioRecorderC from "./AudioRecorder";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthUI />} />
        <Route
          path={ROUTE_CONSTANT.RECORD}
          element={
            <ProtectedRoute>
              <AudioRecorderC />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
