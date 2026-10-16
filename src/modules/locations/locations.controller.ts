import { NextRequest, NextResponse } from "next/server";
import { locationsService } from "./locations.service";
import { handleApiError } from "@/shared/errors";

export class LocationsController {
  async getGates(_req: NextRequest) {
    try {
      const gates = await locationsService.getAllGates();
      return NextResponse.json({ success: true, data: gates });
    } catch (err) {
      return handleApiError(err);
    }
  }

  async getZones(_req: NextRequest) {
    try {
      const zones = await locationsService.getAllZones();
      return NextResponse.json({ success: true, data: zones });
    } catch (err) {
      return handleApiError(err);
    }
  }
}

export const locationsController = new LocationsController();
