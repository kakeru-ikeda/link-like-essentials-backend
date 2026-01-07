pipeline {
    agent {
        label 'built-in'
    }

    environment {
        DOCKER_HUB_CREDS = 'dockerhub-cred-id'
        DEPLOY_HOST = '192.168.40.99'
        DEPLOY_USER = 'server'
        IMAGE_NAME = 'link-like-essentials-backend'
        DISCORD_WEBHOOK = credentials('LLES_JENKINS_WEBHOOK_URL')
    }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Notification') {
            steps {
                echo 'パイプラインの実行を開始しました'
                withCredentials([string(credentialsId: 'LLES_JENKINS_WEBHOOK_URL', variable: 'LLES_JENKINS_WEBHOOK_URL')]) {
                    sh '''
                        # JSONをエスケープして正しく構築
                        JOB_NAME_ESC=$(echo "${JOB_NAME}" | sed 's/"/\\\\"/g')

                        # Discord通知をcurlで送信（ビルド開始）
                        curl -X POST -H "Content-Type: application/json" \\
                             -d "{\\"content\\":\\"**Jenkinsがビルドを受け付けました** 🚀\\nジョブ: ${JOB_NAME_ESC}\\nビルド番号: #${BUILD_NUMBER}\\"}" \\
                             "${LLES_JENKINS_WEBHOOK_URL}"
                    '''
                }
            }
        }

        stage('Workspace Debug') {
            steps {
                echo "ワークスペース情報をデバッグ中..."
                sh '''
                    echo "現在のワークスペース: $(pwd)"
                    echo "ワークスペース内のファイル:"
                    ls -la
                    echo "環境変数:"
                    env | sort
                '''
            }
        }

        stage('Checkout') {
            steps {
                echo "ソースコードをチェックアウト中..."
                checkout scm
            }
        }

        stage('Build and Test') {
            steps {
                echo "Lintとテストを実行中..."
                script {
                    sh '''
                        # builderステージでテストを実行（ソースコードが存在する段階）
                        docker build -f docker/Dockerfile --target builder -t ${IMAGE_NAME}:builder .

                        echo "Type Check, Lint, Formatチェックを実行中..."
                        docker run --rm ${IMAGE_NAME}:builder sh -c "npm run type-check && npm run lint && npm run format:check"

                        echo "テストが完了しました"
                    '''
                }
            }
        }

        stage('Build Production Image') {
            steps {
                echo "本番用Dockerイメージをビルド中..."
                script {
                    sh '''
                        # 本番イメージをビルド
                        docker build -f docker/Dockerfile -t ${IMAGE_NAME}:latest .

                        echo "ビルドが完了しました"
                    '''
                }
            }
        }

        stage('Publish') {
            steps {
                echo "Dockerイメージを公開中..."
                script {
                    withCredentials([usernamePassword(credentialsId: env.DOCKER_HUB_CREDS, passwordVariable: 'DOCKER_HUB_CREDS_PSW', usernameVariable: 'DOCKER_HUB_CREDS_USR')]) {
                        sh '''
                            # Docker Hubにログイン
                            echo $DOCKER_HUB_CREDS_PSW | docker login -u $DOCKER_HUB_CREDS_USR --password-stdin

                            # イメージにタグを付ける
                            docker tag ${IMAGE_NAME}:latest ${DOCKER_HUB_CREDS_USR}/${IMAGE_NAME}:latest
                            docker tag ${IMAGE_NAME}:latest ${DOCKER_HUB_CREDS_USR}/${IMAGE_NAME}:${BUILD_NUMBER}

                            # イメージをプッシュ
                            docker push ${DOCKER_HUB_CREDS_USR}/${IMAGE_NAME}:latest
                            docker push ${DOCKER_HUB_CREDS_USR}/${IMAGE_NAME}:${BUILD_NUMBER}

                            # ログアウト
                            docker logout
                        '''
                    }
                }
            }
        }

        stage('Deploy to Home') {
            steps {
                echo "ホームサーバーにデプロイ中..."
                script {
                    withCredentials([
                        string(credentialsId: 'LLES_DATABASE_URL', variable: 'LLES_DATABASE_URL'),
                        string(credentialsId: 'LLES_FIREBASE_PROJECT_ID', variable: 'LLES_FIREBASE_PROJECT_ID'),
                        string(credentialsId: 'LLES_SENTRY_DSN', variable: 'LLES_SENTRY_DSN'),
                        file(credentialsId: 'LLES_FIREBASE_SERVICE_ACCOUNT', variable: 'FIREBASE_SERVICE_ACCOUNT'),
                        usernamePassword(credentialsId: env.DOCKER_HUB_CREDS, usernameVariable: 'DOCKER_HUB_CREDS_USR', passwordVariable: 'DOCKER_HUB_CREDS_PSW'),
                        sshUserPrivateKey(
                            credentialsId: 'jenkins_deploy',
                            keyFileVariable: 'SSH_KEY',
                            usernameVariable: 'SSH_USER'
                        )
                    ]) {
                        // 必要なファイルをデプロイサーバーに転送
                        sh '''
                            scp -o StrictHostKeyChecking=no -i "$SSH_KEY" "$FIREBASE_SERVICE_ACCOUNT" ''' + "${env.DEPLOY_USER}@${env.DEPLOY_HOST}" + ''':/tmp/firebase-service-account.json
                            scp -o StrictHostKeyChecking=no -i "$SSH_KEY" docker/docker-compose.yml ''' + "${env.DEPLOY_USER}@${env.DEPLOY_HOST}" + ''':/tmp/docker-compose.yml
                        '''

                        def databaseUrl = sh(script: 'echo "$LLES_DATABASE_URL"', returnStdout: true).trim()
                        def firebaseProjectId = sh(script: 'echo "$LLES_FIREBASE_PROJECT_ID"', returnStdout: true).trim()
                        def sentryDsn = sh(script: 'echo "$LLES_SENTRY_DSN"', returnStdout: true).trim()
                        def dockerHubUser = env.DOCKER_HUB_CREDS_USR
                        def imageName = env.IMAGE_NAME

                        sshCommand remote: [
                            name: 'Home Server',
                            host: env.DEPLOY_HOST,
                            user: env.DEPLOY_USER,
                            identityFile: SSH_KEY,
                            port: 22,
                            allowAnyHosts: true,
                            timeout: 60
                        ], command: """
                            # デプロイディレクトリを作成（存在しない場合）
                            mkdir -p /home/${env.DEPLOY_USER}/link-like-essentials-backend/docker
                            cd /home/${env.DEPLOY_USER}/link-like-essentials-backend

                            # 最新のdocker-compose.ymlを配置
                            cp /tmp/docker-compose.yml docker/docker-compose.yml

                            # Firebase Service Accountファイルを配置
                            cp /tmp/firebase-service-account.json ./firebase-service-account.json
                            chmod 600 ./firebase-service-account.json

                            # 既存のコンテナを停止・削除（古いイメージをクリア）
                            echo "既存のコンテナとイメージを削除中..."
                            docker compose -f docker/docker-compose.yml down --rmi all || true

                            # 最新イメージをプル
                            echo "最新イメージをプル中..."
                            docker pull ${dockerHubUser}/${imageName}:latest

                            # .envファイルをdocker/ディレクトリに作成（docker-compose.ymlと同じ場所）
                            cat > docker/.env << 'EOF'
NODE_ENV=production
LLES_DATABASE_URL=${databaseUrl}
SENTRY_DSN=${sentryDsn}
LLES_FIREBASE_PROJECT_ID=${firebaseProjectId}
LLES_CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
DOCKER_IMAGE=${dockerHubUser}/${imageName}:latest
EOF

                            # 新しいコンテナを起動
                            echo "新しいコンテナを起動中..."
                            docker compose -f docker/docker-compose.yml up -d

                            # 起動待機
                            sleep 10

                            # 稼働チェック
                            if docker ps | grep -q ${imageName}; then
                                echo "デプロイ成功: コンテナが稼働中です"
                                docker ps | grep ${imageName}

                                # ヘルスチェック（GraphQLサーバーが応答するか確認）
                                echo "GraphQLサーバーのヘルスチェック中..."
                                sleep 5
                                curl -f http://localhost:4000/health || echo "警告: ヘルスチェックに失敗しました"
                            else
                                echo "デプロイ失敗: コンテナが起動していません"
                                docker compose -f docker/docker-compose.yml logs
                                exit 1
                            fi

                            # 一時ファイルを削除
                            rm -f /tmp/firebase-service-account.json
                            rm -f /tmp/docker-compose.yml

                            # コンテナのステータスを確認
                            docker compose -f docker/docker-compose.yml ps
                        """
                    }
                }
                echo "ホームサーバーへのデプロイが完了しました"
            }
        }
    }

    post {
        always {
            echo "クリーンアップを実行中..."
            sh '''
                # 未使用イメージを削除して領域を解放
                docker image prune -f
            '''

            // ワークスペースをクリーンアップ
            cleanWs()
        }
        success {
            echo 'パイプラインが正常に完了しました！'
            withCredentials([string(credentialsId: 'LLES_JENKINS_WEBHOOK_URL', variable: 'LLES_JENKINS_WEBHOOK_URL')]) {
                sh '''
                    # JSONをエスケープして正しく構築
                    JOB_NAME_ESC=$(echo "${JOB_NAME}" | sed 's/"/\\\\"/g')

                    # Discord通知をcurlで送信（ビルド成功）
                    curl -X POST -H "Content-Type: application/json" \\
                         -d "{\\"content\\":\\"**ビルド成功** ✨\\nジョブ: ${JOB_NAME_ESC}\\nビルド番号: #${BUILD_NUMBER}\\"}" \\
                         "${LLES_JENKINS_WEBHOOK_URL}"
                '''
            }
        }
        failure {
            echo 'パイプラインが失敗しました！'
            withCredentials([string(credentialsId: 'LLES_JENKINS_WEBHOOK_URL', variable: 'LLES_JENKINS_WEBHOOK_URL')]) {
                sh '''
                    # JSONをエスケープして正しく構築
                    JOB_NAME_ESC=$(echo "${JOB_NAME}" | sed 's/"/\\\\"/g')

                    # Discord通知をcurlで送信（ビルド失敗）
                    curl -X POST -H "Content-Type: application/json" \\
                         -d "{\\"content\\":\\"**ビルド失敗** 🚨\\nジョブ: ${JOB_NAME_ESC}\\nビルド番号: #${BUILD_NUMBER}\\"}" \\
                         "${LLES_JENKINS_WEBHOOK_URL}"
                '''
            }
        }
    }
}
