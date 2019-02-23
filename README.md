#Forum API

##Notes:
1. Authentication with jwt through the route /authenticate - tokens last for 24 hours - middleware to check token authenticity- then send back response - add middleware to all protected pages on the site / forum