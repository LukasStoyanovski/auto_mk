// file: scripts/seed-user.ts
import { PrismaClient } from "@prisma/client";

const prisma: PrismaClient = new PrismaClient();

async function main() {
  // Admin settings (singleton)
  await prisma.adminSettings.upsert({
    where: { id: 1 },
    update: { eurMkdRate: '61.5000' },
    create: {
      id: 1,
      eurMkdRate: '61.5000',
      maxPrivateActiveListings: 5,
      moderationRequired: true
    }
  });

  const tags: Array<[string, string]> = [
    ['ac','Air Conditioning'],
    ['heated-seats','Heated Seats'],
    ['panorama-roof','Panorama Roof'],
    ['acc','Adaptive Cruise Control'],
    ['360-camera','360 Camera'],
    ['carplay','Apple CarPlay'],
    ['android-auto','Android Auto'],
    ['ahk','Tow Hitch (AHK)'],
    ['led','LED Headlights'],
    ['keyless','Keyless Entry'],
    ['parking-sensors','Parking Sensors'],
    ['park-assist','Park Assist'],
    ['lane-assist','Lane Assist'],
    ['blind-spot','Blind Spot Monitor'],
    ['nav','Navigation'],
    ['leather','Leather Seats'],
    ['memory-seats','Memory Seats'],
    ['sport-suspension','Sport Suspension'],
    ['alloy-wheels','Alloy Wheels'],
    ['winter-tyres','Winter Tyres']
  ];

  for (const [slug, name] of tags) {
    await prisma.featureTag.upsert({
      where: { slug },
      update: { name },
      create: { slug, name }
    });
  }

  console.log("✅ Seeded AdminSettings + FeatureTags");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
