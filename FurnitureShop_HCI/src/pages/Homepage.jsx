import { useState } from 'react';
import './Homepage.css';

function Homepage() {
  // User data
  const userName = "Alex";
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Sample recent projects data
  const recentProjects = [
    { id: 1, title: 'Website Redesign', artboards: 8, date: 'April 15, 2025' },
    { id: 2, title: 'Mobile App UI', artboards: 12, date: 'April 10, 2025' },
    { id: 3, title: 'Brand Identity', artboards: 5, date: 'April 5, 2025' }
  ];

  return (
    <div className="designhub-container">
      {/* Header */}
      <header className="header">
        <div className="logo">DesignHub</div>
        <div className="header-right">
          <div className="notifications">
            <span className="notification-icon">🔔</span>
            <span>Notifications</span>
          </div>
          <div className="user-profile">
            <div className="avatar">
              <img src="/avatar-placeholder.svg" alt="User avatar" />
            </div>
            <span>{userName}</span>
            <span className="dropdown-icon">▼</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-text">
            <h1>Welcome back, {userName}!</h1>
            <p>Continue working on your creative projects or start something new.</p>
          </div>
          <div className="date-display">
            <p className="date-label">Today's Date</p>
            <p className="current-date">{formattedDate}</p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <div className="action-card">
            <div className="action-icon">
              <span>+</span>
            </div>
            <h2>Create New Design</h2>
            <p>Start a fresh project from scratch</p>
          </div>

          <div className="action-card">
            <div className="action-icon">
              <span>📁</span>
            </div>
            <h2>My Designs</h2>
            <p>Access your previous projects</p>
          </div>

          <div className="action-card">
            <div className="action-icon">
              <span>➡️</span>
            </div>
            <h2>Logout</h2>
            <p>Securely exit the platform</p>
          </div>
        </section>

        {/* Recent Projects */}
        <section className="recent-projects">
          <div className="section-header">
            <h2>Recent Projects</h2>
            <a href="#" className="view-all">
              View all <span className="arrow-icon">→</span>
            </a>
          </div>

          <div className="projects-grid">
            {recentProjects.map(project => (
              <div key={project.id} className="project-card">
                <div className="project-thumbnail">
                  <p>Project Thumbnail</p>
                </div>
                <div className="project-info">
                  <h3>{project.title}</h3>
                  <div className="project-meta">
                    <span className="artboards-count">
                      📄 {project.artboards} artboards
                    </span>
                    <span className="project-date">{project.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="copyright">
          © 2025 DesignHub. All rights reserved.
        </div>
        <div className="footer-links">
          <a href="#" className="footer-link">
            <span className="info-icon">ℹ️</span> Help
          </a>
          <a href="#" className="footer-link">
            <span className="privacy-icon">🔒</span> Privacy
          </a>
          <a href="#" className="footer-link">
            <span className="terms-icon">📄</span> Terms
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Homepage; 