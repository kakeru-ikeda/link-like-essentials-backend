# CI/CD パイプライン ドキュメント

## 概要

このプロジェクトでは、**GitHub Actions**と**Jenkins**の2段階CI/CDパイプラインを採用しています。

- **GitHub Actions**: コード品質保証（CI）
- **Jenkins**: デプロイメント実行（CD）

---

## CI: GitHub Actions

### 目的
コードの品質を保証し、mainブランチへのマージ前に必ず以下をチェック：
1. ✅ Lint（ESLint + Prettier）
2. ✅ Unit Tests（Jest）
3. ✅ Type Check（TypeScript）

### トリガー条件
- `main`または`develop`ブランチへのPush
- `main`または`develop`ブランチへのPull Request

### 必須条件
以下のすべてのジョブが成功することが**マージの必須条件**：

#### 1. Lint Check
```bash
npm run lint          # ESLint（max-warnings 0）
npm run format:check  # Prettier
```
- **失敗条件**: ESLintエラーまたは警告が1件でも存在
- **修正方法**: `npm run lint:fix` または `npm run format`

#### 2. Unit Tests
```bash
npm run test:unit     # Jestユニットテスト
```
- **失敗条件**: テストが1件でも失敗
- **カバレッジ**: Codecovへ自動アップロード
- **推奨カバレッジ**: 80%以上

#### 3. Type Check
```bash
npm run type-check    # TypeScript型チェック
```
- **失敗条件**: 型エラーが1件でも存在
- **設定**: `tsconfig.json`の`strict: true`

### ブランチ保護ルール

GitHubリポジトリ設定で以下を設定推奨：

```
Settings > Branches > Branch protection rules

✅ Require status checks to pass before merging
  - lint
  - test
  - type-check
  - ci-success

✅ Require branches to be up to date before merging
✅ Require pull request reviews before merging (1 approval)
□ Require conversation resolution before merging
```

---

## CD: Jenkins

### 目的
GitHub ActionsのCI成功を前提に、アプリケーションをデプロイ。

### トリガー条件
- **手動実行** または **GitHub Webhook**
- CIが成功したコミットのみデプロイ可能

### デプロイフロー

```
┌─────────────────────┐
│ 1. Verify CI Status │  ← GitHub Actions成功確認
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ 2. Build Docker     │  ← Dockerイメージビルド
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ 3. Push to Registry │  ← レジストリへプッシュ
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ 4. DB Migration     │  ← Prisma Migrate（本番のみ）
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ 5. Deploy           │  ← K8sへデプロイ
│   - Staging: Auto   │
│   - Production: 手動│
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ 6. Health Check     │  ← ヘルスチェック
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│ 7. Smoke Tests      │  ← 簡易動作確認
└─────────────────────┘
```

### 環境別デプロイ

#### Staging環境（developブランチ）
- **自動デプロイ**: CI成功後、自動的にStagingへデプロイ
- **承認不要**: 即座にデプロイ実行
- **用途**: 開発中の機能テスト、統合テスト

#### Production環境（mainブランチ）
- **手動承認**: デプロイ前に承認が必要
- **承認者**: DevOpsチームまたはプロジェクトリード
- **DB Migration**: 本番データベースへのマイグレーション実行
- **Blue-Green Deployment**: ダウンタイムゼロのデプロイ
- **自動ロールバック**: デプロイ失敗時に前バージョンへ自動復旧

### Jenkinsfile 設定

#### 環境変数

```groovy
environment {
    DOCKER_REGISTRY = 'your-registry.example.com'
    IMAGE_NAME = 'link-like-essentials-backend'
    DOCKER_CREDENTIALS_ID = 'docker-registry-credentials'
}
```

**設定手順:**
1. Jenkins管理画面 > Credentials
2. Docker Registryの認証情報を追加
3. IDを`docker-registry-credentials`に設定

#### Kubernetesデプロイメント

デフォルトでKubernetes（kubectl）を使用：

```bash
kubectl set image deployment/link-like-backend-production \
  backend=${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
  --namespace=production
```

**他のデプロイ方法への変更:**
- Docker Swarm: `docker service update`
- AWS ECS: `aws ecs update-service`
- SSH直接デプロイ: `sshpass -p $PASSWORD ssh user@host`

---

## 開発ワークフロー

### 1. 新機能開発

```bash
# feature ブランチ作成
git checkout -b feature/new-feature develop

# 開発 & コミット
git add .
git commit -m "feat: add new feature"

# プッシュ
git push origin feature/new-feature
```

### 2. Pull Request作成

1. GitHubでPR作成: `feature/new-feature` → `develop`
2. **GitHub Actions CI自動実行** 🚀
   - Lint ✅
   - Tests ✅
   - Type Check ✅
3. CIが全て成功するまでマージ不可 ❌
4. レビュー承認を取得
5. マージ ✅

### 3. Stagingデプロイ

```bash
# developブランチへのマージでJenkinsが自動実行
# → Staging環境へ自動デプロイ
```

### 4. Production リリース

```bash
# Release PR作成
develop → main

# PR承認 & マージ
# → Jenkins実行
# → 手動承認待ち
# → Production デプロイ ✅
```

---

## トラブルシューティング

### CI失敗時

#### Lint失敗
```bash
# ローカルで確認
npm run lint

# 自動修正
npm run lint:fix
npm run format

# 再コミット
git add .
git commit -m "fix: lint errors"
git push
```

#### Test失敗
```bash
# ローカルでテスト実行
npm run test:unit

# 特定テストのみ実行
npm run test:unit -- CardService.test.ts

# ウォッチモードで開発
npm run test:watch
```

#### Type Check失敗
```bash
# 型エラー確認
npm run type-check

# VSCodeで確認
# 問題タブで型エラーを確認
```

### デプロイ失敗時

#### ロールバック（Jenkins自動実行）
```bash
# 本番環境のみ自動ロールバック
kubectl rollout undo deployment/link-like-backend-production \
  --namespace=production
```

#### 手動ロールバック
```bash
# 履歴確認
kubectl rollout history deployment/link-like-backend-production \
  --namespace=production

# 特定バージョンへロールバック
kubectl rollout undo deployment/link-like-backend-production \
  --namespace=production \
  --to-revision=2
```

#### ヘルスチェック失敗
```bash
# Podログ確認
kubectl logs -f deployment/link-like-backend-production \
  --namespace=production

# Pod状態確認
kubectl get pods -n production
kubectl describe pod <pod-name> -n production
```

---

## ローカル開発でのCI検証

デプロイ前にローカルでCIを通過するか確認：

```bash
# Lint
npm run lint
npm run format:check

# Tests
npm run test:unit

# Type Check
npm run type-check

# 全て実行
npm run ci:local
```

`package.json`に追加推奨:
```json
{
  "scripts": {
    "ci:local": "npm run lint && npm run format:check && npm run type-check && npm run test:unit"
  }
}
```

---

## メトリクス・モニタリング

### カバレッジレポート
- **自動アップロード**: Codecov
- **閲覧**: https://codecov.io/gh/your-org/link-like-essentials-backend
- **目標**: 80%以上

### デプロイ履歴
- **Jenkins**: ビルド履歴で確認
- **Kubernetes**: Rollout履歴で確認

### 通知設定（オプション）

Jenkinsfileに通知を追加:

```groovy
post {
    success {
        slackSend(
            color: 'good',
            message: "✅ Deployment succeeded: ${env.DEPLOYMENT_ENV}"
        )
    }
    failure {
        slackSend(
            color: 'danger',
            message: "❌ Deployment failed: ${env.DEPLOYMENT_ENV}"
        )
    }
}
```

---

## チェックリスト

### PR作成前
- [ ] `npm run ci:local` が成功
- [ ] コミットメッセージがConventional Commits準拠
- [ ] 新規コードにテスト追加
- [ ] 型定義が正確

### デプロイ前（Production）
- [ ] GitHub Actions CI全て成功
- [ ] Stagingで動作確認完了
- [ ] DBマイグレーションの確認
- [ ] ロールバック手順の確認
- [ ] 関係者への事前通知

---

## 参考リンク

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Kubernetes Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
