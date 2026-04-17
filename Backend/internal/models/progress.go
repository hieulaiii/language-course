package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Progress struct {
	ID             bson.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID         bson.ObjectID `bson:"userId" json:"userId"`
	CourseID       bson.ObjectID `bson:"courseId" json:"courseId"`
	LessonID       bson.ObjectID `bson:"lessonId" json:"lessonId"`
	WatchedSeconds int           `bson:"watchedSeconds" json:"watchedSeconds"`
	TotalSeconds   int           `bson:"totalSeconds" json:"totalSeconds"`
	IsCompleted    bool          `bson:"isCompleted" json:"isCompleted"`
	CompletedAt    *time.Time    `bson:"completedAt,omitempty" json:"completedAt,omitempty"`
	LastWatchedAt  time.Time     `bson:"lastWatchedAt" json:"lastWatchedAt"`
}
