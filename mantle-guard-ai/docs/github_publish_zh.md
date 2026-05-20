# GitHub 发布步骤

## 推荐仓库名

```text
mantle-guard-ai
```

## 方式一：让我继续推送

先在 PowerShell 里运行：

```powershell
gh auth login -h github.com -w
```

按提示登录 GitHub。完成后回到这里告诉我“好了”，我继续创建仓库、提交、推送。

## 方式二：网页手动上传

1. 打开 GitHub。
2. 新建公开仓库，名字填 `mantle-guard-ai`。
3. 不要勾选自动生成 README。
4. 上传 `mantle-guard-ai` 文件夹里的全部文件。
5. 提交到 `main` 分支。

## 开启 GitHub Pages

1. 进入仓库 Settings。
2. 打开 Pages。
3. Source 选择 `Deploy from a branch`。
4. Branch 选择 `main`，目录选择 `/root`。
5. 保存后等待 1 到 3 分钟。

上线链接一般是：

```text
https://你的用户名.github.io/mantle-guard-ai/
```

## DoraHacks 建议填写

- Project Name: `MantleGuard AI`
- Track: `AI DevTools`
- Demo: GitHub Pages 链接
- Repository: GitHub 仓库链接
- Description: 使用 `docs/submission_en.md`

