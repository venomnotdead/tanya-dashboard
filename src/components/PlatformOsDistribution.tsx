import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Stack,
  Divider,
} from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useSearchParams } from "react-router-dom";
import { getAccessToken } from "../service/auth";

const COLORS = ["#4CAF50", "#2196F3"];

const osData = [
  { name: "Android", value: 370 },
  { name: "iOS", value: 110 },
];

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

const sampleData = {
  "totalSessions": 0,
  "platformBreakdown": {
      "web": {
          "total": 0,
          "osBreakdown": {
              "Android 13": 0,
              "Android 14": 0,
              "iOS 18.3.2": 0,
              "iOS 18.1.1": 0,
              "iOS 18.2.1": 0
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
const {total, osBreakdown} = data?.platformBreakdown?.[selected]

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
  
  return (
    <Box
      sx={{
        maxWidth: 320,
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
          <Typography variant="body1"><strong>Mobile:</strong> {total||0}</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <span className="material-symbols-outlined" style={{ color: "#1976d2" }}>laptop_mac</span>
          <Typography variant="body1"><strong>Web:</strong> 200</Typography>
        </Stack>
        <Typography variant="body1" mt={1}><strong>Total Sessions:</strong> {
totalSessions}</Typography>
      </Stack>

      {/* Toggle */}
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

      {/* OS Breakdown */}
      {selected === "mobile" && (
        <>
          <Divider sx={{ my: 2 }}>OS Breakdown</Divider>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={osData}
                dataKey="value"
                nameKey="name"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={5}
              >
                {osData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <Stack direction="column" spacing={1} mt={1}>
{total > 0 ? (
  <Stack direction="column" spacing={1} mt={1}>
    {Object.entries(osBreakdown).map(([osName, count]) => {
      const percentage = ((count / total) * 100).toFixed(1);
      return (
        <Stack direction="row" justifyContent="space-between" key={osName} style={{border:'1px soild red'}}>
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
      )}
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
