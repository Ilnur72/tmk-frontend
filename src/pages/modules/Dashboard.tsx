import React, { useState, useEffect } from "react";
import { applicationsAPI, Application } from "./services/applicationsAPI";
import api from "./services/api";
import { useModulesAuth } from "./hooks/useModulesAuth";
import "./Dashboard.css";

interface DashboardStats {
  publishedListings: number;
  pendingListings: number;
  underReviewListings: number;
  rejectedListings: number;
  revisionRequiredListings: number;
  activePromotions: number;
  visitsThisWeek: number;
  viewsLast24h: number;
  viewsLast7d: number;
  viewsLast30d: number;
  uniqueViewsLast24h: number;
  uniqueViewsLast7d: number;
  uniqueViewsLast30d: number;
}

interface Listing {
  id: string;
  title: string;
  status: "published" | "pending" | "draft";
  createdAt: string;
  views: number;
  category: string;
}

const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [stats, setStats] = useState<DashboardStats>({
    publishedListings: 0,
    pendingListings: 0,
    underReviewListings: 0,
    rejectedListings: 0,
    revisionRequiredListings: 0,
    activePromotions: 0,
    visitsThisWeek: 0,
    viewsLast24h: 0,
    viewsLast7d: 0,
    viewsLast30d: 0,
    uniqueViewsLast24h: 0,
    uniqueViewsLast7d: 0,
    uniqueViewsLast30d: 0,
  });

  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Last 24 hours");
  const [filterBy, setFilterBy] = useState<string>("listing");
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated } = useModulesAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      let userData = localStorage.getItem("modules_partner_data");
      if (!userData) {
        // Try to fetch partner profile if only id is present (Google auth case)
        const partnerId = localStorage.getItem("modules_partner_id");
        if (partnerId) {
          try {
            const resp = await api.get(`/partners/auth/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log(resp);
            
            if (resp.data) {
              localStorage.setItem(
                "modules_partner_data",
                JSON.stringify(resp.data)
              );
              userData = JSON.stringify(resp.data);
            }
          } catch (e) {
            // ignore
          }
        }
      }
      if (userData) {
        const parsedData = JSON.parse(userData);
        if (parsedData.firstName || parsedData.name) {
          setUserName(parsedData.firstName || parsedData.name || "");
        }
      }
      const applicationsData = await applicationsAPI.getMyApplications();
      const mockStats: DashboardStats = {
        publishedListings:
          applicationsData.filter((app: any) => app.status === "approved")
            .length || 0,
        pendingListings:
          applicationsData.filter((app: any) => app.status === "pending")
            .length || 0,
        underReviewListings:
          applicationsData.filter((app: any) => app.status === "under_review")
            .length || 0,
        rejectedListings:
          applicationsData.filter((app: any) => app.status === "rejected")
            .length || 0,
        revisionRequiredListings:
          applicationsData.filter(
            (app: any) => app.status === "revision_required"
          ).length || 0,
        activePromotions: 0,
        visitsThisWeek: 0,
        viewsLast24h: 0,
        viewsLast7d: 0,
        viewsLast30d: 0,
        uniqueViewsLast24h: 0,
        uniqueViewsLast7d: 0,
        uniqueViewsLast30d: 0,
      };
      setStats(mockStats);
      setApplications(applicationsData || []);
      setLoading(false);
    };
    fetchDashboardData();
  }, []);

  const periods = [
    "Last 24 hours",
    "Last 7 days",
    "Last 30 days",
    "Last 6 months",
    "Last 12 months",
  ];

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <h2>Loading Dashboard...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Hello, {userName}!</h1>
        </div>
        <div className="header-right">
          <select
            className="filter-dropdown"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            <option value="listing">Filter by listing</option>
            <option value="category">Filter by category</option>
            <option value="status">Filter by status</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card published">
          <div className="stat-number">{stats.publishedListings}</div>
          <div className="stat-label">Published (Approved)</div>
          <div className="stat-icon">✅</div>
        </div>

        <div className="stat-card pending">
          <div className="stat-number">{stats.pendingListings}</div>
          <div className="stat-label">Pending</div>
          <div className="stat-icon">⏳</div>
        </div>

        <div className="stat-card under-review">
          <div className="stat-number">{stats.underReviewListings}</div>
          <div className="stat-label">Under Review</div>
          <div className="stat-icon">👀</div>
        </div>

        <div className="stat-card rejected">
          <div className="stat-number">{stats.rejectedListings}</div>
          <div className="stat-label">Rejected</div>
          <div className="stat-icon">❌</div>
        </div>

        <div className="stat-card revision">
          <div className="stat-number">{stats.revisionRequiredListings}</div>
          <div className="stat-label">Needs Revision</div>
          <div className="stat-icon">�</div>
        </div>

        <div className="stat-card visits">
          <div className="stat-number">{stats.visitsThisWeek}</div>
          <div className="stat-label">Visits this week</div>
          <div className="stat-icon">👥</div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="analytics-section">
        <div className="analytics-card views-card">
          <div className="card-header">
            <div className="card-icon">👁️</div>
            <h3>Views</h3>
          </div>
          <div className="analytics-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.viewsLast24h}</div>
              <div className="stat-period">Last 24 hours</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.viewsLast7d}</div>
              <div className="stat-period">Last 7 days</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.viewsLast30d}</div>
              <div className="stat-period">Last 30 days</div>
            </div>
          </div>
        </div>

        <div className="analytics-card visits-card">
          <div className="card-header">
            <div className="card-icon">📊</div>
            <h3>Visits</h3>
          </div>
          <div className="visits-periods">
            {periods.map((period) => (
              <button
                key={period}
                className={`period-btn ${
                  selectedPeriod === period ? "active" : ""
                }`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
          <div className="visits-chart">
            <div className="chart-placeholder">
              <div className="chart-bar" style={{ height: "20%" }}></div>
              <div className="chart-bar" style={{ height: "40%" }}></div>
              <div className="chart-bar" style={{ height: "60%" }}></div>
              <div className="chart-bar" style={{ height: "30%" }}></div>
              <div className="chart-bar" style={{ height: "80%" }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Unique Views Section */}
      <div className="unique-views-section">
        <div className="unique-views-card">
          <div className="card-header">
            <div className="card-icon">👁️</div>
            <h3>Unique views</h3>
          </div>
          <div className="analytics-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.uniqueViewsLast24h}</div>
              <div className="stat-period">Last 24 hours</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.uniqueViewsLast7d}</div>
              <div className="stat-period">Last 7 days</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.uniqueViewsLast30d}</div>
              <div className="stat-period">Last 30 days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="btn-primary"
          onClick={() =>
            (window.location.href = "/partner-portal/applications")
          }
        >
          + Create New Listing
        </button>
        <button
          className="btn-secondary"
          onClick={() => (window.location.href = "/listings")}
        >
          📋 Manage Listings
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
