# CPSC 329 Final Project: Password Manager


## Project Description:
The goal is to create a password manager application to securely store passwords for local use on a device.

### Table of Contents
- **[Project Description](#Project-Description)**
- **[File Locations and Purposes](#File-Locations-and-Purposes)**
- **[Running the project](#Running-the-project)**


## File Locations and Purposes:

### Root directory files
- `README.md`  
  **Location:** Root directory  
  **Purpose:** Provides an overview of the project, file locations, and setup instructions.


- `db.js`  
  **Location:** Root directory
  **Purpose:** Controller for database information.


- `encryption.js`  
  **Location:** Root directory
  **Purpose:** Encrypts and decrypts sensitive strings like vault passwords using AES-256-CBC with a securely stored encryption key.


- `package-lock.json`  
  **Location:** Root directory
  **Purpose:** Stores information for necessary packages in the system


- `package.json`  
  **Location:** Root directory
  **Purpose:** Stores information for necessary packages in the system


- `server.js`  
  **Location:** Root directory
  **Purpose:** Runs the localhost server.


### Root - SQL Directory
- `SQL_STATEMENTS.txt`  
  **Location:** SQL Directory
  **Purpose:** This SQL file defines the relational database schema for a password manager, including users, vaults, stored credentials, 2FA logs, and activity tracking.


### Source directory 
- `App.tsx`  
  **Location:** Source directory 
  **Purpose:** Acts as the main controller for the React application. This file sets up the routing for different pages using React Router, directing users to specific pages based on the URL.

- `index.css`  
  **Location:** Source directory 
  **Purpose:** Imports styles from Tailwind.


- `main.tsx`  
  **Location:** Source directory 
  **Purpose:** The entry point for React, where the root React component `(App.tsx)` is rendered into the DOM. It wraps the application in necessary providers like `BrowserRouter` for routing.


- `vite-env.d.ts`  
  **Location:** Source directory 
  **Purpose:** A TypeScript definition file that informs the TypeScript compiler of the types for Vite-specific features. This ensures proper TypeScript support for Vite.


- `enlist.config.json`  
  **Location:** Pages directory
  **Purpose:** Configuration file for ESLint. It specifies the coding standards and rules for linting TypeScript and React code, ensuring consistency in the codebase.


- `index.html`  
  **Location:** Pages directory
  **Purpose:** The main HTML template file


### Source - Components directory
- `CustomServiceTab.tsx`  
  **Location:** Source/Components directory
  **Purpose:** Used to display and manage custom services (e.g., adding custom websites or services for storing passwords).


- `PasswordUnlockModal.tsx`  
  **Location:** Source/Components directory
  **Purpose:** A password modal verifies user input via API, displays errors, and triggers unlock or close actions.


- `PresetServiceTab.tsx`  
  **Location:** Components directory
  **Purpose:** Displays preset (pre-configured) services or websites where users can manage passwords (e.g., Google, Facebook).


- `ProtectedRoute.tsx`  
  **Location:** Source/Components directory
  **Purpose:** Guards routes by checking for a valid token in local storage, redirecting unauthenticated users to the login page.


- `ServiceTab.tsx`  
  **Location:** Source/Components directory
  **Purpose:** A generic tab component that handles the display of either custom or preset services related to password management.


- `Sidebar.tsx`  
  **Location:** Source/Components directory
  **Purpose:** The sidebar handles the navigation across different sections or features of the password manager app.


- `UserInfoTab.tsx`  
  **Location:** Source/Components directory
  **Purpose:** Displays and manages user information, such as their profile details, settings, and account preferences.


### Source - Pages directory
- `Dashboard.tsx`  
  **Location:** Source/Pages directory
  **Purpose:** The main user dashboard where users can view their saved passwords, manage settings, and navigate to other features.


- `LandingPage.tsx`  
  **Location:** Source/Pages directory
  **Purpose:** The first page users see when they visit the app. Contains basic info about the app and buttons for login and signup.


- `Loginpage.tsx`  
  **Location:** Source/Pages directory
  **Purpose:** The login page where users can enter their credentials to access their password manager.


- `SignUpPage.tsx`  
  **Location:** Source/Pages directory
  **Purpose:** The signup page where new users can create an account for the password manager.



## Running The Project:

### **NOTE:** 
This only runs the FRONTEND of the project. 

To have full functionality you also need to start the backend server and host your own PostgreSQL data base locally.

To start the backend server for the first time you just have to type `npm i` then `node server.js`<br><br>

1. **Clone the repository**:
    ```bash
    git clone https://github.com/ShakH00/PasswordManager.git
    ```

2. **Install the necessary packages**:
    - Make sure that `npm` and `node.js` are installed on your computer then run:
   ```bash
    npm install react
    ```
3. **`cd` into proper directory**
    ```bash
   cd frontend/password-manager-app/src 
   ```

4. **Start local server**:
    ```bash
   npm i 
   ```
    ```bash
   npm run dev 
   ```
5. **Click the link in the run terminal**
