const contractInput = document.querySelector("#contractInput");
const runAuditButton = document.querySelector("#runAudit");
const loadSampleButton = document.querySelector("#loadSample");
const lineCount = document.querySelector("#lineCount");

const sampleContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MantleVault {
    address public owner;
    mapping(address => uint256) public balances;
    address[] public depositors;

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        depositors.push(msg.sender);
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "low balance");
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "transfer failed");
        balances[msg.sender] -= amount;
    }

    function sweep(address payable to) external {
        to.transfer(address(this).balance);
    }

    function rewardAll() external {
        for (uint256 i = 0; i < depositors.length; i++) {
            balances[depositors[i]] += 1 ether;
        }
    }
}`;

const rules = [
  {
    id: "reentrancy",
    severity: "high",
    title: "External call before state update",
    pattern: /call\s*\{[^}]*value\s*:\s*[^}]+\}\s*\([^)]*\)[\s\S]{0,220}balances\s*\[[^\]]+\]\s*[-+]?=/i,
    impact: "The withdrawal flow transfers value before reducing the balance, which can allow repeated withdrawals through a callback.",
    fix: "Use the checks-effects-interactions pattern: reduce balance first, then transfer value. Add a reentrancy guard where needed.",
  },
  {
    id: "missing-owner-check",
    severity: "high",
    title: "Sensitive function lacks access control",
    pattern: /function\s+\w+\([^)]*\)\s+external[\s\S]{0,180}address\(this\)\.balance/i,
    impact: "Any address may call a treasury or admin function, potentially moving all contract funds.",
    fix: "Add onlyOwner or role-based access control, and emit events for critical operations.",
  },
  {
    id: "unbounded-loop",
    severity: "medium",
    title: "Unbounded loop can exhaust gas",
    pattern: /for\s*\([^;]+;\s*[^;]+<\s*\w+\.length\s*;/i,
    impact: "As the array grows, batch operations can fail even on Mantle because of block gas limits.",
    fix: "Use pagination, capped batches, or event-driven settlement instead of iterating over every user.",
  },
  {
    id: "transfer-usage",
    severity: "medium",
    title: "transfer can reduce compatibility",
    pattern: /\.transfer\s*\(/i,
    impact: "Fixed-gas transfers may fail for complex receivers and reduce protocol reliability.",
    fix: "Use call, check the return value, and pair it with reentrancy protection and state-first updates.",
  },
  {
    id: "missing-events",
    severity: "low",
    title: "Key state changes are missing events",
    pattern: /function\s+(deposit|withdraw|sweep|set|update)/i,
    negativePattern: /event\s+\w+/i,
    impact: "Indexing, audit trails, and frontend state sync become harder.",
    fix: "Emit events for deposits, withdrawals, permission changes, and parameter updates.",
  },
  {
    id: "owner-not-immutable",
    severity: "low",
    title: "Deployment-time constants can be immutable",
    pattern: /address\s+public\s+owner\s*;/i,
    impact: "Reading owner from storage adds unnecessary runtime cost.",
    fix: "If owner never changes, use address public immutable owner.",
  },
];

const gasRules = [
  {
    title: "Reduce repeated storage writes",
    pattern: /balances\s*\[[^\]]+\]\s*\+=/i,
    detail: "Cache repeated mapping reads or writes locally and write back only when needed.",
  },
  {
    title: "Cap growing arrays",
    pattern: /\w+\.push\s*\(/i,
    detail: "Unbounded arrays make future iteration and maintenance expensive. Add caps or use event indexing.",
  },
  {
    title: "Use unchecked increments where safe",
    pattern: /for\s*\(\s*uint256\s+\w+\s*=\s*0/i,
    detail: "When loop bounds are controlled, unchecked increments can save gas.",
  },
  {
    title: "Replace revert strings with custom errors",
    pattern: /require\s*\([^,]+,\s*"[^"]+"\s*\)/i,
    detail: "Custom errors reduce deployment and runtime cost compared with revert strings.",
  },
];

function analyzeContract(source) {
  const findings = rules
    .filter((rule) => rule.pattern.test(source) && !(rule.negativePattern && rule.negativePattern.test(source)))
    .map((rule) => ({ ...rule }));

  const gas = gasRules
    .filter((rule) => rule.pattern.test(source))
    .map((rule) => ({ ...rule }));

  const mantle = buildMantleChecks(source);
  const score = calculateScore(findings, gas, mantle);

  return { findings, gas, mantle, score };
}

function buildMantleChecks(source) {
  const checks = [
    {
      title: "Mantle chain configuration",
      status: /5000|5001|mantle/i.test(source) ? "Pass" : "Missing",
      detail: "The deployment script should explicitly configure Mantle mainnet or testnet chain IDs to avoid wrong-chain deployment.",
    },
    {
      title: "L2 cost awareness",
      status: /gas|loop|batch|calldata|storage/i.test(source) ? "Partial" : "Missing",
      detail: "Mantle is cheaper than L1, but large loops and frequent storage writes can still hurt UX.",
    },
    {
      title: "On-chain observability",
      status: /event\s+\w+/i.test(source) ? "Pass" : "Missing",
      detail: "Critical actions should emit events so explorers, indexers, and risk tools can read them.",
    },
    {
      title: "Ecosystem fit",
      status: /mETH|USDY|MNT|Mantle/i.test(source) ? "Pass" : "Missing",
      detail: "If the app targets Mantle assets or protocols, state the integration point clearly.",
    },
  ];

  return checks;
}

function calculateScore(findings, gas, mantle) {
  const severityWeight = { high: 24, medium: 13, low: 6 };
  const issuePenalty = findings.reduce((sum, item) => sum + severityWeight[item.severity], 0);
  const gasPenalty = Math.min(gas.length * 5, 18);
  const mantlePenalty = mantle.filter((item) => item.status === "Missing").length * 5;
  return Math.max(0, Math.min(100, 100 - issuePenalty - gasPenalty - mantlePenalty));
}

function severityLabel(severity) {
  return { high: "High", medium: "Medium", low: "Low" }[severity] || "Info";
}

function riskLevel(score) {
  if (score >= 82) return ["Low Risk", "The contract looks stable, but the Mantle launch checks should still be completed."];
  if (score >= 58) return ["Medium Risk", "The contract can continue toward launch after key risks and gas issues are fixed."];
  return ["High Risk", "This version should not be deployed to mainnet until high-impact issues are fixed."];
}

function renderFindings(result) {
  const issues = document.querySelector("#issues");
  const gas = document.querySelector("#gas");
  const mantle = document.querySelector("#mantle");
  const attest = document.querySelector("#attest");
  const report = document.querySelector("#report");
  const reportText = buildReport(result);

  issues.innerHTML = result.findings.length
    ? result.findings.map(renderIssue).join("")
    : `<div class="finding"><h4>No obvious rule-covered risks found</h4><p>This is not a full audit pass. Manual review and tests are still required.</p></div>`;

  gas.innerHTML = result.gas.length
    ? result.gas.map(renderGas).join("")
    : `<div class="finding"><h4>No obvious gas wins found</h4><p>Deployment scripts, call frequency, and real transaction cost should still be reviewed.</p></div>`;

  mantle.innerHTML = result.mantle.map(renderMantle).join("");
  attest.innerHTML = renderProof(result, reportText);
  report.innerHTML = `<pre class="report-text">${reportText}</pre>`;
  updateReportHash(reportText);
}

function renderIssue(item) {
  return `<article class="finding ${item.severity}">
    <span class="badge ${item.severity}">${severityLabel(item.severity)}</span>
    <h4>${item.title}</h4>
    <p><strong>Impact:</strong> ${item.impact}</p>
    <p><strong>Fix:</strong> ${item.fix}</p>
  </article>`;
}

function renderGas(item) {
  return `<article class="finding medium">
    <span class="badge medium">Optimize</span>
    <h4>${item.title}</h4>
    <p>${item.detail}</p>
  </article>`;
}

function renderMantle(item) {
  const tone = item.status === "Pass" ? "low" : item.status === "Partial" ? "medium" : "high";
  return `<article class="finding ${tone}">
    <span class="badge ${tone}">${item.status}</span>
    <h4>${item.title}</h4>
    <p>${item.detail}</p>
  </article>`;
}

function renderProof(result, reportText) {
  const previewHash = pseudoHash(reportText);
  return `<div class="proof-grid">
    <article class="finding low">
      <span class="badge low">Ready</span>
      <h4>On-chain report attestation</h4>
      <p>MantleGuard includes a minimal registry contract that can emit the audit report hash, project name, score, submitter address, and timestamp on Mantle testnet.</p>
      <p><strong>Contract:</strong> contracts/MantleGuardRegistry.sol</p>
    </article>
    <article class="finding medium">
      <span class="badge medium">Report Hash</span>
      <h4>Current audit fingerprint</h4>
      <p>This hash is generated from the current report text. Use it as the input for registerReport after deploying the registry contract.</p>
      <div class="hash-box" id="reportHash">${previewHash}</div>
    </article>
    <article class="finding">
      <span class="badge">Call Data</span>
      <h4>Registry call</h4>
      <div class="hash-box">registerReport(reportHash, "MantleGuard AI demo", ${result.score})</div>
    </article>
  </div>`;
}

function pseudoHash(text) {
  let h1 = 0x811c9dc5;
  let h2 = 0x45d9f3b;
  for (let i = 0; i < text.length; i += 1) {
    h1 ^= text.charCodeAt(i);
    h1 = Math.imul(h1, 16777619);
    h2 ^= h1 >>> 13;
    h2 = Math.imul(h2, 1597334677);
  }
  const part = (value) => (value >>> 0).toString(16).padStart(8, "0");
  return `0x${part(h1)}${part(h2)}${part(h1 ^ h2)}${part(Math.imul(h1, h2))}`;
}

async function updateReportHash(text) {
  if (!window.crypto?.subtle) return;
  const bytes = new TextEncoder().encode(text);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  const hash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  const element = document.querySelector("#reportHash");
  if (element) element.textContent = `0x${hash}`;
}

function buildReport(result) {
  const [level, summary] = riskLevel(result.score);
  const highCount = result.findings.filter((item) => item.severity === "high").length;
  const mediumCount = result.findings.filter((item) => item.severity === "medium").length;
  const lowCount = result.findings.filter((item) => item.severity === "low").length;
  const mantlePassCount = result.mantle.filter((item) => item.status === "Pass").length;
  const mantlePartialCount = result.mantle.filter((item) => item.status === "Partial").length;
  const mantleMissingCount = result.mantle.filter((item) => item.status === "Missing").length;

  return [
    "MantleGuard AI Audit Report",
    "===========================",
    `Score: ${result.score}/100`,
    `Risk Level: ${level}`,
    `Summary: ${summary}`,
    "",
    "Risk Breakdown",
    `- High: ${highCount}`,
    `- Medium: ${mediumCount}`,
    `- Low: ${lowCount}`,
    `- Gas opportunities: ${result.gas.length}`,
    `- Mantle checks passed: ${mantlePassCount}`,
    `- Mantle checks partial: ${mantlePartialCount}`,
    `- Mantle checks missing: ${mantleMissingCount}`,
    "",
    "Pre-launch Recommendations",
    "1. Fix all high-impact findings first.",
    "2. Add unit and boundary tests for critical functions.",
    "3. Deploy and verify transactions on Mantle testnet.",
    "4. Record deployment address, chain ID, report hash, and version.",
    "5. Run a final manual review before mainnet launch.",
  ].join("\n");
}

function updateMetrics(result) {
  const [level, summary] = riskLevel(result.score);
  const mantlePass = result.mantle.filter((item) => item.status === "Pass").length;
  const ring = document.querySelector("#scoreRing");
  const ringColor = result.score >= 82 ? "#145d58" : result.score >= 58 ? "#d99a2b" : "#d94a3a";

  document.querySelector("#riskScore").textContent = result.score;
  document.querySelector("#issueCount").textContent = result.findings.length;
  document.querySelector("#mantleFit").textContent = `${mantlePass}/${result.mantle.length}`;
  document.querySelector("#gasCount").textContent = result.gas.length;
  document.querySelector("#scoreText").textContent = result.score;
  document.querySelector("#riskLevel").textContent = level;
  document.querySelector("#riskSummary").textContent = summary;
  document.querySelector("#auditStatus").textContent = "Complete";
  ring.style.setProperty("--score", result.score);
  ring.style.setProperty("--ring-color", ringColor);
}

function runAudit() {
  const source = contractInput.value.trim();
  if (!source) {
    contractInput.value = sampleContract;
  }
  const result = analyzeContract(contractInput.value);
  updateMetrics(result);
  renderFindings(result);
  updateLineCount();
}

function updateLineCount() {
  const lines = contractInput.value ? contractInput.value.split("\n").length : 0;
  lineCount.textContent = `${lines} lines`;
}

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
    document.querySelectorAll(".tab-view").forEach((view) => view.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.tab}`).classList.add("active");
  });
});

runAuditButton.addEventListener("click", runAudit);
loadSampleButton.addEventListener("click", () => {
  contractInput.value = sampleContract;
  runAudit();
});
contractInput.addEventListener("input", updateLineCount);

contractInput.value = sampleContract;
runAudit();
