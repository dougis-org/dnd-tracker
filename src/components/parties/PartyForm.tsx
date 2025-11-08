/* eslint-disable no-undef */
import React, { useState } from 'react';
import { Party, PartyMember } from '@/types/party';
import { MemberForm } from './MemberForm';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  updateOrAddMember,
  removeMember,
  findMemberById,
} from '@/lib/utils/partyMemberHelpers';

export interface PartyFormProps {
  party?: Party;
  onSubmit: (party: Party) => void;
  onCancel: () => void;
}

export function PartyForm({
  party,
  onSubmit,
  onCancel,
}: PartyFormProps) {
  const [formData, setFormData] = useState({
    name: party?.name || '',
    description: party?.description || '',
    campaignSetting: party?.campaignSetting || '',
  });

  const [members, setMembers] = useState<PartyMember[]>(
    party?.members || []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [showMemberForm, setShowMemberForm] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Party name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
    if (errors.name) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.name;
        return newErrors;
      });
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
  };

  const handleCampaignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, campaignSetting: e.target.value }));
  };

  const handleMemberSubmit = (memberData: Partial<PartyMember>) => {
    setMembers(updateOrAddMember(members, memberData, editingMemberId));
    setEditingMemberId(null);
    setShowMemberForm(false);
  };

  const handleEditMember = (memberId: string) => {
    setEditingMemberId(memberId);
    setShowMemberForm(true);
  };

  const handleDeleteMember = (memberId: string) => {
    setMembers(removeMember(members, memberId));
    setDeletingMemberId(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData: Party = {
      id: party?.id || `party-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      campaignSetting: formData.campaignSetting,
      members,
      created_at: party?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSubmit(submitData);
  };

  const editingMember = findMemberById(members, editingMemberId);
  const memberToDelete = findMemberById(members, deletingMemberId);

  return (
    <form
      onSubmit={handleFormSubmit}
      className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8"
    >
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {party ? 'Edit Party' : 'Create Party'}
      </h1>

      {/* Party Name */}
      <div className="mb-6">
        <label htmlFor="party-name" className="block text-sm font-medium text-gray-700 mb-2">
          Party Name *
        </label>
        <input
          id="party-name"
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter party name"
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={handleDescriptionChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter party description"
        />
      </div>

      {/* Campaign Setting */}
      <div className="mb-6">
        <label htmlFor="campaign" className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Setting
        </label>
        <input
          id="campaign"
          type="text"
          value={formData.campaignSetting}
          onChange={handleCampaignChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter campaign setting"
        />
      </div>

      {/* Members Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Members</h2>
          <button
            type="button"
            onClick={() => setShowMemberForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Member
          </button>
        </div>

        {showMemberForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <MemberForm
              member={editingMember}
              onSubmit={handleMemberSubmit}
              onCancel={() => {
                setShowMemberForm(false);
                setEditingMemberId(null);
              }}
            />
          </div>
        )}

        {members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {member.characterName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Level {member.level} {member.class} {member.race}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEditMember(member.id)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingMemberId(member.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No members added yet.</p>
        )}
      </div>

      {/* Form Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          {party ? 'Update Party' : 'Create Party'}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deletingMemberId !== null}
        onClose={() => setDeletingMemberId(null)}
        onConfirm={() => {
          if (deletingMemberId) {
            handleDeleteMember(deletingMemberId);
          }
        }}
        itemName={memberToDelete?.characterName || 'Member'}
        itemType="member"
      />
    </form>
  );
}
