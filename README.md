# Know Rental Maintenance App

A web application for managing rental maintenance with a clean, royal-feeling UI.

## Features

- User authentication with username/password
- Add, view, and manage rental information
- Toggle between 'paid' and 'pending' status
- View rental history by date
- Automatic daily data saving at midnight
- Responsive design with a premium feel

## Tech Stack

- **Frontend**: React, Material-UI, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **Build Tool**: Vite

## Simplified Deployment on Vercel

### Option 1: Deploy via ZIP file (Recommended)

1. Install dependencies:
   ```
   npm install
   ```

2. Create a deployment ZIP file:
   ```
   npm run prepare-vercel
   ```

3. Upload the generated `vercel-deploy.zip` file to Vercel:
   - Go to [Vercel](https://vercel.com)
   - Click "Add New" > "Project"
   - Choose "Upload" and select the ZIP file
   - Configure the project settings:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add the environment variables from your `.env` file
   - Deploy

### Option 2: Deploy via GitHub

1. Fork or clone this repository to your GitHub account
2. Connect your GitHub repository to Vercel
3. Add the environment variables from your `.env` file
4. Deploy the project

### Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with your Firebase configuration
4. Start the development server:
   ```
   npm run dev
   ```

## License

This project is licensed under the MIT License.
