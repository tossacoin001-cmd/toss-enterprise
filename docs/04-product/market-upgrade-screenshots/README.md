# Market upgrade screenshots

Taken 2026-10-24 from the production build running locally, signed in as a throwaway test user on Clerk's **test** instance, against a local empty database with made-up sample data ("Zara Hair Studio", "Mama Put Kitchen"). Nothing here is real customer data. The test user was deleted afterwards.

Checked at 360, 390, 768 and 1440 px wide on: overview (checked and not yet checked), action plan, reports and one report, businesses, edit business, settings, onboarding and the phone menu. No page scrolled sideways, no browser console errors, and Escape closed the phone menu and returned focus to the menu button.

Not shown: a "before" set. The old signed-in pages were not captured before the redesign.

## Pricing journey (2026-10-24)

`pricing-public-390.png` (public page, yearly view), `plans-closed-1280.png` (payments not open), `plans-growth-1280.png` (a Growth package after a signed test payment) and `settings-starter-1280.png`. These came from a full journey on a production build, a local database and a throwaway Clerk test user: new account, first real check, trial and limits, closed checkout, then a dummy local payment key to prove the signed-webhook path. The dummy key is not a Paystack key and no real payment was made. The small list-bullet polish made after these shots was not re-photographed.
