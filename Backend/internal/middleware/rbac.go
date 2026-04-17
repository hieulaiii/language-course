package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RoleMiddleware checks if the authenticated user has the required role
func RoleMiddleware(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"message": "Role not found in token"})
			return
		}

		role := userRole.(string)
		for _, r := range roles {
			if role == r {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"message": "Insufficient permissions"})
	}
}
