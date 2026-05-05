# PetCare Life — Deployment Guide

## Project Structure
```
petcare/
├── app.py                  ← Flask backend
├── requirements.txt        ← Python packages
├── Procfile                ← Tells Railway how to start
├── railway.json            ← Railway config
├── schema.sql              ← Run this once to create tables
├── static/
│   ├── style.css
│   ├── script.js
│   └── kitten-510651.avif
└── templates/
    ├── index.html
    ├── auth.html
    ├── bookings.html
    ├── clinics.html
    └── stores.html
```

## Deploy on Railway (Free & Easy)

### Step 1 — Push to GitHub
1. Create a GitHub account at github.com
2. Create a new repository (call it `petcare-life`)
3. Upload all these files to it

### Step 2 — Deploy on Railway
1. Go to **railway.app** and sign up with GitHub
2. Click **New Project → Deploy from GitHub Repo**
3. Select your `petcare-life` repo

### Step 3 — Add MySQL Database
1. Inside your Railway project, click **+ New**
2. Select **Database → MySQL**
3. Click on the MySQL service → **Variables** tab
4. Copy: MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE

### Step 4 — Set Environment Variables
In your Railway app service → **Variables** tab, add:
```
MYSQL_HOST     = (paste MYSQLHOST from MySQL service)
MYSQL_USER     = (paste MYSQLUSER)
MYSQL_PASSWORD = (paste MYSQLPASSWORD)
MYSQL_DB       = railway
SECRET_KEY     = choose_any_random_string_here
```

### Step 5 — Run the Database Schema
1. In Railway, click your MySQL service
2. Click **Connect → MySQL Shell**
3. Paste the entire contents of `schema.sql` and press Enter

### Step 6 — Done! 🎉
Railway gives you a public URL like:
`https://petcare-life-production.up.railway.app`

Share it and anyone can open your website!

## Environment Variables Reference
| Variable       | Description                        |
|----------------|------------------------------------|
| MYSQL_HOST     | MySQL server hostname               |
| MYSQL_USER     | MySQL username                      |
| MYSQL_PASSWORD | MySQL password                      |
| MYSQL_DB       | Database name (use `railway`)       |
| SECRET_KEY     | Any random string for session security |
| PORT           | Auto-set by Railway (don't touch)  |
