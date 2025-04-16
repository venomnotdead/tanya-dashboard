import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import { ScatterChart } from "echarts/charts";
import {
  TooltipComponent,
  GeoComponent,
  TitleComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import axios from "axios";
import { getAccessToken } from "../service/auth";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

echarts.use([
  ScatterChart,
  TooltipComponent,
  GeoComponent,
  TitleComponent,
  CanvasRenderer,
]);

type PlatformBreakdown = {
  mobile: number;
  web: number;
};

type LocationData = {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  sessionCount: number;
  platformBreakdown: PlatformBreakdown;
};

const GeoHeatmap: React.FC = () => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [data, setData] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);
  const dateRange = useSelector((state: any) => state.store.dateRange);

  const [searchParams] = useSearchParams();
  const storeCodeFromParams = searchParams.get("storeCode");
  const storeCode = storeCodeFromParams || localStorage.getItem("storeCode");

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const token = await getAccessToken();
      const BASE_URL = process.env.REACT_APP_SERVER_BASE_URL;

      const res = await axios.get(
        `${BASE_URL}api/customer-enquiries/intent-geo-distribution`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // Add params if needed
          params: {
            storeCode,
            startDate: dateRange?.startDate,
            endDate: dateRange?.endDate,
          },
        }
      );
      const parsedData = res?.data || [];
      setData(parsedData);
    } catch (err) {
      console.error("Error fetching chart data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/maps/world.json")
      .then((res) => res.json())
      .then((geoJson) => {
        echarts.registerMap("world", geoJson);
        setMapLoaded(true);
      })
      .catch((err) => console.error("Map load error", err));
  }, []);

  useEffect(() => {
    fetchChartData();
  }, []);

  const getOption = () => {
    const points = data.map((loc) => ({
      name: loc.city,
      value: [loc.longitude, loc.latitude],
      mobile: loc.platformBreakdown.mobile,
      web: loc.platformBreakdown.web,
      total: loc.platformBreakdown.mobile + loc.platformBreakdown.web,
    }));

    return {
      title: {
        left: "center",
      },
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          return `
            <strong>${params.name}</strong><br/>
             Mobile: ${params.data.mobile}<br/>
             Web: ${params.data.web}
          `;
        },
      },
      geo: {
        map: "world",
        roam: true,
        center: [-98, 39],
        zoom: 3.5,
        itemStyle: {
          areaColor: "#e0e0e0",
          borderColor: "#999",
        },
        emphasis: {
          itemStyle: {
            areaColor: "#f2d5d5",
          },
        },
      },
      series: [
        {
          name: "Sessions",
          type: "scatter",
          coordinateSystem: "geo",
          data: points,
          symbol: "pin",
          symbolSize: 27,
          itemStyle: {
            color: "red",
            borderColor: "#ffffff",
            borderWidth: 2,
          },
          label: {
            show: false, 
          },
        },
      ],
    };
  };

  return (
    <div style={{ height: "600px", width: "100%" }}>
      {mapLoaded ? (
        loading ? (
          <div>Loading data...</div>
        ) : (
          <ReactECharts
            option={getOption()}
            style={{ height: "100%", width: "100%" }}
          />
        )
      ) : (
        <div>Loading map data...</div>
      )}
    </div>
  );
};

export default GeoHeatmap;
