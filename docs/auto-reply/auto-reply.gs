/**
 * AD Photography: automatic "we got your inquiry" reply.
 *
 * Runs inside the adphotograph26 Gmail account (script.google.com), free.
 * Every 5 minutes it looks for new booking inquiries that Web3Forms sent from
 * the website's Contact page, and replies once to the client's own address
 * (Web3Forms puts the client's email in Reply-To). The reply goes out from the
 * business Gmail, so when the client answers it lands in the same inbox.
 *
 * Setup: paste this file into a new Apps Script project, save, choose
 * "setup" in the function menu and press Run, then approve Google's prompt.
 * Only inquiries that arrive after setup get a reply. To stop it, run "stop".
 */

var INQUIRY_SUBJECT = 'New booking inquiry from AD Photography website';
var DONE_LABEL = 'Auto-replied';
var REPLY_SUBJECT = 'We received your inquiry | AD Photography';
var SENDER_NAME = 'AD Photography';

function replyBody(firstName) {
  var greeting = firstName ? 'Hi ' + firstName + ',' : 'Hi there,';
  return [
    greeting,
    '',
    'Thank you for reaching out to AD Photography. I received your inquiry and will reply personally within 24 hours with availability and next steps.',
    '',
    'If your date is coming up soon, you can also call or text me at 224-229-2201.',
    '',
    'Talk soon,',
    'Ashim',
    'AD Photography',
    'https://adlightstudio.com'
  ].join('\n');
}

function setup() {
  stop();
  PropertiesService.getScriptProperties().setProperty('startedAt', String(Date.now()));
  getDoneLabel();
  ScriptApp.newTrigger('replyToNewInquiries').timeBased().everyMinutes(5).create();
}

function stop() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'replyToNewInquiries') ScriptApp.deleteTrigger(trigger);
  });
}

// Gmail groups inquiries with the same subject into one conversation, so each
// message is tracked by its own id (not by the conversation's label).
function replyToNewInquiries() {
  var props = PropertiesService.getScriptProperties();
  var startedAt = Number(props.getProperty('startedAt') || 0);
  var done = JSON.parse(props.getProperty('repliedIds') || '[]');
  var label = getDoneLabel();
  var me = Session.getEffectiveUser().getEmail().toLowerCase();
  var query = 'subject:"' + INQUIRY_SUBJECT + '" newer_than:2d';

  GmailApp.search(query, 0, 20).forEach(function (thread) {
    thread.getMessages().forEach(function (message) {
      var id = message.getId();
      if (done.indexOf(id) !== -1 || message.getDate().getTime() < startedAt) return;
      if (message.getSubject().indexOf(INQUIRY_SUBJECT) === -1) return; // your own reply in the thread
      var to = extractEmail(message.getReplyTo());
      if (to && to !== me && to.indexOf('web3forms') === -1) {
        GmailApp.sendEmail(to, REPLY_SUBJECT, replyBody(extractFirstName(message.getPlainBody())), {
          name: SENDER_NAME
        });
        thread.addLabel(label);
      }
      done.push(id);
    });
  });
  props.setProperty('repliedIds', JSON.stringify(done.slice(-300)));
}

function getDoneLabel() {
  return GmailApp.getUserLabelByName(DONE_LABEL) || GmailApp.createLabel(DONE_LABEL);
}

function extractEmail(value) {
  var match = String(value || '').match(/[^\s<>"',;]+@[^\s<>"',;]+\.[^\s<>"',;]+/);
  return match ? match[0].toLowerCase() : '';
}

// Web3Forms lists each form field by name. Find the "name" field, whether it
// reads "Name: Priya Shah" or "Name" with the value on the next line.
function extractFirstName(body) {
  var lines = String(body || '').split(/\r?\n/).map(function (line) { return line.trim(); });
  for (var i = 0; i < lines.length; i++) {
    var sameLine = lines[i].match(/^name\s*:\s*(.+)$/i);
    var value = sameLine ? sameLine[1] : (/^name\s*:?$/i.test(lines[i]) ? nextNonEmpty(lines, i) : '');
    var first = String(value || '').split(/\s+/)[0];
    if (first && /^[\p{L}][\p{L}'’.-]{0,30}$/u.test(first)) return first;
  }
  return '';
}

function nextNonEmpty(lines, index) {
  for (var j = index + 1; j < lines.length; j++) if (lines[j]) return lines[j];
  return '';
}
