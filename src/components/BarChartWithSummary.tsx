import React from "react";
import ReactECharts from "echarts-for-react";

interface Props {
  data: {
    summary: string;
    countMap: Record<string, number>;
  } | null;
}

const BarChartWithSummary: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const { summary, countMap } = data;

  const chartData = Object.entries(countMap).map(([key, value]) => ({
    name: key,
    value,
  }));

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    xAxis: {
      type: "value",
    },
    yAxis: {
      type: "category",
      data: chartData.map((item) => item.name),
    },
    series: [
      {
        type: "bar",
        data: chartData.map((item) => item.value),
        itemStyle: {
          color: "#2B6ECA",
        },
      },
    ],
  };

  return (
    <div style={{ marginTop: 40, display: "flex", gap: "20px" }}>
      <div>
        <h3 style={{ marginBottom: "8px" }}>Summary</h3>
        <p
          style={{
            maxWidth: "600px",
            fontSize: "14px",
            lineHeight: "1.6",
            color: "#444",
          }}
        >
          {summary}
        </p>
      </div>
      <div style={{ width: "100%" }}>
        <h3 style={{ marginBottom: "8px" }}>Category Breakdown</h3>
        <ReactECharts
          option={option}
          style={{ height: "300px", width: "100%" }}
        />
      </div>
    </div>
  );
};

export default BarChartWithSummary;
