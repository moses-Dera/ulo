import { NextRequest } from "next/server";
import { searchController } from "@/modules/search";
import "@/modules/bootstrap";

export async function GET(req: NextRequest) {
  return searchController.search(req);
}
