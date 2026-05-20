// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MantleGuardRegistry
/// @notice Minimal on-chain registry for MantleGuard audit report attestations.
contract MantleGuardRegistry {
    event ReportRegistered(
        address indexed submitter,
        bytes32 indexed reportHash,
        string projectName,
        uint256 score,
        uint256 timestamp
    );

    function registerReport(
        bytes32 reportHash,
        string calldata projectName,
        uint256 score
    ) external {
        require(reportHash != bytes32(0), "empty report");
        require(score <= 100, "invalid score");

        emit ReportRegistered(
            msg.sender,
            reportHash,
            projectName,
            score,
            block.timestamp
        );
    }
}

