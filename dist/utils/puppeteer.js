"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ApiPuppeteer", {
    enumerable: true,
    get: function() {
        return ApiPuppeteer;
    }
});
const _config = /*#__PURE__*/ _interop_require_default(require("../config"));
const _exceptions = require("../exceptions");
const _logger = require("./logger");
const _cheerio = require("cheerio");
const _puppeteer = require("puppeteer");
const _puppeteercluster = require("puppeteer-cluster");
const _puppeteerextra = /*#__PURE__*/ _interop_require_default(require("puppeteer-extra"));
const _puppeteerextrapluginstealth = /*#__PURE__*/ _interop_require_default(require("puppeteer-extra-plugin-stealth"));
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const { proxy } = _config.default;
let ApiPuppeteer = class ApiPuppeteer {
    check(data) {
        data.map((v)=>{
            if (!v.url || typeof v.url !== 'string') {
                throw new _exceptions.InvalidArgumentError('url is a required property and must be a string.');
            }
            if (!v.props || !Array.isArray(v.props)) {
                throw new _exceptions.InvalidArgumentError('Option "props" needs to be an array.');
            }
            if (v.current && typeof v.url !== 'boolean') {
                throw new _exceptions.InvalidArgumentError('Option "currentCompany" needs to be a boolean.');
            }
        });
        _logger.logger.info(`---------------
    puppeteer check successfully
    ---------------`);
    }
    getNumber(values) {
        const $ = (0, _cheerio.load)(values);
        const nResults = $('#result-stats').text();
        const match = nResults.match(/(\d+(?:[.,]\d{3})*(?:\s+\d{3})*)\s*résultats/);
        if (match) {
            return Number.parseInt(match[1].replace(/\s/g, ''), 10);
        }
        return undefined;
    }
    async init() {
        try {
            _puppeteerextra.default.use((0, _puppeteerextrapluginstealth.default)());
            this.browser = await _puppeteercluster.Cluster.launch({
                concurrency: _puppeteercluster.Cluster.CONCURRENCY_PAGE,
                maxConcurrency: 10,
                puppeteerOptions: {
                    headless: 'new',
                    executablePath: (0, _puppeteer.executablePath)(),
                    args: [
                        `--proxy-server=${this.proxyServer}`,
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--disable-gpu',
                        '--disable-features=site-per-process',
                        '--enable-features=NetworkService',
                        '--allow-running-insecure-content',
                        '--enable-automation',
                        '--disable-background-timer-throttling',
                        '--disable-backgrounding-occluded-windows',
                        '--disable-renderer-backgrounding',
                        '--disable-web-security',
                        '--disable-infobars',
                        '--ignore-certifcate-errors-spki-list',
                        '--ignore-certifcate-errors',
                        '--disable-background-networking',
                        '--disable-breakpad',
                        '--disable-client-side-phishing-detection',
                        '--disable-component-update',
                        '--disable-default-apps',
                        '--disable-domain-reliability',
                        '--disable-extensions',
                        '--disable-hang-monitor',
                        '--disable-ipc-flooding-protection',
                        '--disable-print-preview',
                        '--disable-prompt-on-repost',
                        '--disable-speech-api',
                        '--disk-cache-size=33554432',
                        '--hide-scrollbars',
                        '--ignore-gpu-blacklist',
                        '--metrics-recording-only',
                        '--mute-audio',
                        '--no-default-browser-check',
                        '--no-first-run',
                        '--no-pings',
                        '--no-zygote',
                        '--use-gl=swiftshader',
                        '--use-mock-keychain'
                    ],
                    ignoreHTTPSErrors: true
                }
            });
            _logger.logger.info(`Puppeteer launched!`);
        } catch (error) {
            // Kill Puppeteer
            _logger.logger.error('puppeteer browser error: ' + error);
            await this.close();
            throw new _exceptions.ServerException();
        }
    }
    async scrapper({ page, data: { props, url } }) {
        return new Promise(async (resolve)=>{
            try {
                const session = await page.target().createCDPSession();
                await page.setBypassCSP(true);
                await session.send('Page.enable');
                await session.send('Page.setWebLifecycleState', {
                    state: 'active'
                });
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 OPR/103.0.0.0');
                await page.setRequestInterception(true);
                page.on('request', (request)=>{
                    const resourceTypesAccepted = [
                        'document'
                    ];
                    if (resourceTypesAccepted.includes(request.resourceType())) {
                        request.continue();
                    } else {
                        request.abort();
                    }
                });
                await page.authenticate({
                    username: this.proxyUsername,
                    password: this.proxyPassword
                });
                page.on('response', async (response)=>{
                    if (response.status() === 302) {
                        resolve([
                            true
                        ]);
                    }
                    if (response.url().startsWith(props[1]) && response.status() === 200) {
                        const responseBody = await response.text();
                        if (!responseBody) {
                            await page.close();
                            resolve([
                                true
                            ]);
                        }
                        const res = props[0](responseBody);
                        await page.close();
                        resolve([
                            false,
                            [
                                res,
                                this.getNumber(responseBody)
                            ]
                        ]);
                    }
                });
                await page.goto(url);
            } catch (err) {
                // Kill Puppeteer
                await this.close();
                resolve([
                    err
                ]);
            }
        });
    }
    async open(values) {
        try {
            if (!this.browser) {
                await this.init();
            }
            this.browser.task(async ({ page, data })=>{
                _logger.logger.info(`scrapping: ${data.url}`);
                const [error, res] = await this.scrapper({
                    page,
                    data
                });
                if (error) {
                    data.retryCount++;
                    if (data.retryCount < 3) {
                        _logger.logger.error(`Error on scrapping: ${data.url}`);
                        this.browser.queue(data);
                    } else {
                        result.push({
                            data: undefined,
                            current: true
                        });
                    }
                } else {
                    result.push({
                        data: res[0],
                        number: res[1],
                        current: data.current
                    });
                }
            });
            const result = [];
            _logger.logger.info(`Puppeteer scrapping!`);
            values.forEach((option)=>{
                this.browser.queue(option);
            });
            await this.close();
            return [
                false,
                result
            ];
        } catch (error) {
            _logger.logger.error(`Error on open: ${error}`);
            await this.close();
            return [
                true
            ];
        }
    }
    close() {
        return new Promise(async (resolve, reject)=>{
            if (this.browser) {
                try {
                    await this.browser.idle();
                    await this.browser.close();
                    this.browser = null;
                    _logger.logger.info('Closed browser !');
                } catch (err) {
                    _logger.logger.error(`error on Closed browser: ${err}`);
                    reject(err);
                }
            }
            return resolve();
        });
    }
    constructor(){
        _define_property(this, "proxyServer", proxy.SERVER);
        _define_property(this, "proxyUsername", proxy.USERNAME);
        _define_property(this, "proxyPassword", proxy.PASSWORD);
        _define_property(this, "browser", null);
    }
};

//# sourceMappingURL=puppeteer.js.map