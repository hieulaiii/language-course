package repositories

import (
	"context"
	"time"

	"language-course-api/internal/database"
	"language-course-api/internal/models"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type ScoreRepository struct {
	collection *mongo.Collection
}

func NewScoreRepository() *ScoreRepository {
	return &ScoreRepository{
		collection: database.Collection("scores"),
	}
}

func (r *ScoreRepository) Create(ctx context.Context, score *models.Score) error {
	score.CreatedAt = time.Now()
	result, err := r.collection.InsertOne(ctx, score)
	if err != nil {
		return err
	}
	score.ID = result.InsertedID.(bson.ObjectID)
	return nil
}

func (r *ScoreRepository) FindByUserAndCourse(ctx context.Context, userID, courseID bson.ObjectID) ([]models.Score, error) {
	opts := options.Find().SetSort(bson.M{"createdAt": -1})
	cursor, err := r.collection.Find(ctx, bson.M{
		"userId":   userID,
		"courseId": courseID,
	}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var scores []models.Score
	if err = cursor.All(ctx, &scores); err != nil {
		return nil, err
	}
	return scores, nil
}

func (r *ScoreRepository) CountAttempts(ctx context.Context, userID, courseID bson.ObjectID) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{
		"userId":   userID,
		"courseId": courseID,
	})
}

// Leaderboard — aggregate top scores per user for a course
func (r *ScoreRepository) Leaderboard(ctx context.Context, courseID bson.ObjectID, limit int) ([]bson.M, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"courseId": courseID}}},
		{{Key: "$group", Value: bson.M{
			"_id":      "$userId",
			"maxScore": bson.M{"$max": "$score"},
			"attempts": bson.M{"$sum": 1},
		}}},
		{{Key: "$sort", Value: bson.M{"maxScore": -1}}},
		{{Key: "$limit", Value: limit}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "users",
			"localField":   "_id",
			"foreignField": "_id",
			"as":           "user",
		}}},
		{{Key: "$unwind", Value: "$user"}},
		{{Key: "$project", Value: bson.M{
			"userId":   "$_id",
			"fullName": "$user.fullName",
			"avatar":   "$user.avatar",
			"maxScore": 1,
			"attempts": 1,
		}}},
	}

	cursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var results []bson.M
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}
	return results, nil
}
