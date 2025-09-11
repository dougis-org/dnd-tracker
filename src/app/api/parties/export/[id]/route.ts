import { NextRequest, NextResponse } from 'next/server';
import {
  handleApiError,
  findPartyWithAccess,
  setupPartyRoute,
  sanitizeExportData,
  generateExportFilename,
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

    // Create sanitized export data using utility function
    const exportData = sanitizeExportData(party!, setup.userId!);
    
    // Remove undefined fields for cleaner export
    const cleanExportData = JSON.parse(JSON.stringify(exportData));

    // Generate filename using utility function
    const filename = generateExportFilename(party!.name);

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