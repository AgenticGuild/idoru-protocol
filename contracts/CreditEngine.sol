// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IReputationView {
    function viewScore(address agent) external view returns (int256);
}

/// @title CreditEngine
/// @notice Very simple credit lines gated by reputation score, with ERC-4626-like pool assumed off-chain.
contract CreditEngine is Ownable {
    error InsufficientReputation();
    error NotEnoughCollateral();

    IReputationView public immutable reputation;
    IERC20 public immutable collateral;

    mapping(address => uint256) public creditLine;
    mapping(address => uint256) public collateralBalance;

    event CreditGranted(address indexed agent, uint256 amount);
    event CollateralDeposited(address indexed agent, uint256 amount);

    constructor(address reputation_, address collateral_, address owner_) Ownable(owner_) {
        reputation = IReputationView(reputation_);
        collateral = IERC20(collateral_);
    }

    function depositCollateral(uint256 amount) external {
        collateral.transferFrom(msg.sender, address(this), amount);
        collateralBalance[msg.sender] += amount;
        emit CollateralDeposited(msg.sender, amount);
    }

    function grantCredit(address agent, uint256 amount) external onlyOwner {
        int256 score = reputation.viewScore(agent);
        if (score <= 0) revert InsufficientReputation();
        // naive rule: credit line <= 50% of collateral
        uint256 maxCredit = collateralBalance[agent] / 2;
        if (amount > maxCredit) revert NotEnoughCollateral();
        creditLine[agent] = amount;
        emit CreditGranted(agent, amount);
    }
}



