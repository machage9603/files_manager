# Files Manager

A robust backend API for a file management system built with Node.js. This project implements user authentication, file upload/download functionality, permissions management, and image thumbnail generation.

## Features

- **User Authentication**

  - Basic authentication (Base64)
  - Token-based access
  - Session management with Redis

- **File Operations**

  - Upload files (regular files & images)
  - Create folders
  - List files & folders
  - Get file data
  - Set file permissions (public/private)
  - File parent/child relationships

- **Image Processing**

  - Automatic thumbnail generation
  - Multiple thumbnail sizes (100px, 250px, 500px)
  - Background processing with Bull

- **Database Management**
  - MongoDB for data persistence
  - Redis for caching & session management
  - Pagination support

## Technology Stack

- **Backend**: Node.js with Express
- **Databases**:
  - MongoDB (file/user data storage)
  - Redis (caching, session management)
- **Image Processing**: image-thumbnail
- **Queue System**: Bull
- **Testing**: Mocha
- **Development**: ESLint, Nodemon

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/files_manager.git
cd files_manager
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Create .env file
cp .env.example .env

# Configure these variables
DB_HOST=localhost
DB_PORT=27017
DB_DATABASE=files_manager
FOLDER_PATH=/tmp/files_manager
```

4. Start the servers:

```bash
# Start the API server
npm run start-server

# Start the worker (in a separate terminal)
npm run start-worker
```

## API Endpoints

### Authentication

- `GET /connect` - Sign-in with Basic Auth
- `GET /disconnect` - Sign-out based on token
- `GET /users/me` - Get user info based on token

### User Management

- `POST /users` - Create a new user
- `GET /status` - Get API status
- `GET /stats` - Get file & user stats

### File Operations

- `POST /files` - Upload a new file/create folder
- `GET /files/:id` - Get file by ID
- `GET /files` - List all files (with pagination)
- `PUT /files/:id/publish` - Make file public
- `PUT /files/:id/unpublish` - Make file private
- `GET /files/:id/data` - Get file data (supports thumbnail sizes)

## Testing

Run the test suite:

```bash
npm test
```

Tests cover:

- Redis client functionality
- Database client functionality
- API endpoints
- Worker processes

## Project Structure

```
alx-files_manager/
├── controllers/
│   ├── AppController.js
│   ├── AuthController.js
│   ├── FilesController.js
│   └── UsersController.js
├── routes/
│   └── index.js
├── utils/
│   ├── db.js
│   └── redis.js
├── worker.js
├── server.js
└── tests/
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

- Original Author: [https://x.com/SerMachage]

## Acknowledgments

- ALX & Holberton School for the project requirements and support
- Node.js community for excellent documentation
- All contributors and testers
