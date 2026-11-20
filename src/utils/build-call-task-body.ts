// Task body (RICH_TEXT_V2) prefilled with the dialed number, ready for call notes: "+33612345678 : "
// Both formats are sent: blocknote keeps the trailing space, markdown feeds search and exports.
export const buildCallTaskBody = (number: string, blockId: string) => {
  const text = `${number} : `;

  return {
    blocknote: JSON.stringify([
      {
        id: blockId,
        type: 'paragraph',
        props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
        content: [{ type: 'text', text, styles: {} }],
        children: [],
      },
    ]),
    markdown: text,
  };
};
