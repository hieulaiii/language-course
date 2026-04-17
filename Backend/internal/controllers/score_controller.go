package controllers

import (
	"net/http"
	"strconv"

	"language-course-api/internal/dto"
	"language-course-api/internal/models"
	"language-course-api/internal/services"

	"github.com/gin-gonic/gin"
)

type ScoreController struct {
	scoreService *services.ScoreService
}

func NewScoreController(scoreService *services.ScoreService) *ScoreController {
	return &ScoreController{scoreService: scoreService}
}

// POST /api/scores
func (ctrl *ScoreController) Submit(c *gin.Context) {
	var req dto.SubmitScoreRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(400, err.Error()))
		return
	}

	userID := c.GetString("userId")

	// Convert answers
	answers := make([]models.Answer, len(req.Answers))
	for i, a := range req.Answers {
		answers[i] = models.Answer{
			QuestionID: a.QuestionID,
			Answer:     a.Answer,
			IsCorrect:  a.IsCorrect,
		}
	}

	score, err := ctrl.scoreService.Submit(
		c.Request.Context(),
		userID,
		req.CourseID,
		req.LessonID,
		req.Score,
		req.MaxScore,
		answers,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusCreated, dto.Created(score, "Score submitted"))
}

// GET /api/scores/courses/:courseId
func (ctrl *ScoreController) GetCourseScores(c *gin.Context) {
	userID := c.GetString("userId")
	courseID := c.Param("courseId")

	scores, err := ctrl.scoreService.GetCourseScores(c.Request.Context(), userID, courseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(scores, "success"))
}

// GET /api/scores/leaderboard/:courseId
func (ctrl *ScoreController) Leaderboard(c *gin.Context) {
	courseID := c.Param("courseId")
	limitStr := c.DefaultQuery("limit", "10")
	limit, _ := strconv.Atoi(limitStr)

	results, err := ctrl.scoreService.Leaderboard(c.Request.Context(), courseID, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(results, "success"))
}
