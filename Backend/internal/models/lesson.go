package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Lesson struct {
	ID            bson.ObjectID `bson:"_id,omitempty" json:"id"`
	CourseID      bson.ObjectID `bson:"courseId" json:"courseId" binding:"required"`
	Title         string        `bson:"title" json:"title" binding:"required"`
	Description   string        `bson:"description" json:"description"`
	Order         int           `bson:"order" json:"order" binding:"required"`
	VideoURL      string        `bson:"videoUrl,omitempty" json:"videoUrl,omitempty"`
	VideoDuration int           `bson:"videoDuration" json:"videoDuration"` // seconds
	Content       string        `bson:"content,omitempty" json:"content,omitempty"`
	IsPublished   bool          `bson:"isPublished" json:"isPublished"`
	CreatedAt     time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt     time.Time     `bson:"updatedAt" json:"updatedAt"`
}
