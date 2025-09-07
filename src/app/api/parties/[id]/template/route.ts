import { Party, IParty } from '@/models/Party';
import { UpdateQuery } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import {
  handleApiError,
  findPartyWithEditAccess,
  setupPartyRoute,
} from '@/app/api/parties/_utils/party-api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/parties/[id]/template - Convert party to/from template
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const setup = await setupPartyRoute(params);
    if (setup.authError) return setup.authError;
    if (setup.validationError) return setup.validationError;

    const { party, error } = await findPartyWithEditAccess(setup.id!, setup.userId!);
    if (error) return error;

    const body = await req.json();
    const { isTemplate, templateCategory } = body;

    // Validate required fields
    if (typeof isTemplate !== 'boolean') {
      return new NextResponse('isTemplate must be a boolean', { status: 400 });
    }

    // Update template status
    const updateData: UpdateQuery<IParty> = { isTemplate };
    
    if (isTemplate) {
      // Converting to template - set category if provided
      if (templateCategory !== undefined) {
        updateData.templateCategory = templateCategory;
      }
    } else {
      // Converting from template - clear category
      updateData.$unset = { templateCategory: 1 };
    }

    const updatedParty = await Party.findByIdAndUpdate(
      setup.id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedParty);

  } catch (error: any) {
    // Handle JSON parsing errors from req.json()
    if (error.name === 'SyntaxError' || error.message?.includes('JSON')) {
      return new NextResponse('Invalid JSON in request body', { status: 400 });
    }
    return handleApiError(error, 'updating template status');
  }
}