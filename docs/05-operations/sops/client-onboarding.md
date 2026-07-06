# SOP: Client Onboarding

From confirmed payment to project kickoff. Owner: operator. Trigger: Flutterwave payment received for a service engagement.

## Steps

1. Confirm the payment in the Flutterwave dashboard matches the agreed scope amount. You should see the transaction with the client's name or reference.
2. Send the client a WhatsApp confirmation with: what was purchased, the delivery timeline, and what you need from them (content, logins, brand assets). Use the brand voice ([../../06-brand/brand-system.md](../../06-brand/brand-system.md)).
3. Create the client record: a folder under `clients/<client-kebab-name>/` containing `brief.md` with scope, price, dates, and contact info. (First client record creates the `clients/` folder; it is approved in monorepo.md.)
4. Collect required assets and credentials from the client. Credentials go into your password manager, never into the repo or the brief.
5. Schedule the kickoff or delivery checkpoint in Calendly/calendar and confirm the date with the client.
6. During delivery, keep a running `worklog.md` in the client folder: decisions, feedback, changes to scope (with confirmation quotes).
7. On completion: deliver, walk the client through it on WhatsApp or a call, transfer any credentials, and request a review or testimonial.
8. Add the project to the website work page (portfolio entry) and note whether it can become a template in `templates/`.
9. Offer the expansion path: retainer or Visibility OS, per the BOS lifecycle.

## Done when

Payment reconciled, client has their deliverable and credentials, portfolio updated, client record complete in `clients/`.
