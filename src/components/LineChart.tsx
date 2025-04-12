import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { getAccessToken } from "../service/auth";
import { useSearchParams } from "react-router-dom";

type Granularity = "day" | "week" | "month";

interface ChartItem {
  period: string;
  counts: Record<string, number>;
}

const LineChartWithGranularity: React.FC = () => {
  const store = useSelector((state: any) => state.store.store);
  const dateRange = useSelector((state: any) => state.store.dateRange);

  const [granularity, setGranularity] = useState<Granularity>("month");
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const storeCodeFromParams = searchParams.get("storeCode");
  const storeCode = storeCodeFromParams || localStorage.getItem("storeCode");

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      const BASE_URL = process.env.REACT_APP_SERVER_BASE_URL;

      const res = await axios.get(
        `${BASE_URL}api/customer-enquiries/intent-timeline`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          params: {
            storeCode,
            granularity,
            startDate: dateRange?.startDate,
            endDate: dateRange?.endDate,
          },
        }
      );
      // Safely parse and normalize data if needed
      const parsedData = res?.data || [];
      setChartData(parsedData);
    } catch (err) {
      console.error("Error fetching chart data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [granularity, dateRange]);

  const xAxisData = chartData.map((item) => item.period);
  const keys = chartData.length ? Object.keys(chartData[0].counts) : [];

  const series = keys.map((key) => ({
    name: key.replace(/["']/g, ""),
    type: "line" as const,
    data: chartData.map((item) => item.counts[key] || 0),
    smooth: false,
  }));

  const option = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      top: 10,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category" as const,
      data: xAxisData,
    },
    yAxis: {
      type: "value" as const,
    },
    series,
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        {["day", "week", "month"].map((g) => (
          <label key={g} style={{ marginRight: 12 }}>
            <input
              type="radio"
              name="granularity"
              value={g}
              checked={granularity === g}
              onChange={() => setGranularity(g as Granularity)}
            />{" "}
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </label>
        ))}
      </div>
      {loading ? (
        <p>Loading chart...</p>
      ) : (
        <ReactECharts option={option} style={{ height: "400px" }} />
      )}
    </div>
  );
};

export default LineChartWithGranularity;
