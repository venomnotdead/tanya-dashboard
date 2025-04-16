import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  LineChart,
  Map,
  ChartPie,
  Files,
  Bell,
  ChevronDown,
  Calendar,
  Clock,
  CircleDashed,
} from "lucide-react";
import "./DashboardLayout.css";
import { NavLink, useSearchParams } from "react-router-dom";
import { getTheme } from "../service/theme";
import { useDispatch, useSelector } from "react-redux";
import { fetchStoreConfig } from "../service/api";
import { setStore } from "../store/reducer/storeReducer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import DateRangePickerDropdown from "../ui/calenderDatePicker";
import { fetchStoreAssets } from "../store/reducer/cmsReducer";
import type { AppDispatch } from "../store";
import { RootState } from "../store";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  // const [activeSeason, setActiveSeason] = useState("All Seasons");
  // const [activeTimeframe, setActiveTimeframe] = useState("6 Months");
  const dispatch: AppDispatch = useDispatch()
  const [searchParams] = useSearchParams();

  const cms = useSelector(
    (state: RootState) => state.cmsImage
  );
  const store = useSelector(
    (state: RootState) => state.store
  );


  useEffect(() => {
    const storeCodeFromParams = searchParams.get("storeCode");
    const storeCode = storeCodeFromParams || localStorage.getItem("storeCode");

    if (storeCode) {
      dispatch(fetchStoreAssets(storeCode));

      localStorage.setItem("storeCode", storeCode); // Optional: keep it in sync
      fetchStoreConfig(storeCode).then((res) => {
        dispatch(setStore({ ...res, storeCode }));
      });
    }
  }, [searchParams, dispatch]);

  return (
    <div>
      <div
        className="dashboard-header"
        style={{ backgroundColor: store?.store?.themeColor || "#553D94" }}
      >
        <div>
          <div>
            <img src={cms?.logo || ""} alt="Logo" className="logo" />
          </div>
        </div>
      </div>
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="sidebar">
          {/* <div className="sidebar-top">
            <div className="logo">claire's</div>
          </div> */}
          <NavLink
             to="/stat-chart"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <ChartPie size={20} />
          </NavLink>

          <NavLink
            to="/line-chart"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <LineChart size={20} />
          </NavLink>

          <NavLink
            to="/geo-map"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <Map size={20} />
          </NavLink>

          <NavLink
            to="/push-notification"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <Files size={20} />
          </NavLink>
          <NavLink
            to="/platform-os-distribution"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <CircleDashed size={20} />
          </NavLink>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          {/* Header */}
          <header className="header">
            <div className="header-left">
              <h1 className="page-title">Dashboard</h1>
            </div>
            <div className="header-right">
              {/* <div className="dropdown">
                <button
                  className="btn btn-outline"
                  style={{ fontSize: "10px" }}
                >
                  <span>{activeSeason}</span>
                  <ChevronDown size={16} />
                </button>
              </div> */}
              <DateRangePickerDropdown/>
              {/* <div className="dropdown">
                <button
                  className="btn btn-outline"
                  style={{ fontSize: "10px" }}
                >
                  <Clock size={16} />
                  <span>{activeTimeframe}</span>
                  <ChevronDown size={16} />
                </button>
              </div> */}
            </div>
          </header>

          {cms?.loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="dashboard-content">{children}</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
