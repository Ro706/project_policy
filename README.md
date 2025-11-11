# Project Title: Policy Summarizer

## Project Description

The Policy Summarizer is a web application that allows users to get summaries of their documents. Users can sign up, log in, and manage their summaries. The application also features a subscription model, allowing users to access premium features.

## Features

*   **User Authentication:** Secure user registration and login functionality.
*   **Summary Management:** Users can add, view, and delete their summaries.
*   **Subscription Model:** Users can subscribe to a premium plan to access additional features.
*   **User Account:** View your account information and a list of your saved summaries.

## Technologies Used

### Frontend

*   React
*   Vite
*   CSS
*   React Router

### Backend

*   Node.js
*   Express
*   MongoDB
*   Mongoose
*   JSON Web Token (JWT) for authentication
*   Razorpay for payments

## Getting Started

### Prerequisites

*   Node.js
*   npm
*   MongoDB

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/project_policy.git
    ```
2.  Install frontend dependencies:
    ```bash
    cd project_policy
    npm install
    ```
3.  Install backend dependencies:
    ```bash
    cd backend
    npm install
    ```
4.  Create a `.env` file in the `backend` directory and add the following environment variables:
    ```
    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    RAZORPAY_KEY_ID=<your_razorpay_key_id>
    RAZORPAY_KEY_SECRET=<your_razorpay_key_secret>
    ```

### Running the Application

1.  Start the backend server:
    ```bash
    cd backend
    node index.js
    ```
2.  Start the frontend development server:
    ```bash
    cd ..
    npm run dev
    ```

## API Endpoints

### Auth

*   `POST /api/auth/createuser`: Create a new user.
*   `POST /api/auth/login`: Log in a user.
*   `POST /api/auth/getuser`: Get the logged-in user's information.
*   `PUT /api/auth/updateuser`: Update the logged-in user's information.

### Summary

*   `POST /api/summary/add`: Add a new summary.
*   `GET /api/summary/getall`: Get all summaries for the logged-in user.
*   `DELETE /api/summary/delete/:id`: Delete a summary by ID.

### Payment

*   `POST /api/payment/create-order`: Create a new Razorpay order.
*   `POST /api/payment/verify-payment`: Verify a Razorpay payment and update the user's subscription.
*   `GET /api/payment/check-subscription`: Check the subscription status of the logged-in user.
*   `GET /api/payment/get-key`: Get the Razorpay key ID.


## Frontend

<img width="1798" height="831" alt="image" src="https://github.com/user-attachments/assets/8e8c20ab-decf-4828-bf63-cbc4ad1dac43" />
<img width="1852" height="892" alt="image" src="https://github.com/user-attachments/assets/8d862ba9-b6fa-4276-9ae1-cdfb98ddb952" />
