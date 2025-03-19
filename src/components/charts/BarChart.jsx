import React, { useState } from "react";
import Chart from "react-apexcharts";

export default function BarChart() {
  const [barChartConfig, setBarChartConfig] = useState({
    series: [
      {
        name: "Active Users",
        data: [44, 55, 41, 64, 22, 43],
      },
    ],
    options: {
      chart: {
        type: "bar",
        toolbar: {
          show: false,
        },
      },
      title: {
        text: "Active Users",
        align: "left",
      },
      xaxis: {
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "50%",
        },
      },
      dataLabels: {
        enabled: false,
      },
    },
  });
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Chart
        options={barChartConfig.options}
        series={barChartConfig.series}
        type="bar"
        width="100%"
        height="100%"
      />
    </div>
  );
}
