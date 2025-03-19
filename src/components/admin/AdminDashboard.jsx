import React from "react";
import { AdminContext } from "../commonContext";
import "../../style/AdminDashboard.scss";
import LineAreaChart from "../charts/LineAreaChart";
import BarChart from "../charts/BarChart";
import DonutChart from "../charts/DonutChart";
import LineChart from "../charts/LineChart";

export default function AdminDashboard() {
  const { pageName, setPageName } = React.useContext(AdminContext);
  setPageName("Ma'lumotlar statistikasi");
  return (
    <div className="admin-dashboard">
      <div className="top">
        <div className="item">
          <LineAreaChart />
        </div>
        <div className="item">
          <BarChart />
        </div>
        <div className="item">
          <DonutChart />
        </div>
      </div>
      <div className="bottom">
        <LineChart />
      </div>
    </div>
  );
}
