pragma solidity ^0.8.13;

contract IoTAccessControl {
    struct Manager {
        address managerAddress;
        bool isRegistered;
    }

    struct Device {
        address deviceAddress;
        address[] managers;
        bool isRegistered;
    }

    struct Permission {
        address subjectDevice;
        address objectDevice;
        string resource;
        string permissionType; // "read", "write", "execute"
        uint expirationTime;
    }

    mapping(address => Manager) public managers;
    mapping(address => Device) public devices;
    mapping(bytes32 => Permission) public permissions;

    // Register a new manager
    function registerManager(address _managerAddress) public {
        require(!managers[_managerAddress].isRegistered, "Manager already registered.");
        managers[_managerAddress] = Manager({managerAddress: _managerAddress, isRegistered: true});
    }

    // Register a new device
    function registerDevice(address _managerAddress, address _deviceAddress) public {
        require(managers[_managerAddress].isRegistered, "Manager is not registered.");
        require(!devices[_deviceAddress].isRegistered, "Device already registered.");
        devices[_deviceAddress].deviceAddress = _deviceAddress;
        devices[_deviceAddress].managers.push(_managerAddress);
        devices[_deviceAddress].isRegistered = true;
        allDevices.push(_deviceAddress);
    }

    // Add a manager to an existing device
    function addManagerToDevice(address _managerAddress, address _deviceAddress) public {
        require(managers[_managerAddress].isRegistered, "Manager is not registered.");
        require(devices[_deviceAddress].isRegistered, "Device is not registered.");
        require(!isManagerOfDevice(_managerAddress, _deviceAddress), "Already a manager of the device.");
        devices[_deviceAddress].managers.push(_managerAddress);
    }

    // Remove a manager from a device
    function removeManagerFromDevice(address _managerAddress, address _deviceAddress) public {
        require(isManagerOfDevice(_managerAddress, _deviceAddress), "Not a manager of the device.");
        require(devices[_deviceAddress].managers.length > 1, "Cannot remove the last manager.");

        uint managerIndex = 0;
        bool managerFound = false;
        for (uint i = 0; i < devices[_deviceAddress].managers.length; i++) {
            if (devices[_deviceAddress].managers[i] == _managerAddress) {
                managerIndex = i;
                managerFound = true;
                break;
            }
        }

        require(managerFound, "Manager not found.");

        for (uint i = managerIndex; i < devices[_deviceAddress].managers.length - 1; i++) {
            devices[_deviceAddress].managers[i] = devices[_deviceAddress].managers[i + 1];
        }
        devices[_deviceAddress].managers.pop();
    }

    // Add access control permissions
    function addAccessControl(address _managerAddress, address _subjectDevice, address _objectDevice, string memory _resource, string memory _permissionType, uint _expirationTime) public {
        require(isManagerOfDevice(_managerAddress, _subjectDevice), "Not a manager of the subject device.");
        bytes32 permissionKey = keccak256(abi.encodePacked(_subjectDevice, _objectDevice, _resource));
        permissions[permissionKey] = Permission({
        subjectDevice: _subjectDevice,
        objectDevice: _objectDevice,
        resource: _resource,
        permissionType: _permissionType,
        expirationTime: _expirationTime
        });
        allPermissions.push(permissionKey);
    }

    // Deregister a manager
    function deregisterManager(address _managerAddress) public {
        require(managers[_managerAddress].isRegistered, "Manager is not registered.");
        managers[_managerAddress].isRegistered = false;
    }

    // Deregister a device
    function deregisterDevice(address _deviceAddress) public {
        require(devices[_deviceAddress].isRegistered, "Device is not registered.");
        devices[_deviceAddress].isRegistered = false;
        delete devices[_deviceAddress].managers;
    }

    // Revoke permission
    function revokePermission(address _subjectDevice, address _objectDevice, string memory _resource) public {
        bytes32 permissionKey = keccak256(abi.encodePacked(_subjectDevice, _objectDevice, _resource));
        // Verificar si el permiso existe
        require(permissions[permissionKey].subjectDevice != address(0), "Permission does not exist.");
        // Verificar si el permiso ha expirado
        require(permissions[permissionKey].expirationTime < block.timestamp, "Permission already expired.");
        delete permissions[permissionKey];
    }

    // Query manager
    function queryManager(address _managerAddress) public view returns (address[] memory) {
        require(managers[_managerAddress].isRegistered, "Manager is not registered.");
        uint deviceCount = 0;

        // Contar el número de dispositivos
        for (uint i = 0; i < allDevices.length; ++i) {
            if (isManagerOfDevice(_managerAddress, allDevices[i])) {
                deviceCount++;
            }
        }

        // Recopilar las direcciones de los dispositivos
        address[] memory managedDevices = new address[](deviceCount);
        uint counter = 0;
        for (uint i = 0; i < allDevices.length; ++i) {
            if (isManagerOfDevice(_managerAddress, allDevices[i])) {
                managedDevices[counter] = allDevices[i];
                counter++;
            }
        }

        return managedDevices;
    }

    // Query permission
    function queryPermission(address _deviceAddress) public view returns (Permission[] memory) {
        require(devices[_deviceAddress].isRegistered, "Device is not registered.");
        uint permissionCount = 0;

        // Contar el número de permisos
        for (uint i = 0; i < allPermissions.length; ++i) {
            if (permissions[allPermissions[i]].subjectDevice == _deviceAddress) {
                permissionCount++;
            }
        }

        // Recopilar los permisos
        Permission[] memory devicePermissions = new Permission[](permissionCount);
        uint counter = 0;
        for (uint i = 0; i < allPermissions.length; ++i) {
            if (permissions[allPermissions[i]].subjectDevice == _deviceAddress) {
                devicePermissions[counter] = permissions[allPermissions[i]];
                counter++;
            }
        }

        return devicePermissions;
    }

    // Note: allDevices y allPermissions son arrays que necesitas mantener actualizados cuando agregues o quites dispositivos y permisos.
    address[] private allDevices;
    bytes32[] private allPermissions;

    // Helper function to check if an address is a manager of a device
    function isManagerOfDevice(address _managerAddress, address _deviceAddress) internal view returns (bool) {
        for (uint i = 0; i < devices[_deviceAddress].managers.length; i++) {
            if (devices[_deviceAddress].managers[i] == _managerAddress) {
                return true;
            }
        }
        return false;
    }
}
