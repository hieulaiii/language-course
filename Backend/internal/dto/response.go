package dto

// ApiResponse — standard JSON wrapper
type ApiResponse struct {
	Data       interface{} `json:"data"`
	Message    string      `json:"message"`
	StatusCode int         `json:"statusCode"`
}

// PaginatedResponse — list with pagination metadata
type PaginatedResponse struct {
	Data       interface{} `json:"data"`
	Message    string      `json:"message"`
	StatusCode int         `json:"statusCode"`
	Total      int64       `json:"total"`
	Page       int         `json:"page"`
	Limit      int         `json:"limit"`
}

// LoginResponse — returned after successful auth
type LoginResponse struct {
	Token string      `json:"token"`
	User  interface{} `json:"user"`
}

// ProgressWithUnlock — progress info + whether next lesson is accessible
type ProgressWithUnlock struct {
	LessonID    string `json:"lessonId"`
	IsCompleted bool   `json:"isCompleted"`
	IsUnlocked  bool   `json:"isUnlocked"`
	WatchedSeconds int `json:"watchedSeconds"`
	TotalSeconds   int `json:"totalSeconds"`
}

// Helper constructors
func Success(data interface{}, message string) ApiResponse {
	return ApiResponse{Data: data, Message: message, StatusCode: 200}
}

func Created(data interface{}, message string) ApiResponse {
	return ApiResponse{Data: data, Message: message, StatusCode: 201}
}

func Error(statusCode int, message string) ApiResponse {
	return ApiResponse{Data: nil, Message: message, StatusCode: statusCode}
}

func Paginated(data interface{}, total int64, page, limit int) PaginatedResponse {
	return PaginatedResponse{
		Data:       data,
		Message:    "success",
		StatusCode: 200,
		Total:      total,
		Page:       page,
		Limit:      limit,
	}
}
