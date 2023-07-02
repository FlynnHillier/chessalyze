# **Chessalyze**

## about
A mutliplayer capable browser-based chess application written utilising a *MERN* stack structure.

## boot
To begin the application, run the following commands in the top-most directory:
- for server: *yarn run:server*
- for client: *yarn run:client*

## env-setup
Ensure .env files exist in the location's specified, including the listed data within.

### **.env**
- **NODE_ENV** - the current enviroment. ('development' | 'production' ). will result in slightly differing behaviour in the interest of security and ease of development
- **PORT** - the port in which the server will be hosted on
- **OAUTH_CLIENT_ID** - OAUTH client ID
- **OAUTH_CLIENT_SECRET** - OAUTH client secret
- **MONGO_ACCESS_URI** - access URI to mongoDB database
- **REACT_APP_URL** - the base url on which the react app is hosted on.

---
### **src/client/.env**
- **REACT_APP_BASE_URL** - the base URL all requests intended for the server should use.