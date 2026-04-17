package main

import (
	"log"

	"language-course-api/internal/config"
	"language-course-api/internal/controllers"
	"language-course-api/internal/database"
	"language-course-api/internal/repositories"
	"language-course-api/internal/routes"
	"language-course-api/internal/services"

	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Load config
	config.Load()

	// 2. Connect to MongoDB
	database.Connect()

	// 3. Init repositories
	userRepo := repositories.NewUserRepository()
	courseRepo := repositories.NewCourseRepository()
	lessonRepo := repositories.NewLessonRepository()
	progressRepo := repositories.NewProgressRepository()
	scoreRepo := repositories.NewScoreRepository()

	// 4. Init services
	authService := services.NewAuthService(userRepo)
	userService := services.NewUserService(userRepo)
	courseService := services.NewCourseService(courseRepo)
	lessonService := services.NewLessonService(lessonRepo, courseRepo)
	progressService := services.NewProgressService(progressRepo, lessonRepo)
	scoreService := services.NewScoreService(scoreRepo)

	// 5. Init controllers
	authCtrl := controllers.NewAuthController(authService, userService)
	userCtrl := controllers.NewUserController(userService)
	courseCtrl := controllers.NewCourseController(courseService)
	lessonCtrl := controllers.NewLessonController(lessonService, progressService)
	progressCtrl := controllers.NewProgressController(progressService, lessonService)
	scoreCtrl := controllers.NewScoreController(scoreService)

	// 6. Setup Gin
	gin.SetMode(config.AppConfig.GinMode)
	r := gin.Default()

	// 7. Register routes
	routes.Setup(r, authCtrl, userCtrl, courseCtrl, lessonCtrl, progressCtrl, scoreCtrl)

	// 8. Start server
	addr := ":" + config.AppConfig.Port
	log.Printf("🚀 Server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
