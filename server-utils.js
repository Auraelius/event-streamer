// these routines implement the message protocol for our server-sent events

import { faker } from '@faker-js/faker';

/**
 * @returns {string} fake sentence(s) under 80 chars
 */
export function makeConsoleMessage() {
  let line = '';
  while (line.length < 80) {
    const randomSentence = faker.lorem.sentence();
    if (line.length + randomSentence.length > 80) break;
    line += (line.length > 0 ? ' ' : '') + randomSentence;
  }
  return `event:console\ndata: ${line}\n\n`;
}

/**
 *
 * @returns {string} one of three sample templates
 * formatted as a SSE 'template' event with message data field
 * chosen at random from three options. all have the same variables
 */
export function makeTemplateMessage() {
  const templateID = Math.floor(Math.random() * 3) + 1;
  let lines = ``;
  switch (templateID) {
    case 3:
      lines = `data:<i>Function Name Placeholder</i>
data:<h1>Please wait  ...</h1>
data:<p>The tables <i>really</i> are being rebuilt. Trust us.</p>
data:<p>Generating function: <b><span id="func-name">First Function Value</span></b></p>
data:<p>Depending on the options you have chosen, this process may take some time.</p>
data:<p>Currently processing member: <b><span id="member-name">First Member Value</span></b></p>
`; // newline terminated
      break;
    case 2:
      lines = `data:<i>Function Name Placeholder</i>
data:<h1>Please wait ...</h1>
data:<p>The tables really <i>are</i> being rebuilt. Do not navigate away from this page.</p>
data:<p>Generating function: <b><span id="func-name">First Function Value</span></b></p>
data:<p>Depending on the options you have chosen, this process may take some time.</p>
data:<p>Currently processing member: <b><span id="member-name">First Member Value</span></b></p>
`; // newline terminated
      break;
    case 1:
    default:
      lines = `data:<i>Function Name Placeholder</i>
data:<h1>Please wait...</h1>
data:<p>The tables are being rebuilt.</p>
data:<p>Generating function: <b><span id="func-name">First Function Value</span></b></p>
data:<p>Depending on the options you have chosen, this process may take some time.</p>
data:<p>Currently processing member: <b><span id="member-name">First Member Value</span></b></p>
`; // newline terminated
      break;
  }

  return `event:template\n${lines}\n\n`;
}

/**
 * @returns a multiline string coded for an 'update' SSE message
 *
 * @export
 * @param {string} id the html id of the element to be updated
 * @param {string} value to be sanitized and injected

 */
export function makeUpdateMessage(id, value) {
  const msg = `event: update
data: {
data:   "id" : "${id}",
data:   "value" : "${value}"
data: }
\n`; // message terminator

  return msg;
}
