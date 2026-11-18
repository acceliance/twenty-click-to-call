import { defineApplicationRole, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import {
  APP_DISPLAY_NAME,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Twenty 2.59 answers 403 on create without the update right, so both are granted (never delete)
const CREATE_AND_UPDATE = {
  canReadAllRecords: true,
  canCreateAllRecords: true,
  canUpdateAllRecords: true,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
};

// Reads the contact; creates the call task and its link to the contact. Nothing is deleted.
// Every call also stays within the clicking user's own role.
export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: `${APP_DISPLAY_NAME} default function role`,
  description: `${APP_DISPLAY_NAME} default function role`,
  recordsPermissions: {
    canReadAllRecords: true,
    canCreateAllRecords: false,
    canUpdateAllRecords: false,
    canSoftDeleteAllRecords: false,
    canDestroyAllRecords: false,
    objects: [
      {
        objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.task.universalIdentifier,
        ...CREATE_AND_UPDATE,
      },
      {
        objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.taskTarget.universalIdentifier,
        ...CREATE_AND_UPDATE,
      },
    ],
  },
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
});
