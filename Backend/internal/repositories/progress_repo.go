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

type ProgressRepository struct {
	collection *mongo.Collection
}

func NewProgressRepository() *ProgressRepository {
	return &ProgressRepository{
		collection: database.Collection("progress"),
	}
}

// Upsert — create or update progress for a specific user+lesson
func (r *ProgressRepository) Upsert(ctx context.Context, progress *models.Progress) error {
	filter := bson.M{
		"userId":   progress.UserID,
		"courseId": progress.CourseID,
		"lessonId": progress.LessonID,
	}

	now := time.Now()
	update := bson.M{
		"$set": bson.M{
			"watchedSeconds": progress.WatchedSeconds,
			"totalSeconds":   progress.TotalSeconds,
			"isCompleted":    progress.IsCompleted,
			"lastWatchedAt":  now,
		},
	}

	if progress.IsCompleted && progress.CompletedAt == nil {
		update["$set"].(bson.M)["completedAt"] = now
	}

	opts := options.UpdateOne().SetUpsert(true)
	_, err := r.collection.UpdateOne(ctx, filter, update, opts)
	return err
}

func (r *ProgressRepository) FindByUserAndCourse(ctx context.Context, userID, courseID bson.ObjectID) ([]models.Progress, error) {
	cursor, err := r.collection.Find(ctx, bson.M{
		"userId":   userID,
		"courseId": courseID,
	})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var progresses []models.Progress
	if err = cursor.All(ctx, &progresses); err != nil {
		return nil, err
	}
	return progresses, nil
}

func (r *ProgressRepository) FindByUserAndLesson(ctx context.Context, userID, lessonID bson.ObjectID) (*models.Progress, error) {
	var progress models.Progress
	err := r.collection.FindOne(ctx, bson.M{
		"userId":   userID,
		"lessonId": lessonID,
	}).Decode(&progress)
	if err != nil {
		return nil, err
	}
	return &progress, nil
}
