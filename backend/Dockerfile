# =================================================================
# Stage 1: Build Java application with Maven
# =================================================================
FROM maven:3.9.8-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build source
COPY src ./src
RUN mvn clean package -DskipTests -B

# =================================================================
# Stage 2: Minimal JRE Runtime
# =================================================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root security user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=builder /app/target/smartbudget-backend-1.0.0.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080

EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
