package controllers

import (
	"net/http"

	"language-course-api/internal/dto"
	"language-course-api/internal/models"
	"language-course-api/internal/services"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type CourseController struct {
	courseService *services.CourseService
}

func NewCourseController(courseService *services.CourseService) *CourseController {
	return &CourseController{courseService: courseService}
}

// GET /api/courses
func (ctrl *CourseController) GetAll(c *gin.Context) {
	var query dto.PaginationQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		query.Page = 1
		query.Limit = 10
	}

	role := c.GetString("role")
	isAdmin := role == models.RoleAdmin

	courses, total, err := ctrl.courseService.GetAll(c.Request.Context(), query.Page, query.Limit, query.Search, isAdmin)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Paginated(courses, total, query.Page, query.Limit))
}

// GET /api/courses/:id
func (ctrl *CourseController) GetByID(c *gin.Context) {
	course, err := ctrl.courseService.GetByID(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(404, "Course not found"))
		return
	}
	c.JSON(http.StatusOK, dto.Success(course, "success"))
}

// POST /api/courses
func (ctrl *CourseController) Create(c *gin.Context) {
	var req dto.CreateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(400, err.Error()))
		return
	}

	userID := c.GetString("userId")
	course, err := ctrl.courseService.Create(c.Request.Context(), req, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusCreated, dto.Created(course, "Course created"))
}

// PUT /api/courses/:id
func (ctrl *CourseController) Update(c *gin.Context) {
	var req dto.UpdateCourseRequest
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
	if req.Thumbnail != nil {
		update["thumbnail"] = *req.Thumbnail
	}
	if req.Level != nil {
		update["level"] = *req.Level
	}
	if req.Language != nil {
		update["language"] = *req.Language
	}
	if req.IsPublished != nil {
		update["isPublished"] = *req.IsPublished
	}

	if err := ctrl.courseService.Update(c.Request.Context(), c.Param("id"), update); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil, "Course updated"))
}

// DELETE /api/courses/:id
func (ctrl *CourseController) Delete(c *gin.Context) {
	if err := ctrl.courseService.Delete(c.Request.Context(), c.Param("id")); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.Success(nil, "Course deleted"))
}
