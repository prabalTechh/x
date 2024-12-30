# X - Twitter Scraper Project

## Overview
This project scrapes trending topics on Twitter using Selenium. The backend is built with Node.js and MongoDB, while the frontend uses HTML, CSS, and JavaScript.

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Selenium WebDriver
- Chrome/Chromium Browser

## Installation
### Frontend (FE)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Backend (BE)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory:
   ```bash
   touch .env
   ```
4. Add your MongoDB connection string to the `.env` file:
   ```
   SECRET=mongodb+srv://<username>:<password>@cluster0.mongodb.net/dbname
   ```

## How to Use
1. **Start the Backend**:
   ```bash
   npm run dev
   ```
2. **Open Frontend**:
   - Open `index.html` manually in your browser from the `frontend` directory **while the backend is running**.
   - Path Example: 
     ```
     file:///path-to-project/frontend/index.html
     ```
3. **Fill the Form**:
   - Enter your Twitter credentials:
     - **Email**
     - **Username**
     - **Password**
   - Submit the form to generate a `credential.json` file.

4. **Credential Storage**:
   - The credentials are stored in the backend directory but **not in the database**.

5. **Run Selenium Script**:
   - After submitting the form, Selenium will automatically run and fetch trending topics in India.

## Notes
- Ensure your Chrome WebDriver is compatible with the version of Chrome installed.
- Selenium will open a browser window to log in to Twitter and scrape data.
- If there are issues with login, verify credentials in the `credential.json` file.

## Project Structure
```
X-Project/
|-- frontend/
|   |-- index.html
|   |-- script.js
|   |-- styles.css
|-- backend/
|   |-- server.js
|   |-- .env
|   |-- credential.json
|   |-- selenium/
|   |-- package.json
|-- README.md
```

## Troubleshooting
- **MongoDB Connection Error**: Ensure the connection string in `.env` is correct.
- **Selenium Not Running**: Verify WebDriver installation and path.
- **Form Not Submitting**: Check browser console for JavaScript errors.

## if not woriking try going to the selinium script and commit the username selenium script 

##ps i will add the deploy link as well to use it 

