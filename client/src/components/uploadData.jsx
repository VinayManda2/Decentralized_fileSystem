import React, { useState, useEffect } from "react";
import axios from "axios";
import Web3 from "web3";
import SimpleStorageContract from "../contracts/SimpleStorage.json";

const UploadData = () => {
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState("");
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

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
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      setContract(instance);
    };

    loadWeb3();
    loadBlockchainData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key: "8d9d1a9bc5c10d2b4a84",
            pinata_secret_api_key:
              "e8a9a7d301bd2656ffceeaebae8e690aebddb3c9dd84a1aec5be6e2497f4e83b",
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      await contract.methods.set(ipfsHash).send({ from: account });

      setFileHash(ipfsHash);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getHashFromContract = async () => {
    try {
      const ipfsHash = await contract.methods.get().call();
      setFileHash(ipfsHash);
    } catch (error) {
      console.error("Error fetching hash from contract:", error);
    }
  };

  useEffect(() => {
    if (contract) {
      getHashFromContract();
    }
  }, [contract]);

  return (
    <div>
      <h1>File System</h1>
      <p>Upload the file here</p>
      <p>Connected Account: {account}</p>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>
      {fileHash && <p>File Hash: {fileHash}</p>}

    </div>
  );
};

export default UploadData;
