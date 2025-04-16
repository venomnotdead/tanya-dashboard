import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layout/DashboardLayout";
import GeoHeatmap from "./components/GeoChart";
import LineChartWithGranularity from "./components/LineChart";
import PieChartComponent from "./components/PiecChart";
import PushNotificationStatus from "./components/PushNotificationStatus";
import PlatformOsDistribution from "./components/PlatformOsDistribution"
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
          <Route path="/push-notification" element={<PushNotificationStatus />} />
          <Route path="/platform-os-distribution" element={<PlatformOsDistribution />} />
        </Routes>
      </DashboardLayout>
    </Provider>
  );
}

export default App;
