import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiFolder } from "react-icons/fi";
import Web3 from "web3";

const Navbar = () => {
  const [account, setAccount] = useState("");

  useEffect(() => {
    // Check if an account is already stored in localStorage
    const storedAccount = localStorage.getItem("account");
    if (storedAccount) {
      setAccount(storedAccount);
    }
  }, []);

  const handleMetaMaskConnection = async () => {
    if (account) {
      // If already connected, disconnect
      setAccount("");
      localStorage.removeItem("account");
    } else {
      // If not connected, connect
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

  return (
    <nav className="navbar navbar-expand-md navbar-light bg-body-light border-bottom sticky-top">
      <div className="container-fluid">
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav">
            <Link to="/" className="nav-link">
              <FiFolder />
            </Link>
            <Link to="/" className="nav-link">
              File System DApp
            </Link>
          </div>
          <div className="navbar-nav ms-auto">
            <Link to="/" className="nav-link">
              All Files
            </Link>
            <Link to="/addfile" className="nav-link">
              Add New File
            </Link>
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
  );
};

export default Navbar;
