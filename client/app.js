const { Web3 } = require('web3');
const contractArtifacts = require('../build/contracts/IoTAccessControl.json');

const web3 = new Web3('http://localhost:7545');
const contractABI = contractArtifacts.abi;
const networkId = Object.keys(contractArtifacts.networks)[0];
const contractAddress = contractArtifacts.networks[networkId] ? contractArtifacts.networks[networkId].address : 'undefined';

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function registerManager(managerAddress) {
    const accounts = await web3.eth.getAccounts();
    const receipt = await contract.methods.registerManager(managerAddress).send({ from: accounts[0] });
    console.log('Manager Registered:', receipt);
}

async function registerDevice(managerAddress, deviceAddress) {
    const accounts = await web3.eth.getAccounts();
    const receipt = await contract.methods.registerDevice(managerAddress, deviceAddress).send({ from: accounts[0], gas: 6721975 });
    console.log('Device Registered:', receipt);
}

async function addManagerToDevice(managerAddress, deviceAddress) {
    const accounts = await web3.eth.getAccounts();
    const receipt = await contract.methods.addManagerToDevice(managerAddress, deviceAddress).send({ from: accounts[0] });
    console.log('Manager Added to Device:', receipt);
}

async function removeManagerFromDevice(managerAddress, deviceAddress) {
    const accounts = await web3.eth.getAccounts();
    const receipt = await contract.methods.removeManagerFromDevice(managerAddress, deviceAddress).send({ from: accounts[0] });
    console.log('Manager Removed from Device:', receipt);
}

async function addAccessControl(managerAddress, subjectDevice, objectDevice, resource, permissionType, expirationTime) {
    const accounts = await web3.eth.getAccounts();
    const receipt = await contract.methods.addAccessControl(managerAddress, subjectDevice, objectDevice, resource, permissionType, expirationTime).send({ from: accounts[0], gas: 6721975 });
    console.log('Access Control Added:', receipt);
}

async function deregisterManager(managerAddress) {
    const accounts = await web3.eth.getAccounts();
    const receipt = await contract.methods.deregisterManager(managerAddress).send({ from: accounts[0] });
    console.log('Manager Deregistered:', receipt);
}

async function deregisterDevice(deviceAddress) {
    const accounts = await web3.eth.getAccounts();
    const receipt = await contract.methods.deregisterDevice(deviceAddress).send({ from: accounts[0] });
    console.log('Device Deregistered:', receipt);
}

async function revokePermission(subjectDevice, objectDevice, resource) {
    const accounts = await web3.eth.getAccounts();
    const receipt = await contract.methods.revokePermission(subjectDevice, objectDevice, resource).send({ from: accounts[0] });
    console.log('Permission Revoked:', receipt);
}

async function queryManager(managerAddress) {
  try {
    const managedDevices = await contract.methods.queryManager(managerAddress).call();
    console.log(`Managed Devices for Manager ${managerAddress}:`, managedDevices);
    return managedDevices; // Esto retornará las direcciones de los dispositivos gestionados por el manager
  } catch (error) {
    console.error(error);
  }
}

async function queryPermission(deviceAddress) {
  try {
    const devicePermissions = await contract.methods.queryPermission(deviceAddress).call();
    console.log(`Permissions for Device ${deviceAddress}:`, devicePermissions);
    return devicePermissions; // Esto retornará los permisos asociados con el dispositivo
  } catch (error) {
    console.error(error);
  }
}

/*
// Simulations
const addresses = {
    managers: ['0x13Bbd58d419a850c25F408d9cd9aA5AE75162085', '0x87F76cead7CF01386046FBeA2736cfc7A7A66C8C', '0xcFb7f2ef1634eeEE770e05F508a99B5c3BE5ad46', '0x4aBaC251EF9eA15e36BE7Ea4538e8A9f0145af65'],
    devices: ['0x34f5E357927262270695C021Bac54Da692E9DA41', '0xa274A202ac321fd0C4BD43Fd94E644a6c56f072B'],
};

async function runWorkflow() {
    await registerManager(addresses.managers[0]);
    await registerManager(addresses.managers[1]);
    await registerDevice(addresses.managers[0], addresses.devices[0]);
    await addManagerToDevice(addresses.managers[1], addresses.devices[0]);
    await queryManager(addresses.managers[0]);

    await addAccessControl(addresses.managers[0], addresses.devices[0], addresses.devices[1], 'resource1', 'read', 1672444800);
    await addAccessControl(addresses.managers[1], addresses.devices[0], addresses.devices[1], 'resource2', 'write', 1672444800);
    await queryPermission(addresses.devices[0]);

    await revokePermission(addresses.devices[0], addresses.devices[1], 'resource1');

    await deregisterManager(addresses.managers[1]);
    await deregisterDevice(addresses.devices[0]);
}

runWorkflow().catch(console.error);

*/

module.exports = {
    registerManager,
    registerDevice,
    addManagerToDevice,
    removeManagerFromDevice,
    addAccessControl,
    deregisterManager,
    deregisterDevice,
    revokePermission,
    queryManager,
    queryPermission
};

