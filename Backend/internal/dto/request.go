package dto

// ── Auth ─────────────────────────────────────────────
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"fullName" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// ── User ─────────────────────────────────────────────
type UpdateUserRequest struct {
	FullName string `json:"fullName,omitempty"`
	Role     string `json:"role,omitempty"`
	Avatar   string `json:"avatar,omitempty"`
}

// ── Course ───────────────────────────────────────────
type CreateCourseRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Thumbnail   string `json:"thumbnail"`
	Level       string `json:"level" binding:"required,oneof=beginner intermediate advanced"`
	Language    string `json:"language" binding:"required"`
	IsPublished bool   `json:"isPublished"`
}

type UpdateCourseRequest struct {
	Title       *string `json:"title,omitempty"`
	Description *string `json:"description,omitempty"`
	Thumbnail   *string `json:"thumbnail,omitempty"`
	Level       *string `json:"level,omitempty"`
	Language    *string `json:"language,omitempty"`
	IsPublished *bool   `json:"isPublished,omitempty"`
}

// ── Lesson ───────────────────────────────────────────
type CreateLessonRequest struct {
	Title         string `json:"title" binding:"required"`
	Description   string `json:"description"`
	Order         int    `json:"order" binding:"required,min=1"`
	VideoURL      string `json:"videoUrl"`
	VideoDuration int    `json:"videoDuration"`
	Content       string `json:"content"`
	IsPublished   bool   `json:"isPublished"`
}

type UpdateLessonRequest struct {
	Title         *string `json:"title,omitempty"`
	Description   *string `json:"description,omitempty"`
	Order         *int    `json:"order,omitempty"`
	VideoURL      *string `json:"videoUrl,omitempty"`
	VideoDuration *int    `json:"videoDuration,omitempty"`
	Content       *string `json:"content,omitempty"`
	IsPublished   *bool   `json:"isPublished,omitempty"`
}

// ── Progress ─────────────────────────────────────────
type UpdateProgressRequest struct {
	WatchedSeconds int `json:"watchedSeconds" binding:"required"`
	TotalSeconds   int `json:"totalSeconds" binding:"required"`
}

// ── Score ────────────────────────────────────────────
type SubmitScoreRequest struct {
	CourseID string           `json:"courseId" binding:"required"`
	LessonID string          `json:"lessonId,omitempty"`
	Score    float64          `json:"score" binding:"required"`
	MaxScore float64          `json:"maxScore" binding:"required"`
	Answers  []AnswerRequest  `json:"answers"`
}

type AnswerRequest struct {
	QuestionID string `json:"questionId"`
	Answer     string `json:"answer"`
	IsCorrect  bool   `json:"isCorrect"`
}

// ── Pagination Query ─────────────────────────────────
type PaginationQuery struct {
	Page  int    `form:"page,default=1"`
	Limit int    `form:"limit,default=10"`
	Search string `form:"search"`
}
