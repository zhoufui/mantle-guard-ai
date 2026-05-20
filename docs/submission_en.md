# DoraHacks Submission Copy

## Project Name

MantleGuard AI

## Track

AI DevTools

## One-line Pitch

MantleGuard AI is a Mantle-native smart contract audit and gas optimization assistant that helps developers detect launch risks, reduce gas waste, and generate deployment-ready audit reports.

## Project Description

MantleGuard AI is built for developers shipping applications on Mantle. A developer can paste a Solidity contract, run an audit, and receive a structured risk score, issue list, gas optimization advice, Mantle launch-readiness checks, and a handoff report.

The project is not positioned as a generic scanner. It is designed around the Mantle developer workflow: pre-deployment checks, L2 gas awareness, on-chain observability, report handoff, and future report attestation on Mantle.

The current demo includes a runnable browser interface and a rule-based audit engine that detects reentrancy risk, missing access control, unbounded loops, transfer compatibility issues, missing events, and storage optimization opportunities.

## Problem

Hackathon teams and early-stage Web3 developers often deploy contracts quickly, but they can miss three important launch requirements:

- security issues should be found before deployment
- gas and L2 compatibility should be checked systematically
- audit findings should become a clear report that can be shared and tracked

MantleGuard AI compresses this into one workflow: paste contract, get report, fix issues, deploy with more confidence.

## Why Mantle

Mantle needs more safe, usable, developer-friendly applications. MantleGuard AI helps builders reduce launch risk before contracts reach users.

The product focuses on:

- Mantle chain configuration
- L2 gas cost awareness
- on-chain observability
- future support for mETH, USDY, MNT, and Mantle ecosystem integrations
- audit report attestation on Mantle

## Current Status

- Browser demo completed
- Rule-based audit engine completed
- Risk scoring completed
- Gas optimization suggestions completed
- Mantle launch-readiness checks completed
- Audit report generation completed
- Minimal on-chain report registry contract included

## Next Steps

- Connect a real AI model for deeper audit explanations
- Add Solidity AST analysis
- Add report export
- Deploy the report registry contract to Mantle testnet
- Write audit report hashes to Mantle

