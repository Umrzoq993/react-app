import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import axios from "../../axiosConfig";
import { useSelector } from "react-redux";

export default function DonutChart() {
  const [chartConfig, setChartConfig] = useState({
    series: [],
    options: {
      chart: { type: "donut" },
      title: { text: "Buyurtmalar statusi", align: "left" },
      labels: [],
      legend: { position: "bottom" },
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = useSelector((state) => state.auth.token);

  const fetchDonutChartData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/accounts/stats/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // "donut_chart": {labels:['Pending','Delivered'...], series:[12, 5,...]}
      const donutData = response.data.donut_chart;
      setChartConfig((prev) => ({
        ...prev,
        series: donutData.series,
        options: {
          ...prev.options,
          labels: donutData.labels,
        },
      }));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Error fetching donut chart data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonutChartData();
  }, []);

  if (loading) return <div>Loading donut chart...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Chart
        options={chartConfig.options}
        series={chartConfig.series}
        type="donut"
        width="100%"
        height="100%"
      />
    </div>
  );
}
