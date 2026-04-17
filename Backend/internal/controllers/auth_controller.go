package controllers

import (
	"net/http"

	"language-course-api/internal/dto"
	"language-course-api/internal/services"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	authService *services.AuthService
	userService *services.UserService
}

func NewAuthController(authService *services.AuthService, userService *services.UserService) *AuthController {
	return &AuthController{
		authService: authService,
		userService: userService,
	}
}

// POST /api/auth/register
func (ctrl *AuthController) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(400, err.Error()))
		return
	}

	user, err := ctrl.authService.Register(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusConflict, dto.Error(409, err.Error()))
		return
	}

	c.JSON(http.StatusCreated, dto.Created(user, "Registration successful"))
}

// POST /api/auth/login
func (ctrl *AuthController) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(400, err.Error()))
		return
	}

	token, user, err := ctrl.authService.Login(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.Error(401, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(dto.LoginResponse{
		Token: token,
		User:  user,
	}, "Login successful"))
}

// GET /api/auth/me
func (ctrl *AuthController) Me(c *gin.Context) {
	userID := c.GetString("userId")
	user, err := ctrl.userService.GetByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(404, "User not found"))
		return
	}
	c.JSON(http.StatusOK, dto.Success(user, "success"))
}
