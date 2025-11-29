import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

// Inject Zoho SalesIQ widget using Vite env variable `VITE_ZOHO_TOKEN`.
// Create a `.env` in the `client/` folder with `VITE_ZOHO_TOKEN=your_token`.
const zohoToken = import.meta.env.VITE_ZOHO_TOKEN;
if (typeof window !== "undefined" && zohoToken) {
  // 1. Initialize the global objects if they don't exist
  window.$zoho = window.$zoho || {};
  window.$zoho.salesiq = window.$zoho.salesiq || { ready: function () {} };

  // 2. Define the 'ready' function with your Custom Actions
  // This must be defined before the script loads to ensure SalesIQ picks it up on init.
  window.$zoho.salesiq.ready = function () {
    
    // Define the client action listeners here
    window.$zoho.salesiq.clientactions = {
      
      "handle_feedback_click": function (data) {
        // 'data.name' corresponds to the 'name' field in your Deluge Map
        var actionName = data.name;
        window.$zoho.salesiq.visitor.question(actionName);
        window.$zoho.salesiq.chat.start();
        console.log(window.$zoho.salesiq.chat, "Clicked feedback");
      },

      "handle_book_again_click": function (data) {
        var packageId = data.name;
        
        // Use triggerMessage to simulate the user typing this text
        window.$zoho.salesiq.chat.triggerMessage("Book again package " + packageId);
      }
    };
  };

  // 3. Load the main SalesIQ Widget Script
  const s = document.createElement("script");
  s.id = "zsiqscript";
  s.defer = true;
  s.src = `https://salesiq.zohopublic.com/widget?wc=${zohoToken}`;
  document.head.appendChild(s);
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
