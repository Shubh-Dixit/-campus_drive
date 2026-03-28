FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Optimize caching by downloading dependencies first
COPY campusdrive-backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy the backend source code and build it
COPY campusdrive-backend/src ./src
RUN mvn clean package -DskipTests

# Create minimal runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built jar from the previous build stage
COPY --from=build /app/target/*.jar app.jar

# Hugging Face Spaces uses port 7860 automatically
ENV PORT=7860
EXPOSE 7860

# Run the backend locally
ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]
