package services

import (
	"context"

	"language-course-api/internal/models"
	"language-course-api/internal/repositories"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type ScoreService struct {
	scoreRepo *repositories.ScoreRepository
}

func NewScoreService(scoreRepo *repositories.ScoreRepository) *ScoreService {
	return &ScoreService{scoreRepo: scoreRepo}
}

func (s *ScoreService) Submit(ctx context.Context, userID string, courseID string, lessonID string, score, maxScore float64, answers []models.Answer) (*models.Score, error) {
	uid, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}
	cid, err := bson.ObjectIDFromHex(courseID)
	if err != nil {
		return nil, err
	}

	// Count attempts for auto-increment
	attempts, _ := s.scoreRepo.CountAttempts(ctx, uid, cid)

	sc := &models.Score{
		UserID:        uid,
		CourseID:      cid,
		Score:         score,
		MaxScore:      maxScore,
		Answers:       answers,
		AttemptNumber: int(attempts) + 1,
	}

	// Optional lessonID
	if lessonID != "" {
		lid, err := bson.ObjectIDFromHex(lessonID)
		if err == nil {
			sc.LessonID = lid
		}
	}

	if err := s.scoreRepo.Create(ctx, sc); err != nil {
		return nil, err
	}
	return sc, nil
}

func (s *ScoreService) GetCourseScores(ctx context.Context, userID, courseID string) ([]models.Score, error) {
	uid, err := bson.ObjectIDFromHex(userID)
	if err != nil {
		return nil, err
	}
	cid, err := bson.ObjectIDFromHex(courseID)
	if err != nil {
		return nil, err
	}
	return s.scoreRepo.FindByUserAndCourse(ctx, uid, cid)
}

func (s *ScoreService) Leaderboard(ctx context.Context, courseID string, limit int) ([]bson.M, error) {
	cid, err := bson.ObjectIDFromHex(courseID)
	if err != nil {
		return nil, err
	}
	if limit <= 0 {
		limit = 10
	}
	return s.scoreRepo.Leaderboard(ctx, cid, limit)
}
