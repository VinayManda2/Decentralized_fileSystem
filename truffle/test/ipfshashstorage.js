const IPFSHashStorage = artifacts.require("IPFSHashStorage");

const { expect } = require("chai");
const truffleAssert = require("truffle-assertions");

contract("IPFSHashStorage", function (accounts) {
  let ipfsHashStorage;
  const owner = accounts[0];
  const addr1 = accounts[1];
  const addr2 = accounts[2];

  beforeEach(async function () {
    ipfsHashStorage = await IPFSHashStorage.new({ from: owner });
  });

  describe("Add and retrieve files", function () {
    it("Should allow a user to add a file and retrieve it", async function () {
      const tx = await ipfsHashStorage.addFile(
        "QmExampleHash",
        "Example Title",
        "Example Description",
        { from: addr1 }
      );

      truffleAssert.eventEmitted(tx, "FileAdded", (ev) => {
        return (
          ev.ipfsHash === "QmExampleHash" &&
          ev.title === "Example Title" &&
          ev.description === "Example Description" &&
          ev.owner === addr1
        );
      });

      const file = await ipfsHashStorage.getFile(1);
      expect(file.ipfsHash).to.equal("QmExampleHash");
      expect(file.title).to.equal("Example Title");
      expect(file.description).to.equal("Example Description");
      expect(file.owner).to.equal(addr1);
    });
  });

  describe("List files by owner", function () {
    it("Should list all files added by the current owner", async function () {
      await ipfsHashStorage.addFile(
        "QmHash1",
        "Title 1",
        "Description 1",
        { from: addr1 }
      );
      await ipfsHashStorage.addFile(
        "QmHash2",
        "Title 2",
        "Description 2",
        { from: addr1 }
      );
      await ipfsHashStorage.addFile(
        "QmHash3",
        "Title 3",
        "Description 3",
        { from: addr2 }
      );

      // Call listAllFiles and capture the return values
    const result = await ipfsHashStorage.listAllFiles({ from: addr1 });

    // Destructure the returned arrays from result
    const ids = result[0];
    const ipfsHashes = result[1];
    const titles = result[2];
    const descriptions = result[3];
    const timestamps = result[4];

      // Check the number of files owned by addr1
      expect(ids.length).to.equal(2);

      // Check details of the first file
      expect(ipfsHashes[0]).to.equal("QmHash1");
      expect(titles[0]).to.equal("Title 1");
      expect(descriptions[0]).to.equal("Description 1");
      // Check details of the second file
      expect(ipfsHashes[1]).to.equal("QmHash2");
      expect(titles[1]).to.equal("Title 2");
      expect(descriptions[1]).to.equal("Description 2");
    });
  });
});
