## Setup and Run Instructions

# Step 1: Prerequisites

1. Install Node.js v20 LTS.
2. Install MySQL v8.0.

# Step 2: Database Creation

1. In the root folder, locate the file `database/schema.sql`.
2. Open this file in your local MySQL server.
3. Run all the queries in the file to create the database and tables.
4. Once the queries execute successfully, the database setup is complete.

# Step 3: Environment Setup

1. Create a `.env` file in the root directory
2. Add the following variables:

PORT=8080
JWT_SECRET=create your own key
DB_HOST=your_host
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=studentAttendanceTracker
DB_PORT=your_port

4. Replace the placeholder values with your actual database credentials.

## Step 4: Install Dependencies

1. Make sure you are in the root folder. If not, navigate to it using cd.
2. Run the following command in the terminal:
3. `npm install --force`
4. This command will install all the required Node.js dependencies.

## Step 5: Start Project

1. In the terminal, run the following command:
2. `node app.js`
3. If `Server Port 8080` is displayed in the terminal, the project is running successfully.

## Step 6: Frontend Setup
 
 1. Open the frontend project.
 2. Follow the setup and run instructions provided in its README.md file.