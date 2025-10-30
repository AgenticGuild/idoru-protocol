// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IEASLike {
    function revoke(bytes32 uid) external;
}

/// @title ValidatorMarket
/// @notice Validator staking and attestation challenge mechanism.
contract ValidatorMarket is Ownable {
    error InsufficientStake();
    error NotValidator();

    IERC20 public immutable stakeToken;
    IEASLike public immutable eas;

    mapping(address => uint256) public validatorStake;

    event Attested(address indexed validator, bytes32 indexed attestationId);
    event Challenged(address indexed challenger, bytes32 indexed attestationId, address indexed validator);
    event Slashed(address indexed validator, uint256 amount);

    constructor(address token_, address eas_, address owner_) Ownable(owner_) {
        stakeToken = IERC20(token_);
        eas = IEASLike(eas_);
    }

    function stake(uint256 amount) external {
        stakeToken.transferFrom(msg.sender, address(this), amount);
        validatorStake[msg.sender] += amount;
    }

    function unstake(uint256 amount) external {
        uint256 s = validatorStake[msg.sender];
        require(s >= amount, "insufficient");
        validatorStake[msg.sender] = s - amount;
        stakeToken.transfer(msg.sender, amount);
    }

    function attest(bytes32 attestationId) external {
        if (validatorStake[msg.sender] == 0) revert NotValidator();
        emit Attested(msg.sender, attestationId);
    }

    function challenge(bytes32 attestationId, address validator, uint256 slashAmount) external onlyOwner {
        emit Challenged(msg.sender, attestationId, validator);
        _slash(validator, slashAmount);
        // Revoke in EAS if supported
        eas.revoke(attestationId);
    }

    function _slash(address validator, uint256 amount) internal {
        uint256 s = validatorStake[validator];
        if (s < amount) revert InsufficientStake();
        validatorStake[validator] = s - amount;
        emit Slashed(validator, amount);
    }
}



