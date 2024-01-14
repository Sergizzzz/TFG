const app = require('../client/app'); // Asume que app.js exporta las funciones necesarias

const addresses = {
    managers: ['0xEDBffbd4E936934456Cc27eb77C1D45844F3EFaD'],
    devices: ['0x6aC9897F99e48FCe4105d1671FbB8238D1cdDD20', '0xD362633681e2F94403af19f913a4DA9a3bC4A348', '0x2560C4e5A891c5343B94b0eA058e64f05f12C939'
    ,'0xCAEFDFbAa6901dc49Fb3E365fD2c83CBFE87890F', '0x03adFcAeb2Bb8b90F3A75404AF5A31A4C63295bA', '0x7b6cB05816d7065b8B55405283AaC62310C0F0b5', '0x289fE1ea079eB19E91c500E124dAe4f463d737a4'
    , '0xCb8B232eF9D78Fb1A966adC2209d893F21Dcc017', '0x8e0ea15c79771783ABBAf2b013123C304952161D'],
};

async function simulateMultipleRequests(deviceCount) {
    try {
        console.log(`Starting the performance evaluation with ${deviceCount} devices...`);

        // Registro inicial de un manager
        await app.registerManager(addresses.managers[0]);
        await app.registerDevice(addresses.managers[0], addresses.devices[0]);
        // Registro dinámico de dispositivos y adición de permisos
        const registrationAndPermissionPromises = [];
        for (let i = 1; i < deviceCount; i++) {
            let deviceAddress = addresses.devices[i];
            registrationAndPermissionPromises.push(app.registerDevice(addresses.managers[0], deviceAddress));
            registrationAndPermissionPromises.push(app.addAccessControl(addresses.managers[0], addresses.devices[0], deviceAddress, 'resource1', 'read', 1672444800));
            registrationAndPermissionPromises.push(app.addAccessControl(addresses.managers[0], addresses.devices[0], deviceAddress, 'resource2', 'write', 1672444800));
            registrationAndPermissionPromises.push(app.addAccessControl(addresses.managers[0], addresses.devices[0], deviceAddress, 'resource3', 'execute', 1672444800));
        }

        const startTime = Date.now();
        await Promise.all(registrationAndPermissionPromises);
        const endTime = Date.now();
        console.log(`Total time for handling ${deviceCount - 1} device registrations and access controls: ${endTime - startTime} ms`);
    } catch (error) {
        console.error("Error in simulation:", error);
    }
}

// Llamar a la función con el número deseado de dispositivos
simulateMultipleRequests(5); // Cambia el número según sea necesario
