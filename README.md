---------------------------------------------------
<!-- --------- SETUP INSTRUCTIONS: -------------- -->
--------------------------------------------------

Step 1: Required things before run application

1. node js 20 LTS
2. mysql 8.0

## Environment Setup

1. Create a `.env` file in the root directory
2. Add the following variables:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=database_name
DB_PORT=3306
PORT=8080
JWT_SECRET=create your own key

Step 2: Install Dependencies

-> open terminal and inside the root folder run the below command
-> npm i --force
-> This will install all the needed Dependencies

Step 3: DB Creation and Table Creation

-> In the Root Folder there is a .sql file, the name of the file is "MySQL_Script_PMS.sql"
-> Open that file and follow the Database Creation and Table creation.
-> Once everything is created. Now Your DB creation is finsihed.

Step 4: mySQL setups

-> open .env file - it is in the root folder

-> there enter your mySQL details

DB_HOST=your_db_host
DB_PORT=your_db_port
DB_USER=your_db_user
DB_PASSWORD=your_db_password

-> Do not change the DB_NAME: productManagementSystem

<!-- --------------------------------------------------- -->
<!-- --------- RUN INSTRUCTIONS: -------------- -->
<!-- -------------------------------------------------- -->

Step 1: Starting Project

-> In the terminal, run the below command
-> node app.js
-> This will start the project.

Step 2: Run In Browser

-> Open Browser and paste the below url
-> http://localhost:8080/
-> This will show a Login page.

Step 3: Steps to Test

-> click signup link and create a new account
-> then come back and login
-> this will open a product listing page
-> Click Add Product button and add a product.
-> Added Product will be displayed in the product Listing.
-> There you can add, edit, view product and view Report.

<!-- --------------------------------------------------- -->
<!-- --------- PROJECT STRUCTURE -------------- -->
<!-- -------------------------------------------------- -->

PRODUCT-MANAGEMENT-SYSTEM
|
|--- Config
|     |__db.js - Contains MySQL db connection code
|
|--- Controller
|     |_adminController.js - Contains admin table codes
|     |_productController.js - Contains products table codes
|
|--- public - Contains HTML files
|     |_pages
|        |_login
|        |   |_login.html
|        |   |_signUp.html
|        |_products
|            |_addProduct.html
|            |_editProduct.html
|            |_productList.html
|            |_productReport.html
|            |_viewProduct.html
|
|--- Route
|     |_adminRoute.js - Contains admin Routes
|     |_productRoute.js - Contains product Routes
|
|--- .env - Contains port and db variables
|--- .gitignore
|--- app.js - Main file, Project starts at here
|--- MySQL_Script_PMS.sql - Contains SQL Scripts
|--- package.json
|--- README.md


DB run locally

mysql -u root -p your_db_name < database/schema.sql