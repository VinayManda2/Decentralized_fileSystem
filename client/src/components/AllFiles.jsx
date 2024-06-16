import React, { useState, useEffect } from "react";
import Web3 from "web3";
import IPFSHashStorage from "../contracts/IPFSHashStorage.json";
import axios from "axios"; // Import Axios for HTTP requests

const AllFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const web3 = new Web3(window.ethereum);
          const networkId = await web3.eth.net.getId();
          const deployedNetwork = IPFSHashStorage.networks[networkId];
          const contract = new web3.eth.Contract(
            IPFSHashStorage.abi,
            deployedNetwork && deployedNetwork.address
          );

          const accounts = await web3.eth.getAccounts();
          const ownerFilesData = await contract.methods
            .listAllFiles()
            .call({ from: accounts[0] });

          const ids = ownerFilesData[0];
          const ipfsHashes = ownerFilesData[1];
          const titles = ownerFilesData[2];
          const descriptions = ownerFilesData[3];
          const timestamps = ownerFilesData[4];

          const ownerFilesList = ids.map((id, index) => ({
            id,
            ipfsHash: ipfsHashes[index],
            title: titles[index],
            description: descriptions[index],
            timestamp: new Date(timestamps[index] * 1000).toLocaleString(),
          }));

          setFiles(ownerFilesList);
        } catch (error) {
          console.error("Error fetching owner's files:", error);
        }
      } else {
        console.error("Web3 provider not detected");
      }
      setLoading(false);
    };

    fetchFiles();
  }, []);

  const downloadFile = async (ipfsHash) => {
    try {
      const response = await axios.get(`https://ipfs.io/ipfs/${ipfsHash}`, {
        responseType: "arraybuffer", // Ensure response is treated as an array buffer
      });

      if (response && response.data) {
        const contentType = response.headers["content-type"];
        const fileExtension = contentType ? contentType.split("/")[1] : "txt";

        const suggestedFileName = `file_${ipfsHash}.${fileExtension}`;
        const downloadConfirmed = window.confirm(
          `Do you want to download "${suggestedFileName}"?`
        );

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

  const handleDownload = (ipfsHash) => {
    downloadFile(ipfsHash);
  };

  if (loading) {
    return <div>Loading files...</div>;
  }

  return (
    <div>
      <h2 className="md-2">My Files</h2>
      {files.length === 0 ? (
        <p>No files found</p>
      ) : (
        <div className="row">
          {files.map((file) => (
            <div key={file.id} className="col-md-4 mb-4">
              <div className="card border-primary">
                <div className="card-body">
                  <h5 className="card-title">Title : {file.title}</h5>
                  <p className="card-text">Description : {file.description}</p>
                  <p className="card-text">IPFS Hash: {file.ipfsHash}</p>
                  <p className="card-text">Uploaded at: {file.timestamp}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleDownload(file.ipfsHash)}
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllFiles;
