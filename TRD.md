1. System Architecture
   You will use a decentralized serverless architecture. Your Next.js Full Stack handles the UI, Routing, and internal Server Actions. Supabase handles the robust PostgreSQL Database and Authentication. Your separate Python (FastAPI) backend handles the heavy Artificial Intelligence tasks, hosted independently.

2. AI Measurement Engine (Python / FastAPI)

Pose Detection: Use Google MediaPipe Pose to identify the 33 3D landmarks on the user's body.

Depth Estimation: Use the MiDaS AI model (via PyTorch) to estimate how far the user is from the camera, which is required to calculate the circumference of the body.

Calibration Math: To convert the digital pixels of the photo into real-world centimeters, the Python script measures the pixels of the A4 paper. It uses the formula: Centimeters = (Pixels / DPI) \* 2.54 to scale the measurements perfectly.

3. 3D Rendering Engine (React.js)

The Canvas: Use React Three Fiber and Three.js to render the 3D graphics directly in the browser.

Customization: Use the useLoader hook to load compressed .glb clothing models from Cloudflare R2 (to avoid bandwidth costs). Use the Decal component from the @react-three/drei library to project uploaded logos securely buffered via Cloudinary.

Layering Clothes: To ensure layered 3D clothes (like a jacket over a shirt) don't clip through each other, the 3D models must be bound to a shared skeletal rig using "skinning" techniques rather than just scaling them up.

4. Affiliate & Backend Automations (Next.js Server Actions)

Instead of a heavy Java server, your Next.js API Routes and Server Actions will connect directly to affiliate networks like Impact.com, Rakuten Advertising, and ShopStyle Collective.

You will use Vercel Cron Jobs that trigger specific Next.js Serverless API endpoints every night to download the latest product catalogs, prices, and affiliate links into your Supabase database.
