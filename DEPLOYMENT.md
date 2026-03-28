# Deployment Guide

This project is configured to run locally and is fully prepared for cloud deployment. Here is the step-by-step guide to deploying the Database, Backend, and Frontend.

---

## 1. Database: TiDB Cloud Serverless (MySQL Compatible)

1. Create a free account at [TiDB Cloud](https://tidbcloud.com/).
2. Create a **Serverless** cluster.
3. Once created, click **Connect** and select the Java/JDBC driver option.
4. Copy the connection string. It will look like this:
   `jdbc:mysql://gateway01.us-east-1.prod.aws.tidbcloud.com:4000/campusdrive_db?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2,TLSv1.3`
5. Keep your Username and Password handy.

---

## 2. Backend: Hugging Face Spaces

1. Create an account at [Hugging Face](https://huggingface.co/).
2. Create a new **Space**. Choose **Docker** as the SDK and use **Blank**.
3. Upload the contents of your `campusdrive-backend` folder to the Space. 
   - The included `Dockerfile` will automatically build the Spring Boot project and run it on port 7860 (the HF standard port for Spaces).
4. Go to your Space **Settings** -> **Variables and secrets** and add the following **Secrets**:
   - `SPRING_DATASOURCE_URL`: (Paste your TiDB JDBC URL from step 1)
   - `DB_USERNAME`: (Your TiDB Username)
   - `DB_PASSWORD`: (Your TiDB Password)
   - `JWT_SECRET`: (A strong random string for JWT signatures)
   - `CORS_ORIGINS`: `https://YOUR_VERCEL_APP_URL.vercel.app` (You will set this after deploying frontend)
5. The Space will automatically rebuild and start running.

---

## 3. Frontend: Vercel

1. Create a GitHub repository and push your `campusdrive-frontend` code.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Set the **Framework Preset** to Vite.
5. In the **Environment Variables** section, add:
   - `VITE_API_URL`: `https://your-huggingface-space-name.hf.space` (This is the direct app URL of your Hugging Face space).
6. Click **Deploy**. 
7. Vercel will install dependencies, build the React app, and use the included `vercel.json` to handle client-side routing properly.

*Note: Once your Vercel URL is generated, don't forget to update the `CORS_ORIGINS` secret in your Hugging Face Space so that your backend allows requests from your frontend!*
