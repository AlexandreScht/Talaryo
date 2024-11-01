export const cvForm = {
  Nindustry: undefined,
  Nkey: undefined,
  Nskill: undefined,
  date: new Date('2023-01-01T00:00:00.000Z'),
  fn: ['developer web'],
  formation: undefined,
  industry: undefined,
  key: undefined,
  loc: undefined,
  matching: 50,
  sector: ['informatique'],
  skill: undefined,
  time: true,
  zone: false,
};

export const cvUrl =
  'https://www.google.com/search?client=opera&q=ext%3Apdf%20%7C%20ext%3Adoc%20%7C%20ext%3Adocx%20%7C%20ext%3Appt%20inurl%3Acv%20%7C%20inurl%3Acurriculum%20%7C%20intitle%3Acv%20%7C%20intitle%3Acurriculum%20after%3A2023%20developer-web%20%7C%20informatique%20%20&start=0&num=50';

export const blankPage = `<!DOCTYPE html>
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

export const dataPage = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
  </head>
  <body>
  <div id="result-stats">Environ 1 230 résultats</div>
    <div class="N54PNb BToiNc cvP2Ce">
      <a jsname="UWckNb" href="https://link-to-get">
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

export const dataMultiplePages = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title></title>
  </head>
  <body>
  <div id="result-stats">Environ 2 480 résultats</div>
    <div class="N54PNb BToiNc cvP2Ce">
      <a jsname="UWckNb" href="https://link-to-get">
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
    <div class="N54PNb BToiNc cvP2Ce">
      <a jsname="UWckNb" href="https://link-to-get-2">
        <h3 class="LC20lb MBeuO DKV0Md">Jane Doe2 - Développeuse Web - TechCorp</h3>
      </a>
      <div>
        <span>Développeuse Logiciel</span>
        <span>TechCorp</span>
      </div>
      <div class="VwiC3b yXK7lf">
        Passionnée par le développement front-end et les technologies modernes.
      </div>
    </div>
  </body>
</html>
`;

export function ExpectedCvPuppeteer({ scrapeCV, checkPuppeteer, openSpy, configurePage, scrapperCV, mockPage, scrapePage, mockBrowser }) {
  expect(scrapeCV).toHaveBeenNthCalledWith(1, cvUrl);
  expect(checkPuppeteer).toHaveBeenNthCalledWith(1, {
    url: cvUrl,
    type: 'cv',
    strategy: expect.any(Function),
  });
  expect(openSpy).toHaveBeenNthCalledWith(1, {
    url: cvUrl,
    type: 'cv',
    strategy: expect.any(Function),
  });
  expect(configurePage).toHaveBeenCalledTimes(1);
  expect(scrapperCV).toHaveBeenNthCalledWith(1, {
    page: mockPage,
    data: {
      type: 'cv',
      strategy: expect.any(Function),
      url: cvUrl,
    },
  });
  expect(scrapePage).toHaveBeenNthCalledWith(1, {
    page: mockPage,
    url: cvUrl,
    handler: expect.any(Function),
  });
  expect(mockBrowser.newPage).toHaveBeenCalledTimes(1);
  expect(mockBrowser.close).toHaveBeenCalledTimes(1);
  expect(mockPage.goto).toHaveBeenCalledTimes(1);
  expect(mockPage.close).toHaveBeenCalledTimes(2);
}
