// Experiment sample for the Phase B instant-scan plan. "kind" is only for analysis.
export const SITES = [
  // Toss portfolio (ground truth known to the founder)
  ["https://julie-luxury-spa.vercel.app/", "portfolio"],
  ["https://oj-clothings-repo.vercel.app/", "portfolio"],
  ["https://shopluxury-site.vercel.app/", "portfolio"],
  ["https://dyne-in-roots.vercel.app/", "portfolio"],
  ["https://rookas.vercel.app/", "portfolio"],
  ["https://luxcatalog.vercel.app/", "portfolio"],
  ["https://tossvisibilityos.com/", "portfolio"],
  ["https://ultiusport.com", "portfolio"],
  // Lagos clinics found via directories
  ["https://www.smile360ng.com/", "lagos-smb"],
  ["https://richmonddentalng.com/", "lagos-smb"],
  ["https://www.ekohospitals.com/", "lagos-smb"],
  ["http://www.dentalplusng.com/", "lagos-smb"],
  ["https://airedentalclinic.com/", "lagos-smb"],
  ["https://smileydentalclinic.com.ng/", "lagos-smb"],
  ["https://femmeng.com/", "lagos-smb"],
  ["https://www.forno.ng/", "lagos-smb"],
  ["https://ikokolagos.com/", "lagos-smb"],
  ["https://wakamelagos.com/", "lagos-smb"],
  // Larger Nigerian sites (stress test, bot protection)
  ["https://jumia.com.ng/", "big"],
  ["https://paystack.com/", "big"],
  ["https://flutterwave.com/", "big"],
  ["https://kuda.com/", "big"],
  ["https://www.piggyvest.com/", "big"],
  // Edge cases an owner may type
  ["https://example.com/", "edge-minimal"],
  ["https://www.facebook.com/tossenterprise", "edge-social-as-website"],
  ["https://www.instagram.com/tossenterprise/", "edge-social-as-website"],
  ["https://this-domain-does-not-exist-zz9-toss.com/", "edge-dead"],
  ["http://neverssl.com/", "edge-http-only"],
  ["https://expired.badssl.com/", "edge-bad-cert"],
  ["https://httpstat.us/503", "edge-503"],
];
