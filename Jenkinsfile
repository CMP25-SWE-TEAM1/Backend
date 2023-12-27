pipeline {  
    agent any  
    options{
        disableConcurrentBuilds()
    }
    stages {  
        stage('Install Dependencies') {  
            steps {  
               sh 'npm i'
            }
        }  
        stage('Test') {  
            steps {  
                echo 'Testing'
            }
        }
        stage('Build') {  
            steps {  
                echo 'Building'
            }
        }
        stage('Deploy') {  
            steps {  
                  sh  'docker compose -f docker-compose-dev.yml build'
                  sh  'docker compose -f docker-compose-dev.yml push'
                  sh  'docker compose -f docker-compose-dev.yml up -d'
                  sh  'docker system prune --force'

             }
         } 
    }  
    post {   
        success {  
            echo 'This will run only if successful'  
        }  
        failure {  
            echo 'Failure'
            mail bcc: '', body: "<b>Failure</b><br>Project: ${env.JOB_NAME} <br>Build Number: ${env.BUILD_NUMBER} <br>", cc: '', charset: 'UTF-8', from: '', mimeType: 'text/html', replyTo: '', subject: "ERROR CI: Project name -> ${env.JOB_NAME}", to: "sheshtawy321@gmail.com";  
        }  
        changed {  
            script{
                if(currentBuild.result == 'SUCCESS' && currentBuild.getPreviousBuild().result == 'FAILURE') {
                    mail bcc: '', body: "<b>Back to work</b><br>Project: ${env.JOB_NAME} <br>Build Number: ${env.BUILD_NUMBER} <br>", cc: '', charset: 'UTF-8', from: '', mimeType: 'text/html', replyTo: '', subject: "Successful CI: Project name -> ${env.JOB_NAME}", to: "sheshtawy321@gmail.com";    
                }
            }  
        }  
   }
}