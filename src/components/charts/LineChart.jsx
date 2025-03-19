import React, { useState } from "react";
import Chart from "react-apexcharts";

export default function LineChart() {
  const [lineChartConfig, setLineChartConfig] = useState({
    series: [
      {
        name: "Sales",
        data: [10, 41, 35, 51, 49, 62, 69],
      },
    ],
    options: {
      chart: {
        type: "line",
        toolbar: {
          show: false,
        },
      },
      title: {
        text: "Monthly Sales",
        align: "left",
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
    },
  });
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Chart
        options={lineChartConfig.options}
        series={lineChartConfig.series}
        type="line"
        width="100%"
        height="100%"
      />
    </div>
  );
}
