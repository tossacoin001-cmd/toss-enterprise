/**
 * Do it yourself: two to five plain steps for every finding the scan can produce.
 * Written for someone who has never touched their website settings. Tests: tests/scan-ui/view.test.ts (XP-05).
 */
export const HOWTO: Record<string, string[]> = {
  "site.reachable": [
    "Type your address into your phone and see if it opens.",
    "If it does not, log in to the company where you bought the address.",
    "Check that it is paid up and points to your website.",
    "Ask their support to help if you are stuck.",
  ],
  "site.https": [
    "Log in to your website host or builder.",
    "Look for a setting about security. It may be called SSL or HTTPS.",
    "Turn on the free certificate, then wait a few minutes.",
    "Open your site again and check for a padlock.",
  ],
  "site.cert_expiring": [
    "Log in to your website host or builder.",
    "Find the security or SSL page.",
    "Choose renew. It is usually free.",
  ],
  "page.title": [
    "Open your website settings or page editor.",
    "Find the box for the page title. Some tools call it the SEO title.",
    "Write your name and what you do, like Toss Spa, massages in Lekki.",
    "Save and publish.",
  ],
  "page.description": [
    "Open your website settings or page editor.",
    "Find the box called description.",
    "Write one or two sentences on what you offer and where.",
    "Save and publish.",
  ],
  "page.mobile": [
    "Open your site on your phone and see if you must zoom in.",
    "In your website builder, pick a theme that says mobile friendly.",
    "If someone built it for you, ask them to make it fit phones.",
  ],
  "page.heading": [
    "Open your home page in the editor.",
    "Put your business name and what you do in a large heading at the top.",
    "Save and publish.",
  ],
  "page.canonical": [
    "Ask your website builder to set the main address for each page.",
    "On many website tools this is one switch in the settings.",
    "Check it again with a new scan in a day.",
  ],
  "trust.contact": [
    "Add your phone number to the top of your home page.",
    "Add a WhatsApp button that opens a chat with you.",
    "Save, publish, and tap the button on your phone to test it.",
  ],
  "trust.schema": [
    "Ask your website builder to add your business details for Google.",
    "Give them your name, address, phone number and opening hours.",
    "Many website tools have a plugin that does this for you.",
  ],
  "find.robots_sitemap": [
    "Ask your website builder to create a page list for search engines.",
    "Many website tools do this with one switch or plugin.",
    "Check that your address followed by slash sitemap opens a list.",
  ],
  speed: [
    "Make large pictures smaller before you upload them.",
    "Remove tools and plugins that you do not use.",
    "Ask your host about a faster plan if it is still slow.",
  ],
  "social.present": [
    "Pick the platform your customers use most.",
    "Open a free account with your business name.",
    "Add your phone number, area and a link to your website.",
    "Post three times so it looks active.",
  ],
  "social.linked": [
    "Open the footer or contact area of your website.",
    "Add buttons that link to your social pages.",
    "Save, publish, and tap each one to test it.",
  ],
  "social.verified": [
    "Open each social link on your website.",
    "Fix any that lead to an empty page.",
    "If you have no account yet, open one and link it.",
  ],
  "site.none": [
    "Start with one page: your services, your prices and a WhatsApp button.",
    "Use a simple website builder. Many have a free start.",
    "Buy a web address of your own.",
    "Link your social pages from the bottom of the page.",
  ],
  "google.profile": [
    "Search for Google Business Profile and sign in.",
    "Add your business name, area, phone number and hours.",
    "Add three clear photos.",
    "Confirm it with the code Google sends you.",
  ],
};
