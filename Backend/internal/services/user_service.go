package services

import (
	"context"

	"language-course-api/internal/models"
	"language-course-api/internal/repositories"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type UserService struct {
	userRepo *repositories.UserRepository
}

func NewUserService(userRepo *repositories.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) GetByID(ctx context.Context, id string) (*models.User, error) {
	oid, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	return s.userRepo.FindByID(ctx, oid)
}

func (s *UserService) GetAll(ctx context.Context, page, limit int, search string) ([]models.User, int64, error) {
	return s.userRepo.FindAll(ctx, page, limit, search)
}

func (s *UserService) Update(ctx context.Context, id string, update bson.M) error {
	oid, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return s.userRepo.Update(ctx, oid, update)
}

func (s *UserService) Delete(ctx context.Context, id string) error {
	oid, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return s.userRepo.Delete(ctx, oid)
}
