#!/usr/bin/env node
/**
 * Performance Metrics Check
 * Measures the 5 Core Web Vitals (LCP, FID/INP, CLS, TTFB, FCP) using the
 * modern `PerformanceNavigationTiming` + `PerformanceObserver` APIs, compares
 * them against thresholds, and writes both a run report and a rolling baseline
 * used for regression detection across runs.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.PERF_BASE_URL || 'http://localhost:8080';
const RESULTS_DIR = 'test-results';
const BASELINE_PATH = path.join(RESULTS_DIR, 'performance-baseline.json');
const REPORT_PATH = path.join(RESULTS_DIR, 'performance-metrics.json');
const REGRESSION_RATIO = 1.15; // fail if metric worsens by >15% vs baseline

const THRESHOLDS = {
    lcp: 2500,      // ms - Largest Contentful Paint (good <= 2500)
    fid: 100,       // ms - First Input Delay (good <= 100)
    cls: 0.1,       // unitless - Cumulative Layout Shift (good <= 0.1)
    ttfb: 800,      // ms - Time to First Byte (good <= 800)
    fcp: 1800       // ms - First Contentful Paint (good <= 1800)
};

function fmt(name, value) {
    if (value == null) return `${name}: n/a`;
    if (name === 'CLS') return `${name}: ${value.toFixed(3)}`;
    return `${name}: ${Math.round(value)}ms`;
}

async function collectVitals(page) {
    // Install the observers before navigation so we don't miss entries.
    await page.evaluateOnNewDocument(() => {
        window.__vitals = { lcp: null, fid: null, cls: 0, longTasks: 0 };

        try {
            new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const last = entries[entries.length - 1];
                if (last) window.__vitals.lcp = last.renderTime || last.loadTime || last.startTime;
            }).observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (_) {}

        try {
            new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (window.__vitals.fid == null) {
                        window.__vitals.fid = entry.processingStart - entry.startTime;
                    }
                }
            }).observe({ type: 'first-input', buffered: true });
        } catch (_) {}

        try {
            new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) window.__vitals.cls += entry.value;
                }
            }).observe({ type: 'layout-shift', buffered: true });
        } catch (_) {}

        try {
            new PerformanceObserver((list) => {
                window.__vitals.longTasks += list.getEntries().length;
            }).observe({ type: 'longtask', buffered: true });
        } catch (_) {}
    });
}

async function measure(page) {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // Synthetic interaction to capture FID (first input delay).
    try {
        await page.mouse.move(200, 200);
        await page.mouse.click(200, 200, { delay: 10 });
    } catch (_) {}

    // Let LCP/CLS settle. LCP finalizes on user input or page hide; force a small wait.
    await new Promise((r) => setTimeout(r, 1500));

    const data = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        const fcp = paint.find((p) => p.name === 'first-contentful-paint')?.startTime ?? null;
        const ttfb = nav ? nav.responseStart - nav.startTime : null;
        const domReady = nav ? nav.domContentLoadedEventEnd - nav.startTime : null;
        const loadTime = nav ? nav.loadEventEnd - nav.startTime : null;

        const resources = performance
            .getEntriesByType('resource')
            .map((r) => ({ name: r.name.split('/').pop(), size: r.transferSize || 0, duration: r.duration }))
            .filter((r) => r.size > 0)
            .sort((a, b) => b.size - a.size)
            .slice(0, 5);

        return {
            ttfb,
            fcp,
            lcp: window.__vitals.lcp,
            fid: window.__vitals.fid,
            cls: window.__vitals.cls,
            longTasks: window.__vitals.longTasks,
            domReady,
            loadTime,
            resources
        };
    });

    return data;
}

function checkThresholds(metrics) {
    const checks = [
        { key: 'lcp', label: 'LCP', value: metrics.lcp, threshold: THRESHOLDS.lcp },
        { key: 'fid', label: 'FID', value: metrics.fid, threshold: THRESHOLDS.fid },
        { key: 'cls', label: 'CLS', value: metrics.cls, threshold: THRESHOLDS.cls },
        { key: 'ttfb', label: 'TTFB', value: metrics.ttfb, threshold: THRESHOLDS.ttfb },
        { key: 'fcp', label: 'FCP', value: metrics.fcp, threshold: THRESHOLDS.fcp }
    ];

    const report = [];
    let passed = true;

    for (const c of checks) {
        if (c.value == null) {
            report.push({ ...c, status: 'skipped' });
            continue;
        }
        const ok = c.value <= c.threshold;
        if (!ok) passed = false;
        report.push({ ...c, status: ok ? 'pass' : 'fail' });
    }

    return { passed, report };
}

function checkRegressions(metrics) {
    if (!fs.existsSync(BASELINE_PATH)) return { hasBaseline: false, regressions: [] };
    let baseline;
    try {
        baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
    } catch (_) {
        return { hasBaseline: false, regressions: [] };
    }

    const regressions = [];
    for (const key of ['lcp', 'fid', 'cls', 'ttfb', 'fcp']) {
        const current = metrics[key];
        const prior = baseline.metrics?.[key];
        if (current == null || prior == null || prior === 0) continue;
        const ratio = current / prior;
        if (ratio > REGRESSION_RATIO) {
            regressions.push({ key, current, prior, ratio: Number(ratio.toFixed(2)) });
        }
    }
    return { hasBaseline: true, regressions };
}

function updateBaseline(metrics) {
    // Only track the subset of metrics we regress against.
    const slim = {
        lcp: metrics.lcp,
        fid: metrics.fid,
        cls: metrics.cls,
        ttfb: metrics.ttfb,
        fcp: metrics.fcp
    };
    const payload = { updatedAt: new Date().toISOString(), metrics: slim };
    fs.writeFileSync(BASELINE_PATH, JSON.stringify(payload, null, 2));
}

async function main() {
    if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('console', (msg) => { if (msg.type() === 'error') pageErrors.push(msg.text()); });

    const results = {
        timestamp: new Date().toISOString(),
        url: BASE_URL,
        passed: true,
        summary: 'All metrics within acceptable ranges',
        metrics: {},
        thresholds: THRESHOLDS,
        checks: [],
        regressions: [],
        longTasks: 0,
        consoleErrors: []
    };

    try {
        console.log('Measuring performance metrics...');
        await collectVitals(page);
        const data = await measure(page);

        results.metrics = {
            lcp: data.lcp,
            fid: data.fid,
            cls: data.cls,
            ttfb: data.ttfb,
            fcp: data.fcp,
            domReady: data.domReady,
            loadTime: data.loadTime
        };
        results.longTasks = data.longTasks;
        results.consoleErrors = pageErrors.slice(0, 20);

        const { passed, report } = checkThresholds(results.metrics);
        results.checks = report;
        results.passed = passed;
        results.summary = passed ? 'All metrics within acceptable ranges' : 'Some metrics exceeded thresholds';

        console.log('Metrics:');
        for (const c of report) {
            const mark = c.status === 'pass' ? 'OK ' : c.status === 'fail' ? 'FAIL' : 'SKIP';
            const thresholdStr = c.label === 'CLS' ? c.threshold.toFixed(2) : `${c.threshold}ms`;
            console.log(`  [${mark}] ${fmt(c.label, c.value)} (threshold: ${thresholdStr})`);
        }

        console.log('\nTop resources:');
        for (const r of data.resources) {
            const size = (r.size / 1024).toFixed(2);
            console.log(`  ${r.name}: ${size}KB (${Math.round(r.duration)}ms)`);
        }

        console.log(`\nLong tasks: ${data.longTasks}`);

        const { hasBaseline, regressions } = checkRegressions(results.metrics);
        results.regressions = regressions;
        if (hasBaseline && regressions.length > 0) {
            results.passed = false;
            results.summary = 'Regression detected vs. baseline';
            console.log('\nRegressions vs baseline:');
            for (const r of regressions) {
                console.log(`  ${r.key.toUpperCase()}: ${Math.round(r.current)} vs ${Math.round(r.prior)} (x${r.ratio})`);
            }
        } else if (!hasBaseline) {
            console.log('\nNo baseline found — writing initial baseline.');
        }

        // Refresh baseline only on a clean pass so regressions don't silently become the new normal.
        if (results.passed) updateBaseline(results.metrics);

        console.log(`\n${results.passed ? 'PASS' : 'FAIL'}: ${results.summary}`);
    } catch (error) {
        console.error('Performance check failed:', error);
        results.passed = false;
        results.summary = `Error: ${error.message}`;
    } finally {
        fs.writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2));
        await browser.close();
        process.exit(results.passed ? 0 : 1);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
