import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const { imageData, caption, style, context } = await request.json();

    if (!imageData) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("gemini-captionator");
    const imagesCollection = db.collection("images");

    const newImage = {
      imageData,
      caption: caption || null,
      style: style || "default",
      context: context || null,
      createdAt: new Date(),
    };

    const result = await imagesCollection.insertOne(newImage);

    return NextResponse.json({ message: "Image saved", id: result.insertedId });
  } catch (error) {
    console.error("Error saving image:", error);
    return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("gemini-captionator");
    const imagesCollection = db.collection("images");

    const images = await imagesCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}
