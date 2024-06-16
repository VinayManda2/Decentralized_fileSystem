// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IPFSHashStorage {
    // Struct to store IPFS hash with additional metadata if needed
    struct File {
        string ipfsHash;
        string title;
        string description;
        uint256 timestamp;
        address owner; // Owner address stored with each file
    }

    // Mapping to store files by a unique identifier (could be a hash of the file content or a simple index)
    mapping(uint256 => File) private files;
    uint256 public fileCount;

    // Event to emit when a new file is added
    event FileAdded(
        uint256 indexed fileId,
        string ipfsHash,
        string title,
        string description,
        uint256 timestamp,
        address owner // Include owner in the event
    );

    // Function to add a new IPFS hash
    function addFile(
        string memory _ipfsHash,
        string memory _title,
        string memory _description
    ) public {
        fileCount++;
        files[fileCount] = File(
            _ipfsHash,
            _title,
            _description,
            block.timestamp,
            msg.sender // Set the owner as the sender of the transaction
        );

        emit FileAdded(
            fileCount,
            _ipfsHash,
            _title,
            _description,
            block.timestamp,
            msg.sender // Emit the owner in the event
        );
    }

    // Function to get a file's details by its ID
    function getFile(
        uint256 _fileId
    )
        public
        view
        returns (
            string memory ipfsHash,
            string memory title,
            string memory description,
            uint256 timestamp,
            address owner
        )
    {
        File storage file = files[_fileId];
        return (
            file.ipfsHash,
            file.title,
            file.description,
            file.timestamp,
            file.owner
        );
    }

    // Function to list all files of the current owner
    function listAllFiles()
        public
        view
        returns (
            uint256[] memory,
            string[] memory,
            string[] memory,
            string[] memory,
            uint256[] memory
        )
    {
        uint256[] memory ids = new uint256[](fileCount);
        string[] memory ipfsHashes = new string[](fileCount);
        string[] memory titles = new string[](fileCount);
        string[] memory descriptions = new string[](fileCount);
        uint256[] memory timestamps = new uint256[](fileCount);

        uint256 count = 0; // Counter for matching files

        for (uint256 i = 1; i <= fileCount; i++) {
            File storage file = files[i];
            if (file.owner == msg.sender) {
                ids[count] = i;
                ipfsHashes[count] = file.ipfsHash;
                titles[count] = file.title;
                descriptions[count] = file.description;
                timestamps[count] = file.timestamp;
                count++;
            }
        }

        // Trim arrays to correct size based on count
        assembly {
            mstore(ids, count)
            mstore(ipfsHashes, count)
            mstore(titles, count)
            mstore(descriptions, count)
            mstore(timestamps, count)
        }

        return (ids, ipfsHashes, titles, descriptions, timestamps);
    }
}
