# MantleGuard AI

MantleGuard AI is an AI DevTools project for the Turing Test Hackathon 2026.

It is a Mantle-native smart contract audit and gas optimization assistant that helps developers find security risks, gas issues, and Mantle launch-readiness gaps before deployment.

## Prize Targets

The project is built to target three prize paths:

- Finalist & Deployment Award
- Best UI/UX Award
- AI DevTools Track First Prize

## Core Features

- Paste Solidity contract code
- Generate a risk score
- Detect high-impact risks such as reentrancy, missing access control, and unsafe fund sweeping
- Detect medium and low issues such as unbounded loops, transfer compatibility, and missing events
- Provide gas optimization suggestions
- Provide Mantle launch-readiness checks
- Generate an audit report
- Include a minimal Mantle on-chain report registry contract
- Generate a report hash for future Mantle testnet attestation

## Why This Fits AI DevTools

The AI DevTools track calls for smart gas optimization tools and Mantle-specific audit assistants. MantleGuard AI is designed around both:

- It is not a generic scanner; it includes Mantle deployment checks, L2 cost awareness, and on-chain observability by default.
- It follows a real developer workflow: paste contract, review risks, fix issues, generate report, and verify before deployment.
- It can be extended with real AI analysis, on-chain report hashes, and Mantle testnet deployment records.

## Local Run

Open:

```text
index.html
```

You can also run it with any static file server.

## GitHub Pages

This repository is a static site. It can be deployed directly through GitHub Pages from the repository root.

## On-chain Registry Contract

Contract file:

```text
contracts/MantleGuardRegistry.sol
```

It records audit report hashes, project names, risk scores, and submitter addresses as events. The contract is intentionally minimal, holds no funds, and is suitable as Mantle testnet deployment proof.

The browser demo includes a `Proof` tab that generates a report hash and shows the registry call shape.

## Next Extensions

- Connect a real AI model for deeper natural-language audit explanations
- Add Solidity AST analysis
- Add Mantle testnet deployment records
- Write audit report hashes to Mantle
- Add GitHub contract import
- Add team collaboration and report export
