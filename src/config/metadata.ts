const metadataConfig: Record<string, string> = {
  title: 'Talaryo',
  description: "L'outil de recrutement ultime",
  url: process.env.NEXTAUTH_URL as string,
  siteName: 'Talaryo',
  siteImg: '/favicons/opengraph-image.png',
  defaultIcon: '/favicons/favicon.ico',
};

export default metadataConfig;
