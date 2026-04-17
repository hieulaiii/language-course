package services

import (
	"context"

	"language-course-api/internal/dto"
	"language-course-api/internal/models"
	"language-course-api/internal/repositories"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type LessonService struct {
	lessonRepo *repositories.LessonRepository
	courseRepo *repositories.CourseRepository
}

func NewLessonService(lessonRepo *repositories.LessonRepository, courseRepo *repositories.CourseRepository) *LessonService {
	return &LessonService{
		lessonRepo: lessonRepo,
		courseRepo: courseRepo,
	}
}

func (s *LessonService) Create(ctx context.Context, courseID string, req dto.CreateLessonRequest) (*models.Lesson, error) {
	cid, err := bson.ObjectIDFromHex(courseID)
	if err != nil {
		return nil, err
	}

	lesson := &models.Lesson{
		CourseID:      cid,
		Title:         req.Title,
		Description:   req.Description,
		Order:         req.Order,
		VideoURL:      req.VideoURL,
		VideoDuration: req.VideoDuration,
		Content:       req.Content,
		IsPublished:   req.IsPublished,
	}

	if err := s.lessonRepo.Create(ctx, lesson); err != nil {
		return nil, err
	}

	// Auto-increment course totalLessons
	_ = s.courseRepo.IncrementLessonCount(ctx, cid, 1)

	return lesson, nil
}

func (s *LessonService) GetByCourseID(ctx context.Context, courseID string) ([]models.Lesson, error) {
	cid, err := bson.ObjectIDFromHex(courseID)
	if err != nil {
		return nil, err
	}
	return s.lessonRepo.FindByCourseID(ctx, cid)
}

func (s *LessonService) GetByID(ctx context.Context, id string) (*models.Lesson, error) {
	oid, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	return s.lessonRepo.FindByID(ctx, oid)
}

func (s *LessonService) Update(ctx context.Context, id string, update bson.M) error {
	oid, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	return s.lessonRepo.Update(ctx, oid, update)
}

func (s *LessonService) Delete(ctx context.Context, id string, courseID string) error {
	oid, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return err
	}

	if err := s.lessonRepo.Delete(ctx, oid); err != nil {
		return err
	}

	// Decrement course totalLessons
	cid, _ := bson.ObjectIDFromHex(courseID)
	_ = s.courseRepo.IncrementLessonCount(ctx, cid, -1)

	return nil
}
