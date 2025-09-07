import { NextRequest, NextResponse } from 'next/server';
import {
  handleApiError,
  findPartyWithAccess,
  setupPartyRoute,
} from '@/app/api/parties/_utils/party-api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/parties/export/[id] - Export party to JSON
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const setup = await setupPartyRoute(params);
    if (setup.authError) return setup.authError;
    if (setup.validationError) return setup.validationError;

    const { party, error } = await findPartyWithAccess(setup.id!, setup.userId!);
    if (error) return error;

    // Create sanitized export data (remove sensitive/internal fields)
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: setup.userId,
        version: '1.0'
      },
      party: {
        name: party!.name,
        description: party!.description,
        campaignName: party!.campaignName,
        maxSize: party!.maxSize,
        isTemplate: party!.isTemplate,
        templateCategory: party!.templateCategory,
        characters: party!.characters.map((char: { playerName?: string; playerEmail?: string; isActive?: boolean }) => ({
          playerName: char.playerName,
          playerEmail: char.playerEmail,
          isActive: char.isActive,
          // Note: characterId and joinedAt are not exported for security
        }))
      }
    };

    // Remove undefined fields for cleaner export
    const cleanExportData = JSON.parse(JSON.stringify(exportData));

    // Generate filename from party name (sanitized)
    const filename = party!.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      || 'party-export';

    return new NextResponse(JSON.stringify(cleanExportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}.json"`,
      },
    });

  } catch (error) {
    return handleApiError(error, 'exporting party');
  }
}