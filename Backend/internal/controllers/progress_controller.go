package controllers

import (
	"net/http"

	"language-course-api/internal/dto"
	"language-course-api/internal/services"

	"github.com/gin-gonic/gin"
)

type ProgressController struct {
	progressService *services.ProgressService
	lessonService   *services.LessonService
}

func NewProgressController(progressService *services.ProgressService, lessonService *services.LessonService) *ProgressController {
	return &ProgressController{
		progressService: progressService,
		lessonService:   lessonService,
	}
}

// GET /api/progress/courses/:courseId
func (ctrl *ProgressController) GetCourseProgress(c *gin.Context) {
	userID := c.GetString("userId")
	courseID := c.Param("courseId")

	progress, err := ctrl.progressService.GetCourseProgress(c.Request.Context(), userID, courseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(progress, "success"))
}

// PUT /api/progress/lessons/:lessonId
func (ctrl *ProgressController) UpdateProgress(c *gin.Context) {
	var req dto.UpdateProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(400, err.Error()))
		return
	}

	userID := c.GetString("userId")
	lessonID := c.Param("lessonId")

	// Get lesson to find courseID
	lesson, err := ctrl.lessonService.GetByID(c.Request.Context(), lessonID)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(404, "Lesson not found"))
		return
	}

	if err := ctrl.progressService.UpdateProgress(
		c.Request.Context(),
		userID,
		lesson.CourseID.Hex(),
		lessonID,
		req.WatchedSeconds,
		req.TotalSeconds,
	); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil, "Progress updated"))
}

// GET /api/progress/check-unlock/:lessonId
func (ctrl *ProgressController) CheckUnlock(c *gin.Context) {
	userID := c.GetString("userId")
	role := c.GetString("role")
	lessonID := c.Param("lessonId")

	unlocked, err := ctrl.progressService.CheckUnlock(c.Request.Context(), userID, lessonID, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(gin.H{"unlocked": unlocked}, "success"))
}
