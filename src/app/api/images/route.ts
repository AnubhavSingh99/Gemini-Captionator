import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";

export async function POST(request: NextRequest) {
  try {
    const { imageData, caption, style, context } = await request.json();

    if (!imageData) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    const imagesCollection = collection(db, "images");

    const newImage = {
      imageData,
      caption: caption || null,
      style: style || "default",
      context: context || null,
      createdAt: new Date(),
    };

    const docRef = await addDoc(imagesCollection, newImage);

    return NextResponse.json({ message: "Image saved", id: docRef.id });
  } catch (error) {
    console.error("Error saving image:", error);
    return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const imagesCollection = collection(db, "images");
    const q = query(imagesCollection, orderBy("createdAt", "desc"), limit(20));
    const querySnapshot = await getDocs(q);

    const images = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}
