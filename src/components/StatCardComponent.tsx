import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { getAccessToken } from "../service/auth";
import ClipLoader from "react-spinners/ClipLoader";
import BarChartWithSummary from "./BarChartWithSummary";
import { useSelector } from "react-redux";
import axios from "axios";
import { relationMapping } from "../utils/relationMapping";

// Define the type for the data
export type StatCardData = {
  title: string;
  queryCount: number;
  percentage: number;
  queries: string[];
  changeType: "increase" | "decrease";
};

// Process the data
export function processStatData(data: any): StatCardData[] {
  const totalQueries = data.reduce(
    (sum: any, item: any) => sum + item.queryCount,
    0
  );

  return data.map((item: any) => {
    const title =
      item.whom && item.whom !== "null"
        ? relationMapping[item.whom]
        : "Unknown";
    const percentage = Math.round((item.queryCount / totalQueries) * 100);

    return {
      title,
      queryCount: item.queryCount,
      percentage,
      queries: item.queries,
      changeType: "increase", // or "decrease" based on your logic
    };
  });
}

const StatCardComponent = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0); // State to track selected card
  const isFetchingRef = useRef<boolean>(false);

  const store = useSelector((state: any) => state.store.store);

  const [statChartData, setStatChartData] = useState<any[]>([]);
  const [rawQueryData, setRawQueryData] = useState<any[]>([]);

  const [searchParams] = useSearchParams();
  const storeCodeFromParams = searchParams.get("storeCode");
  const storeCode = storeCodeFromParams || localStorage.getItem("storeCode");

  const lastHoveredSlice = useRef<string | null>(null);
  const [insightData, setInsightData] = useState<{
    summary: string;
    countMap: Record<string, number>;
  } | null>(null);

  const dateRange = useSelector((state: any) => state.store.dateRange);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedIndex(-1);
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const token = await getAccessToken();
        const BASE_URL = process.env.REACT_APP_SERVER_BASE_URL;

        const res = await axios.get(
          `${BASE_URL}api/customer-enquiries/intent-summary`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            params: {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
              storeCode: storeCode,
            },
          }
        );

        const apiData = res.data || [];

        // Save full data for hover logic
        setRawQueryData(processStatData(apiData));

        setStatChartData(processStatData(apiData));
      } catch (error) {
        console.error("Failed to fetch pie chart data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [storeCode, dateRange.startDate, dateRange.endDate]);

  const handleTileClick = useCallback(
    async (params: any) => {
      const hoveredName = params.name;

      // Don't trigger if it's the same slice or if a request is already in progress
      if (lastHoveredSlice.current === hoveredName || isFetchingRef.current)
        return;

      lastHoveredSlice.current = hoveredName;
      isFetchingRef.current = true;
      setIsLoadingInsight(true);

      const item = rawQueryData.find(
        (d) => (d.title || "unspecified") === hoveredName
      );

      if (!item) {
        setIsLoadingInsight(false);
        isFetchingRef.current = false;
        return;
      }

      const queryString = item.queries.filter(Boolean).join(", ");

      const payload = {
        flowId: "AM6R93FNLL",
        flowAliasId: "QX3N9CA9YV",
        input: queryString,
      };

      try {
        const token = await getAccessToken();
        const BASE_URL = process.env.REACT_APP_SERVER_BASE_URL;

        const res = await axios.post(
          `${BASE_URL}api/summary-bar-chart`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = res.data;
        const event1 = data.outputEvents?.["Event 1"];
        const event2 = data.outputEvents?.["Event 2"];

        const summary = event1?.content || "";
        const countMap: Record<string, number> = {};

        if (event2?.content) {
          const parts = event2.content.split("-");
          parts.forEach((p: string) => {
            const [key, val] = p.split(":");
            countMap[key] = Number(val);
          });
        }

        setInsightData({ summary, countMap });
      } catch (err) {
        console.error("Insight fetch error", err);
      } finally {
        setIsLoadingInsight(false);
        isFetchingRef.current = false;
      }
    },
    [rawQueryData]
  );

  // Circle progress bar style
  const circleProgressStyle = (percentage: number) => {
    const strokeDashoffset = 440 - (440 * percentage) / 100; // Circle length calculation (2 * π * radius)
    return {
      strokeDasharray: 440, // Circumference of the circle (2 * π * 70)
      strokeDashoffset,
    };
  };

  const totalQueryCount = useMemo(() => {
    return statChartData.reduce((sum, stat) => sum + stat.queryCount, 0);
  }, [statChartData]);

  return (
    <>
      {(isLoadingInsight || loading) && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(255, 255, 255, 0.6)",
            padding: "1rem",
            borderRadius: "8px",
            zIndex: 10,
          }}
        >
          <ClipLoader size={35} color="#2B6ECA" />
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "15px",
          alignItems: "flex-end",
          pointerEvents: isLoadingInsight ? "none" : "auto",
          opacity: isLoadingInsight ? 0.5 : 1,
        }}
      >
        {/* Total Shoppers Tile */}
        {!loading && (
          <>
            <div
              style={{
                width: "200px",
                height: "200px",
                border: "1px solid #ddd",
                borderRadius: "12px",
                background: "#e8f5e9", // very light green
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "15px",
                position: "relative",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
                Total Shoppers
              </h3>
              <div
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  alignSelf: "flex-start",
                }}
              >
                {totalQueryCount}
              </div>
              <div></div>
            </div>
            {/* Stat Tiles */}
            {statChartData.map((stat, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedIndex(index);
                  handleTileClick({ name: stat.title });
                }}
                style={{
                  width: "140px",
                  height: "140px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "bottom",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  padding: "15px",
                  position: "relative",
                  background: "#fff",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  border:
                    selectedIndex === index
                      ? `2px solid ${store.tanyaThemeColor}`
                      : "1px solid #ddd",
                }}
              >
                {/* Top section: Title and Progress */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    alignItems: "center",
                    marginBottom: "10px",
                    gap: "5px",
                  }}
                >
                  <h4 style={{ fontSize: "12px", margin: "0" }}>
                    {stat.title}
                  </h4>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <svg
                      width="15"
                      height="15"
                      style={{ transform: "rotate(-90deg)" }}
                      viewBox="0 0 120 120"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="60"
                        cy="60"
                        r="55"
                        stroke={store.tanyaThemeColorLight}
                        strokeWidth="18"
                        fill="none"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="55"
                        stroke={
                          stat.changeType === "increase"
                            ? store.tanyaThemeColor
                            : "#f44336"
                        }
                        strokeWidth="18"
                        fill="none"
                        style={circleProgressStyle(stat.percentage)}
                      />
                    </svg>
                    <span
                      style={{
                        fontSize: "10px",
                        marginLeft: "6px",
                        color: store.tanyaThemeColor,
                      }}
                    >
                      {stat.percentage}%
                    </span>
                  </div>
                </div>

                {/* Count in the middle */}
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    position: "absolute",
                    top: "50%",
                    left: "15px",
                    transform: "translateY(-50%)",
                  }}
                >
                  {stat.queryCount}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      {selectedIndex !== -1 ? (
        <BarChartWithSummary data={insightData} />
      ) : (
        <></>
      )}
    </>
  );
};

export default StatCardComponent;
