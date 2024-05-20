import React, { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import IPFSHashStorage from "../contracts/IPFSHashStorage.json";

const AllFiles = () => {
  const [files, setFiles] = useState([]);
  const [contract, setContract] = useState(null);
  const account = localStorage.getItem("account");

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        console.log(
          "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
      }
    };

    const loadBlockchainData = async () => {
      const web3 = window.web3;

      // Set contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = IPFSHashStorage.networks[networkId];
      const instance = new web3.eth.Contract(
        IPFSHashStorage.abi,
        deployedNetwork && deployedNetwork.address
      );
      setContract(instance);

      // Fetch files data from the contract
      try {
        const filesCount = await instance.methods.fileCount().call();
        const newFiles = [];
        for (let i = 1; i <= filesCount; i++) {
          const fileInfo = await instance.methods.getFile(i).call();
          newFiles.push({
            ipfsHash: fileInfo.ipfsHash,
            title: fileInfo.title, // Add title here
            description: fileInfo.description,
            timestamp: fileInfo.timestamp,
          });
        }
        setFiles(newFiles);
      } catch (error) {
        console.error("Error fetching files from contract:", error);
      }
    };

    loadWeb3();
    loadBlockchainData();
  }, []);

  const downloadFile = async (ipfsHash) => {
    try {
      const response = await axios.get(`https://ipfs.io/ipfs/${ipfsHash}`, {
        responseType: "arraybuffer", // Ensure response is treated as an array buffer
      });
      // Check if response data is not empty
      if (response && response.data) {
        // Extract file extension from content type if available
        const contentType = response.headers["content-type"];
        const fileExtension = contentType ? contentType.split("/")[1] : "txt"; // Default to 'txt' if content type is not available

        // Prompt user to save the file with a suggested name
        const suggestedFileName = `file_${ipfsHash}.${fileExtension}`;
        const downloadConfirmed = window.confirm(
          `Do you want to download "${suggestedFileName}"?`
        );

        // If user confirms, proceed with download
        if (downloadConfirmed) {
          const blob = new Blob([response.data], { type: contentType });
          const url = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", suggestedFileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        console.error("Empty response received from IPFS");
      }
    } catch (error) {
      console.error("Error downloading file from IPFS:", error);
    }
  };

  return (
    <div>
      <h2>Connected Account: {account}</h2>
      {files.length > 0 && (
        <div>
          <h2>Files:</h2>
          {files.map((file, index) => (
            <div key={index}>
              <p>File Hash: {file.ipfsHash}</p>
              <p>File Title: {file.title}</p>
              <p>Description: {file.description}</p>
              <p>Timestamp: {file.timestamp}</p>
              <button onClick={() => downloadFile(file.ipfsHash)}>
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllFiles;
