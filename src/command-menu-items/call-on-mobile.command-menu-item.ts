import {
  CommandMenuItemAvailabilityType,
  defineCommandMenuItem,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  CALL_ON_MOBILE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  CALL_ON_MOBILE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Pinned button on People (record page, side panel, single selection in the list)
export default defineCommandMenuItem({
  universalIdentifier: CALL_ON_MOBILE_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  label: 'Call on mobile',
  shortLabel: 'Call',
  isPinned: true,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  availabilityObjectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  frontComponentUniversalIdentifier: CALL_ON_MOBILE_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
});
