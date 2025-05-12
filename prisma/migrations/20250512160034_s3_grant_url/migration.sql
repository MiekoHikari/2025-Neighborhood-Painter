/*
  Warnings:

  - Added the required column `url` to the `S3Grants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "S3Grants" ADD COLUMN     "url" VARCHAR(255) NOT NULL;
