import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

// Inject Zoho SalesIQ widget using Vite env variable `VITE_ZOHO_TOKEN`.
// Create a `.env` in the `client/` folder with `VITE_ZOHO_TOKEN=your_token`.
const zohoToken = import.meta.env.VITE_ZOHO_TOKEN;
if (typeof window !== "undefined" && zohoToken) {
  window.$zoho = window.$zoho || {};
  window.$zoho.salesiq = window.$zoho.salesiq || { ready: function () {} };
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
