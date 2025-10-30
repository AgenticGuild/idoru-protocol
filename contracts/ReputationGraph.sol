// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ReputationGraph
/// @notice Aggregates WorkReceipts to maintain agent scores.
interface IValidatorMarketView {
    function validatorStake(address v) external view returns (uint256);
}

contract ReputationGraph {
    mapping(address => int256) public agentScore;
    IValidatorMarketView public immutable validatorMarket;

    event ScoreUpdated(address indexed agent, int256 newScore);

    constructor(address validatorMarket_) {
        validatorMarket = IValidatorMarketView(validatorMarket_);
    }

    function viewScore(address agent) external view returns (int256) {
        return agentScore[agent];
    }

    function updateScore(address agent, int256 delta) external {
        int256 newScore = agentScore[agent] + delta;
        agentScore[agent] = newScore;
        emit ScoreUpdated(agent, newScore);
    }
}



