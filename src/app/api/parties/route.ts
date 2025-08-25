
import { auth } from "@clerk/nextjs/server";
import { Party } from "../../../models/Party";
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const parties = await Party.find({
    $or: [{ userId }, { "sharedWith.userId": userId }],
  }).populate("characters.characterId");
  return NextResponse.json(parties);
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, campaignName, maxSize } = body;

    const newParty = new Party({
      userId,
      name,
      description,
      campaignName,
      maxSize,
    });

    const savedParty = await newParty.save();
    return NextResponse.json(savedParty, { status: 201 });
  } catch (error) {
    console.error("Error creating party:", error);
    return new NextResponse("Error creating party", { status: 500 });
  }
}
