package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type User struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"id"`
	Email     string        `bson:"email" json:"email" binding:"required,email"`
	Password  string        `bson:"password" json:"-"`
	FullName  string        `bson:"fullName" json:"fullName" binding:"required"`
	Role      string        `bson:"role" json:"role"`
	Avatar    string        `bson:"avatar,omitempty" json:"avatar,omitempty"`
	CreatedAt time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time     `bson:"updatedAt" json:"updatedAt"`
}

const (
	RoleAdmin = "admin"
	RoleUser  = "user"
)
