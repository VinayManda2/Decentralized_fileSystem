import React, { useState, useEffect } from "react";
import { FiFolder } from "react-icons/fi";
import Web3 from "web3";
import AddFile from "./components/AddFile";
import AllFiles from "./components/AllFiles";

const App = () => {
  const [account, setAccount] = useState("");
  const [selectedComponent, setSelectedComponent] = useState("allFiles");

  useEffect(() => {
    const storedAccount = localStorage.getItem("account");
    if (storedAccount) {
      setAccount(storedAccount);
    }
  }, []);

  const handleMetaMaskConnection = async () => {
    if (account) {
      setAccount("");
      localStorage.removeItem("account");
    } else {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);
          localStorage.setItem("account", accounts[0]);
        } catch (error) {
          console.error("Error connecting to MetaMask", error);
        }
      } else {
        console.log(
          "MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html"
        );
      }
    }
  };

  const handleFileAdded = () => {
    setSelectedComponent("allFiles");
  };

  const renderComponent = () => {
    switch (selectedComponent) {
      case "addFile":
        return <AddFile onFileAdded={handleFileAdded} />;
      case "allFiles":
      default:
        return <AllFiles />;
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-md navbar-light bg-body-light border-bottom sticky-top bg-white">
        <div className="container-fluid">
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav">
              <div className="nav-link">
                <FiFolder />
              </div>
              <div className="nav-link">File System DApp</div>
            </div>
            <div className="navbar-nav ms-auto">
              <button
                className="nav-link btn btn-link"
                onClick={() => setSelectedComponent("allFiles")}
              >
                All Files
              </button>
              <button
                className="nav-link btn btn-link"
                onClick={() => setSelectedComponent("addFile")}
              >
                Add New File
              </button>
              <button
                className={`btn ${account ? "btn-success" : "btn-primary"}`}
                onClick={handleMetaMaskConnection}
              >
                <b>{account ? "Disconnect" : "Connect"}</b>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="container mt-3">{renderComponent()}</div>
    </>
  );
};

export default App;
