// file: src/app/api/sell/photo/primary/route.ts
import {NextResponse} from 'next/server';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {prisma} from '@/lib/db';

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  const {photoId} = await req.json();

  const photo = await prisma.photo.findFirst({
    where: {id: photoId, listing: {seller: {email: session.user.email}}},
    select: {id: true, listingId: true},
  });
  if (!photo) return NextResponse.json({error: 'Not found'}, {status: 404});

  // Unset others, set this one
  await prisma.photo.updateMany({where: {listingId: photo.listingId}, data: {isPrimary: false}});
  await prisma.photo.update({where: {id: photo.id}, data: {isPrimary: true}});

  return NextResponse.json({ok: true});
}
