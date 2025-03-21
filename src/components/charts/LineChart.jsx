import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import axios from "../../axiosConfig";
import { useSelector } from "react-redux";

export default function LineChart() {
  const [chartConfig, setChartConfig] = useState({
    series: [],
    options: {
      chart: { type: "line", toolbar: { show: false } },
      title: { text: "So'nggi 7 kun buyurtmalar", align: "left" },
      xaxis: { categories: [] },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = useSelector((state) => state.auth.token);

  const fetchLineChartData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/accounts/stats/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // "line_chart": { labels:[...], series:[ { name:'...', data:[...] } ] }
      const lineData = response.data.line_chart;
      setChartConfig((prev) => ({
        ...prev,
        series: lineData.series,
        options: {
          ...prev.options,
          xaxis: { categories: lineData.labels },
        },
      }));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Error fetching line chart data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLineChartData();
  }, []);

  if (loading) return <div>Loading line chart...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Chart
        options={chartConfig.options}
        series={chartConfig.series}
        type="line"
        width="100%"
        height="100%"
      />
    </div>
  );
}
