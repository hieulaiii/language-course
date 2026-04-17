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

type UserRepository struct {
	collection *mongo.Collection
}

func NewUserRepository() *UserRepository {
	return &UserRepository{
		collection: database.Collection("users"),
	}
}

func (r *UserRepository) Create(ctx context.Context, user *models.User) error {
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	if user.Role == "" {
		user.Role = models.RoleUser
	}
	result, err := r.collection.InsertOne(ctx, user)
	if err != nil {
		return err
	}
	user.ID = result.InsertedID.(bson.ObjectID)
	return nil
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	var user models.User
	err := r.collection.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByID(ctx context.Context, id bson.ObjectID) (*models.User, error) {
	var user models.User
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindAll(ctx context.Context, page, limit int, search string) ([]models.User, int64, error) {
	filter := bson.M{}
	if search != "" {
		filter["$or"] = []bson.M{
			{"fullName": bson.M{"$regex": search, "$options": "i"}},
			{"email": bson.M{"$regex": search, "$options": "i"}},
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

	var users []models.User
	if err = cursor.All(ctx, &users); err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (r *UserRepository) Update(ctx context.Context, id bson.ObjectID, update bson.M) error {
	update["updatedAt"] = time.Now()
	_, err := r.collection.UpdateByID(ctx, id, bson.M{"$set": update})
	return err
}

func (r *UserRepository) Delete(ctx context.Context, id bson.ObjectID) error {
	_, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	return err
}
