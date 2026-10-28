// Company facts as published on tamsinfotech.com (October 2026).
// Anything not on that site or in TAMS's own product documentation stays off the page;
// open items are listed in CONTENT-REVIEW.md.

export const company = {
  name: "TAMS Infotech",
  legal: "TAMS Infotech Pvt. Ltd.",
  phone: "+91 80 4130 1039",
  phoneHref: "tel:+918041301039",
  email: "info@tamsinfotech.com",
  offices: [
    {
      city: "Bengaluru",
      country: "India",
      lines: ["#67, 35th Main, 100 Feet Road", "KAS Officers Colony, BTM 2nd Stage", "Bengaluru, Karnataka 560068"],
    },
    {
      city: "Pune",
      country: "India",
      lines: ["Office No. 1002, 10th Floor, Finswell Bldg.", "Viman Nagar, near Bajaj Finserv", "Pune, Maharashtra 411014"],
    },
    {
      city: "Fremont",
      country: "USA",
      lines: ["4580 Auto Mall Parkway, Suite 121", "Fremont, CA 94538"],
    },
  ],
} as const;
