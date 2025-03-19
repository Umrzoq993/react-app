import React, { useState } from "react";
import Chart from "react-apexcharts";

export default function LineAreaChart() {
  const [areaChartConfig, setAreaChartConfig] = useState({
    series: [
      {
        name: "Orders",
        data: [31, 40, 28, 51, 42, 109, 100],
      },
      {
        name: "Deliveries",
        data: [11, 32, 45, 32, 34, 52, 41],
      },
    ],
    options: {
      chart: {
        type: "area",
        toolbar: {
          show: false,
        },
      },
      title: {
        text: "Orders and Deliveries",
        align: "left",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      },
      legend: {
        position: "top",
      },
    },
  });
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Chart
        options={areaChartConfig.options}
        series={areaChartConfig.series}
        type="area"
        width="100%"
        height="100%"
      />
    </div>
  );
}
