import React, { useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Link } from "react-router-dom";
import "../../style/sidebar.scss";
import {
  Truck,
  HomeIcon,
  ShoppingCart,
  Landmark,
  Building2Icon,
  User2Icon,
  Users,
} from "lucide-react";

export default function SidebarItem({ collapsed, toggled, onHeaderClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`sidebar ${toggled ? "mobile-open" : ""} ${
        collapsed && !isHovered ? "collapsed" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Sidebar
        style={{ height: "100%", position: "fixed" }}
        collapsed={collapsed && !isHovered}
        toggled={toggled}
      >
        <Menu>
          <MenuItem onClick={onHeaderClick}>
            <div
              onClick={onHeaderClick}
              style={{
                padding: "9px",
                fontWeight: "bold",
                fontSize: collapsed && !isHovered ? 0 : 14,
                letterSpacing: "1px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {collapsed && !isHovered ? (
                <img
                  src="/tujjor_logo.png"
                  alt="Logo"
                  style={{ height: "40px", width: "auto" }}
                />
              ) : (
                "TUJJOR EXPRESS"
              )}
            </div>
          </MenuItem>
          <hr />
        </Menu>
        <Menu>
          <MenuItem component={<Link to="/main" />} icon={<HomeIcon />}>
            Asosiy sahifa
          </MenuItem>
          <MenuItem
            component={<Link to="/main/products" />}
            icon={<ShoppingCart />}
          >
            Pochtalar
          </MenuItem>
          <MenuItem component={<Link to="/main/cities" />} icon={<Landmark />}>
            Tumanlar
          </MenuItem>
          <MenuItem
            component={<Link to="/main/regions" />}
            icon={<Building2Icon />}
          >
            Viloyatlar
          </MenuItem>
          <MenuItem component={<Link to="/main/users" />} icon={<Users />}>
            Foydalanuvchilar
          </MenuItem>
          <MenuItem component={<Link to="/main/couriers" />} icon={<Truck />}>
            Kuryerlar
          </MenuItem>
        </Menu>
      </Sidebar>
    </div>
  );
}
