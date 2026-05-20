# 部署计划

## 最快提交版本

当前版本是纯静态网页，可以部署到：

- GitHub Pages
- Vercel
- Netlify
- DoraHacks 项目附件

## Mantle 部署证明方案

为了冲 Finalist & Deployment Award，建议增加一个很轻的 Mantle 测试网合约，用来记录审计报告摘要。

合约只需要保存：

- 报告哈希
- 合约名称
- 风险分数
- 提交者地址
- 时间戳

这样 Demo 就能说明项目不仅是网页，还和 Mantle 链有实际连接。

## 最小链上合约草案

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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
```

## 后续网页集成

- 连接钱包
- 生成报告哈希
- 调用 registerReport
- 显示 Mantle 测试网交易哈希

## 当前 Demo 已完成

- `Proof` 页签会生成当前审计报告哈希。
- `contracts/MantleGuardRegistry.sol` 可用于 Mantle Sepolia 部署。
- 部署后可以把合约地址和交易哈希填到 DoraHacks 项目页。

详细操作见：

```text
docs/mantle_testnet_deploy_zh.md
```
