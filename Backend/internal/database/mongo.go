package database

import (
	"context"
	"log"
	"time"

	"language-course-api/internal/config"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var DB *mongo.Database

func Connect() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOpts := options.Client().ApplyURI(config.AppConfig.MongoURI)
	client, err := mongo.Connect(clientOpts)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	DB = client.Database(config.AppConfig.MongoDatabase)
	log.Println("✅ Connected to MongoDB:", config.AppConfig.MongoDatabase)

	createIndexes()
}

func Collection(name string) *mongo.Collection {
	return DB.Collection(name)
}

func createIndexes() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Unique email index on users
	usersCol := Collection("users")
	_, err := usersCol.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    map[string]interface{}{"email": 1},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		log.Println("Warning: could not create email index:", err)
	}

	// Compound index on progress
	progressCol := Collection("progress")
	_, err = progressCol.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: map[string]interface{}{
			"userId":   1,
			"courseId": 1,
			"lessonId": 1,
		},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		log.Println("Warning: could not create progress index:", err)
	}
}
