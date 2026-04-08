# YOUNGIN — Fashion Tech Platform

An all-in-one fashion tech platform for Gen-Z combining AI sizing, 3D design, an affiliate marketplace, subscriptions, and tailor networking.

## Core Modules
1. **AI Body Sizing**: User uploads front + side photo. System extracts 33 body landmarks using MediaPipe, estimates depth using MiDaS (PyTorch), and uses A4 paper calibration to convert pixels to real centimeters.
2. **3D Designer Studio**: Browser-based clothing editor using React Three Fiber. Users customize GLB/GLTF garment models with colors, textures, and logo decals.
3. **Global Brand Aggregator**: Affiliate marketplace showing Nike, Zara, H&M products via Impact.com and Rakuten APIs. Earns commission on clicks.
4. **Subscription Thrift Box**: Monthly curated secondhand clothing box based on AI measurements and style quiz.
5. **Tailor Marketplace**: Connects users to local tailors; sends 3D designs + measurements directly to the tailor.

## Tech Stack
- **Frontend/Backend APIs**: Next.js 15 (App Router + SSR + Server Actions), Tailwind CSS, Zustand, React Three Fiber
- **AI Backend**: Python FastAPI, Google MediaPipe, MiDaS (PyTorch), Gemini API for AI stylist
- **Database & Auth**: Supabase (PostgreSQL + Authentication)
- **Object Storage**: Cloudflare R2 (10GB Free/Zero Egress) + Cloudinary (Image Compression)
- **Hosting**: Vercel (Next.js), Hugging Face Spaces (Python API)
- **Payments**: Skipped for now (mock with UI only)

## Design System & Vibe
- **Name**: "Youngin Neo-Hype" (Creative North Star: "The Neon Curator")
- **Theme**: Dark premium streetwear meets AI tech ("Supreme meets Silicon Valley")
- **Palette**: Background `#0A0A0A`, Surface `#111111`/`#1A1A1A`, Primary Neon Cyan `#00E5FF`, Secondary Gold `#F5C842`, Text `#E5E2E1`, Muted `#888888`
- **Font**: Inter (weight 900 for headlines, 400 for body, tight letter-spacing)
- **Layout**: 12-column grid desktop, 4-column mobile
- **Effects**: Glassmorphism, neon glow CTAs, gradient mesh overlays at 3-8% opacity, "Neon Trace" hover interactions, cubic-bezier(0.16,1,0.3,1) transitions

## Constraints
- **Budget**: Zero. Use ONLY free tiers. No paid services.
- **Scalability**: Design every service to handle at least 1,000 concurrent users
- **Professionalism**: Industry-standard design patterns (SOLID, Microservices, Design Systems)

---

## Stitch MCP — Project & Asset Registry

- **Stitch Project ID**: `5643700132775558569`
- **Design System Asset**: `assets/affc905378a84d4f8e5840d86b5a7e0b`

### All Generated Screens (Desktop)

| # | Screen | Screen ID |
|---|--------|-----------|
| 1 | Landing Page | `d0824eaac74e482ebc4256738c087917` |
| 2 | Login / Signup (Auth) | `d35e5649f2f84925bf669af4ad61875a` |
| 3 | 3D Designer Studio | `260c35f6df344fbebd1d2a84392a2a8d` |
| 4 | Brand Marketplace | `cf64926938674078b24758c2b69008b2` |
| 5 | AI Body Measurement | `991f470ed889499b9aa47aab79e99b20` |
| 6 | Thrift Box Subscription | `32128603b42b47119c691185ece51839` |
| 7 | Tailor Marketplace | `dc144506f8d94b508515aecd3e84d827` |
| 8 | User Dashboard | `0d9af7837e964975bf69586b7f65bf1b` |
| 9 | Style Quiz | `592ac04020d4456a9a30ef920d2c7ece` |
| 10 | Product Details (Nike AF1) | `f9cf1156f6e8493087a032470e68e574` |
| 11 | AI Stylist Chat | `603732394aee4241bdd91efc6d397c8b` |
| 12 | Virtual Try-On | `5a9601d67e4b40ae8f5d705c76bb6195` |

### Screens Still Needed
- [ ] Tailor Profile (detailed individual tailor view)
- [ ] Mobile versions of all screens
- [ ] Onboarding / Welcome flow
- [ ] Settings / Profile Edit page
- [ ] Order Tracking page

---

## Development Principles (The Ralph Loop)
- **Plan**: Break tasks into small GSD phases
- **Build**: Implement using the defined pro-tech stack
- **Test**: Continuous verification
- **Improve**: Automate UI refinement with Stitch

## Next Steps
1. Review all 12 screens in Stitch (login at stitch.withgoogle.com)
2. Iterate/refine any screens that need polish
3. Initialize Next.js 15 project and start implementing the Landing Page
4. Set up Vercel deployment pipeline
