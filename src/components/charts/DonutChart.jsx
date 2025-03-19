import React, { useState } from "react";
import Chart from "react-apexcharts";

export default function DonutChart() {
  const [donutChartConfig, setDonutChartConfig] = useState({
    series: [44, 55, 13, 43],
    options: {
      chart: {
        type: "donut",
      },
      title: {
        text: "Continent Distribution",
        align: "left",
      },
      labels: ["Europe", "Asia", "Africa", "Americas"],
      legend: {
        position: "bottom",
      },
    },
  });

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Chart
        options={donutChartConfig.options}
        series={donutChartConfig.series}
        type="donut"
        width="100%"
        height="100%"
      />
    </div>
  );
}
