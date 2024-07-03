-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "merchantDescription" TEXT,
ALTER COLUMN "merchantId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Transaction_merchantDescription_idx" ON "Transaction"("merchantDescription");
