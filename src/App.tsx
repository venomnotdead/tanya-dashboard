import { Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import GeoHeatmap from "./components/GeoChart";
import LineChartWithGranularity from "./components/LineChart";
import PieChartComponent from "./components/PiecChart";
import { Provider } from "react-redux";
import store from "./store";

function App() {
  return (
    <Provider store={store}>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/pie-chart" />} />
          <Route path="/pie-chart" element={<PieChartComponent />} />
          <Route path="/line-chart" element={<LineChartWithGranularity />} />
          <Route path="/geo-map" element={<GeoHeatmap />} />
          {/* <Route path="/persona" element={<PersonaPage />} /> */}
        </Routes>
      </DashboardLayout>
    </Provider>
  );
}

export default App;
