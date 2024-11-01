export const blankCandidatePage = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
  </head>
  <body>
  </body>
</html>
`;

export const dataCandidatePage = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
  </head>
  <body>
  <div id="result-stats">Environ 1 230 résultats</div>
    <div class="N54PNb BToiNc cvP2Ce">
      <a jsname="UWckNb" href="https://www.linkedin.com/in/jane-doe">
        <h3 class="LC20lb MBeuO DKV0Md">Jane Doe - Développeuse Web - TechCorp</h3>
      </a>
      <div>
        <span>Développeuse Web</span>
        <span>TechCorp</span>
      </div>
      <div class="VwiC3b yXK7lf">
        Passionnée par le développement front-end et les technologies modernes.
      </div>
    </div>
  </body>
</html>
`;

export const candidateUrl =
  'https://www.google.com/search?client=opera&q=site%3Afr.linkedin.com%2Fin%20intitle%3Adeveloper%20web%20informatique&start=0&num=50';

export function ExpectedCandidatePuppeteer({
  scrapeCandidate,
  checkPuppeteer,
  openSpy,
  configurePage,
  scrapperReseauxSpy,
  mockPage,
  scrapePage,
  mockBrowser,
  closeBrowser,
  init,
}) {
  expect(scrapeCandidate).toHaveBeenNthCalledWith(1, {
    url: candidateUrl,
    platform: 'LinkedIn',
    current: true,
  });
  expect(checkPuppeteer).toHaveBeenNthCalledWith(1, {
    url: candidateUrl,
    type: 'reseaux',
    strategy: expect.any(Function),
  });
  expect(openSpy).toHaveBeenNthCalledWith(1, {
    url: candidateUrl,
    type: 'reseaux',
    strategy: expect.any(Function),
  });
  expect(init).toHaveBeenCalledTimes(1);
  expect(configurePage).toHaveBeenCalledTimes(1);
  expect(scrapperReseauxSpy).toHaveBeenNthCalledWith(1, {
    page: mockPage,
    data: {
      type: 'reseaux',
      strategy: expect.any(Function),
      url: candidateUrl,
    },
  });
  expect(scrapePage).toHaveBeenNthCalledWith(1, {
    page: mockPage,
    url: candidateUrl,
    handler: expect.any(Function),
  });
  expect(mockBrowser.newPage).toHaveBeenCalledTimes(1);
  expect(mockBrowser.close).toHaveBeenCalledTimes(1);
  expect(mockPage.goto).toHaveBeenCalledTimes(1);
  expect(mockPage.close).toHaveBeenCalledTimes(2);
  expect(closeBrowser).toHaveBeenCalledTimes(1);
}
