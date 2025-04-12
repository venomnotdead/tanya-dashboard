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
import { useDispatch } from "react-redux";
import { fetchStoreConfig } from "../service/api";
import { setStore } from "../store/reducer/storeReducer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import DateRangePickerDropdown from "../ui/calenderDatePicker";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  // const [activeSeason, setActiveSeason] = useState("All Seasons");
  // const [activeTimeframe, setActiveTimeframe] = useState("6 Months");
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<any>({});

  const getThemeFunc = async () => {
    const themeData = await getTheme("claires");
    setTheme(themeData);
    setLoading(false);
  };

  useEffect(() => {
    const storeCodeFromParams = searchParams.get("storeCode");
    const storeCode = storeCodeFromParams || localStorage.getItem("storeCode");

    if (storeCode) {
      localStorage.setItem("storeCode", storeCode); // Optional: keep it in sync
      fetchStoreConfig(storeCode).then((res) => {
        console.log("********", res);
        dispatch(setStore({ ...res, storeCode }));
      });
    }
    getThemeFunc();
  }, [searchParams, dispatch]);

  return (
    <div>
      <div
        className="dashboard-header"
        style={{ backgroundColor: theme?.themeColor || "#553D94" }}
      >
        <div>
          <div>
            {theme?.logoTransparent ? (
              <img src={theme?.logoTransparent} alt="Logo" className="logo" />
            ) : (
              <div className="logo-text">claire's</div>
            )}
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
            to="/pie-chart"
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

          {/* <NavLink
            to="/persona"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <Files size={20} />
          </NavLink> */}
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

          {loading ? (
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
