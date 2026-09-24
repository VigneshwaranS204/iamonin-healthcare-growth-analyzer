import { CrawlEngineResult } from '../crawler/crawlerEngine.js';
import { PageCrawlResult } from '../crawler/pageCrawler.js';

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface TechnicalFindingItem {
  checkId: string;
  name: string;
  category: 'Technical' | 'SEO' | 'Security' | 'Performance' | 'Mobile';
  severity: FindingSeverity;
  evidence: string;
  affectedUrls: string[];
  explanation: string;
  recommendation: string;
  passed: boolean;
}

export class TechnicalSeoAnalyzer {
  /**
   * Evaluates all 26 technical and SEO checks across the crawl dataset.
   */
  analyze(crawlData: CrawlEngineResult): TechnicalFindingItem[] {
    const pages = crawlData.pages;
    const totalPages = pages.length;
    const findings: TechnicalFindingItem[] = [];

    if (totalPages === 0) {
      return findings;
    }

    // 1. HTTPS Check
    const nonHttpsPages = pages.filter((p) => !p.finalUrl.startsWith('https://'));
    findings.push({
      checkId: 'TECH-01',
      name: 'HTTPS Protocol Support',
      category: 'Security',
      severity: nonHttpsPages.length > 0 ? 'CRITICAL' : 'INFO',
      passed: nonHttpsPages.length === 0,
      evidence:
        nonHttpsPages.length > 0
          ? `${nonHttpsPages.length} of ${totalPages} page(s) loaded over insecure HTTP connection.`
          : `All ${totalPages} analyzed pages are securely served over HTTPS.`,
      affectedUrls: nonHttpsPages.map((p) => p.url),
      explanation: 'HTTPS encrypts patient data and is a recognized baseline standard for healthcare websites.',
      recommendation: 'Enforce full SSL/TLS certificates across all hospital web pages and subdomains.',
    });

    // 2. HTTP -> HTTPS Redirect
    const rootPage = pages.find((p) => p.depth === 0) || pages[0];
    const redirectsToHttps = rootPage.finalUrl.startsWith('https://');
    findings.push({
      checkId: 'TECH-02',
      name: 'HTTP to HTTPS Redirection',
      category: 'Security',
      severity: !redirectsToHttps ? 'HIGH' : 'INFO',
      passed: redirectsToHttps,
      evidence: redirectsToHttps
        ? `Primary domain automatically redirects to HTTPS (${rootPage.finalUrl}).`
        : `Website does not automatically upgrade HTTP traffic to HTTPS.`,
      affectedUrls: !redirectsToHttps ? [rootPage.url] : [],
      explanation: 'Automated 301 redirection from HTTP to HTTPS prevents insecure traffic and duplicate indexing.',
      recommendation: 'Implement a permanent 301 redirect rule from HTTP to HTTPS on the web server.',
    });

    // 3. Missing Page Title
    const missingTitles = pages.filter((p) => !p.title || p.title.trim() === '');
    findings.push({
      checkId: 'TECH-03',
      name: 'Missing Page Title Tag',
      category: 'SEO',
      severity: missingTitles.length > 0 ? 'HIGH' : 'INFO',
      passed: missingTitles.length === 0,
      evidence:
        missingTitles.length > 0
          ? `Missing <title> tag on ${missingTitles.length} of ${totalPages} page(s).`
          : `All ${totalPages} analyzed pages have title tags.`,
      affectedUrls: missingTitles.map((p) => p.url),
      explanation: 'The title tag is the primary indicator of page relevance for search engines and browser tabs.',
      recommendation: 'Define unique, descriptive title tags including the specialty, hospital name, and location.',
    });

    // 4. Duplicate Page Titles
    const titleMap = new Map<string, string[]>();
    pages.forEach((p) => {
      if (p.title) {
        const list = titleMap.get(p.title) || [];
        list.push(p.url);
        titleMap.set(p.title, list);
      }
    });
    const duplicateTitles = Array.from(titleMap.entries()).filter(([_, urls]) => urls.length > 1);
    const affectedDuplicateTitleUrls = duplicateTitles.flatMap(([_, urls]) => urls);
    findings.push({
      checkId: 'TECH-04',
      name: 'Duplicate Page Titles',
      category: 'SEO',
      severity: duplicateTitles.length > 0 ? 'MEDIUM' : 'INFO',
      passed: duplicateTitles.length === 0,
      evidence:
        duplicateTitles.length > 0
          ? `Identified ${duplicateTitles.length} title(s) duplicated across ${affectedDuplicateTitleUrls.length} pages.`
          : 'No duplicate page titles detected across crawled pages.',
      affectedUrls: affectedDuplicateTitleUrls,
      explanation: 'Duplicate titles cause search engine keyword cannibalization and dilute page distinctiveness.',
      recommendation: 'Ensure each doctor, specialty, and service page has a tailored, distinct page title.',
    });

    // 5. Title Too Short (< 30 chars)
    const shortTitles = pages.filter((p) => p.title && p.title.length < 30);
    findings.push({
      checkId: 'TECH-05',
      name: 'Title Tag Too Short (<30 characters)',
      category: 'SEO',
      severity: shortTitles.length > 0 ? 'LOW' : 'INFO',
      passed: shortTitles.length === 0,
      evidence:
        shortTitles.length > 0
          ? `${shortTitles.length} page(s) have title tags under 30 characters.`
          : 'All page titles meet minimum character length guidelines.',
      affectedUrls: shortTitles.map((p) => p.url),
      explanation: 'Very short titles underutilize available search snippet space and miss relevant location/specialty context.',
      recommendation: 'Expand short titles (optimal 50-60 characters) to include key hospital credentials and location.',
    });

    // 6. Title Too Long (> 60 chars)
    const longTitles = pages.filter((p) => p.title && p.title.length > 60);
    findings.push({
      checkId: 'TECH-06',
      name: 'Title Tag Too Long (>60 characters)',
      category: 'SEO',
      severity: longTitles.length > 0 ? 'LOW' : 'INFO',
      passed: longTitles.length === 0,
      evidence:
        longTitles.length > 0
          ? `${longTitles.length} page(s) have title tags exceeding 60 characters (likely truncated).`
          : 'All page titles are within optimal character length bounds.',
      affectedUrls: longTitles.map((p) => p.url),
      explanation: 'Titles longer than 60 characters get truncated in search snippets, reducing click-through clarity.',
      recommendation: 'Keep primary title keywords within the first 55-60 characters.',
    });

    // 7. Missing Meta Description
    const missingMetas = pages.filter((p) => !p.metaDescription || p.metaDescription.trim() === '');
    findings.push({
      checkId: 'TECH-07',
      name: 'Missing Meta Description',
      category: 'SEO',
      severity: missingMetas.length > 0 ? 'HIGH' : 'INFO',
      passed: missingMetas.length === 0,
      evidence:
        missingMetas.length > 0
          ? `Missing meta description on ${missingMetas.length} of ${totalPages} page(s).`
          : `All ${totalPages} analyzed pages include meta descriptions.`,
      affectedUrls: missingMetas.map((p) => p.url),
      explanation: 'Meta descriptions directly influence patient click-through rates from search results.',
      recommendation: 'Write compelling meta descriptions (120-155 characters) outlining doctors, treatments, and booking availability.',
    });

    // 8. Duplicate Meta Descriptions
    const metaMap = new Map<string, string[]>();
    pages.forEach((p) => {
      if (p.metaDescription) {
        const list = metaMap.get(p.metaDescription) || [];
        list.push(p.url);
        metaMap.set(p.metaDescription, list);
      }
    });
    const duplicateMetas = Array.from(metaMap.entries()).filter(([_, urls]) => urls.length > 1);
    const affectedDuplicateMetaUrls = duplicateMetas.flatMap(([_, urls]) => urls);
    findings.push({
      checkId: 'TECH-08',
      name: 'Duplicate Meta Descriptions',
      category: 'SEO',
      severity: duplicateMetas.length > 0 ? 'MEDIUM' : 'INFO',
      passed: duplicateMetas.length === 0,
      evidence:
        duplicateMetas.length > 0
          ? `Found ${duplicateMetas.length} duplicate description(s) across ${affectedDuplicateMetaUrls.length} pages.`
          : 'No duplicate meta descriptions detected.',
      affectedUrls: affectedDuplicateMetaUrls,
      explanation: 'Repeated meta descriptions across different departments create duplicate snippet text.',
      recommendation: 'Craft unique summary descriptions for each department and doctor profile.',
    });

    // 9. Missing H1 Heading
    const missingH1 = pages.filter((p) => p.h1List.length === 0);
    findings.push({
      checkId: 'TECH-09',
      name: 'Missing H1 Heading',
      category: 'SEO',
      severity: missingH1.length > 0 ? 'HIGH' : 'INFO',
      passed: missingH1.length === 0,
      evidence:
        missingH1.length > 0
          ? `Missing primary <h1> heading on ${missingH1.length} of ${totalPages} page(s).`
          : 'All analyzed pages contain an H1 heading.',
      affectedUrls: missingH1.map((p) => p.url),
      explanation: 'The H1 tag establishes the semantic topic hierarchy for both patients and search engines.',
      recommendation: 'Add a clear H1 heading specifying the department, doctor name, or service on each page.',
    });

    // 10. Multiple H1 Headings
    const multipleH1 = pages.filter((p) => p.h1List.length > 1);
    findings.push({
      checkId: 'TECH-10',
      name: 'Multiple H1 Headings',
      category: 'SEO',
      severity: multipleH1.length > 0 ? 'LOW' : 'INFO',
      passed: multipleH1.length === 0,
      evidence:
        multipleH1.length > 0
          ? `${multipleH1.length} page(s) contain multiple <h1> tags (up to ${Math.max(...multipleH1.map((p) => p.h1List.length))} on a single page).`
          : 'All analyzed pages maintain a clean single H1 hierarchy.',
      affectedUrls: multipleH1.map((p) => p.url),
      explanation: 'Multiple H1 tags can dilute topic focus; standard practice is one H1 with supporting H2s and H3s.',
      recommendation: 'Restructure extra H1 tags into H2 subheadings for clearer content structure.',
    });

    // 11. Duplicate H1 across pages
    const h1Map = new Map<string, string[]>();
    pages.forEach((p) => {
      p.h1List.forEach((h) => {
        const list = h1Map.get(h) || [];
        list.push(p.url);
        h1Map.set(h, list);
      });
    });
    const duplicateH1s = Array.from(h1Map.entries()).filter(([_, urls]) => urls.length > 1);
    const affectedDuplicateH1Urls = duplicateH1s.flatMap(([_, urls]) => urls);
    findings.push({
      checkId: 'TECH-11',
      name: 'Duplicate H1 Headings Across Pages',
      category: 'SEO',
      severity: duplicateH1s.length > 0 ? 'MEDIUM' : 'INFO',
      passed: duplicateH1s.length === 0,
      evidence:
        duplicateH1s.length > 0
          ? `Detected ${duplicateH1s.length} identical H1 heading(s) shared across multiple pages.`
          : 'All detected H1 headings are distinct.',
      affectedUrls: affectedDuplicateH1Urls,
      explanation: 'Identical H1 headings across separate pages hinder search engines from identifying unique page intents.',
      recommendation: 'Customize H1s to explicitly reference the specific specialty or doctor.',
    });

    // 12. Missing Canonical Tag
    const missingCanonical = pages.filter((p) => !p.canonicalUrl);
    findings.push({
      checkId: 'TECH-12',
      name: 'Missing Canonical Tag',
      category: 'SEO',
      severity: missingCanonical.length > 0 ? 'MEDIUM' : 'INFO',
      passed: missingCanonical.length === 0,
      evidence:
        missingCanonical.length > 0
          ? `Missing rel="canonical" on ${missingCanonical.length} of ${totalPages} page(s).`
          : 'Canonical link tags are present across all analyzed pages.',
      affectedUrls: missingCanonical.map((p) => p.url),
      explanation: 'Canonical tags protect against duplicate content penalties from query parameters and trailing slashes.',
      recommendation: 'Implement self-referential canonical tags on all core pages.',
    });

    // 13. Canonical Mismatch
    const canonicalMismatch = pages.filter((p) => {
      if (!p.canonicalUrl) return false;
      try {
        const can = new URL(p.canonicalUrl, p.finalUrl).toString().replace(/\/$/, '');
        const act = new URL(p.finalUrl).toString().replace(/\/$/, '');
        return can !== act;
      } catch {
        return false;
      }
    });
    findings.push({
      checkId: 'TECH-13',
      name: 'Canonical Tag Mismatch',
      category: 'SEO',
      severity: canonicalMismatch.length > 0 ? 'MEDIUM' : 'INFO',
      passed: canonicalMismatch.length === 0,
      evidence:
        canonicalMismatch.length > 0
          ? `${canonicalMismatch.length} page(s) have canonical URLs pointing to different destination addresses.`
          : 'Canonical tags match actual page URLs correctly.',
      affectedUrls: canonicalMismatch.map((p) => p.url),
      explanation: 'Canonical mismatches instruct search engines to index an alternate URL instead of the current page.',
      recommendation: 'Verify canonical tags point to the intended authoritative URL.',
    });

    // 14. Broken Internal Links
    const brokenInternal = pages.filter((p) => p.statusCode >= 400);
    findings.push({
      checkId: 'TECH-14',
      name: 'Broken Internal Pages (4xx/5xx HTTP Status)',
      category: 'Technical',
      severity: brokenInternal.length > 0 ? 'HIGH' : 'INFO',
      passed: brokenInternal.length === 0,
      evidence:
        brokenInternal.length > 0
          ? `${brokenInternal.length} internal page(s) returned error status codes (${brokenInternal.map((p) => `${p.statusCode}`).join(', ')}).`
          : `Zero broken internal pages detected among ${totalPages} crawled URLs.`,
      affectedUrls: brokenInternal.map((p) => p.url),
      explanation: 'Broken pages disrupt patient navigation, appointment booking, and waste search crawl budget.',
      recommendation: 'Fix or 301-redirect all broken internal links to active relevant departments.',
    });

    // 15. Broken External Links Observation
    findings.push({
      checkId: 'TECH-15',
      name: 'Outbound External Links',
      category: 'Technical',
      severity: 'INFO',
      passed: true,
      evidence: `Extracted external outbound links across ${pages.filter((p) => p.externalLinks.length > 0).length} pages.`,
      affectedUrls: [],
      explanation: 'Outbound links to accreditation bodies (NABH, JCI) and social profiles build trust.',
      recommendation: 'Ensure all external links open securely with rel="noopener noreferrer".',
    });

    // 16. Missing Image Alt Text
    const pagesWithMissingAlt = pages.filter((p) => p.imagesMissingAlt > 0);
    const totalMissingAltCount = pages.reduce((acc, p) => acc + p.imagesMissingAlt, 0);
    const totalImagesCount = pages.reduce((acc, p) => acc + p.imagesCount, 0);
    findings.push({
      checkId: 'TECH-16',
      name: 'Images Missing Alt Text',
      category: 'SEO',
      severity: totalMissingAltCount > 0 ? 'MEDIUM' : 'INFO',
      passed: totalMissingAltCount === 0,
      evidence:
        totalMissingAltCount > 0
          ? `${totalMissingAltCount} of ${totalImagesCount} image(s) lack descriptive alt attributes across ${pagesWithMissingAlt.length} pages.`
          : `All ${totalImagesCount} images have alt attributes defined.`,
      affectedUrls: pagesWithMissingAlt.map((p) => p.url),
      explanation: 'Alt text improves accessibility and enables doctor/equipment images to appear in visual search.',
      recommendation: 'Add descriptive alt tags including doctor name, department, or procedure name.',
    });

    // 17. Excessively Large Image Count
    const imageHeavyPages = pages.filter((p) => p.imagesCount > 40);
    findings.push({
      checkId: 'TECH-17',
      name: 'High Image Density (>40 images/page)',
      category: 'Performance',
      severity: imageHeavyPages.length > 0 ? 'LOW' : 'INFO',
      passed: imageHeavyPages.length === 0,
      evidence:
        imageHeavyPages.length > 0
          ? `${imageHeavyPages.length} page(s) contain more than 40 images, which may impact mobile page load speeds.`
          : 'Image density is well balanced across analyzed pages.',
      affectedUrls: imageHeavyPages.map((p) => p.url),
      explanation: 'High image volume without modern lazy-loading increases initial payload on mobile networks.',
      recommendation: 'Implement native loading="lazy" and WebP image compression.',
    });

    // 18. Thin Content (< 300 words)
    const thinPages = pages.filter(
      (p) =>
        p.wordCount < 300 &&
        !p.url.includes('/contact') &&
        !p.url.includes('/login') &&
        !p.url.includes('/privacy') &&
        !p.url.includes('/terms')
    );
    findings.push({
      checkId: 'TECH-18',
      name: 'Thin Content Pages (<300 words)',
      category: 'SEO',
      severity: thinPages.length > 0 ? 'HIGH' : 'INFO',
      passed: thinPages.length === 0,
      evidence:
        thinPages.length > 0
          ? `${thinPages.length} clinical or service page(s) contain fewer than 300 words of text content.`
          : 'All service and specialty pages have adequate content depth.',
      affectedUrls: thinPages.map((p) => p.url),
      explanation: 'Thin medical pages fail to address patient symptom queries, treatment FAQs, and doctor expertise.',
      recommendation: 'Expand clinical content to 600-1000 words with procedures, doctor bios, and patient FAQs.',
    });

    // 19. Orphan-like Pages (No internal in-links detected during crawl)
    const internalInboundMap = new Map<string, number>();
    pages.forEach((p) => {
      p.internalLinks.forEach((link) => {
        const count = internalInboundMap.get(link) || 0;
        internalInboundMap.set(link, count + 1);
      });
    });
    const orphanLike = pages.filter((p) => p.depth > 0 && !internalInboundMap.has(p.url) && !internalInboundMap.has(p.finalUrl));
    findings.push({
      checkId: 'TECH-19',
      name: 'Orphan-Like Pages Detection',
      category: 'SEO',
      severity: orphanLike.length > 0 ? 'MEDIUM' : 'INFO',
      passed: orphanLike.length === 0,
      evidence:
        orphanLike.length > 0
          ? `Detected ${orphanLike.length} page(s) with minimal internal navigation links in the crawl tree.`
          : 'Internal linking structure provides continuous navigation paths.',
      affectedUrls: orphanLike.map((p) => p.url),
      explanation: 'Pages lacking prominent internal links receive less search equity and fewer patient visits.',
      recommendation: 'Link specialty and doctor profile pages from main menus and cross-specialty references.',
    });

    // 20. Excessive Click Depth (> 3)
    const deepPages = pages.filter((p) => p.depth > 3);
    findings.push({
      checkId: 'TECH-20',
      name: 'Excessive Click Depth (>3 clicks from home)',
      category: 'SEO',
      severity: deepPages.length > 0 ? 'MEDIUM' : 'INFO',
      passed: deepPages.length === 0,
      evidence:
        deepPages.length > 0
          ? `${deepPages.length} page(s) require 4 or more clicks from the homepage to reach.`
          : 'All analyzed pages are accessible within 1-3 clicks of the homepage.',
      affectedUrls: deepPages.map((p) => p.url),
      explanation: 'Deeply nested pages are crawled less frequently and are harder for prospective patients to find.',
      recommendation: 'Flatten URL architecture and add direct specialty links to the primary header/footer.',
    });

    // 21. Missing Sitemap
    findings.push({
      checkId: 'TECH-21',
      name: 'XML Sitemap Availability',
      category: 'SEO',
      severity: !crawlData.sitemap.exists ? 'MEDIUM' : 'INFO',
      passed: crawlData.sitemap.exists,
      evidence: crawlData.sitemap.exists
        ? `Valid XML sitemap detected containing ${crawlData.sitemap.totalUrls} URLs.`
        : 'XML sitemap was not detected at standard locations or in robots.txt.',
      affectedUrls: crawlData.sitemap.sitemapUrls,
      explanation: 'An XML sitemap helps search engines discover all doctor profiles, blogs, and departments promptly.',
      recommendation: 'Generate and submit a dynamic XML sitemap indexing all live hospital URLs.',
    });

    // 22. Robots Configuration Observations
    findings.push({
      checkId: 'TECH-22',
      name: 'Robots.txt Crawl Directives',
      category: 'Technical',
      severity: 'INFO',
      passed: true,
      evidence: crawlData.robots.exists
        ? `robots.txt is active with ${crawlData.robots.disallowedPaths.length} disallow directive(s) and ${crawlData.robots.sitemaps.length} sitemap link(s).`
        : 'robots.txt not found (site default is open crawling).',
      affectedUrls: crawlData.robots.sitemaps,
      explanation: 'robots.txt guides automated crawlers while protecting internal administrative routes.',
      recommendation: 'Ensure sensitive administrative and search query URLs are disallowed while clinical pages remain crawlable.',
    });

    // 23. Missing Structured Data (JSON-LD)
    const pagesWithSchema = pages.filter((p) => p.schemaTypes.length > 0);
    const missingSchemaPages = pages.filter((p) => p.schemaTypes.length === 0);
    findings.push({
      checkId: 'TECH-23',
      name: 'Structured Data (Schema.org JSON-LD)',
      category: 'SEO',
      severity: pagesWithSchema.length === 0 ? 'HIGH' : missingSchemaPages.length > totalPages / 2 ? 'MEDIUM' : 'INFO',
      passed: pagesWithSchema.length > 0,
      evidence:
        pagesWithSchema.length > 0
          ? `Schema.org structured data detected on ${pagesWithSchema.length} of ${totalPages} page(s) (Types: ${Array.from(new Set(pages.flatMap((p) => p.schemaTypes))).join(', ') || 'General'}).`
          : 'Zero Schema.org JSON-LD structured data detected across analyzed pages.',
      affectedUrls: missingSchemaPages.map((p) => p.url),
      explanation: 'Medical schema (Hospital, Physician, MedicalOrganization, FAQPage) powers rich Google results and Google Knowledge Graph.',
      recommendation: 'Implement Hospital and Physician JSON-LD schema across hospital and doctor profile pages.',
    });

    // 24. Missing Open Graph Metadata
    const missingOg = pages.filter((p) => !p.ogTitle || !p.ogImage);
    findings.push({
      checkId: 'TECH-24',
      name: 'Open Graph (Social Sharing) Metadata',
      category: 'SEO',
      severity: missingOg.length > 0 ? 'LOW' : 'INFO',
      passed: missingOg.length === 0,
      evidence:
        missingOg.length > 0
          ? `Missing Open Graph title or image tags on ${missingOg.length} of ${totalPages} page(s).`
          : 'Open Graph metadata is properly configured for social sharing across all pages.',
      affectedUrls: missingOg.map((p) => p.url),
      explanation: 'Open Graph tags control how pages look when shared on WhatsApp, LinkedIn, and Facebook.',
      recommendation: 'Add og:title, og:description, and high-resolution og:image tags for branded social sharing previews.',
    });

    // 25. Mobile Viewport Metadata
    const missingViewport = pages.filter((p) => !p.hasViewportMeta);
    findings.push({
      checkId: 'TECH-25',
      name: 'Mobile Viewport Meta Tag',
      category: 'Mobile',
      severity: missingViewport.length > 0 ? 'CRITICAL' : 'INFO',
      passed: missingViewport.length === 0,
      evidence:
        missingViewport.length > 0
          ? `Missing <meta name="viewport"> tag on ${missingViewport.length} page(s).`
          : 'Mobile responsive viewport tag is configured on all pages.',
      affectedUrls: missingViewport.map((p) => p.url),
      explanation: 'A responsive viewport tag is essential for proper rendering and usability on patient mobile devices.',
      recommendation: 'Include <meta name="viewport" content="width=device-width, initial-scale=1.0"> in the HTML head.',
    });

    // 26. HTTPS Mixed-Content Indicators
    const mixedContentPages = pages.filter((p) => p.hasMixedContent);
    findings.push({
      checkId: 'TECH-26',
      name: 'HTTPS Mixed Content Indicators',
      category: 'Security',
      severity: mixedContentPages.length > 0 ? 'HIGH' : 'INFO',
      passed: mixedContentPages.length === 0,
      evidence:
        mixedContentPages.length > 0
          ? `Detected HTTP assets (images, scripts, or iframes) loaded inside HTTPS pages on ${mixedContentPages.length} URL(s).`
          : 'No insecure mixed HTTP content detected on HTTPS pages.',
      affectedUrls: mixedContentPages.map((p) => p.url),
      explanation: 'Mixed content triggers browser security warnings and blocks insecure assets from loading.',
      recommendation: 'Update all asset URLs (images, scripts, styles) to relative or https:// paths.',
    });

    return findings;
  }
}
