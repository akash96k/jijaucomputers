import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  const uploadFilesCount = fs.existsSync(uploadDir) ? fs.readdirSync(uploadDir).length : 0;
  
  let productsInDb = 0;
  try {
    productsInDb = await prisma.product.count();
  } catch {}

  return NextResponse.json({
    status: "ok",
    app: "Jijau Computers",
    version: "v2.5.0-optimized",
    deployedCommit: "fd2550a",
    buildTimestamp: new Date().toISOString(),
    staticUploadedImagesCount: uploadFilesCount,
    totalProductsInDatabase: productsInDb,
    optimizationsEnabled: {
      isrCaching: true,
      staticImagesExtracted: uploadFilesCount > 0,
    },
  });
}
