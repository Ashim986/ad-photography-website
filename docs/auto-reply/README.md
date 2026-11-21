# Automatic reply to website inquiries

The Contact page form sends each inquiry through Web3Forms (free plan, 250 a month) to the business Gmail. Web3Forms' own autoresponder is a paid Pro feature, so the automatic "we got your request" email is sent by a small free Google Apps Script that runs inside the business Gmail account instead.

How it works: every 5 minutes the script looks for new emails with the subject "New booking inquiry from AD Photography website", sends one reply to the client's address (Web3Forms puts it in Reply-To), and labels the conversation "Auto-replied". The reply comes from the business Gmail, so the client's answer lands in the same inbox. Only inquiries that arrive after setup get a reply. Free Gmail allows 100 script emails a day.

Setup (once, signed in to the business Gmail):

1. Open https://script.google.com and press New project.
2. Delete the sample code, paste in everything from `auto-reply.gs`, and press Save.
3. Pick `setup` in the function menu, press Run, and approve Google's permission prompt. Google warns that the app isn't verified because it is your own script: choose Advanced, then Go to the project.

To stop it, pick `stop` and press Run. To change the wording, edit `replyBody` and save.

The form's subject line is set in `site/assets/site.js`. If it ever changes, change `INQUIRY_SUBJECT` in the script to match.
