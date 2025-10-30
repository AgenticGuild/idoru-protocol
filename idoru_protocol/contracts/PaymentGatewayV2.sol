// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title PaymentGatewayV2
/// @notice Escrow, facilitator-quoted payments with EIP-712 domain config and refund mechanics.
contract PaymentGatewayV2 is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error NotFacilitator();
    error InvalidQuote();
    error AlreadySettled();
    error NotExpired();
    error NotRefundable();

    struct Payment {
        address payer;
        address payee;
        address token;
        uint256 amount;
        uint256 fee;
        uint256 expiry;
        bool settled;
        bool refunded;
    }

    struct Quote {
        address payer;
        address payee;
        address token;
        uint256 amount;
        uint256 fee;
        uint256 expiry;
        bytes32 pid; // off-chain payment id to correlate
    }

    bytes32 public constant EIP712_QUOTE_TYPEHASH = keccak256(
        "Quote(address payer,address payee,address token,uint256 amount,uint256 fee,uint256 expiry,bytes32 pid)"
    );

    bytes32 private immutable DOMAIN_SEPARATOR;
    string public constant EIP712_NAME = "x402 Payment";
    string public constant EIP712_VERSION = "1";

    address public facilitator;
    address public feeCollector;

    mapping(bytes32 => Payment) public payments; // key: pid

    event PaymentQuoted(bytes32 indexed pid, address indexed payer, address token, uint256 amount, uint256 fee, uint256 expiry);
    event PaymentSettled(bytes32 indexed pid, address indexed payer, address indexed payee, uint256 netAmount, uint256 fee);
    event PaymentRefunded(bytes32 indexed pid, address indexed payer, uint256 amount);

    modifier onlyFacilitator() {
        if (msg.sender != facilitator) revert NotFacilitator();
        _;
    }

    constructor(address initialOwner, address facilitator_, address feeCollector_) Ownable(initialOwner) {
        facilitator = facilitator_;
        feeCollector = feeCollector_;
        DOMAIN_SEPARATOR = _buildDomainSeparator();
    }

    function setFacilitator(address facilitator_) external onlyOwner {
        facilitator = facilitator_;
    }

    function setFeeCollector(address feeCollector_) external onlyOwner {
        feeCollector = feeCollector_;
    }

    function domainSeparator() external view returns (bytes32) {
        return DOMAIN_SEPARATOR;
    }

    function _buildDomainSeparator() internal view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(EIP712_NAME)),
                keccak256(bytes(EIP712_VERSION)),
                block.chainid,
                address(this)
            )
        );
    }

    function quote(Quote calldata q, bytes calldata facilitatorSig) external onlyFacilitator {
        bytes32 structHash = keccak256(
            abi.encode(
                EIP712_QUOTE_TYPEHASH,
                q.payer,
                q.payee,
                q.token,
                q.amount,
                q.fee,
                q.expiry,
                q.pid
            )
        );
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, structHash));
        // Below is a minimal check: require sig is from facilitator address
        address recovered = _recover(digest, facilitatorSig);
        if (recovered != facilitator) revert InvalidQuote();

        Payment storage p = payments[q.pid];
        if (p.payer != address(0)) revert InvalidQuote();
        p.payer = q.payer;
        p.payee = q.payee;
        p.token = q.token;
        p.amount = q.amount;
        p.fee = q.fee;
        p.expiry = q.expiry;
        emit PaymentQuoted(q.pid, q.payer, q.token, q.amount, q.fee, q.expiry);
    }

    function payWithPermit(bytes32 pid, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external nonReentrant {
        Payment storage p = payments[pid];
        if (p.payer != msg.sender) revert InvalidQuote();
        if (p.settled || p.refunded) revert AlreadySettled();
        IERC20Permit(p.token).permit(msg.sender, address(this), value, deadline, v, r, s);
        _escrowAndSettle(pid);
    }

    function pay(bytes32 pid) external nonReentrant {
        Payment storage p = payments[pid];
        if (p.payer != msg.sender) revert InvalidQuote();
        if (p.settled || p.refunded) revert AlreadySettled();
        _escrowAndSettle(pid);
    }

    function _escrowAndSettle(bytes32 pid) internal {
        Payment storage p = payments[pid];
        IERC20(p.token).safeTransferFrom(p.payer, address(this), p.amount);

        uint256 fee = p.fee;
        uint256 net = p.amount - fee;
        IERC20(p.token).safeTransfer(p.payee, net);
        if (fee > 0) {
            IERC20(p.token).safeTransfer(feeCollector, fee);
        }
        p.settled = true;
        emit PaymentSettled(pid, p.payer, p.payee, net, fee);
    }

    function refund(bytes32 pid) external onlyFacilitator nonReentrant {
        Payment storage p = payments[pid];
        if (p.settled || p.refunded) revert NotRefundable();
        if (block.timestamp < p.expiry) revert NotExpired();
        p.refunded = true;
        emit PaymentRefunded(pid, p.payer, p.amount);
    }

    function _recover(bytes32 digest, bytes memory signature) internal pure returns (address) {
        if (signature.length != 65) return address(0);
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }
        if (v < 27) v += 27;
        return ecrecover(digest, v, r, s);
    }
}


