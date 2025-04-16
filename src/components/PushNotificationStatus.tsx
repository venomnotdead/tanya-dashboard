/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState , useEffect} from "react";
import ReactECharts from "echarts-for-react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { getAccessToken } from "../service/auth";

interface PushNotificationStats {
  "totalMobileUsers": number,
  "pushNotificationStats": {
      "enabled": number,
      "disabled": number,
      "notificationsReceivedInPeriod": number
  }
}

const sampleData ={
  "totalMobileUsers": 0,
  "pushNotificationStats": {
      "enabled": 0,
      "disabled": 0,
      "notificationsReceivedInPeriod": 0
  }
}

const PushNotificationStatus: React.FC = () => {
  const [data, setData] = useState<PushNotificationStats>(sampleData);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const dateRange = useSelector((state: any) => state.store.dateRange);
  const [searchParams] = useSearchParams();
  const storeCodeFromParams = searchParams.get("storeCode");
  const storeCode = storeCodeFromParams || localStorage.getItem("storeCode");

  const {totalMobileUsers , pushNotificationStats :{disabled, enabled, notificationsReceivedInPeriod }} = data

  useEffect(() => {
    getPushNoticationData()
  }, [dateRange?.startDate,dateRange?.endDate ]);

  const getPushNoticationData  =  async()=>{
       setLoading(true)
try {
            const token = await getAccessToken();
            const BASE_URL = process.env.REACT_APP_SERVER_BASE_URL;
            const res = await axios.get(
              `${BASE_URL}api/customer-enquiries/intent-push-notification-stats`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                params: {
                  storeCode,
                  startDate: dateRange?.startDate,
                  endDate: dateRange?.endDate,
                },
              }
            );
            if (res.status !== 200) {
              throw new Error('Failed to fetch');
            }
            
 setData( res.data)
}catch(e){
     console.log(e)
}finally{
  setLoading(false)
}

  }
  const notificationOptionzs = {
    tooltip: { trigger: "item" },
    legend: { bottom: 0 },
    series: [
      {
        type: "pie",
        radius: ["60%", "80%"],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: "bold" },
        },
        labelLine: { show: false },
        data: [
          { value:  enabled, name: "Enabled", itemStyle: { color: "#2b9eff" } },
          { value: disabled, name: "Disabled", itemStyle: { color: "#fba834" } },
        ],
      },
    ],
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
 const option =    {
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
        radius: "65%",
        data: [
          { value: enabled, name: "Enabled", itemStyle: { color: "#2b9eff" } },
          { value: disabled, name: "Disabled", itemStyle: { color: "#fba834" } },
        ],
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
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-1">
          Push Notification Status
        </h2>
        <p className="text-md text-gray-700 mb-6 text-center">
          Total Mobile Users: {totalMobileUsers}
        </p>
        <div className="w-full h-[200px]">
        <ReactECharts option={option} style={{ height: "300px", width: "85%" }} />
        </div>
        <p className="text-center mt-4 text-gray-700 text-center">
          {notificationsReceivedInPeriod} notifications received in the chosen period
        </p>
      </div>
    </div>
  );
};

export default PushNotificationStatus;
