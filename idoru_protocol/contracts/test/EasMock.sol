// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EasMock {
    function isAttestationValid(bytes32) external pure returns (bool) {
        return true;
    }
    function revoke(bytes32) external pure {}
}


