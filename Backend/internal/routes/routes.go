package routes

import (
	"language-course-api/internal/controllers"
	"language-course-api/internal/middleware"
	"language-course-api/internal/models"

	"github.com/gin-gonic/gin"
)

func Setup(
	r *gin.Engine,
	authCtrl *controllers.AuthController,
	userCtrl *controllers.UserController,
	courseCtrl *controllers.CourseController,
	lessonCtrl *controllers.LessonController,
	progressCtrl *controllers.ProgressController,
	scoreCtrl *controllers.ScoreController,
) {
	// ── Global middleware ──────────────────────────────
	r.Use(middleware.CORSMiddleware())

	api := r.Group("/api")

	// ── Auth (public) ─────────────────────────────────
	auth := api.Group("/auth")
	{
		auth.POST("/register", authCtrl.Register)
		auth.POST("/login", authCtrl.Login)
	}

	// ── Auth (protected) ──────────────────────────────
	authProtected := api.Group("/auth")
	authProtected.Use(middleware.AuthMiddleware())
	{
		authProtected.GET("/me", authCtrl.Me)
	}

	// ── Users (admin only) ────────────────────────────
	users := api.Group("/users")
	users.Use(middleware.AuthMiddleware(), middleware.RoleMiddleware(models.RoleAdmin))
	{
		users.GET("", userCtrl.GetAll)
		users.GET("/:id", userCtrl.GetByID)
		users.PUT("/:id", userCtrl.Update)
		users.DELETE("/:id", userCtrl.Delete)
	}

	// ── Courses ───────────────────────────────────────
	// ── Lessons (nested under courses) ──
    courses := api.Group("/courses")
    courses.Use(middleware.AuthMiddleware())
    {
        courses.GET("", courseCtrl.GetAll)
        courses.GET("/:id", courseCtrl.GetByID)

        // Nested admin routes for courses
        coursesAdmin := courses.Group("")
        coursesAdmin.Use(middleware.RoleMiddleware(models.RoleAdmin))
        {
            coursesAdmin.POST("", courseCtrl.Create)
            coursesAdmin.PUT("/:id", courseCtrl.Update)
            coursesAdmin.DELETE("/:id", courseCtrl.Delete)
        }

        // Nested lessons routes - uses parent's :id as courseId
        lessons := courses.Group("/:id/lessons")
        lessons.Use(middleware.AuthMiddleware())
        {
            lessons.GET("", lessonCtrl.GetByCourse)  // /api/courses/:id/lessons
            lessons.GET("/:lessonId", lessonCtrl.GetByID)

            lessonsAdmin := lessons.Group("")
            lessonsAdmin.Use(middleware.RoleMiddleware(models.RoleAdmin))
            {
                lessonsAdmin.POST("", lessonCtrl.Create)
                lessonsAdmin.PUT("/:lessonId", lessonCtrl.Update)
                lessonsAdmin.DELETE("/:lessonId", lessonCtrl.Delete)
            }
        }
    }


	// ── Progress ──────────────────────────────────────
	progress := api.Group("/progress")
	progress.Use(middleware.AuthMiddleware())
	{
		progress.GET("/courses/:courseId", progressCtrl.GetCourseProgress)
		progress.PUT("/lessons/:lessonId", progressCtrl.UpdateProgress)
		progress.GET("/check-unlock/:lessonId", progressCtrl.CheckUnlock)
	}

	// ── Scores ────────────────────────────────────────
	scores := api.Group("/scores")
	scores.Use(middleware.AuthMiddleware())
	{
		scores.POST("", scoreCtrl.Submit)
		scores.GET("/courses/:courseId", scoreCtrl.GetCourseScores)
		scores.GET("/leaderboard/:courseId", scoreCtrl.Leaderboard)
	}
}
