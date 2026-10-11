# 🌐 Connect Us — Local Services Platform

### For the People, By the People

**Connect Us** is a full-stack web application designed to connect customers with local service providers. The platform aims to make everyday services easier to find and help local workers discover employment opportunities.

## 🚀 Live Demo

- **Live Website:** https://manibhangi.github.io/connect-us/
- **Backend API:** https://connect-us-1-dq8a.onrender.com
- **GitHub Repository:** https://github.com/Manibhangi/connect-us

---

## 📌 About the Project

Finding suitable local service providers can be difficult, while local workers may need better ways to discover job opportunities.

Connect Us aims to address these challenges through a single online platform. Customers can explore services and request work, while workers can access job opportunities through their dashboard.

The application uses a web frontend, a backend API, and a database to support its functionality.

## 🎯 Project Objectives

- Connect customers with local service providers.
- Make everyday services easier to discover.
- Help local workers find job opportunities.
- Simplify the process of submitting service requests.
- Support local employment and community development.
- Build a convenient and accessible web application.

---

## ✨ Key Features

### 🔐 User Authentication
Provides registration and login functionality for users.

### 👥 Customer and Worker Roles
Supports separate interfaces for customers and workers.

### 🛠️ Local Service Discovery
Allows customers to explore available service options.

### 💼 Job Requests and Opportunities
Supports customer job requests and worker access to available opportunities through the implemented features.

### 🗄️ Database Integration
Uses MongoDB to store application data.

### 🔑 Backend API
Uses Node.js and Express.js to handle application requests.

### 📧 Email OTP
Includes email OTP flows for account verification and password recovery. Email delivery requires valid SMTP configuration.

### 📱 Web-Based Interface
Provides a browser-accessible interface built with HTML, CSS, and JavaScript.

---

## ⚙️ How Connect Us Works

### Step 1: Visit the Website
Open the [Connect Us Live Website](https://manibhangi.github.io/connect-us/) in your browser.

### Step 2: Register or Log In
New users can register by providing the required information. Existing users can log in using their credentials.

### Step 3: Access Your Account
Users access the application according to their account role:

- **Customer:** Explore available services and submit job requests.
- **Worker:** Access the worker dashboard and explore available job opportunities.

### Step 4: Customer Requests a Service
The customer describes the required work and submits a job request using the available features.

### Step 5: Worker Explores Opportunities
Workers can review available work opportunities through the worker interface.

### Step 6: Service Coordination
Customers and workers can coordinate to arrange the service, depending on the communication features implemented in the application.

### Step 7: Backend Processing
The frontend sends HTTP requests to the backend API. The backend processes supported operations and interacts with MongoDB to retrieve or store application data.

### Step 8: Deployment
The frontend is hosted on GitHub Pages, and the backend API is hosted on Render. MongoDB Atlas provides cloud database storage.

---

## 🧰 Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Structures website pages |
| CSS3 | Designs and styles the interface |
| JavaScript | Adds frontend functionality |
| Node.js | Runs the backend application |
| Express.js | Handles server requests and API routes |
| MongoDB | Stores application data |
| Mongoose | Defines database models and manages database operations |
| JWT | Supports token-based authentication |
| bcryptjs | Hashes passwords |
| Nodemailer | Sends emails through a configured SMTP server |
| Brevo SMTP | Supports transactional email delivery |
| Git | Tracks source-code changes |
| GitHub | Hosts the source code |
| GitHub Pages | Hosts the frontend |
| Render | Hosts the backend API |

---

## 📁 Project Structure

```text
connect-us/
│
├── frontend/                     # Frontend source code
│   ├── index.html                # Landing page
│   ├── style.css                 # Main website styles
│   ├── script.js                 # Landing page JavaScript
│   │
│   ├── auth.html                 # Login and registration page
│   ├── auth.css                  # Authentication page styles
│   ├── auth.js                   # Authentication functionality
│   │
│   ├── customer.html             # Customer dashboard
│   ├── customer.css              # Customer dashboard styles
│   ├── customer.js               # Customer dashboard functionality
│   │
│   ├── worker.html               # Worker dashboard
│   ├── worker.css                # Worker dashboard styles
│   └── worker.js                 # Worker dashboard functionality
│
├── backend/                      # Backend source code
│   │
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   │
│   ├── models/
│   │   ├── User.js               # User data model
│   │   ├── Job.js                # Job data model
│   │   └── Service.js             # Service data model
│   │
│   ├── controllers/
│   │   ├── authController.js     # Authentication and OTP logic
│   │   ├── userController.js     # User operations
│   │   ├── jobController.js      # Job operations
│   │   └── serviceControllers.js # Service operations
│   │
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication API routes
│   │   ├── userRoutes.js         # User API routes
│   │   ├── jobRoutes.js          # Job API routes
│   │   └── serviceRoutes.js      # Service API routes
│   │
│   ├── middleware/
│   │   └── authMiddleware.js     # Authentication middleware
│   │
│   ├── server.js                 # Backend entry point
│   ├── package.json              # Backend dependencies
│   └── .env                      # Local environment variables (not committed)
│
├── docs/                         # GitHub Pages deployment files
│   ├── index.html
│   └── ...                       # Other deployed frontend assets
│
├── .gitignore                    # Excludes secrets and unwanted files
└── README.md                     # Project documentation
```

**Note:** This is the project structure discussed during development. Check your actual repository to confirm every filename before publishing the documentation.

### 📂 Folder Responsibilities

- **frontend/** — Contains website pages, stylesheets, and browser-side JavaScript.
- **backend/** — Contains the Express server, API routes, controllers, middleware, and data models.
- **config/** — Contains database connection configuration.
- **models/** — Defines the structure of MongoDB documents.
- **controllers/** — Implements application logic for supported operations.
- **routes/** — Defines the API endpoints.
- **middleware/** — Handles request checks, including authentication.
- **docs/** — Contains frontend files used by GitHub Pages.
- **README.md** — Documents the project, functionality, technologies, and links.

---

## 🔄 Application Architecture

```text
        CUSTOMER / WORKER
                |
                v
        CONNECT US FRONTEND
         HTML + CSS + JS
                |
                v
           BACKEND API
        Node.js + Express.js
                |
                v
       ROUTES AND CONTROLLERS
                |
                v
            MONGODB
        Database and Models
```

The frontend sends requests to the backend. The backend validates and processes supported operations and accesses MongoDB when database operations are required.

---

## 🌍 Deployment Architecture

| Component | Platform | Responsibility |
|---|---|---|
| Frontend | GitHub Pages | Hosts the website |
| Backend | Render | Runs the backend API |
| Database | MongoDB Atlas | Stores application data |
| Email delivery | Brevo SMTP | Sends transactional emails |

---

## 🔒 Security

- Passwords should be stored as secure hashes, not plain text.
- Protected API routes should validate authentication tokens.
- Sensitive credentials should be stored in environment variables.
- Database connection strings, SMTP keys, and JWT secrets must not be published.
- The `backend/.env` file should remain excluded through `.gitignore`.

**Important:** Never upload your `.env` file or secrets to GitHub.

---

## 🔮 Future Enhancements

- Real-time notifications for new job requests.
- Customer reviews and worker ratings.
- Secure online payment integration.
- Location-based service discovery.
- In-app communication between customers and workers.
- Worker profile verification.
- Job status tracking.
- Improved service search and filtering.

---

## 💡 Benefits of Connect Us

- Helps customers discover local services.
- Gives workers another way to discover job opportunities.
- Supports local employment.
- Makes service requests easier to organize.
- Encourages community connections through technology.

---

## 👨‍💻 Project Information

- **Project Name:** Connect Us
- **Project Type:** Full-Stack Web Application
- **Domain:** Web Development
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Hosting:** GitHub Pages and Render
- **Tagline:** For the People, By the People

---

## 📄 License

This project was developed for educational and software-development purposes. Add an open-source license if you intend to distribute the project under specific reuse terms.

---

## 🌐 Explore Connect Us

**[Visit the Live Website](https://manibhangi.github.io/connect-us/)**

**[View the Source Code on GitHub](https://github.com/Manibhangi/connect-us)**

