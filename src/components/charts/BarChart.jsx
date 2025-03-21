import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import axios from "../../axiosConfig";
import { useSelector } from "react-redux";

export default function BarChart() {
  const [chartConfig, setChartConfig] = useState({
    series: [],
    options: {
      chart: { type: "bar", toolbar: { show: false } },
      title: { text: "Region bo'yicha buyurtmalar", align: "left" },
      xaxis: { categories: [] },
      plotOptions: { bar: { horizontal: false, columnWidth: "50%" } },
      dataLabels: { enabled: false },
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redux store'dan token olish
  const token = useSelector((state) => state.auth.token);

  const fetchBarChartData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/accounts/stats/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // "bar_chart" kalitidagi ma'lumot: { labels: [...], series: [ { name:'...', data:[...]} ] }
      const barData = response.data.bar_chart;

      setChartConfig((prev) => ({
        ...prev,
        series: barData.series,
        options: {
          ...prev.options,
          xaxis: { categories: barData.labels },
        },
      }));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Error fetching bar chart data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarChartData();
    // eslint-disable-next-line
  }, []);

  if (loading) return <div>Loading bar chart...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Chart
        options={chartConfig.options}
        series={chartConfig.series}
        type="bar"
        width="100%"
        height="100%"
      />
    </div>
  );
}
