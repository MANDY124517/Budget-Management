@echo off
@REM SmartBudget Root Maven Wrapper

if "%JAVA_HOME%"=="" (
    if exist "C:\Program Files\Java\jdk-26.0.2.1" (
        set "JAVA_HOME=C:\Program Files\Java\jdk-26.0.2.1"
    )
)

set MAVEN_CMD="C:\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin\mvn.cmd"

if exist %MAVEN_CMD% (
    %MAVEN_CMD% -f backend/pom.xml %*
) else (
    mvn -f backend/pom.xml %*
)
