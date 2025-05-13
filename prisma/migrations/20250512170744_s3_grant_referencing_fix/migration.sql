/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `S3Grants` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "S3Grants" DROP CONSTRAINT "S3Grants_team_id_fkey";

-- DropIndex
DROP INDEX "S3Grants_key_key";

-- AlterTable
ALTER TABLE "S3Grants" ALTER COLUMN "url" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "S3Grants_url_key" ON "S3Grants"("url");

-- AddForeignKey
ALTER TABLE "S3Grants" ADD CONSTRAINT "S3Grants_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("uniqueId") ON DELETE CASCADE ON UPDATE CASCADE;
