## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

**Deployment**

# Build the image
docker build -t vite-react-app .

# Run the container
docker run -d -p 3000:80 --name vite-react-container vite-react-app
