# Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** Book Management Application  
**Version:** 1.0 (MVP)  
**Product Type:** Full-stack web application  
**Status:** In development

### 1.1 Problem Statement

Managing book records through scattered notes or spreadsheets can become inconvenient. Users need a centralized application to create, view, search, update, and delete book records.

The application must also protect user accounts and restrict access to protected operations through authentication and authorization.

### 1.2 Product Vision

Deliver a reliable and secure book management application that demonstrates practical full-stack engineering, including REST API design, database modeling, authentication, frontend integration, validation, testing, and deployment.

### 1.3 Goals

- Provide secure user registration and login.
- Allow authenticated users to manage book records.
- Provide search, filtering, sorting, and pagination.
- Build a responsive and intuitive user interface.
- Implement consistent API responses and error handling.
- Demonstrate maintainable project structure and professional Git workflows.
- Deploy a usable application with clear setup documentation.

### 1.4 Non-Goals for the MVP

The first release will not include:

- Online purchasing or payments.
- Book delivery or inventory shipping.
- Social features, reviews, or ratings.
- External book-provider integrations.
- AI-generated recommendations.
- Mobile applications.
- Complex multi-organization administration.

These can be considered after the core product works reliably.

## 2. Target Users

### 2.1 Registered User

A person who wants to maintain and organize book records.

Primary needs:
- Register and log in securely.
- Browse their book collection.
- Add new books.
- Edit or delete existing records.
- Search and filter books.
- Maintain a valid authenticated session.

### 2.2 Administrator

A privileged user responsible for administrative operations, if an administrative interface is included in the final release.

Primary needs:
- Access explicitly authorized administrative functionality.
- Manage records according to defined permissions.
- Prevent unauthorized users from performing administrative operations.

**MVP ownership assumption:** Books belong to the user who creates them. Users can manage their own books, while administrators may have broader access according to explicit authorization rules. This ownership model must be enforced by the backend, not merely hidden in the frontend.

## 3. Functional Requirements

### FR-01: User Registration

The system shall allow a new user to create an account.

Required fields:
- Name
- Email
- Password

Requirements:
- All required fields must be validated.
- Email addresses must be normalized consistently.
- Duplicate email addresses must be rejected.
- Passwords must be hashed before storage.
- Passwords and refresh tokens must never appear in public user responses.
- Public registration must not allow users to grant themselves administrator privileges.
- Successful registration returns a clear success response.

### FR-02: User Login

The system shall authenticate registered users using email and password.

Requirements:
- Missing credentials must be rejected.
- Invalid credentials must produce a suitable authentication error.
- Password verification must use a secure password-hashing library.
- Successful login issues an access token and refresh token.
- Authentication cookies must use appropriate security settings.
- Responses must not expose passwords or refresh tokens.
- Login errors must not unnecessarily disclose sensitive account information.

### FR-03: Session and Token Management

The application shall maintain authenticated sessions using access and refresh tokens.

Requirements:
- Protected endpoints must reject missing, invalid, or expired access tokens.
- Refresh-token requests must validate the token and its association with the user.
- Refresh-token rotation must invalidate the previously stored refresh token.
- Logout must invalidate the stored refresh token and clear authentication cookies.
- Token secrets must be stored in environment variables.
- Cookie settings must be appropriate for development and production environments.
- Cross-origin frontend requests must use a consistent credential and CORS configuration.
- The frontend must handle expired sessions and authentication failures.

### FR-04: Protected Profile

The system shall provide an authenticated profile endpoint.

Requirements:
- Only authenticated users can access the endpoint.
- The response returns safe user information.
- Passwords and refresh tokens must never be included.
- Invalid or expired access tokens must be rejected.

### FR-05: Create a Book

Authenticated users shall be able to create book records.

Book fields:
- `title`: required string
- `author`: required string
- `price`: required non-negative number
- `genre`: optional or required according to the final validation policy
- `createdAt`: automatically generated timestamp
- `updatedAt`: automatically maintained timestamp
- `owner`: authenticated user's identifier

Requirements:
- Input must be validated on the backend.
- Invalid data must return a clear client error.
- The server must derive ownership from the authenticated user, never trust an owner ID supplied by the client.
- Successful creation returns the created book without exposing internal secrets.

### FR-06: Retrieve Books

The system shall provide endpoints to retrieve a collection of books and a single book.

Requirements:
- Users can retrieve only records they are authorized to access.
- A single-book request must validate the identifier.
- A valid identifier for a nonexistent or inaccessible book must produce an appropriate response.
- Collection responses must use a consistent JSON structure.
- Database errors must be handled safely.

### FR-07: Update a Book

Authenticated users shall be able to update authorized book records.

Requirements:
- The book must exist and be accessible to the current user.
- Updates must validate supplied fields.
- Invalid updates must not corrupt stored records.
- The server must prevent unauthorized ownership changes.
- Successful updates return the updated record.

### FR-08: Delete a Book

Authenticated users shall be able to delete authorized book records.

Requirements:
- The book must exist and be accessible to the current user.
- Unauthorized deletion attempts must be rejected.
- Successful deletion returns a clear confirmation.
- The frontend should ask for confirmation before deleting a record.

### FR-09: Search, Filtering, and Sorting

Users shall be able to find books efficiently.

Supported MVP capabilities:
- Search by title or author.
- Filter by genre.
- Filter by minimum and maximum price.
- Sort by supported fields such as title, price, or creation date.

Requirements:
- Search and filter parameters must be validated.
- Unsupported sort fields or directions must be rejected or safely defaulted.
- Combined filters must work together.
- Empty results must return a valid empty collection rather than an error.

### FR-10: Pagination

The collection endpoint shall support server-side pagination.

Parameters:
- `page`: requested page number.
- `limit`: records per page.

Requirements:
- Page and limit values must be validated.
- A reasonable maximum page size must be enforced.
- The response must include pagination metadata, such as current page, page size, total records, and total pages.
- Empty pages must be handled consistently.
- Search, filtering, and sorting must work with pagination.

### FR-11: Frontend Experience

The web interface shall provide:

- Registration and login forms.
- A books listing page.
- A create-book form.
- Edit and delete actions.
- Search, filter, sort, and pagination controls.
- Loading, empty, success, and error states.
- A logout action.
- Responsive layouts for desktop and mobile screens.

Requirements:
- Forms must show understandable validation messages.
- Repeated submissions should be prevented while requests are pending.
- API errors must be displayed without exposing internal server details.
- Protected pages must handle unauthenticated users correctly.
- The interface must remain usable when the collection is empty or a request fails.

## 4. Proposed API Specification

Base path: `/api`

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/user/register` | Register a user | Public |
| POST | `/user/login` | Log in | Public |
| POST | `/user/refresh-token` | Refresh tokens | Valid refresh token |
| POST | `/user/logout` | Log out | Authenticated |
| GET | `/user/profile` | Retrieve profile | Authenticated |
| POST | `/books` | Create a book | Authenticated |
| GET | `/books` | List books | Authenticated |
| GET | `/books/:id` | Retrieve one book | Authenticated |
| PATCH | `/books/:id` | Update a book | Authenticated |
| DELETE | `/books/:id` | Delete a book | Authenticated |

The final routes must be reconciled with the existing code before implementation. Endpoint names above define the intended contract, not proof that every route already exists.

### 4.1 Example Collection Request

`GET /api/books?page=1&limit=10&search=javascript&genre=Programming&minPrice=100&maxPrice=800&sortBy=title&order=asc`

### 4.2 Example Collection Response

```json
{
  "success": true,
  "data": {
    "books": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalRecords": 0,
      "totalPages": 0
    }
  },
  "message": "Books retrieved successfully"
}
```

The exact response envelope may follow the project's existing `ApiResponse` utility, provided it remains consistent across endpoints.

## 5. Non-Functional Requirements

### NFR-01: Security
- Hash passwords using a suitable password-hashing algorithm.
- Keep secrets outside source control.
- Use HTTP-only cookies for tokens when following the cookie-based authentication strategy.
- Configure `Secure`, `SameSite`, cookie paths, and CORS according to the deployment environment.
- Validate all client input on the server.
- Enforce authentication, ownership, and role authorization on protected operations.
- Avoid leaking stack traces, secrets, or sensitive user data in production responses.
- Consider CSRF protections appropriate to the cookie-based authentication design.

### NFR-02: Maintainability
- Separate routes, controllers, models, middleware, and utilities.
- Keep database logic and HTTP response handling organized.
- Reuse centralized error-handling and asynchronous-handler utilities.
- Use consistent naming, formatting, and module conventions.
- Keep configuration in environment variables.

### NFR-03: Reliability
- Handle invalid requests and database failures gracefully.
- Ensure protected routes cannot be accessed by bypassing the frontend.
- Avoid inconsistent token state during refresh and logout.
- Provide predictable response status codes and structures.

### NFR-04: Performance
- Use database queries that support the required filters.
- Implement pagination at the database/API level rather than downloading every record.
- Avoid unnecessary database requests.
- Add indexes when query patterns justify them.

### NFR-05: Usability and Accessibility
- Provide clear labels and validation messages.
- Support keyboard navigation for core workflows.
- Maintain readable contrast and responsive layouts.
- Display request progress and meaningful empty states.

### NFR-06: Deployment
- Support separate development and production configuration.
- Document required environment variables.
- Keep production secrets out of the repository.
- Deploy the frontend and backend with compatible CORS and cookie settings.
- Verify the deployed application, not only the local development build.

## 6. Data Model

### User

| Field | Type | Requirement |
|---|---|---|
| `_id` | ObjectId | Generated by MongoDB |
| `name` | String | Required; validated length |
| `email` | String | Required; unique and normalized |
| `password` | String | Required; hashed and excluded by default |
| `role` | String | Restricted enum, default `user` |
| `refreshToken` | String or null | Stored according to the token strategy |
| `createdAt` | Date | Automatically maintained |
| `updatedAt` | Date | Automatically maintained |

### Book

| Field | Type | Requirement |
|---|---|---|
| `_id` | ObjectId | Generated by MongoDB |
| `title` | String | Required |
| `author` | String | Required |
| `price` | Number | Required; non-negative |
| `genre` | String | Optional or required by final policy |
| `owner` | ObjectId reference | Required; derived from authenticated user |
| `createdAt` | Date | Automatically maintained |
| `updatedAt` | Date | Automatically maintained |

The final schema should use consistent validation rules and timestamps. Additional fields should be introduced only when a real product requirement justifies them.

## 7. Error Handling

The API shall use appropriate HTTP status codes.

- `200 OK`: successful read, update, or action.
- `201 Created`: successful resource creation.
- `400 Bad Request`: invalid input or malformed identifier.
- `401 Unauthorized`: missing, invalid, or expired authentication.
- `403 Forbidden`: authenticated user lacks permission.
- `404 Not Found`: requested resource does not exist or is not accessible, according to the chosen disclosure policy.
- `409 Conflict`: duplicate email or conflicting resource state.
- `500 Internal Server Error`: unexpected server failure.

Errors must have a predictable structure and safe user-facing messages. Detailed internal errors should be logged server-side, not returned to clients.

## 8. Testing Requirements

### Authentication
- Register with valid and invalid inputs.
- Reject duplicate email addresses.
- Verify stored passwords are hashed.
- Reject login with invalid credentials.
- Access the profile with valid, missing, and invalid tokens.
- Refresh access tokens successfully.
- Reject expired, invalid, or previously rotated refresh tokens.
- Verify logout clears cookies and invalidates the stored refresh token.
- Verify public registration cannot assign an admin role.

### Book Management
- Create a valid book.
- Reject missing or invalid fields.
- Retrieve the collection and individual records.
- Update valid records.
- Delete an existing record.
- Handle malformed and nonexistent IDs.
- Verify one user cannot read, update, or delete another user's books.
- Verify administrative permissions where implemented.

### Search and Pagination
- Search by title and author.
- Apply each filter independently and in combination.
- Verify ascending and descending sorting.
- Test first, middle, last, and out-of-range pages.
- Confirm page metadata matches the returned data.

### Frontend Integration
- Test login, logout, and protected navigation.
- Verify cookie-based requests and credential configuration.
- Test loading, success, empty, and failure states.
- Verify forms and book operations work against the actual API.

## 9. MVP Acceptance Criteria

The MVP is ready for release when:

1. A user can register and log in securely.
2. Protected endpoints enforce authentication.
3. Refresh-token rotation and logout behave correctly.
4. Users can create, read, update, and delete authorized book records.
5. Ownership and role restrictions are enforced on the backend.
6. Search, filtering, sorting, and server-side pagination work together.
7. API responses and errors follow a consistent contract.
8. Core authentication and book-management test cases pass.
9. The frontend integrates successfully with the deployed or locally running API.
10. The README contains setup instructions, API documentation, environment-variable examples, and test instructions.
11. Secrets are excluded from Git.
12. A reviewer can run the project using the documented instructions.

## 10. Delivery Plan

### Phase 1: Complete Authentication Integration
- Verify access-token transport.
- Verify cookie and CORS behavior.
- Confirm login, profile, refresh, and logout flows.
- Test token rotation and invalid-token scenarios.

### Phase 2: Complete the Books API
- Implement the Book model and validation.
- Implement create and read endpoints.
- Implement update and delete endpoints.
- Enforce ownership and authorization.
- Test all endpoints in Postman.

### Phase 3: Search and Pagination
- Implement search and filters.
- Add sorting.
- Implement server-side pagination and metadata.
- Test combined query parameters.

### Phase 4: Frontend Integration
- Connect authentication forms to the API.
- Build the books listing and forms.
- Implement loading, error, and empty states.
- Connect CRUD, search, filters, and pagination.

### Phase 5: Quality and Release
- Run the complete test suite.
- Fix security and integration issues.
- Review code quality and environment configuration.
- Write the README and API examples.
- Deploy the application.
- Perform an end-to-end smoke test.
- Review and merge the feature branch when it is ready.

## 11. Success Metrics

The project will be evaluated against observable outcomes:

- All critical authentication tests pass.
- All core CRUD workflows pass.
- Unauthorized data access is prevented.
- Search and pagination return correct results.
- No secrets or password values appear in public API responses.
- A new developer can follow the README and run the application.
- The deployed application completes its main workflows without critical errors.

## 12. Assumptions and Open Decisions

The following decisions should be confirmed before expanding scope:

1. **Book visibility:** This PRD assumes personal collections. A shared public catalog would require different access rules.
2. **Administrator access:** Admin capabilities are conditional on whether an administrative interface is part of the MVP.
3. **Genre validation:** Decide whether genre is optional or restricted to a fixed list.
4. **Authentication transport:** The implementation should use one clearly defined access-token strategy and configure cookies and CORS consistently.
5. **Deployment targets:** Final hosting providers and production domains remain to be selected.
6. **Testing framework:** Select an automated testing setup compatible with the existing Node.js project.

## 13. Definition of Done

A feature is not complete merely because its endpoint returns a success response once.

A feature is done when:
- The implementation matches the requirement.
- Validation and error cases are handled.
- Authorization has been tested.
- Relevant tests pass.
- Changes are committed with a meaningful message.
- Documentation is updated where necessary.
- The feature has been reviewed before merging into `main`.

**Final product objective:** A secure, tested, documented, and deployable full-stack Book Management Application that demonstrates practical software engineering rather than merely a collection of CRUD endpoints.