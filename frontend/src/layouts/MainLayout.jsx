import React from "react";
import { Outlet } from "react-router-dom";
import HeaderComSidebar from "../pages/HeaderComSidebar";
import "../style/main-layout.css";


export default function MainLayout() {
  return (
    <div className="app-shell">
      <HeaderComSidebar />
      <main className="app-content">
        <div className="app-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}