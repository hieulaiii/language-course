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

type CourseRepository struct {
	collection *mongo.Collection
}

func NewCourseRepository() *CourseRepository {
	return &CourseRepository{
		collection: database.Collection("courses"),
	}
}

func (r *CourseRepository) Create(ctx context.Context, course *models.Course) error {
	course.CreatedAt = time.Now()
	course.UpdatedAt = time.Now()
	result, err := r.collection.InsertOne(ctx, course)
	if err != nil {
		return err
	}
	course.ID = result.InsertedID.(bson.ObjectID)
	return nil
}

func (r *CourseRepository) FindByID(ctx context.Context, id bson.ObjectID) (*models.Course, error) {
	var course models.Course
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&course)
	if err != nil {
		return nil, err
	}
	return &course, nil
}

func (r *CourseRepository) FindAll(ctx context.Context, page, limit int, search string) ([]models.Course, int64, error) {
	filter := bson.M{"isPublished": true}
	if search != "" {
		filter["$or"] = []bson.M{
			{"title": bson.M{"$regex": search, "$options": "i"}},
			{"description": bson.M{"$regex": search, "$options": "i"}},
		}
	}

	total, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	skip := int64((page - 1) * limit)
	opts := options.Find().SetSkip(skip).SetLimit(int64(limit)).SetSort(bson.M{"createdAt": -1})

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var courses []models.Course
	if err = cursor.All(ctx, &courses); err != nil {
		return nil, 0, err
	}

	return courses, total, nil
}

// FindAllAdmin — no isPublished filter
func (r *CourseRepository) FindAllAdmin(ctx context.Context, page, limit int, search string) ([]models.Course, int64, error) {
	filter := bson.M{}
	if search != "" {
		filter["$or"] = []bson.M{
			{"title": bson.M{"$regex": search, "$options": "i"}},
			{"description": bson.M{"$regex": search, "$options": "i"}},
		}
	}

	total, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	skip := int64((page - 1) * limit)
	opts := options.Find().SetSkip(skip).SetLimit(int64(limit)).SetSort(bson.M{"createdAt": -1})

	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var courses []models.Course
	if err = cursor.All(ctx, &courses); err != nil {
		return nil, 0, err
	}

	return courses, total, nil
}

func (r *CourseRepository) Update(ctx context.Context, id bson.ObjectID, update bson.M) error {
	update["updatedAt"] = time.Now()
	_, err := r.collection.UpdateByID(ctx, id, bson.M{"$set": update})
	return err
}

func (r *CourseRepository) Delete(ctx context.Context, id bson.ObjectID) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}

func (r *CourseRepository) IncrementLessonCount(ctx context.Context, id bson.ObjectID, delta int) error {
	_, err := r.collection.UpdateByID(ctx, id, bson.M{"$inc": bson.M{"totalLessons": delta}})
	return err
}
