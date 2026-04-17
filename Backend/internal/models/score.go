package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Score struct {
	ID            bson.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID        bson.ObjectID `bson:"userId" json:"userId"`
	CourseID      bson.ObjectID `bson:"courseId" json:"courseId"`
	LessonID      bson.ObjectID `bson:"lessonId,omitempty" json:"lessonId,omitempty"`
	Score         float64       `bson:"score" json:"score"`
	MaxScore      float64       `bson:"maxScore" json:"maxScore"`
	Answers       []Answer      `bson:"answers" json:"answers"`
	AttemptNumber int           `bson:"attemptNumber" json:"attemptNumber"`
	CreatedAt     time.Time     `bson:"createdAt" json:"createdAt"`
}

type Answer struct {
	QuestionID string `bson:"questionId" json:"questionId"`
	Answer     string `bson:"answer" json:"answer"`
	IsCorrect  bool   `bson:"isCorrect" json:"isCorrect"`
}
