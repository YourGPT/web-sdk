import React, { useEffect, useState } from "react";
import { YourGPT, useYourGPTChatbot, useAIActions } from "@yourgpt/sdk/react";

// Initialize SDK
YourGPT.init({
  widgetId: "232d2602-7cbd-4f6a-87eb-21058599d594",
  endpoint: "https://dev-widget.yourgpt.ai",
  debug: true,
});

// Main App Component
function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>YourGPT SDK - React Example</h1>
        <p>Demonstrating React hooks integration</p>
      </header>

      <main className="app-main">
        <ChatControls />
        <UserProfile />
        <AIActionsDemo />
        <EventLogger />
      </main>
    </div>
  );
}

// Chat Controls Component
function ChatControls() {
  const chatbot = useYourGPTChatbot();

  const handleQuickMessage = () => {
    chatbot.sendMessage("Hello! I need help with my account.");
  };

  const handleStartQuiz = () => {
    chatbot.startGame("quizMania", {
      showExitConfirmation: true,
      leadCapture: true,
      gameConfig: {
        difficulty: "medium",
        category: "product-knowledge",
      },
    });
  };

  const handleOpenDocs = () => {
    chatbot.openBottomSheet("https://docs.yourgpt.ai");
  };

  return (
    <div className="chat-controls">
      <h2>Widget Controls</h2>

      <div className="button-group">
        <button onClick={chatbot.open}>Open Chat</button>
        <button onClick={chatbot.close}>Close Chat</button>
        <button onClick={chatbot.toggle}>Toggle Chat</button>
        <button onClick={chatbot.show}>Show Widget</button>
        <button onClick={chatbot.hide}>Hide Widget</button>
      </div>

      <div className="button-group">
        <button onClick={handleQuickMessage}>Quick Help</button>
        <button onClick={handleStartQuiz}>Start Quiz</button>
        <button onClick={handleOpenDocs}>View Docs</button>
      </div>

      <div className="widget-status">
        <h3>Widget Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <span>Connected:</span>
            <span className={chatbot.isConnected ? "status-ok" : "status-error"}>{chatbot.isConnected ? "✅" : "❌"}</span>
          </div>
          <div className="status-item">
            <span>Loaded:</span>
            <span className={chatbot.isLoaded ? "status-ok" : "status-error"}>{chatbot.isLoaded ? "✅" : "❌"}</span>
          </div>
          <div className="status-item">
            <span>Visible:</span>
            <span className={chatbot.isVisible ? "status-ok" : "status-error"}>{chatbot.isVisible ? "✅" : "❌"}</span>
          </div>
          <div className="status-item">
            <span>Open:</span>
            <span className={chatbot.isOpen ? "status-ok" : "status-error"}>{chatbot.isOpen ? "✅" : "❌"}</span>
          </div>
          <div className="status-item">
            <span>Messages:</span>
            <span>{chatbot.messageCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// User Profile Component
function UserProfile() {
  const chatbot = useYourGPTChatbot();
  const [userData, setUserData] = useState({
    id: "12345",
    email: "user@example.com",
    name: "John Doe",
    plan: "pro",
    preferences: {
      theme: "dark",
      notifications: true,
      language: "en",
    },
  });

  // Update chatbot data when user data changes
  useEffect(() => {
    // Set contact data (user identity)
    // chatbot.setContactData({
    //   email: userData.email,
    //   name: userData.name,
    //   user_hash: `user_${userData.id}`,
    // });
    // Set session data (temporary data for this session)
    // chatbot.setSessionData({
    //   userId: userData.id,
    //   plan: userData.plan,
    //   sessionStart: new Date().toISOString(),
    //   features: userData.plan === "pro" ? ["ai-actions", "games", "priority-support"] : ["basic-chat"],
    //   preferences: userData.preferences,
    // });
    // Set visitor data (analytics/tracking data)
    // chatbot.setVisitorData({
    //   source: "react-demo",
    //   userAgent: navigator.userAgent,
    //   referrer: document.referrer,
    //   viewport: `${window.innerWidth}x${window.innerHeight}`,
    //   timestamp: new Date().toISOString(),
    // });
  }, [userData, chatbot]);

  const updatePreferences = (key: string, value: any) => {
    setUserData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }));
  };

  return (
    <div className="user-profile">
      <h2>User Profile</h2>

      <div className="profile-info">
        <div className="info-item">
          <label>Name:</label>
          <input type="text" value={userData.name} onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))} />
        </div>
        <div className="info-item">
          <label>Email:</label>
          <input type="email" value={userData.email} onChange={(e) => setUserData((prev) => ({ ...prev, email: e.target.value }))} />
        </div>
        <div className="info-item">
          <label>Plan:</label>
          <select value={userData.plan} onChange={(e) => setUserData((prev) => ({ ...prev, plan: e.target.value }))}>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      <div className="preferences">
        <h3>Preferences</h3>
        <div className="pref-item">
          <label>
            <input type="checkbox" checked={userData.preferences.notifications} onChange={(e) => updatePreferences("notifications", e.target.checked)} />
            Enable Notifications
          </label>
        </div>

        <div className="pref-item">
          <label>
            Theme:
            <select value={userData.preferences.theme} onChange={(e) => updatePreferences("theme", e.target.value)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

// AI Actions Demo Component
function AIActionsDemo() {
  const aiActions = useAIActions();
  const [registeredActionNames, setRegisteredActionNames] = useState<string[]>([]);

  useEffect(() => {
    // Helper function to update registered actions
    const updateRegisteredActions = () => {
      setRegisteredActionNames(aiActions.registeredActions);
    };

    // Register location action
    aiActions.registerAction("get_location", async (data, helpers) => {
      const confirmed = await helpers.confirm({
        title: "Location Access",
        description: "This React app wants to access your location. Allow?",
        acceptLabel: "Allow",
        rejectLabel: "Deny",
      });

      if (!confirmed) {
        helpers.respond("Location access denied by user");
        return;
      }

      if (!navigator.geolocation) {
        helpers.respond("Geolocation not supported by this browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          helpers.respond(`Current location: ${latitude}, ${longitude}`);
        },
        (error) => {
          helpers.respond(`Failed to get location: ${error.message}`);
        }
      );
    });

    // // Register React component info action
    // aiActions.registerAction("get_react_info", async (data, helpers) => {
    //   const reactInfo = {
    //     version: React.version,
    //     mode: process.env.NODE_ENV,
    //     components: ["App", "ChatControls", "UserProfile", "AIActionsDemo", "EventLogger"],
    //     hooks: ["useYourGPTChatbot", "useAIActions"],
    //     timestamp: new Date().toISOString(),
    //   };

    //   helpers.respond(`React App Information:\n${JSON.stringify(reactInfo, null, 2)}`);
    // });

    // // Register system info action
    // aiActions.registerAction("get_system_info", async (data, helpers) => {
    //   const systemInfo = {
    //     userAgent: navigator.userAgent,
    //     language: navigator.language,
    //     platform: navigator.platform,
    //     screenSize: `${screen.width}x${screen.height}`,
    //     windowSize: `${window.innerWidth}x${window.innerHeight}`,
    //     url: window.location.href,
    //     timestamp: new Date().toISOString(),
    //   };

    //   helpers.respond(`System Information:\n${JSON.stringify(systemInfo, null, 2)}`);
    // });

    // // Register batch actions
    // aiActions.registerActions({
    //   get_page_title: async (data, helpers) => {
    //     helpers.respond(`Page title: ${document.title}`);
    //   },

    //   scroll_to_top: async (data, helpers) => {
    //     window.scrollTo({ top: 0, behavior: "smooth" });
    //     helpers.respond("Scrolled to top of page");
    //   },

    //   get_current_time: async (data, helpers) => {
    //     const now = new Date();
    //     helpers.respond(`Current time: ${now.toLocaleString()}`);
    //   },
    // });

    // Update initial state
    updateRegisteredActions();

    // Cleanup on unmount
    return () => {
      aiActions.unregisterAction("get_location");
      // aiActions.unregisterAction("get_react_info");
      // aiActions.unregisterAction("get_system_info");
      // aiActions.unregisterAction("get_page_title");
      // aiActions.unregisterAction("scroll_to_top");
      // aiActions.unregisterAction("get_current_time");
    };
  }, []);

  return (
    <div className="ai-actions-demo">
      <h2>AI Actions Demo</h2>
      <p>
        Registered Actions: <strong>{registeredActionNames.length}</strong>
      </p>

      <div className="action-list">
        {registeredActionNames.map((action) => (
          <div key={action} className="action-item">
            <code>{action}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

// Event Logger Component
function EventLogger() {
  const chatbot = useYourGPTChatbot();
  const [events, setEvents] = useState<string[]>([]);

  const addEvent = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    const unsubscribers = [
      chatbot.onInit(() => {
        addEvent("Widget initialized and connected");
      }),

      chatbot.onMessageReceived((data) => {
        addEvent(`Message received: ${JSON.stringify(data)}`);
      }),

      chatbot.onEscalatedToHuman((data) => {
        addEvent(`Escalated to human: ${JSON.stringify(data)}`);
      }),

      chatbot.onWidgetPopup((isOpen) => {
        addEvent(`Widget popup: ${isOpen ? "opened" : "closed"}`);
      }),
    ];

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [chatbot]);

  return (
    <div className="event-logger">
      <h2>Event Log</h2>
      <div className="log-container">
        {events.map((event, index) => (
          <div key={index} className="log-entry">
            {event}
          </div>
        ))}
        {events.length === 0 && <div className="log-empty">No events yet...</div>}
      </div>
    </div>
  );
}

// Styles
const styles = `
  .app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }

  .app-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .app-header h1 {
    color: #333;
    margin-bottom: 10px;
  }

  .app-main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .chat-controls,
  .user-profile,
  .ai-actions-demo,
  .event-logger {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .button-group {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    flex-wrap: wrap;
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #007bff;
    color: white;
    cursor: pointer;
    font-size: 14px;
  }

  button:hover {
    background: #0056b3;
  }

  .widget-status {
    margin-top: 20px;
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
    margin-top: 10px;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 4px;
  }

  .status-ok {
    color: #28a745;
  }

  .status-error {
    color: #dc3545;
  }

  .profile-info {
    margin-bottom: 20px;
  }

  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  .info-item label {
    width: 80px;
    margin-right: 10px;
  }

  .info-item input,
  .info-item select {
    flex: 1;
    padding: 6px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .preferences h3 {
    margin-bottom: 15px;
  }

  .pref-item {
    margin-bottom: 10px;
  }

  .pref-item label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .action-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    margin-top: 10px;
  }

  .action-item {
    padding: 8px;
    background: #fff3cd;
    border-radius: 4px;
    border-left: 3px solid #ffc107;
  }

  .action-item code {
    color: #856404;
    font-weight: bold;
  }

  .log-container {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;
    background: #f8f9fa;
  }

  .log-entry {
    padding: 5px;
    margin-bottom: 5px;
    background: white;
    border-radius: 3px;
    font-family: monospace;
    font-size: 12px;
    border-left: 3px solid #007bff;
  }

  .log-empty {
    text-align: center;
    color: #666;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .app-main {
      grid-template-columns: 1fr;
    }
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default App;
