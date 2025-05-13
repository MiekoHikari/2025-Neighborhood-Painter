-- DropForeignKey
ALTER TABLE "UserTeam" DROP CONSTRAINT "UserTeam_team_id_fkey";

-- AddForeignKey
ALTER TABLE "UserTeam" ADD CONSTRAINT "UserTeam_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("uniqueId") ON DELETE CASCADE ON UPDATE CASCADE;
