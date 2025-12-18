# Agile Practices

Hello, and thank you for contributing to the Skill Bytes project! We are currently using a modified AGILE framework to manage work. Below is a list of planned features, if you finish any feature please check it off on the list. The way our AGILE system works is every week we begin a new sprint, named with the start and end dates - and goal - where we layout goals for the week. Every goal that is finished will be marked completed, and the ones that remain incomplete by the end of the week will be pushed into the next week.

**ACTIVE SPRINT:** [Sprint 0 (12/14/2025 - 12/21/2025) Patch Daily Challenge Implementation](#sprint-0-12142025---12212025-patch-daily-challenge-implementation)

## Sprint 2 (12/28/2025 - 1/5/2026) Account Management

| Implement Soft Account Deletion and Management                 | Implement a frontend to allow users to easily manage their account data, such as email and username, and implement soft account deletion. On deletion a flag should be set in the database marking the account for deletion, and an email should be sent to the user informing them that their account will be deleted unless they log into their account.                       | ❌     |

## Sprint 1 (12/21/2025 - 12/28/2025) Internal Tooling

| Item                                   | Description                                                                                                                                                                                        | Status |
|----------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| Write Internal Tooling                 | Develop internal tooling—using the Ink framework—to streamline challenge publishing and provide automated warnings to ensure the challenge pool remains sufficiently populated.                       | ❌     |

## Sprint 0 (12/14/2025 - 12/21/2025) Patch Daily Challenge Implementation

| Item                                   | Description                                                                                                                                                                                        | Status |
|----------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|
| Finish Daily Challenge System          | Implement the backend for daily challenge retrieval, track each user’s completed challenges, and build frontend interfaces for loading challenges, editing code, testing solutions, and viewing leaderboards. | ✅     |
**| Vim Bindings & Editor Patch  | Allow for easier programming by implementing vim bindings in a seperate mode. Also, patch editor to fix issues with resetting the editor and immediately attempting to interact, and issues when using `CTRL` + `Z` to take back to default code sample.                                                            | ⌛ DELAYED     |**
| Patch Logout  | Patch Logout implementation to invalidate the active session before redirecting to `/login`.                                                            | ✅     |
| Update Nav Bar for `/user` Endpoints  | Update the Nav Bar for all `\user` endpoints to directly link to account state management and daily challenge features.                                                            | ✅     |
| UI Patch  | Update the `\daily-challenge` UI to show a green highlught on all previously completed challenges regardless of whether the elements are in focus.                                                            | ✅     |
| Code Cleanup – Auth Routes/Middleware  | Conduct a thorough review of authentication routes and middleware to ensure adherence to coding best practices and security guidelines.                                                             | ❌     |
| Code Cleanup – User Routes             | Audit and refine all user-related routes to maintain code quality, consistency, and security compliance.                                                                                            | ❌     |
| Code Cleanup – Admin Routes            | Review and polish administrative routes to uphold coding standards and strengthen application security.                                                                                             | ❌     |
| Code Cleanup – Root Routes             | Clean and standardize root-level routing logic to improve maintainability and overall application structure.                                                                                        | ❌     |
| Code Cleanup – Internal Tooling        | Evaluate and refine internal tooling code to ensure it meets project conventions and security expectations.                                                                                         | ❌     |

## Project Direction
The following is an outline for the long term goals of the project.
1. Implement a learn feature, allowing users to work through problem lists by topic
2. Add skill issues, providing feedback on users projects
3. Add byte clubs, connecting users, a d allowing users to collaborate on projects
4. Add premium plan, including executing problems in Docker to allow for more complex problems, and migrating the service to web to increase scalability
5. Implement free subdomains, allowing users to easily create landinv pages
