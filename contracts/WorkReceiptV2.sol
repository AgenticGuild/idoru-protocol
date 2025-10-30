// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal IEAS interface for attestation verification
interface IEAS {
    function isAttestationValid(bytes32 uid) external view returns (bool);
}

/// @notice Minimal interface to query payment status from gateway
interface IPaymentGatewayV2 {
    function payments(bytes32 pid)
        external
        view
        returns (
            address payer,
            address payee,
            address token,
            uint256 amount,
            uint256 fee,
            uint256 expiry,
            bool settled,
            bool refunded
        );
}

/// @title WorkReceiptV2
/// @notice Logs post-work receipts tied to settled payments and valid EAS attestations.
contract WorkReceiptV2 {
    error NotSettled();
    error InvalidAttestation();

    struct Receipt {
        bytes32 paymentId;
        address agent;
        bytes32 attestationId;
        bytes32 resultHash;
        bool success;
    }

    IPaymentGatewayV2 public immutable gateway;
    IEAS public immutable eas;

    uint256 public nextId;
    mapping(uint256 => Receipt) public receipts;

    event ReceiptLogged(uint256 indexed id, bytes32 indexed paymentId, bytes32 indexed attestationId, bool success);

    constructor(address gateway_, address eas_) {
        gateway = IPaymentGatewayV2(gateway_);
        eas = IEAS(eas_);
    }

    function logReceipt(bytes32 paymentId, address agent, bytes32 attestationId, bytes32 resultHash, bool success)
        external
        returns (uint256 id)
    {
        (, , , , , , bool settled, ) = gateway.payments(paymentId);
        if (!settled) revert NotSettled();
        if (!eas.isAttestationValid(attestationId)) revert InvalidAttestation();
        id = ++nextId;
        receipts[id] = Receipt({
            paymentId: paymentId,
            agent: agent,
            attestationId: attestationId,
            resultHash: resultHash,
            success: success
        });
        emit ReceiptLogged(id, paymentId, attestationId, success);
    }
}



