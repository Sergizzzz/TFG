const IoTAccessControl = artifacts.require("IoTAccessControl");

contract("IoTAccessControl", (accounts) => {
    let contractInstance;
    before(async () => {
        contractInstance = await IoTAccessControl.deployed();
    });

    it("should register a manager", async () => {
        await contractInstance.registerManager(accounts[1]);
        const manager = await contractInstance.managers(accounts[1]);
        assert(manager.isRegistered, "Manager should be registered");
    });

    it("should register a device", async () => {
        // Verifica si el manager ya está registrado
        let manager = await contractInstance.managers(accounts[1]);
        if (!manager.isRegistered) {
            await contractInstance.registerManager(accounts[1], { from: accounts[0] });
        }
        await contractInstance.registerDevice(accounts[1], accounts[2], { from: accounts[1] });
        const device = await contractInstance.devices(accounts[2]);
        assert(device.isRegistered, "Device should be registered");
    });

    it("should add a manager to a device", async () => {
        await contractInstance.addManagerToDevice(accounts[1], accounts[2], { from: accounts[1] });
    });

    it("should remove a manager from a device", async () => {
        await contractInstance.removeManagerFromDevice(accounts[1], accounts[2], { from: accounts[1] });
    });

    it("should allow a manager to add access control permissions", async () => {
        // Preparar el entorno para la prueba
        const managerAddress = accounts[1];
        const subjectDevice = accounts[2];
        const objectDevice = accounts[3];
        const resource = "resource_id";
        const permissionType = "read";
        const expirationTime = Math.floor(Date.now() / 1000) + 600; // 10 minutos desde ahora

        // Agregar permisos de control de acceso
        await contractInstance.addAccessControl(managerAddress, subjectDevice, objectDevice, resource, permissionType, expirationTime, { from: managerAddress });
        const permissionKey = web3.utils.soliditySha3(subjectDevice, objectDevice, resource);
        const permission = await contractInstance.permissions(permissionKey);

        assert.equal(permission.resource, resource, "Resource should match the one that was set");
        assert.equal(permission.permissionType, permissionType, "Permission type should match the one that was set");
        assert.equal(permission.expirationTime.toString(), expirationTime.toString(), "Expiration time should match the one that was set");
    });

    it("should query permissions for a device", async () => {
            const permissions = await contractInstance.queryPermission(accounts[2]);
            assert(Array.isArray(permissions), "Should return an array of permissions");
    });

    it("should allow deregistration of a manager", async () => {
        const managerAddress = accounts[1];
        // Desregistrar el manager
        await contractInstance.deregisterManager(managerAddress);
        const manager = await contractInstance.managers(managerAddress);

        assert.equal(manager.isRegistered, false, "Manager should be deregistered");
    });

    it("should allow deregistration of a device", async () => {
        const managerAddress = accounts[1];
        const deviceAddress = accounts[2];

        // Desregistrar el dispositivo
        await contractInstance.deregisterDevice(deviceAddress);
        const device = await contractInstance.devices(deviceAddress);

        assert.equal(device.isRegistered, false, "Device should be deregistered");
        // Agregar pruebas adicionales para verificar la eliminación de managers asociados si es necesario
    });

    it("should allow revoking of permission", async () => {
        const managerAddress = accounts[1];
        const subjectDevice = accounts[2];
        const objectDevice = accounts[3];
        const resource = "resource_id";
        // Revocar permiso
        await contractInstance.revokePermission(subjectDevice, objectDevice, resource, { from: managerAddress });
        const permissionKey = web3.utils.soliditySha3(subjectDevice, objectDevice, resource);
        const permission = await contractInstance.permissions(permissionKey);

        assert.equal(permission.subjectDevice, 0x0, "Permission should be revoked");
    });
});
