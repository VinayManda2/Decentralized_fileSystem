import { useState } from "react";
import axios from "axios";
import Web3 from "web3";
import IPFSHashStorage from "../contracts/IPFSHashStorage.json";

const AddFile = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [file, setFile] = useState(null);
  const [fileHash, setFileHash] = useState("");
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const { title, description } = formData;
    const formDataToSend = new FormData();
    formDataToSend.append("title", title);
    formDataToSend.append("description", description);
    formDataToSend.append("file", file);

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formDataToSend,
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
      setFileHash(ipfsHash);

      // Connect to Ethereum blockchain
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3 = new Web3(window.ethereum);
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = IPFSHashStorage.networks[networkId];
        const contract = new web3.eth.Contract(
          IPFSHashStorage.abi,
          deployedNetwork && deployedNetwork.address
        );

        // Get account address from localStorage
        const account = localStorage.getItem("account");

        // Call the smart contract function to add the file hash
        await contract.methods.addFile(ipfsHash, title, description).send({
          from: account,
        });
      } else {
        console.error("Web3 provider not detected");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="row add mt-4">
      <div className="col-8 offset-2">
        <h3>Upload files to Blockchain</h3>
        <form
          noValidate
          className={`needs-validation ${validated ? "was-validated" : ""}`}
          encType="multipart/form-data"
          onSubmit={handleSubmit}
        >
          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              Title
            </label>
            <input
              name="title"
              placeholder="Add title"
              type="text"
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              required
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && (
              <div className="invalid-feedback">{errors.title}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              name="description"
              className={`form-control ${
                errors.description ? "is-invalid" : ""
              }`}
              required
              value={formData.description}
              onChange={handleChange}
            ></textarea>
            {errors.description && (
              <div className="invalid-feedback">{errors.description}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="image" className="form-label">
              Upload Image
            </label>
            <input
              type="file"
              className={`form-control ${errors.file ? "is-invalid" : ""}`}
              required
              onChange={(e) => setFile(e.target.files[0])}
            />
            {errors.file && (
              <div className="invalid-feedback">{errors.file}</div>
            )}
          </div>

          <br />
          <button className="btn btn-dark add-btn">Add</button>
          <br />
          <br />
        </form>
      </div>
    </div>
  );
};

export default AddFile;
