package controllers

import (
	"net/http"

	"language-course-api/internal/dto"
	"language-course-api/internal/services"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type UserController struct {
	userService *services.UserService
}

func NewUserController(userService *services.UserService) *UserController {
	return &UserController{userService: userService}
}

// GET /api/users
func (ctrl *UserController) GetAll(c *gin.Context) {
	var query dto.PaginationQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		query.Page = 1
		query.Limit = 10
	}

	users, total, err := ctrl.userService.GetAll(c.Request.Context(), query.Page, query.Limit, query.Search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Paginated(users, total, query.Page, query.Limit))
}

// GET /api/users/:id
func (ctrl *UserController) GetByID(c *gin.Context) {
	user, err := ctrl.userService.GetByID(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(404, "User not found"))
		return
	}
	c.JSON(http.StatusOK, dto.Success(user, "success"))
}

// PUT /api/users/:id
func (ctrl *UserController) Update(c *gin.Context) {
	var req dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(400, err.Error()))
		return
	}

	update := bson.M{}
	if req.FullName != "" {
		update["fullName"] = req.FullName
	}
	if req.Role != "" {
		update["role"] = req.Role
	}
	if req.Avatar != "" {
		update["avatar"] = req.Avatar
	}

	if err := ctrl.userService.Update(c.Request.Context(), c.Param("id"), update); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil, "User updated"))
}

// DELETE /api/users/:id
func (ctrl *UserController) Delete(c *gin.Context) {
	if err := ctrl.userService.Delete(c.Request.Context(), c.Param("id")); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(500, err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.Success(nil, "User deleted"))
}
