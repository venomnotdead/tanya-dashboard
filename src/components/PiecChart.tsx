import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactECharts from "echarts-for-react";
import BarChartWithSummary from "./BarChartWithSummary";
import { useSelector } from "react-redux";
import axios from "axios";
import { NavLink, useSearchParams } from "react-router-dom";
import { getAccessToken } from "../service/auth";
import ClipLoader from "react-spinners/ClipLoader";

// Sample JSON response data
const sampleData = [
  {
    whom: "",
    queries: [
      "show me necklaces",
      "earrings",
      "show me earrings",
      "show me necklaces",
      "hi 1",
      "hi 2",
    ],
    queryCount: 6,
  },
  {
    whom: "other",
    queries: [
      "earrings",
      "earrings",
      "Are there any clip-on earring options?",
      "earrings",
      "Are there matching necklace and earring sets available?",
      "Can I find matching earrings for a specific necklace?",
      "What factors should I consider when selecting earrings to match a necklace?",
    ],
    queryCount: 7,
  },
  { whom: "null", queries: [""], queryCount: 1 },
  {
    whom: "myfriends",
    queries: [
      "earrings",
      "Are there any hypoallergenic earring options available?",
      "earrings",
      "earrings",
      "bag",
      "toys ",
      "head bands",
      "diamond rings ",
      "can you tell me what are the products previously I have searched",
      "bags",
      "Are there any bags specifically designed for kids?",
      "earrings ",
      "toys",
      "tell my previous searches",
      "no idea on my previous searches?",
      "remember I was searching for toys?",
      "what else was I looking for?",
      "show me some hair clips",
      "What are the most popular hair accessories for teens?",
      "What are the latest trends in hair accessories for teens?",
      "What are the latest trends in hair accessories for younger kids?",
      "Are there any eco-friendly options for children's hair accessories?",
      "What are the most popular hair accessories for girls aged 5-10?",
    ],
    queryCount: 23,
  },
  {
    whom: "mychild",
    queries: [
      "Hi Claire, do have any cool jewelry for Easter?",
      "Do you have any bunny or egg-shaped jewelry?",
      "do you anything like this for grownups ",
      "can you tell me what is trendy among 2-6 year old girls",
      "can you recommend current trending jewelry ",
      "Do you have any recommendations for trendy hoop earrings?",
      "are their trendy jewelry for prom",
      "Do you have any matching jewelry sets for prom?",
      "necklaces",
      "earrings",
      "show me some shoes ",
      "What kind of jewelry accessories are available?",
      "What types of hoops earrings are available?",
      "What are some popular trends in hoops earrings?",
      "Are there any new styles of charm hoops?",
      "show some rings?",
    ],
    queryCount: 16,
  },
  {
    whom: "myself",
    queries: [
      "show me toys",
      "show me ring",
      "show me nose ring",
      "tell me what are the things i previously looked for",
      "show me nose ring",
      "show some earrings?",
    ],
    queryCount: 6,
  },
  { whom: "niece-nephew", queries: ["earrings"], queryCount: 1 },
  { whom: "child", queries: ["show me necklaces"], queryCount: 1 },
];

// Prepare chart data
const chartData = sampleData.map((item) => ({
  value: item.queryCount,
  name: item.whom || "unspecified",
}));

const moakcInsightData = {
  executionId: "11d80a6b-8534-47f9-812c-206cff1327e6",
  flowStatus: "SUCCESS",
  outputEvents: {
    "Event 1": {
      eventName: "SummaryOutputNode",
      content:
        "The customer inquiries primarily focus on fashion and accessories, with multiple requests spanning different wearable categories. Clothing and accessories appear to be the dominant interest, especially footwear and shirts, along with jewelry in the form of earrings. Toys represent another distinct category of interest. There's also an isolated food-related query about pizza, specifically regarding size options, though this appears to be less prominent in the overall pattern of inquiries. Overall, the questions suggest a stronger emphasis on personal fashion items with a secondary interest in entertainment products and occasional food queries.",
    },
    "Event 2": {
      eventName: "CountOutputNode",
      content: "jewelry:1-toys:1-clothing:2-food:1",
    },
  },
};

const PieChartComponent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const storeCodeFromParams = searchParams.get("storeCode");
  const storeCode = storeCodeFromParams || localStorage.getItem("storeCode");
  const isFetchingRef = useRef<boolean>(false); // NEW

  const lastHoveredSlice = useRef<string | null>(null);
  const [insightData, setInsightData] = useState<{
    summary: string;
    countMap: Record<string, number>;
  } | null>(null);

  const [pieChartData, setPieChartData] = useState<any[]>([]);
  const [rawQueryData, setRawQueryData] = useState<any[]>([]); // store raw data for querying
  const store = useSelector((state: any) => state.store.store);
  const dateRange = useSelector((state: any) => state.store.dateRange);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  console.log(dateRange,'%%%%%%%%%5')

  useEffect(() => {
    const fetchChartData = async () => {
      try {
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
        setRawQueryData(apiData);

        // Transform into pie data format
        const formattedChartData = apiData.map((item: any) => ({
          value: item.queryCount,
          name: item.whom || "unspecified",
        }));

        setPieChartData(formattedChartData);
      } catch (error) {
        console.error("Failed to fetch pie chart data", error);
      }
    };

    fetchChartData();
  }, [storeCode, dateRange.startDate, dateRange.endDate]);

  const handleSliceClick = useCallback(
    async (params: any) => {
      const hoveredName = params.name;

      // Don't trigger if it's the same slice or if a request is already in progress
      if (lastHoveredSlice.current === hoveredName || isFetchingRef.current)
        return;

      lastHoveredSlice.current = hoveredName;
      isFetchingRef.current = true;
      setIsLoadingInsight(true);

      const item = rawQueryData.find(
        (d) => (d.whom || "unspecified") === hoveredName
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

  const option = useMemo(
    () => ({
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        show: true,
      },
      series: [
        {
          name: "Queries",
          type: "pie",
          radius: "50%",
          data: pieChartData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          label: {
            fontSize: 14,
            formatter: "{b} ({c}, {d}%)",
          },
        },
      ],
    }),
    [pieChartData]
  );

  return (
    <>
      <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto", position: "relative" }}>
        <ReactECharts
          option={option}
          style={{ height: "400px", width: "100%" }}
          onEvents={{
            click: handleSliceClick,
          }}
        />
  
        {isLoadingInsight && (
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
      </div>
  
      <BarChartWithSummary data={insightData} />
    </>
  );
};

export default PieChartComponent;
