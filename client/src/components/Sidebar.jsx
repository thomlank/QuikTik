import React from "react";
import { NavLink } from "react-router-dom";
import { Button, Col, Container, Row} from "react-bootstrap";
import { useState, useEffect } from "react";
import { authUtils, weatherApi } from "../utils/DjangoApiUtil";


export default function Sidebar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [weather, setWeather] = useState({});
  const isAdmin = user?.role === "admin";
  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);
  
  const getWeatherIconUrl = (iconName) => {
  if (!iconName) return null;
  // Visual Crossing hosts their icons on GitHub
  return `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/SVG/2nd Set - Color/${iconName}`
  };

  useEffect(() => {
    async function fetchWeather() {
      const wData = await weatherApi();
      setWeather(wData);
    } 
    fetchWeather();
  },[]);
  
  
  return (
    <>
      {/* Mobile Menu Button */}
      <Button 
        className="d-flex align-items-center justify-content-center mobile-menu-btn d-md-none"
        onClick={toggleSidebar}
      >
        <i className="bi bi-list fs-4"></i>
      </Button>

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'show' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="sidebar-title">QuikTik</h2>
            <Button 
              variant="link" 
              className="d-md-none text-white p-0"
              onClick={closeSidebar}
            >
              <i className="bi bi-x-lg fs-4"></i>
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          <NavLink to="/dashboard" end className="sidebar-link" onClick={closeSidebar}>
            <i className="bi bi-speedometer2"></i>
            Dashboard
          </NavLink>

          <NavLink to="/dashboard/tickets" className="sidebar-link" onClick={closeSidebar}>
            <i className="bi bi-ticket-perforated"></i>
            Tickets
          </NavLink>

          <NavLink to="/dashboard/teams" className="sidebar-link" onClick={closeSidebar}>
            <i className="bi bi-people"></i>
            Teams
          </NavLink>

          {isAdmin && (
            <>
              <hr className="sidebar-divider" />
            
              <NavLink to="/dashboard/users" className="sidebar-link" onClick={closeSidebar}>
                <i className="bi bi-person-gear"></i>
                Users
              </NavLink>

              <NavLink to="/dashboard/categories" className="sidebar-link" onClick={closeSidebar}>
                <i className="bi bi-tags"></i>
                Categories
              </NavLink>
            </>
          )}
        </div>

        {/* Footer with Logout */}
        <div className="sidebar-footer">
          <Container fluid>
            {weather.icon && (
              <Row className="text-center mb-2">
                <Col>
                  <img 
                    src={getWeatherIconUrl(weather.icon)} 
                    alt="Weather icon"
                    style={{ 
                      width: '64px', 
                      height: '64px',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                    }}
                  />
                </Col>
              </Row>
            )}
            <Row className="text-center">
              <span>{weather.location}</span>
            </Row>
            <Row>
              <Col className="d-flex justify-content-around">
                <span>Low: {weather.low}</span>
                <span>High: {weather.high}</span>
              </Col>
            </Row>
          </Container>
        </div>

        <div className="sidebar-footer">
          <Button
            variant="outline-light"
            className="sidebar-logout-btn"
            onClick={authUtils.logout}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Logout
          </Button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="d-flex align-items-center justify-content-center sidebar-overlay d-md-none"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}