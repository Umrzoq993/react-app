import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import axios from "../../axiosConfig";
import { useSelector } from "react-redux";

export default function LineAreaChart() {
  const [chartConfig, setChartConfig] = useState({
    series: [],
    options: {
      chart: { type: "area", toolbar: { show: false } },
      title: { text: "Oyma-oy Pending vs Delivered", align: "left" },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      xaxis: { categories: [] },
      legend: { position: "top" },
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = useSelector((state) => state.auth.token);

  const fetchAreaChartData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/accounts/stats/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // "area_chart" kaliti: { labels:['2025-01','2025-02'], series:[ {name:'Pending', data:[...]}, ... ] }
      const areaData = response.data.area_chart;
      setChartConfig((prev) => ({
        ...prev,
        series: areaData.series,
        options: {
          ...prev.options,
          xaxis: { categories: areaData.labels },
        },
      }));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Error fetching area chart data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreaChartData();
  }, []);

  if (loading) return <div>Loading area chart...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Chart
        options={chartConfig.options}
        series={chartConfig.series}
        type="area"
        width="100%"
        height="100%"
      />
    </div>
  );
}
