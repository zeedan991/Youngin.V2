import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  try {
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      throw new Error("No API key");
    }
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=16&orientation=squarish`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
          "Accept-Version": "v1",
        },
      },
    );

    if (!res.ok) {
      throw new Error(`Unsplash API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.warn("Unsplash error, using fallback images:", error?.message);

    // Fallback array so the aesthetic studio always works
    const defaultMockPics = [
      {
        id: "1",
        alt_description: "Cyberpunk graphic",
        urls: {
          raw: "",
          full: "",
          regular:
            "https://images.unsplash.com/photo-1605806616238-76906af427a1?w=600",
          thumb:
            "https://images.unsplash.com/photo-1605806616238-76906af427a1?w=200",
        },
      },
      {
        id: "2",
        alt_description: "Graffiti tag",
        urls: {
          raw: "",
          full: "",
          regular:
            "https://images.unsplash.com/photo-1549490349-f0a905a3036a?w=600",
          thumb:
            "https://images.unsplash.com/photo-1549490349-f0a905a3036a?w=200",
        },
      },
      {
        id: "3",
        alt_description: "Skulls design",
        urls: {
          raw: "",
          full: "",
          regular:
            "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=600",
          thumb:
            "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=200",
        },
      },
      {
        id: "4",
        alt_description: "Neon vaporwave",
        urls: {
          raw: "",
          full: "",
          regular:
            "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600",
          thumb:
            "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=200",
        },
      },
      {
        id: "5",
        alt_description: "Abstract camo",
        urls: {
          raw: "",
          full: "",
          regular:
            "https://images.unsplash.com/photo-1616492229823-d9d10787a64c?w=600",
          thumb:
            "https://images.unsplash.com/photo-1616492229823-d9d10787a64c?w=200",
        },
      },
      {
        id: "6",
        alt_description: "Vintage illustration",
        urls: {
          raw: "",
          full: "",
          regular:
            "https://images.unsplash.com/photo-1614030424754-24d0e656c07a?w=600",
          thumb:
            "https://images.unsplash.com/photo-1614030424754-24d0e656c07a?w=200",
        },
      },
    ];
    return NextResponse.json({ results: defaultMockPics });
  }
}
