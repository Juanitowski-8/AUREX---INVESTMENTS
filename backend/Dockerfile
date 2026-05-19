FROM gradle:8.10.2-jdk21 AS build
WORKDIR /app

COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY gradlew ./
COPY src ./src

RUN chmod +x gradlew
RUN ./gradlew clean bootJar --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

ENV SERVER_PORT=10000
EXPOSE 10000

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${SERVER_PORT} -jar app.jar"]
