// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IPFSHashStorage {
    // Struct to store IPFS hash with additional metadata if needed
    struct File {
        string ipfsHash;
        string title;
        string description;
        uint256 timestamp;
    }

    // Mapping to store files by a unique identifier (could be a hash of the file content or a simple index)
    mapping(uint256 => File) private files;
    uint256 public fileCount;

    // Event to emit when a new file is added
    event FileAdded(uint256 indexed fileId, string ipfsHash, string title, string description, uint256 timestamp);

    // Function to add a new IPFS hash
    function addFile(string memory _ipfsHash, string memory _title, string memory _description) public {
        fileCount++;
        files[fileCount] = File(_ipfsHash, _title, _description, block.timestamp);
        
        emit FileAdded(fileCount, _ipfsHash, _title, _description, block.timestamp);
    }

    // Function to get a file's details by its ID
    function getFile(uint256 _fileId) public view returns (string memory ipfsHash, string memory title, string memory description, uint256 timestamp) {
        File storage file = files[_fileId];
        return (file.ipfsHash, file.title, file.description, file.timestamp);
    }
}
