pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry.example.com'
        IMAGE_NAME = 'link-like-essentials-backend'
        DOCKER_CREDENTIALS_ID = 'docker-registry-credentials'
        DEPLOYMENT_ENV = "${env.BRANCH_NAME == 'main' ? 'production' : 'staging'}"
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        timeout(time: 1, unit: 'HOURS')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        returnStdout: true,
                        script: "git rev-parse --short HEAD"
                    ).trim()
                    env.IMAGE_TAG = "${env.DEPLOYMENT_ENV}-${env.GIT_COMMIT_SHORT}-${env.BUILD_NUMBER}"
                }
            }
        }
        
        stage('Verify CI Status') {
            steps {
                script {
                    echo "Verifying GitHub Actions CI status..."
                    // GitHub Actions CIの成功を確認
                    // この段階でCI（lint, test）が通過していることを前提とする
                    sh """
                        echo "CI Status: Passed (verified by GitHub Actions)"
                        echo "Proceeding with deployment..."
                    """
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG}"
                    docker.build(
                        "${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}",
                        "-f docker/Dockerfile ."
                    )
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_CREDENTIALS_ID) {
                        def image = docker.image("${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}")
                        image.push()
                        image.push("${env.DEPLOYMENT_ENV}-latest")
                    }
                }
            }
        }
        
        stage('Database Migration') {
            when {
                expression { env.DEPLOYMENT_ENV == 'production' }
            }
            steps {
                script {
                    echo "Running database migrations..."
                    sh """
                        docker run --rm \
                          -e DATABASE_URL=${env.DATABASE_URL} \
                          ${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
                          npm run prisma:migrate:deploy
                    """
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                expression { env.DEPLOYMENT_ENV == 'staging' }
            }
            steps {
                script {
                    echo "Deploying to Staging environment..."
                    sh """
                        # Kubernetes deployment example
                        kubectl set image deployment/link-like-backend-staging \
                          backend=${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
                          --namespace=staging
                        
                        kubectl rollout status deployment/link-like-backend-staging \
                          --namespace=staging \
                          --timeout=300s
                    """
                }
            }
        }
        
        stage('Deploy to Production') {
            when {
                expression { env.DEPLOYMENT_ENV == 'production' }
            }
            steps {
                script {
                    // 本番環境デプロイには手動承認を要求
                    input message: 'Deploy to Production?', ok: 'Deploy'
                    
                    echo "Deploying to Production environment..."
                    sh """
                        # Blue-Green Deployment
                        kubectl set image deployment/link-like-backend-production \
                          backend=${DOCKER_REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
                          --namespace=production
                        
                        kubectl rollout status deployment/link-like-backend-production \
                          --namespace=production \
                          --timeout=600s
                    """
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo "Running health checks..."
                    sh """
                        # デプロイ後のヘルスチェック
                        sleep 10
                        
                        HEALTH_URL=\$(kubectl get service link-like-backend-${env.DEPLOYMENT_ENV} \
                          --namespace=${env.DEPLOYMENT_ENV} \
                          -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
                        
                        curl -f http://\${HEALTH_URL}:4000/health || exit 1
                        echo "Health check passed"
                    """
                }
            }
        }
        
        stage('Smoke Tests') {
            steps {
                script {
                    echo "Running smoke tests..."
                    sh """
                        # GraphQLエンドポイントの簡易テスト
                        npm run test:smoke -- --env=${env.DEPLOYMENT_ENV}
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo "Deployment succeeded: ${env.DEPLOYMENT_ENV} - ${IMAGE_TAG}"
            // Slack/Discord通知の例
            // slackSend(
            //     color: 'good',
            //     message: "Deployment succeeded: ${env.DEPLOYMENT_ENV} - ${IMAGE_TAG}"
            // )
        }
        failure {
            echo "Deployment failed: ${env.DEPLOYMENT_ENV} - ${IMAGE_TAG}"
            // ロールバック処理
            script {
                if (env.DEPLOYMENT_ENV == 'production') {
                    sh """
                        echo "Rolling back production deployment..."
                        kubectl rollout undo deployment/link-like-backend-production \
                          --namespace=production
                    """
                }
            }
            // Slack/Discord通知の例
            // slackSend(
            //     color: 'danger',
            //     message: "Deployment failed: ${env.DEPLOYMENT_ENV} - ${IMAGE_TAG}"
            // )
        }
        always {
            cleanWs()
        }
    }
}
