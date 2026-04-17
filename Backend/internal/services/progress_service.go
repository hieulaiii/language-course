package services

import (
	"context"
	"errors"

	"language-course-api/internal/models"
	"language-course-api/internal/repositories"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type ProgressService struct {
	progressRepo *repositories.ProgressRepository
	lessonRepo   *repositories.LessonRepository
}

func NewProgressService(progressRepo *repositories.ProgressRepository, lessonRepo *repositories.LessonRepository) *ProgressService {
	return &ProgressService{
		progressRepo: progressRepo,
		lessonRepo:   lessonRepo,
	}
}

// UpdateProgress — save current watch position; auto-mark completed at 90%
func (s *ProgressService) UpdateProgress(ctx context.Context, userID, courseID, lessonID string, watchedSeconds, totalSeconds int) error {
	uid, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}
	cid, err := bson.ObjectIDFromHex(courseID)
	if err != nil {
		return err
	}
	lid, err := bson.ObjectIDFromHex(lessonID)
	if err != nil {
		return err
	}

	isCompleted := false
	if totalSeconds > 0 && float64(watchedSeconds) >= float64(totalSeconds)*0.9 {
		isCompleted = true
	}

	progress := &models.Progress{
		UserID:         uid,
		CourseID:       cid,
		LessonID:       lid,
		WatchedSeconds: watchedSeconds,
		TotalSeconds:   totalSeconds,
		IsCompleted:    isCompleted,
	}

	return s.progressRepo.Upsert(ctx, progress)
}

// GetCourseProgress — all lesson progress for a user in a course
func (s *ProgressService) GetCourseProgress(ctx context.Context, userID, courseID string) ([]models.Progress, error) {
	uid, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}
	cid, err := bson.ObjectIDFromHex(courseID)
	if err != nil {
		return nil, err
	}
	return s.progressRepo.FindByUserAndCourse(ctx, uid, cid)
}

// CheckUnlock — determines if a lesson is accessible
// Rule: lesson order 1 is always unlocked; for order N > 1, the previous lesson must be completed
func (s *ProgressService) CheckUnlock(ctx context.Context, userID, lessonID string, userRole string) (bool, error) {
	// Admin bypass
	if userRole == models.RoleAdmin {
		return true, nil
	}

	lid, err := bson.ObjectIDFromHex(lessonID)
	if err != nil {
		return false, err
	}

	// Get the lesson to know its order and courseID
	lesson, err := s.lessonRepo.FindByID(ctx, lid)
	if err != nil {
		return false, errors.New("lesson not found")
	}

	// First lesson is always unlocked
	if lesson.Order <= 1 {
		return true, nil
	}

	// Find the previous lesson
	prevLesson, err := s.lessonRepo.FindPreviousLesson(ctx, lesson.CourseID, lesson.Order)
	if err != nil {
		// No previous lesson found → this IS the first lesson
		if errors.Is(err, mongo.ErrNoDocuments) {
			return true, nil
		}
		return false, err
	}

	// Check if user completed the previous lesson
	uid, _ := bson.ObjectIDFromHex(userID)
	progress, err := s.progressRepo.FindByUserAndLesson(ctx, uid, prevLesson.ID)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return false, nil // No progress → not unlocked
		}
		return false, err
	}

	return progress.IsCompleted, nil
}
