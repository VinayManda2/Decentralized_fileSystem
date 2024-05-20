import React from "react";
import Manage from "./components/Manage";
import { EthProvider } from "./contexts/EthContext";

function App() {
  return (
    <EthProvider>
      <div id="App">
        <div className="container">
          <Manage />
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
