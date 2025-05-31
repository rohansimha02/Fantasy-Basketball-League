
# Fantasy League Final 

## Overview
This is a full-stack fantasy sports web application built with Express.js, MongoDB (Mongoose), and Bootstrap 5. Users can create and manage teams, join leagues, and compete on leaderboards.

## Public URL


## Features
- User authentication and session management
- Create, join, and view leagues
- Build and manage fantasy teams
- Add/drop players
- View live leaderboard
- Responsive, modern frontend (Bootstrap 5)

## Tech Stack
- Node.js, Express.js
- MongoDB (Mongoose)
- Bootstrap 5, custom CSS



## Main API Endpoints
| Method | Endpoint         | Purpose                                  |
|--------|------------------|------------------------------------------|
| GET    | /players         | Get all available players                |
| POST   | /team/add        | Add a player to a team                   |
| POST   | /team/drop       | Drop a player from a team                |
| GET    | /team/:userId    | Get a user's team                        |
| GET    | /leaderboard     | Get leaderboard data                     |
| GET    | /leagues         | List all leagues                         |
| POST   | /leagues/create  | Create a new league                      |

## Database Models (Mongoose)
### League
```
{
  leagueName: String,
  created_date: Date
}
```
### Team
```
{
  username: String,
  teamName: String,
  members: [String],
  league: ObjectId (ref: 'League'),
  created_date: Date
}
```

## Deployment
- Node.js app can be deployed to Render, Heroku, or similar platforms.
- MongoDB is hosted on Atlas (see `models.js`).

## Notes
- For development, you can change the port by setting the `PORT` environment variable.
- Make sure your MongoDB Atlas cluster is running and accessible.

---

