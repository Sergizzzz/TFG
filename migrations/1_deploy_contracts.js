const IoTAccessControl = artifacts.require("IoTAccessControl");

module.exports = function (deployer) {
  deployer.deploy(IoTAccessControl);
};