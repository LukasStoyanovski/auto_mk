-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'DEALER', 'USER');

-- CreateEnum
CREATE TYPE "public"."ListingStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'REJECTED', 'SOLD', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ServiceHistory" AS ENUM ('NONE', 'PARTIAL', 'FULL');

-- CreateEnum
CREATE TYPE "public"."VehicleCategory" AS ENUM ('CAR', 'MOTORCYCLE', 'VAN', 'TRUCK', 'BUS', 'AGRI', 'CONSTRUCTION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."FuelType" AS ENUM ('PETROL', 'DIESEL', 'HYBRID', 'PHEV', 'EV', 'LPG', 'CNG');

-- CreateEnum
CREATE TYPE "public"."Transmission" AS ENUM ('MANUAL', 'AUTO');

-- CreateEnum
CREATE TYPE "public"."Drivetrain" AS ENUM ('FWD', 'RWD', 'AWD', 'FOURX4');

-- CreateEnum
CREATE TYPE "public"."EuroStandard" AS ENUM ('E3', 'E4', 'E5', 'E6', 'E6d', 'NA');

-- CreateEnum
CREATE TYPE "public"."VehicleCondition" AS ENUM ('NEW', 'USED', 'DAMAGED');

-- CreateEnum
CREATE TYPE "public"."ReportReason" AS ENUM ('SPAM', 'SCAM', 'INAPPROPRIATE', 'DUPLICATE');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'USER',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."Dealership" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "city" TEXT,
    "municipality" TEXT,
    "address" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dealership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Vehicle" (
    "id" TEXT NOT NULL,
    "category" "public"."VehicleCategory" NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "trim" TEXT,
    "generation" TEXT,
    "year" INTEGER NOT NULL,
    "bodyType" TEXT,
    "doors" INTEGER,
    "seats" INTEGER,
    "mileageKm" INTEGER NOT NULL,
    "fuel" "public"."FuelType" NOT NULL,
    "transmission" "public"."Transmission" NOT NULL,
    "drivetrain" "public"."Drivetrain",
    "engineDisplacementCc" INTEGER,
    "powerKw" INTEGER,
    "torqueNm" INTEGER,
    "color" TEXT,
    "interiorColor" TEXT,
    "euroStandard" "public"."EuroStandard" NOT NULL,
    "co2Gkm" INTEGER,
    "owners" INTEGER,
    "condition" "public"."VehicleCondition" NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Listing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "public"."ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "sellerId" TEXT NOT NULL,
    "dealershipId" TEXT,
    "vehicleId" TEXT NOT NULL,
    "priceMkd" INTEGER NOT NULL,
    "priceEur" INTEGER NOT NULL,
    "priceIsNet" BOOLEAN NOT NULL DEFAULT false,
    "vatReclaimable" BOOLEAN NOT NULL DEFAULT false,
    "negotiable" BOOLEAN NOT NULL DEFAULT true,
    "city" TEXT NOT NULL,
    "municipality" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "showExactLocation" BOOLEAN NOT NULL DEFAULT false,
    "accidentFree" BOOLEAN NOT NULL DEFAULT true,
    "serviceHistory" "public"."ServiceHistory" NOT NULL DEFAULT 'NONE',
    "warrantyMonths" INTEGER,
    "firstRegistration" TIMESTAMP(3),
    "registrationValidUntil" TIMESTAMP(3),
    "vin" TEXT,
    "plateNumber" TEXT,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "favoritesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Photo" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeatureTag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "FeatureTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ListingFeature" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "featureTagId" TEXT NOT NULL,

    CONSTRAINT "ListingFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Lead" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Report" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "reason" "public"."ReportReason" NOT NULL,
    "details" TEXT,
    "reporterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "eurMkdRate" DECIMAL(10,4) NOT NULL,
    "maxPrivateActiveListings" INTEGER NOT NULL DEFAULT 5,
    "moderationRequired" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AdminSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dealership_slug_key" ON "public"."Dealership"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Dealership_ownerId_key" ON "public"."Dealership"("ownerId");

-- CreateIndex
CREATE INDEX "Vehicle_make_idx" ON "public"."Vehicle"("make");

-- CreateIndex
CREATE INDEX "Vehicle_model_idx" ON "public"."Vehicle"("model");

-- CreateIndex
CREATE INDEX "Vehicle_year_idx" ON "public"."Vehicle"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_vehicleId_key" ON "public"."Listing"("vehicleId");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "public"."Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_city_idx" ON "public"."Listing"("city");

-- CreateIndex
CREATE INDEX "Listing_priceMkd_idx" ON "public"."Listing"("priceMkd");

-- CreateIndex
CREATE INDEX "Listing_priceEur_idx" ON "public"."Listing"("priceEur");

-- CreateIndex
CREATE INDEX "Listing_createdAt_idx" ON "public"."Listing"("createdAt");

-- CreateIndex
CREATE INDEX "Photo_listingId_idx" ON "public"."Photo"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureTag_slug_key" ON "public"."FeatureTag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureTag_name_key" ON "public"."FeatureTag"("name");

-- CreateIndex
CREATE INDEX "ListingFeature_featureTagId_idx" ON "public"."ListingFeature"("featureTagId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingFeature_listingId_featureTagId_key" ON "public"."ListingFeature"("listingId", "featureTagId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_listingId_key" ON "public"."Favorite"("userId", "listingId");

-- CreateIndex
CREATE INDEX "Lead_listingId_idx" ON "public"."Lead"("listingId");

-- CreateIndex
CREATE INDEX "Report_reason_idx" ON "public"."Report"("reason");

-- CreateIndex
CREATE INDEX "Report_listingId_idx" ON "public"."Report"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSettings_id_key" ON "public"."AdminSettings"("id");

-- AddForeignKey
ALTER TABLE "public"."Dealership" ADD CONSTRAINT "Dealership_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Listing" ADD CONSTRAINT "Listing_dealershipId_fkey" FOREIGN KEY ("dealershipId") REFERENCES "public"."Dealership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Listing" ADD CONSTRAINT "Listing_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Photo" ADD CONSTRAINT "Photo_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ListingFeature" ADD CONSTRAINT "ListingFeature_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ListingFeature" ADD CONSTRAINT "ListingFeature_featureTagId_fkey" FOREIGN KEY ("featureTagId") REFERENCES "public"."FeatureTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lead" ADD CONSTRAINT "Lead_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lead" ADD CONSTRAINT "Lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
