-- CreateTable
CREATE TABLE "S3Grants" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "team_id" TEXT NOT NULL,

    CONSTRAINT "S3Grants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "S3Grants_key_key" ON "S3Grants"("key");

-- CreateIndex
CREATE UNIQUE INDEX "S3Grants_key_team_id_key" ON "S3Grants"("key", "team_id");

-- AddForeignKey
ALTER TABLE "S3Grants" ADD CONSTRAINT "S3Grants_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
