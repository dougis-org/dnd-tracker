import { Party, IParty } from '@/models/Party';
import { UpdateQuery } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import {
  handlePostWithJsonBody,
  findPartyWithEditAccess,
} from '@/app/api/parties/_utils/party-api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface TemplateRequestBody {
  isTemplate: boolean;
  templateCategory?: string;
}

async function handleTemplateBody(body: TemplateRequestBody, party: IParty): Promise<NextResponse> {
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
    party._id,
    updateData,
    { new: true, runValidators: true }
  );

  return NextResponse.json(updatedParty);
}

// POST /api/parties/[id]/template - Convert party to/from template
export async function POST(req: NextRequest, { params }: RouteParams) {
  return handlePostWithJsonBody(req, params, findPartyWithEditAccess, handleTemplateBody);
}