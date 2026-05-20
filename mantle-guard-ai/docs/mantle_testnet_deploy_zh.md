# Mantle 测试网部署最短路线

目标：部署 `MantleGuardRegistry.sol`，拿到一个 Mantle 测试网合约地址，用于 DoraHacks 的部署证明。

## 准备

- 浏览器钱包，例如 MetaMask
- Mantle Sepolia 测试网
- 少量 Mantle Sepolia 测试币

## Mantle Sepolia 常用信息

```text
Network Name: Mantle Sepolia Testnet
Chain ID: 5003
Currency Symbol: MNT
RPC URL: https://rpc.sepolia.mantle.xyz
Block Explorer: https://explorer.sepolia.mantle.xyz
```

如果这些信息后续变化，以 Mantle 官方文档为准。

## 用 Remix 部署

1. 打开 Remix：

```text
https://remix.ethereum.org/
```

2. 新建文件：

```text
MantleGuardRegistry.sol
```

3. 粘贴本项目里的合约代码：

```text
contracts/MantleGuardRegistry.sol
```

4. Solidity 编译器选择 `0.8.20` 或更高兼容版本。

5. 编译合约。

6. 在 Deploy 页面选择：

```text
Injected Provider - MetaMask
```

7. 确认钱包当前网络是 Mantle Sepolia。

8. 点击 Deploy。

9. 复制部署后的合约地址和区块浏览器链接。

## 登记一份报告

在网页 Demo 里打开 `Proof` 页签，复制当前 `Report Hash`。

在 Remix 的已部署合约里调用：

```text
registerReport(reportHash, "MantleGuard AI demo", score)
```

示例：

```text
reportHash: 0x...
projectName: MantleGuard AI demo
score: 0
```

交易成功后，复制交易哈希和区块浏览器链接。

## DoraHacks 可写材料

```text
MantleGuard AI includes a minimal on-chain report registry deployed on Mantle Sepolia. The registry emits audit report hashes, project names, risk scores, submitter addresses, and timestamps, making audit outputs verifiable and traceable on Mantle.
```

