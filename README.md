# Project Title: Policy Summarizer

## Project Description

The Policy Summarizer is a web application that allows users to upload PDF documents, get summaries, translate them, and interact with a chatbot to ask questions about the document. This tool is designed to help users quickly understand the content of lengthy policy documents.

## Features

*   **User Authentication:** Secure user registration and login functionality.
*   **PDF Summarization:** Upload a PDF file and get a concise summary with a configurable word limit.
*   **Translation:** Translate the summary into multiple Indian languages.
*   **Text-to-Speech:** Listen to the summary in the selected language.
*   **Chat with PDF:** Ask questions about the uploaded PDF and get answers from an AI-powered chatbot.
*   **Download Summary:** Download the generated summary as a PDF file.
*   **User Account:** View your account information and a list of your saved summaries.

## Technologies Used

### Frontend

*   React
*   Vite
*   Tailwind CSS
*   React Router

### Backend

*   Node.js
*   Express
*   MongoDB
*   Mongoose
*   JSON Web Token (JWT) for authentication

### APIs

*   OpenAI API (for chat functionality)
*   Google Translate API (for translation)

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
    OPENAI_API_KEY=<your_openai_api_key>
    ```

### Running the Application

1.  Start the backend server:
    ```bash
    cd backend
    npm start
    ```
2.  Start the frontend development server:
    ```bash
    cd ..
    npm run dev
    ```

## API Endpoints

### Auth

*   `POST /api/auth/signup`: Create a new user.
*   `POST /api/auth/login`: Log in a user.
*   `POST /api/auth/getuser`: Get the logged-in user's information.
*   `PUT /api/auth/updateuser`: Update the logged-in user's information.

### Summary

*   `POST /api/summary/add`: Add a new summary.
*   `GET /api/summary/getall`: Get all summaries for the logged-in user.

### Chat

*   `POST /api/chat/init`: Initialize a new chat session.
*   `POST /api/chat/ask`: Ask a question about a PDF document.
*   `GET /api/chat/history/:documentId`: Get the chat history for a document.

## Flow Diagram

```
+---------------------+      +---------------------+      +---------------------+
|   User Registers/   |----->|  User Uploads PDF   |----->|  Backend Generates  |
|       Logins        |      |      and Sets       |      |      Summary        |
+---------------------+      |       Options       |      +---------------------+
                               +---------------------+
                                         |
                                         v
+---------------------+      +---------------------+      +---------------------+
|  Summary Displayed  |<-----|  Backend Saves      |<-----|  User Interacts     |
|    with Options     |      |      Summary        |      |    with Chatbot     |
| (Translate, TTS)    |      +---------------------+      +---------------------+
+---------------------+
```