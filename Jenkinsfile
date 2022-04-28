@Library('ceiba-jenkins-library') _
pipeline {
  //Donde se va a ejecutar el Pipeline
  agent {
    label 'Slave_Induccion'
  }

  //Opciones específicas de Pipeline dentro del Pipeline
  options {
    	buildDiscarder(logRotator(numToKeepStr: '3'))
 	disableConcurrentBuilds()
  }

  //Una sección que define las herramientas “preinstaladas” en Jenkins
  tools {
    jdk 'JDK8_Centos' //Verisión preinstalada en la Configuración del Master
  }
/*	Versiones disponibles
      JDK8_Mac
      JDK6_Centos
      JDK7_Centos
      JDK8_Centos
      JDK10_Centos
      JDK11_Centos
      JDK13_Centos
      JDK14_Centos
*/

  //Aquí comienzan los “items” del Pipeline
  stages{
    stage('Checkout') {
      steps{
        echo "------------>Checkout<------------"
         checkout scm
      }
    }

stage('Install') {
      steps {
        echo "------------>Installing<------------"
        sh 'npm install'
      }
    }

            stage('Build') {
                steps {
                    sh 'npm run build'
                }
            }

    stage('Unit Test') {
      steps {
        echo "------------>Testing<------------"
        sh 'npm run test -- --watch=false --browsers ChromeHeadless'
      }
    }

    stage('Static Code Analysis') {
      steps{
        echo '------------>Análisis de código estático<------------'
       sonarqubeMasQualityGatesP(sonarKey:'co.com.ceiba.adn:atencionmedicafront.nelson.garcia',
        sonarName:'''"CeibaADN-AtencionMedicaFront(nelson.garcia)"''',
        sonarPathProperties:'./sonar-project.properties')
      }
    }
  }

  post {
    always {
      echo 'This will always run'
    }
    success {
      echo 'This will run only if successful'
    }
    failure {
      echo 'This will run only if failed'
    }
    unstable {
      echo 'This will run only if the run was marked as unstable'
    }
    changed {
      echo 'This will run only if the state of the Pipeline has changed'
      echo 'For example, if the Pipeline was previously failing but is now successful'
    }
  }
}
