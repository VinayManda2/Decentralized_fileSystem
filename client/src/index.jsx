import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { EthProvider } from "./contexts/EthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <EthProvider>
      <div id="App">
        <div className="container">
          <App />
        </div>
      </div>
    </EthProvider>
  </React.StrictMode>
);
