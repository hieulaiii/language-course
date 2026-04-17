package services

import (
	"context"

	"language-course-api/internal/dto"
	"language-course-api/internal/models"
	"language-course-api/internal/repositories"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type CourseService struct {
	courseRepo *repositories.CourseRepository
}

func NewCourseService(courseRepo *repositories.CourseRepository) *CourseService {
	return &CourseService{courseRepo: courseRepo}
}

func (s *CourseService) Create(ctx context.Context, req dto.CreateCourseRequest, createdBy string) (*models.Course, error) {
	creatorID, err := bson.ObjectIDFromHex(createdBy)
	if err != nil {
		return nil, err
	}

	course := &models.Course{
		Title:       req.Title,
		Description: req.Description,
		Thumbnail:   req.Thumbnail,
		Level:       req.Level,
		Language:    req.Language,
		IsPublished: req.IsPublished,
		CreatedBy:   creatorID,
	}

	if err := s.courseRepo.Create(ctx, course); err != nil {
		return nil, err
	}
	return course, nil
}

func (s *CourseService) GetByID(ctx context.Context, id string) (*models.Course, error) {
	oid, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	return s.courseRepo.FindByID(ctx, oid)
}

func (s *CourseService) GetAll(ctx context.Context, page, limit int, search string, isAdmin bool) ([]models.Course, int64, error) {
	if isAdmin {
		return s.courseRepo.FindAllAdmin(ctx, page, limit, search)
	}
	return s.courseRepo.FindAll(ctx, page, limit, search)
}

func (s *CourseService) Update(ctx context.Context, id string, update bson.M) error {
	oid, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return s.courseRepo.Update(ctx, oid, update)
}

func (s *CourseService) Delete(ctx context.Context, id string) error {
	oid, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return s.courseRepo.Delete(ctx, oid)
}
