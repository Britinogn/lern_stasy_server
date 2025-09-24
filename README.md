Refactor and enhance controllers, models, and routes for improved functionality and role-based access control

Fixed typo in user profile fetch message in authController.
Updated commentController to handle replies and improved comment structure.

Enhanced enrollController with pagination, duplicate enrollment prevention, and progress tracking.

Refactored lessonController to support pagination and improved lesson management.

Added progressController for tracking student progress and analytics.
Implemented role-based access control middleware for instructors and students.

Updated models to reflect changes in relationships and added new fields for comments and enrollments.

Cleaned up routes to ensure proper access control and organization.
Removed unused middleware files for cleaner codebase.