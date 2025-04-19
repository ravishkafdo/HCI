import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Homepage.css";

function Homepage() {
  const navigate = useNavigate();

  // User data
  const userName = "Alex";
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Sample recent projects data
  const recentProjects = [
    {
      id: 1,
      title: "Living Room Design",
      type: "3D Furniture",
      artboards: 5,
      date: "April 15, 2025",
      thumbnail: "/thumbnails/living-room.jpg",
    },
    {
      id: 2,
      title: "Office Space",
      type: "3D Furniture",
      artboards: 8,
      date: "April 10, 2025",
      thumbnail: "/thumbnails/office.jpg",
    },
    {
      id: 3,
      title: "Bedroom Concept",
      type: "3D Furniture",
      artboards: 6,
      date: "April 5, 2025",
      thumbnail: "/thumbnails/bedroom.jpg",
    },
  ];

  const handleCreateNewDesign = () => {
    navigate("/design");
  };

  return (
    <div className="designhub-container">
      {/* Header */}
      <header className="header">
        <div className="logo">DesignHub 3D</div>
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
            <p>Design, visualize and customize furniture layouts in 3D.</p>
          </div>
          <div className="date-display">
            <p className="date-label">Today's Date</p>
            <p className="current-date">{formattedDate}</p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <div className="action-card" onClick={handleCreateNewDesign}>
            <div className="action-icon">
              <span>✏️</span>
            </div>
            <h2>New 3D Design</h2>
            <p>Start a new furniture layout</p>
          </div>

          <div className="action-card">
            <div className="action-icon">
              <span>📂</span>
            </div>
            <h2>My Designs</h2>
            <p>Access your saved projects</p>
          </div>

          <div className="action-card">
            <div className="action-icon">
              <span>🎨</span>
            </div>
            <h2>Templates</h2>
            <p>Use pre-made room layouts</p>
          </div>
        </section>

        {/* Recent Projects */}
        <section className="recent-projects">
          <div className="section-header">
            <h2>Your Recent 3D Projects</h2>
            <a href="#" className="view-all">
              View all <span className="arrow-icon">→</span>
            </a>
          </div>

          <div className="projects-grid">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => navigate(`/design/${project.id}`)}
              >
                <div className="project-thumbnail">
                  <img src={project.thumbnail} alt={project.title} />
                  <div className="project-type-badge">{project.type}</div>
                </div>
                <div className="project-info">
                  <h3>{project.title}</h3>
                  <div className="project-meta">
                    <span className="artboards-count">
                      📄 {project.artboards} items
                    </span>
                    <span className="project-date">{project.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Getting Started Section */}
        <section className="getting-started">
          <h2>Getting Started with 3D Design</h2>
          <div className="tutorial-steps">
            <div className="tutorial-step">
              <div className="step-number">1</div>
              <h3>Create a Room</h3>
              <p>Set dimensions and wall colors for your space</p>
            </div>
            <div className="tutorial-step">
              <div className="step-number">2</div>
              <h3>Add Furniture</h3>
              <p>Drag and drop items from our catalog</p>
            </div>
            <div className="tutorial-step">
              <div className="step-number">3</div>
              <h3>Customize</h3>
              <p>Adjust colors, sizes and positions</p>
            </div>
            <div className="tutorial-step">
              <div className="step-number">4</div>
              <h3>Visualize</h3>
              <p>View your design in 3D from any angle</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="copyright">
          © 2025 DesignHub 3D. All rights reserved.
        </div>
        <div className="footer-links">
          <a href="#" className="footer-link">
            <span className="info-icon">ℹ️</span> Tutorials
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
