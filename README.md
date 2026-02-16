## Setup and Run Instructions

# Step 1: Required things

1. node js 20 LTS
2. mysql 8.0

# Step 2: DB Creation and Table Creation

-> In the Root Folder there is a database/schema.sql file.
-> Open that file in your local mysql and run those queries to create Database and Tables.
-> Once everything is created. Now Your DB creation is finsihed.

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

## Step 4:

-> Make sure you're in the root folder or else use cd to get into root folder.
-> Next run this command in the terminal --> npm i --force
-> The above command will install the necessary node modules.

## Step 5: Start Project

-> In the terminal, run the below command
-> node app.js
-> This will start the project.
-> If `Server Port 8080` shown in terminal, The project successfully Running.

## Step 6: Move to Front end
 
 -> Now open fron end project and follow the instructions to setup and run.
 -> The front end instructions were given in the README.md file.