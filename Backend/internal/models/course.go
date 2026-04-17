package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Course struct {
	ID           bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Title        string        `bson:"title" json:"title" binding:"required"`
	Description  string        `bson:"description" json:"description"`
	Thumbnail    string        `bson:"thumbnail,omitempty" json:"thumbnail,omitempty"`
	Level        string        `bson:"level" json:"level"` // beginner, intermediate, advanced
	Language     string        `bson:"language" json:"language"`
	TotalLessons int           `bson:"totalLessons" json:"totalLessons"`
	IsPublished  bool          `bson:"isPublished" json:"isPublished"`
	CreatedBy    bson.ObjectID `bson:"createdBy" json:"createdBy"`
	CreatedAt    time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt    time.Time     `bson:"updatedAt" json:"updatedAt"`
}
