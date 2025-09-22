// file: src/app/api/sell/photos/route.ts
import {NextResponse} from 'next/server';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {prisma} from '@/lib/db';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  const {searchParams} = new URL(req.url);
  const listingId = searchParams.get('listingId') || '';
  if (!listingId) return NextResponse.json({error: 'listingId required'}, {status: 400});

  const listing = await prisma.listing.findFirst({
    where: {id: listingId, seller: {email: session.user.email}},
    select: {id: true},
  });
  if (!listing) return NextResponse.json({error: 'Not found'}, {status: 404});

  const photos = await prisma.photo.findMany({
    where: {listingId},
    orderBy: [{isPrimary: 'desc'}, {sortOrder: 'asc'}],
    select: {id: true, url: true, key: true, isPrimary: true},
  });

  return NextResponse.json({photos});
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  const {searchParams} = new URL(req.url);
  const id = searchParams.get('id') || '';
  if (!id) return NextResponse.json({error: 'id required'}, {status: 400});

  const photo = await prisma.photo.findFirst({
    where: {id, listing: {seller: {email: session.user.email}}},
    select: {id: true, key: true, listingId: true, isPrimary: true},
  });
  if (!photo) return NextResponse.json({error: 'Not found'}, {status: 404});

  await prisma.photo.delete({where: {id}});

  // if primary deleted -> set first remaining as primary
  const remaining = await prisma.photo.findFirst({
    where: {listingId: photo.listingId},
    orderBy: {sortOrder: 'asc'},
    select: {id: true},
  });
  if (photo.isPrimary && remaining) {
    await prisma.photo.update({where: {id: remaining.id}, data: {isPrimary: true}});
  }

  return NextResponse.json({ok: true});
}
