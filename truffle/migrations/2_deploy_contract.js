// 2_deploy_contract.js
const IPFSHashStorage = artifacts.require("IPFSHashStorage");

module.exports = function(deployer) {
  deployer.deploy(IPFSHashStorage);
};
