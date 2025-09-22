// file: src/app/api/upload/image/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { s3, ensureBucketPublic, s3PublicUrl } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import crypto from "crypto";

const BUCKET = process.env.S3_BUCKET;
if (!BUCKET) {
  throw new Error("S3_BUCKET environment variable is required");
}

function makeKey(listingId: string) {
  const id = crypto.randomBytes(8).toString("hex");
  return `listings/${listingId}/${id}.jpg`;
}

function watermarkSvg(text = "Auto.mk") {
  // simple bottom-right watermark
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="200">
      <rect x="0" y="0" width="1200" height="200" fill="none"/>
      <text x="1180" y="150" text-anchor="end" font-family="Arial, Helvetica, sans-serif"
        font-size="120" fill="rgba(255,255,255,0.65)" stroke="rgba(0,0,0,0.35)" stroke-width="3">
        ${text}
      </text>
    </svg>`
  );
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const listingId = (form.get("listingId") as string) || "";

  if (!file || !listingId) {
    return NextResponse.json({ error: "Missing file or listingId" }, { status: 400 });
  }

  // Verify listing ownership & draft
  // @ts-ignore - Prisma client types not updated in linter
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, status: "DRAFT", seller: { email: session.user.email! } },
    select: { id: true }
  });
  if (!listing) {
    return NextResponse.json({ error: "Draft not found" }, { status: 404 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  // Process with sharp: resize (max 2000px), JPEG, watermark
  const base = await sharp(bytes).rotate().resize(2000, 2000, { fit: "inside" }).jpeg({ quality: 82 }).toBuffer();

  const composite = await sharp(base)
    .composite([{ input: watermarkSvg(), gravity: "southeast" }])
    .jpeg({ quality: 82 })
    .toBuffer();

  const key = makeKey(listingId);

  await ensureBucketPublic(BUCKET!);

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET!,
      Key: key,
      Body: composite,
      ContentType: "image/jpeg"
    })
  );

  // Save Photo row
  // @ts-ignore - Prisma client types not updated in linter
  const photo = await prisma.photo.create({
    data: {
      listingId,
      key,
      url: s3PublicUrl(key),
      isPrimary: false
    },
    select: { id: true, url: true, key: true }
  });

  return NextResponse.json({ ok: true, photo });
}
