const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "..");
const outDir = path.resolve(__dirname, "..", "postimages");
const proofPath = path.resolve(__dirname, "..", "five-width-runtime-proof.json");
const url = "http://127.0.0.1:8765/nebula-easy-psychic-reading.html";
const widths = [1200, 992, 768, 576, 320];

fs.mkdirSync(outDir, { recursive: true });

async function scrollAll(page) {
  await page.evaluate(async () => {
    const step = Math.max(320, Math.floor(window.innerHeight * 0.75));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(150);
}

async function faqState(page) {
  return page.locator("#psychicFaq > .faq-section__item").evaluateAll((items) =>
    items.map((item, index) => item.classList.contains("is-open") ? index : -1).filter((index) => index >= 0),
  );
}

(async () => {
  const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({ executablePath, headless: true });
  const result = {
    schema: "nebula_easy_psychic_reading_runtime_proof.v1",
    generatedAt: new Date().toISOString(),
    url,
    status: "pass",
    widths: [],
  };

  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const consoleErrors = [];
    const pageErrors = [];
    const requestFailures = [];
    const badResponses = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => pageErrors.push(String(error)));
    page.on("requestfailed", (request) => requestFailures.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || "failed"}`));
    page.on("response", (response) => { if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`); });

    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await scrollAll(page);

    const dimensions = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
    }));
    const images = await page.locator("img").evaluateAll((nodes) => ({
      total: nodes.length,
      broken: nodes.filter((node) => !node.complete || node.naturalWidth === 0).map((node) => node.currentSrc || node.src),
    }));
    const expertNames = await page.locator(".experts-section__name").allInnerTexts();
    const expectedNames = width >= 1200
      ? ["Veronika", "Marina", "Svetlana", "Izolda", "Galina", "Magic Pig"]
      : ["Veronika", "Veronika", "Veronika", "Veronika", "Veronika", "Veronika"];
    const normalizedNames = expertNames.map((name) => name.replace(/\s+/g, " ").trim());
    const ctaHrefs = await page.locator(".experts-section__chat-btn, .prn-experts-section__more a").evaluateAll((links) => links.map((link) => link.getAttribute("href")));

    let menu = "desktop_not_required";
    if (width < 992) {
      const opener = page.locator(".navbar-toggler");
      const closer = page.locator(".site-header__offcanvas-close");
      await opener.click();
      const opened = await page.locator("#navbarOffcanvas").evaluate((node) => node.classList.contains("show"));
      const openAria = await opener.getAttribute("aria-expanded");
      await closer.click();
      const closed = await page.locator("#navbarOffcanvas").evaluate((node) => !node.classList.contains("show"));
      const closeAria = await opener.getAttribute("aria-expanded");
      menu = opened && openAria === "true" && closed && closeAria === "false" ? "pass" : "fail";
    }

    const initial = await faqState(page);
    const buttons = page.locator("#psychicFaq .faq-section__toggle");
    await buttons.nth(1).click();
    const second = await faqState(page);
    await buttons.nth(1).click();
    const reclosed = await faqState(page);
    await buttons.nth(2).click();
    const third = await faqState(page);
    await buttons.nth(0).click();
    const first = await faqState(page);
    const faq = JSON.stringify([initial, second, reclosed, third, first]) === JSON.stringify([[0], [1], [], [2], [0]]) ? "pass" : "fail";

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);
    const screenshot = path.join(outDir, `candidate-${width}.png`);
    await page.screenshot({ path: screenshot, fullPage: true, animations: "disabled" });

    const failures = [];
    if (dimensions.scrollWidth > dimensions.clientWidth) failures.push("horizontal_overflow");
    if (images.broken.length) failures.push("broken_images");
    if (consoleErrors.length || pageErrors.length || requestFailures.length || badResponses.length) failures.push("runtime_errors");
    if (menu === "fail") failures.push("menu");
    if (faq !== "pass") failures.push("faq");
    if (JSON.stringify(normalizedNames) !== JSON.stringify(expectedNames)) failures.push("expert_content");
    if (ctaHrefs.length !== 7 || ctaHrefs.some((href) => href !== "signup-step-1.html")) failures.push("cta_targets");

    result.widths.push({
      width,
      dimensions,
      images,
      expertNames: normalizedNames,
      ctaHrefs,
      interactions: { menu, faq, faqStates: [initial, second, reclosed, third, first] },
      consoleErrors,
      pageErrors,
      requestFailures,
      badResponses,
      screenshot: path.relative(root, screenshot).replaceAll("\\", "/"),
      screenshotBytes: fs.statSync(screenshot).size,
      failures,
    });
    if (failures.length) result.status = "fail";
    await page.close();
  }

  await browser.close();
  fs.writeFileSync(proofPath, JSON.stringify(result, null, 2) + "\n");
  process.stdout.write(JSON.stringify({ status: result.status, widths: result.widths.map(({ width, dimensions, images, interactions, failures }) => ({ width, dimensions, images, interactions, failures })) }, null, 2) + "\n");
  process.exit(result.status === "pass" ? 0 : 1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
