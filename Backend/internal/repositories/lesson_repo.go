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

type LessonRepository struct {
	collection *mongo.Collection
}

func NewLessonRepository() *LessonRepository {
	return &LessonRepository{
		collection: database.Collection("lessons"),
	}
}

func (r *LessonRepository) Create(ctx context.Context, lesson *models.Lesson) error {
	lesson.CreatedAt = time.Now()
	lesson.UpdatedAt = time.Now()
	result, err := r.collection.InsertOne(ctx, lesson)
	if err != nil {
		return err
	}
	lesson.ID = result.InsertedID.(bson.ObjectID)
	return nil
}

func (r *LessonRepository) FindByID(ctx context.Context, id bson.ObjectID) (*models.Lesson, error) {
	var lesson models.Lesson
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&lesson)
	if err != nil {
		return nil, err
	}
	return &lesson, nil
}

func (r *LessonRepository) FindByCourseID(ctx context.Context, courseID bson.ObjectID) ([]models.Lesson, error) {
	opts := options.Find().SetSort(bson.M{"order": 1})
	cursor, err := r.collection.Find(ctx, bson.M{"courseId": courseID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var lessons []models.Lesson
	if err = cursor.All(ctx, &lessons); err != nil {
		return nil, err
	}
	return lessons, nil
}

// FindPreviousLesson returns the lesson with order immediately before the given order
func (r *LessonRepository) FindPreviousLesson(ctx context.Context, courseID bson.ObjectID, currentOrder int) (*models.Lesson, error) {
	opts := options.FindOne().SetSort(bson.M{"order": -1})
	var lesson models.Lesson
	err := r.collection.FindOne(ctx, bson.M{
		"courseId": courseID,
		"order":   bson.M{"$lt": currentOrder},
	}, opts).Decode(&lesson)
	if err != nil {
		return nil, err
	}
	return &lesson, nil
}

func (r *LessonRepository) Update(ctx context.Context, id bson.ObjectID, update bson.M) error {
	update["updatedAt"] = time.Now()
	_, err := r.collection.UpdateByID(ctx, id, bson.M{"$set": update})
	return err
}

func (r *LessonRepository) Delete(ctx context.Context, id bson.ObjectID) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (r *LessonRepository) CountByCourseID(ctx context.Context, courseID bson.ObjectID) (int64, error) {
	return r.collection.CountDocuments(ctx, bson.M{"courseId": courseID})
}
