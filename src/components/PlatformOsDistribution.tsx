import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import ReactECharts from "echarts-for-react";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Stack,
  Divider,
} from "@mui/material";
import {  ResponsiveContainer } from "recharts";
import { useSearchParams } from "react-router-dom";
import { getAccessToken } from "../service/auth";

interface PushNotificationStats {
  totalSessions: number;
  platformBreakdown: {
    [platform: string]: {
      total: number;
      osBreakdown: {
        [osVersion: string]: number;
      };
    };
  };
}

const osData = [
  { name: "Android", value: 0 },
  { name: "iPhone", value: 0 },
];

const sampleData = {
  "totalSessions": 0,
  "platformBreakdown": {
      "web": {
          "total": 0,
          "osBreakdown": {
           "Windows NT 10.0; Win64; x64": 0,
           "Windows NT 11.0; Win64; x64": 0,
           "Macintosh; Intel Mac OS X 10_15_7": 0,
           "Linux x86_64": 0,
          }
      },
      "mobile": {
        "total": 0,
        "osBreakdown": {
          "Android 13": 0,
          "Android 14": 0,
          "iOS 18.3.2": 0,
          "iOS 18.1.1": 0,
          "iOS 18.2.1": 0
        }
    }
  }
}

const PlatformOsDistribution = () => {
  const [data, setData] = useState<PushNotificationStats>(sampleData);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [selected, setSelected] = useState("mobile");
  const dateRange = useSelector((state: any) => state.store.dateRange);
  const [searchParams] = useSearchParams();
  const storeCodeFromParams = searchParams.get("storeCode");
  const storeCode = storeCodeFromParams || localStorage.getItem("storeCode");
  
  const { totalSessions} = data
  const {osBreakdown} = data?.platformBreakdown?.[selected]
  const webTotal = data?.platformBreakdown?.['web']?.total
  const mobileTotal = data?.platformBreakdown?.['mobile']?.total

const combinedOS = Object.entries(osBreakdown || {}).reduce<Record<string, number>>(
  (acc, [os, count]) => {
    const osName = os.toLowerCase();

    if (/android/.test(osName)) {
      acc["Android"] = (acc["Android"] || 0) + count;
    } else if (/iphone|i phone|ios/.test(osName)) {
      acc["iPhone"] = (acc["iPhone"] || 0) + count;
    } else if (/windows/.test(osName)) {
      acc["Windows"] = (acc["Windows"] || 0) + count;
    } else if (/mac|darwin/.test(osName)) {
      acc["Mac"] = (acc["Mac"] || 0) + count;
    } else if (/linux|ubuntu/.test(osName)) {
      acc["Linux"] = (acc["Linux"] || 0) + count;
    }
    return acc;
  },
  {}
);

const osChartData =
  Object.keys(combinedOS).length === 0 || Object.values(combinedOS).every(v => v === 0)
    ? osData
    : Object.entries(combinedOS).map(([name, value]) => ({
        name,
        value
      }));

  useEffect(() => {
    getPlatFormData()
  }, [dateRange?.startDate,dateRange?.endDate ]);


    const getPlatFormData  =  async()=>{
    setLoading(true)
  try {
              const token = await getAccessToken();
              const BASE_URL = process.env.REACT_APP_SERVER_BASE_URL;
              const res = await axios.get(
                `${BASE_URL}api/customer-enquiries/platform-os-distribution`,
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


  const handleToggle = (_event: any, newValue: string) => {
    if (newValue !== null) setSelected(newValue);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  const totals = Object.values(combinedOS).reduce((a, b) => a + b, 0);
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
        radius: "40%",
        data: osChartData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        label: {
          fontSize: 10,
          formatter: "{b} ({c}, {d}%)",
        },
      },
    ],
  };

  return (
    <Box
      sx={{
        maxWidth: 420,
        p: 2,
        backgroundColor: "#fff",
        borderRadius: 2,
        border: "1px solid #E0E0E0",
      }}
    >
       <h2 className="text-2xl font-bold text-gray-900 mb-1">
       Platform Os Distribution
        </h2>
      <Paper
        variant="outlined"
        sx={{
          p: 1,
          borderRadius: 1,
          mb: 2,
        }}
      >
        <Typography variant="body2">
          <strong>From:</strong> {dateRange?.startDate} &nbsp;&nbsp;
          <strong>To:</strong>{dateRange?.endDate}
        </Typography>
      </Paper>

      {/* Device Stats */}
      <Stack direction="column" spacing={1} mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <span className="material-symbols-outlined" style={{ color: "#1976d2" }}>smartphone</span>
          <Typography variant="body1"><strong>Mobile:</strong> {mobileTotal||0}</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <span className="material-symbols-outlined" style={{ color: "#1976d2" }}>laptop_mac</span>
          <Typography variant="body1"><strong>Web:</strong> {webTotal||0}</Typography>
        </Stack>
        <Typography variant="body1" mt={1}><strong>Total Sessions:</strong> {
totalSessions}</Typography>
      </Stack>
      <ToggleButtonGroup
        value={selected}
        exclusive
        onChange={handleToggle}
        sx={{
          border: "1px solid #D1D5DB",
          borderRadius: "8px",
          overflow: "hidden",
          mb: 2,
        }}
      >
        <ToggleButton value="mobile" sx={toggleStyle(selected === "mobile")}>Mobile</ToggleButton>
        <ToggleButton value="web" sx={toggleStyle(selected === "web")}>Web</ToggleButton>
      </ToggleButtonGroup>
        <>
          <Divider sx={{ my: 2 }}>OS Breakdown</Divider>
          <ResponsiveContainer width="100%" height={180}>
          <ReactECharts option={option}  />
          </ResponsiveContainer>
          <Stack direction="column" spacing={1} mt={6}>
          {totals > 0 ? (
  <Stack direction="column" spacing={1} mt={1}>
    {Object.entries(combinedOS).map(([osName, count]) => {
      const percentage = ((count / totals) * 100).toFixed(1);
      return (
        <Stack
          direction="row"
          justifyContent="space-between"
          key={osName}
          style={{ border: '1px solid lightGray', padding: '4px 8px', borderRadius: '6px' }}
        >
          <Typography variant="body2">{osName}</Typography>
          <Typography variant="body2">
            {count} <span style={{ color: "#666" }}>({percentage}%)</span>
          </Typography>
        </Stack>
      );
    })}
  </Stack>
) : (
  <Typography variant="body2">No data available</Typography>
)}
          </Stack>
        </>
  
    </Box>
  );
};

const toggleStyle = (isSelected: boolean) => ({
  textTransform: "none",
  fontWeight: isSelected ? "bold" : "normal",
  color: isSelected ? "#1976d2" : "#000",
  borderRight: "1px solid #D1D5DB",
  borderRadius: 0,
  px: 4,
  py: 1.5,
  backgroundColor: "#fff",
  "&.Mui-selected": {
    backgroundColor: "#fff",
    border: "none",
  },
});

export default PlatformOsDistribution;
