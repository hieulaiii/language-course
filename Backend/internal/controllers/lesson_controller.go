package controllers

import (
	"net/http"

	"language-course-api/internal/dto"
	"language-course-api/internal/services"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type LessonController struct {
	lessonService   *services.LessonService
	progressService *services.ProgressService
}

func NewLessonController(lessonService *services.LessonService, progressService *services.ProgressService) *LessonController {
	return &LessonController{
		lessonService:   lessonService,
		progressService: progressService,
	}
}

// GET /api/courses/:courseId/lessons
func (ctrl *LessonController) GetByCourse(c *gin.Context) {
	lessons, err := ctrl.lessonService.GetByCourseID(c.Request.Context(), c.Param("courseId"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.Success(lessons, "success"))
}

// GET /api/courses/:courseId/lessons/:id
func (ctrl *LessonController) GetByID(c *gin.Context) {
	lessonID := c.Param("id")
	userID := c.GetString("userId")
	role := c.GetString("role")

	// Check unlock
	unlocked, err := ctrl.progressService.CheckUnlock(c.Request.Context(), userID, lessonID, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}
	if !unlocked {
		c.JSON(http.StatusForbidden, dto.Error(403, "Complete the previous lesson first"))
		return
	}

	lesson, err := ctrl.lessonService.GetByID(c.Request.Context(), lessonID)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(404, "Lesson not found"))
		return
	}

	c.JSON(http.StatusOK, dto.Success(lesson, "success"))
}

// POST /api/courses/:courseId/lessons
func (ctrl *LessonController) Create(c *gin.Context) {
	var req dto.CreateLessonRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(400, err.Error()))
		return
	}

	lesson, err := ctrl.lessonService.Create(c.Request.Context(), c.Param("courseId"), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusCreated, dto.Created(lesson, "Lesson created"))
}

// PUT /api/courses/:courseId/lessons/:id
func (ctrl *LessonController) Update(c *gin.Context) {
	var req dto.UpdateLessonRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(400, err.Error()))
		return
	}

	update := bson.M{}
	if req.Title != nil {
		update["title"] = *req.Title
	}
	if req.Description != nil {
		update["description"] = *req.Description
	}
	if req.Order != nil {
		update["order"] = *req.Order
	}
	if req.VideoURL != nil {
		update["videoUrl"] = *req.VideoURL
	}
	if req.VideoDuration != nil {
		update["videoDuration"] = *req.VideoDuration
	}
	if req.Content != nil {
		update["content"] = *req.Content
	}
	if req.IsPublished != nil {
		update["isPublished"] = *req.IsPublished
	}

	if err := ctrl.lessonService.Update(c.Request.Context(), c.Param("id"), update); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil, "Lesson updated"))
}

// DELETE /api/courses/:courseId/lessons/:id
func (ctrl *LessonController) Delete(c *gin.Context) {
	if err := ctrl.lessonService.Delete(c.Request.Context(), c.Param("id"), c.Param("courseId")); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.Success(nil, "Lesson deleted"))
}
