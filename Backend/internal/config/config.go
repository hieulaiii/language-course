package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                string
	GinMode             string
	MongoURI            string
	MongoDatabase       string
	JWTSecret           string
	JWTExpirationHours  int
	CORSOrigins         []string
}

var AppConfig *Config

func Load() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system env vars")
	}

	expHours, _ := strconv.Atoi(getEnv("JWT_EXPIRATION_HOURS", "72"))

	AppConfig = &Config{
		Port:               getEnv("PORT", "8080"),
		GinMode:            getEnv("GIN_MODE", "debug"),
		MongoURI:           getEnv("MONGODB_URI", "mongodb://localhost:27017"),
		MongoDatabase:      getEnv("MONGODB_DATABASE", "language_course"),
		JWTSecret:          getEnv("JWT_SECRET", "default-secret"),
		JWTExpirationHours: expHours,
		CORSOrigins:        strings.Split(getEnv("CORS_ORIGINS", "http://localhost:4200"), ","),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
