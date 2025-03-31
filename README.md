# University-Store-Payment-System
Prepaid Wallet System +  Volunteer-Based Ride-Sharing System, for University.

## Wallet Feature Testing Commands

This guide provides the necessary `curl` commands to test the wallet functionalities. Make sure your backend server is running on the correct port (default is 5000) before executing these commands.

### Topup

```bash
curl -X POST http://localhost:5000/wallet/topup \
     -H "Content-Type: application/json" \
     -d '{"userId": "user123", "amount": 500}'
```

### Check Balance

```bash
curl -X GET "http://localhost:5000/wallet/balance?userId=user123"
```

### Pay 

```bash
curl -X POST http://localhost:5000/wallet/pay \
     -H "Content-Type: application/json" \
     -d '{"userId": "user123", "amount": 200}'
```
### Check Transaction History

```bash
curl -X GET "http://localhost:5000/wallet/history?userId=user123"
```
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Implementation Summary

I've implemented the three requested features for your Campus Marketplace application:

### 1. Currency Conversion

- Created a `formatCurrency` utility function that formats numbers as Indian Rupees (₹)
- Updated all price displays across the application to use this function
- Ensured consistent formatting with the Indian numbering system (lakhs, crores)


### 2. Authentication Restriction

- Implemented a Next.js middleware that:

- Restricts access to all pages except the home page (About Us), login, and signup
- Redirects unauthenticated users to the login page
- Preserves the original URL as a redirect parameter for after login
- Redirects logged-in users away from login/signup pages





### 3. User Profile Display

- Created an AuthProvider context to manage user authentication state
- Implemented user profile information display on the profile page
- Made user data accessible throughout the application via the useAuth hook
- Updated the dashboard navigation to show the logged-in user's information
- Added proper avatar display with user initials as fallback


### How to Test

1. **Authentication Flow**:

1. Visit any protected page while logged out - you should be redirected to login
2. Log in with test credentials (e.g., [john.doe@kiit.ac.in](mailto:john.doe@kiit.ac.in) / password123)
3. You should be redirected to the originally requested page



2. **Currency Display**:

1. Check product listings, cart, wallet, and other pages
2. All prices should now display in ₹ format (e.g., ₹1,200 instead of $15)



3. **User Profile**:

1. After logging in, visit the profile page
2. You should see your name, email, university, and other details
3. The avatar should show your initials if no profile image is available
4. Your wallet balance should be displayed in ₹





These changes provide a more localized experience for Indian users, better security through proper authentication, and improved user experience by displaying relevant user information throughout the application.

Please make sure to add the following environment variables to your project:

PORT JWT_SECRET JWT_EXPIRES_IN Submit
