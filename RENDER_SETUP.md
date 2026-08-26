# Cookie Run server – Render deployment

## 1. MongoDB
Create a MongoDB Atlas Free cluster and a database user. Create a database named `kcr-db` (it can also be created automatically on first write). Add network access for the Render service; for a simple test deployment, Atlas may be configured to allow connections from `0.0.0.0/0`, with a strong database password.

## 2. Render
Create a **Web Service** from this repository. Use:
- Build Command: `npm ci`
- Start Command: `npm start`
- Plan: Free

Set the environment variable `MONGODB_URI` to the Atlas connection string. Render supplies the HTTP `PORT` variable automatically, and this project now binds to `0.0.0.0`.

## 3. Public server URL
After deployment Render provides a URL like:
`https://kcr-server.onrender.com`

That hostname is the base URL to use when patching the APK.
