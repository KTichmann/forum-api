#Forum API

##Notes:
1. Authentication with jwt through the route /authenticate - tokens last for 24 hours - middleware to check token authenticity- then send back response - add middleware to all protected pages on the site / forum

###Users:
Users consist of:
* USERNAME
* PASSWORD (saved as a hash in the database)

###Posts:
Posts consist of:
 * USERNAME The user that created the post
 * POST The post content
 * CREATED_AT The date the post was created (timestamp without timezone - default now)
 * POST_ID auto-incremented primary key - post id

###Comments:
Comments consist of:
* Comment_id
* Comment data - comment
* Username of commenter - username
* Id of the post it's on - post_id
* date created - created_at