import { useState } from "react";
import axios from "axios";
import Web3 from "web3";
import IPFSHashStorage from "../contracts/IPFSHashStorage.json";

const AddFile = ({ onFileAdded }) => {
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
            pinata_api_key: "e7c33357ac6f2c49f523",
            pinata_secret_api_key:
              "cd1fbcda5636a11ffa28bed055bf978282f5dcb753f276b0f28d81cc7652961d",
          },
        }
      );

      const ipfsHash = response.data.IpfsHash;
      setFileHash(ipfsHash);

      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3 = new Web3(window.ethereum);
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = IPFSHashStorage.networks[networkId];
        const contract = new web3.eth.Contract(
          IPFSHashStorage.abi,
          deployedNetwork && deployedNetwork.address
        );

        const account = (await web3.eth.getAccounts())[0];

        const receipt = await contract.methods
          .addFile(ipfsHash, title, description)
          .send({
            from: account,
          });
        console.log("File saved in blockchain:", ipfsHash);

        // Fetch file details using the fileId from the event
        const fileId = receipt.events.FileAdded.returnValues.fileId;

        // Notify parent component that file has been added
        onFileAdded();
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
