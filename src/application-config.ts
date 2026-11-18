import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  CALL_TASK_TITLE_VARIABLE_UNIVERSAL_IDENTIFIER,
  NTFY_TOKEN_VARIABLE_UNIVERSAL_IDENTIFIER,
  NTFY_TOPIC_PREFIX_VARIABLE_UNIVERSAL_IDENTIFIER,
  NTFY_URL_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const REPOSITORY_URL = 'https://github.com/acceliance/twenty-click-to-call';

// The marketplace "About" tab shows README.md (markdown only: no HTML, images are not rendered)
export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  author: 'Acceliance',
  emailSupport: 'contact@acceliance.fr',
  logo: 'public/logo.svg',
  websiteUrl: REPOSITORY_URL,
  issueReportUrl: `${REPOSITORY_URL}/issues`,
  applicationVariables: {
    NTFY_URL: {
      universalIdentifier: NTFY_URL_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'ntfy server URL',
      description:
        'Base URL of your ntfy server, without trailing slash (e.g. https://ntfy.example.com). Self-hosting is recommended: notifications contain contact names and phone numbers.',
      isSecret: false,
      isRequired: true,
    },
    NTFY_TOKEN: {
      universalIdentifier: NTFY_TOKEN_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'ntfy access token',
      description: 'Access token (tk_…) of an ntfy account allowed to publish to <topic prefix>*.',
      isSecret: true,
      isRequired: true,
    },
    NTFY_TOPIC_PREFIX: {
      universalIdentifier: NTFY_TOPIC_PREFIX_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'ntfy topic prefix',
      description:
        "Each user's notifications go to <prefix><email local part>, e.g. jane.doe@example.com -> call-jane-doe. The phone subscribes to that topic.",
      value: 'call-',
      isSecret: false,
    },
    CALL_TASK_TITLE: {
      universalIdentifier: CALL_TASK_TITLE_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Call task title',
      description:
        'Title of the done task logged on the contact for each call (e.g. "Appel" in French). Leave empty to log no task.',
      value: 'Call',
      isSecret: false,
    },
  },
});
