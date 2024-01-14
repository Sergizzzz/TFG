const app = require('../client/app'); // Asume que app.js exporta las funciones necesarias

const addresses = {
    managers: ['0x3ACEcD2fe0DA38602F8f76E0b2FB04A3dc17025B', '0x227a0AAd5248C6185297581934320180c4D0E8D3'],
    devices: ['0xF855fBC62B6de3eFB1F0D39EcA52784B8592eD3C', '0xeEa6F7609d14523d8f2e9E59d524A29be06e9378', '0x05ADF83d49f8dA1ee97F1E51474D76b46a4109ab',
    '0xEb33D1aDbFFB7E799e914ce208353a64a2d4C376'],
};

async function simulateComplexRequest() {
    try {
        console.log("Starting the performance evaluation of an IoT device with a complex request...");
        // Registrar un manager y un dispositivo
        const startTime = Date.now();
        await app.registerManager(addresses.managers[0]);
        await app.registerManager(addresses.managers[1]);

        await app.registerDevice(addresses.managers[0], addresses.devices[0]);
        await app.addManagerToDevice(addresses.managers[1], addresses.devices[0]);
        await app.registerDevice(addresses.managers[0], addresses.devices[1]);

        // Suponer que el dispositivo realiza varias operaciones
        await app.addAccessControl(addresses.managers[0], addresses.devices[0], addresses.devices[1], 'resource1', 'read', 1672444800);
        await app.addAccessControl(addresses.managers[0], addresses.devices[0], addresses.devices[1], 'resource2', 'write', 1672444800);
        await app.addAccessControl(addresses.managers[0], addresses.devices[0], addresses.devices[1], 'resource3', 'execute', 1672444800);
        await app.revokePermission(addresses.devices[0], addresses.devices[1], 'resource1');

        await app.removeManagerFromDevice(addresses.managers[0], addresses.devices[0])
        await app.deregisterManager(addresses.managers[0]);
        await app.deregisterDevice(addresses.devices[0]);

        const endTime = Date.now();
        console.log(`Total time for the request: ${endTime - startTime} ms`);
    } catch (error) {
        console.error("Error in simulation:", error);
    }
}

simulateComplexRequest();