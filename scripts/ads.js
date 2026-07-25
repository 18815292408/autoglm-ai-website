(function () {
    'use strict';

    var AD_BASE = '/ads/';
    var DIRECT_LINK = 'https://www.effectivecpmnetwork.com/d2yqad3s?key=8ffb82b6d14df9058aa20756ef73aa58';

    function frame(src, width, height, className, label) {
        var iframe = document.createElement('iframe');
        iframe.className = 'ad-frame ' + (className || '');
        var localSuffix = /^(127\.0\.0\.1|localhost)$/.test(window.location.hostname) ? '.html' : '';
        iframe.src = AD_BASE + src + localSuffix;
        iframe.width = String(width);
        iframe.height = String(height);
        iframe.loading = 'lazy';
        iframe.scrolling = 'no';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.title = label;
        iframe.setAttribute('aria-label', label);
        return iframe;
    }

    function placement(format) {
        var outer = document.createElement('aside');
        outer.className = 'ad-placement ad-' + format;
        outer.setAttribute('aria-label', 'Advertisement');
        var shell = document.createElement('div');
        shell.className = 'ad-frame-shell';

        if (format === 'leaderboard') {
            shell.appendChild(frame('banner-728x90', 728, 90, 'ad-desktop-frame', 'Sponsored advertisement, 728 by 90'));
            shell.appendChild(frame('banner-320x50', 320, 50, 'ad-mobile-frame', 'Sponsored advertisement, 320 by 50'));
        } else if (format === 'rectangle') {
            shell.appendChild(frame('banner-300x250', 300, 250, '', 'Sponsored advertisement, 300 by 250'));
        } else if (format === 'compact') {
            shell.appendChild(frame('banner-468x60', 468, 60, '', 'Sponsored advertisement, 468 by 60'));
        } else if (format === 'native') {
            shell.appendChild(frame('native', 900, 270, '', 'Sponsored recommendations'));
        }

        outer.appendChild(shell);
        return outer;
    }

    function insertAfter(reference, node) {
        reference.parentNode.insertBefore(node, reference.nextSibling);
    }

    function addPagePlacements() {
        var article = document.querySelector('.article');
        var footer = document.querySelector('.site-footer');

        if (article) {
            var facts = article.querySelector('.facts');
            if (facts) insertAfter(facts, placement('rectangle'));

            var comparison = article.querySelector('.compare');
            if (comparison) insertAfter(comparison, placement('compact'));

            var sources = article.querySelector('.sources');
            if (sources) article.insertBefore(placement('native'), sources);
        } else {
            var hero = document.querySelector('.hero');
            var resources = document.querySelector('#resources');
            if (hero) insertAfter(hero, placement('leaderboard'));
            if (resources) insertAfter(resources, placement('native'));
        }

        if (footer && article) footer.parentNode.insertBefore(placement('leaderboard'), footer);
    }

    function addSideRails() {
        var left = document.createElement('aside');
        left.className = 'ad-rail ad-rail-left';
        left.setAttribute('aria-label', 'Advertisement');
        var leftShell = document.createElement('div');
        leftShell.className = 'ad-frame-shell';
        leftShell.appendChild(frame('banner-160x600', 160, 600, '', 'Sponsored advertisement, 160 by 600'));
        left.appendChild(leftShell);

        var right = document.createElement('aside');
        right.className = 'ad-rail ad-rail-right';
        right.setAttribute('aria-label', 'Advertisement');
        var rightShell = document.createElement('div');
        rightShell.className = 'ad-frame-shell';
        rightShell.appendChild(frame('banner-160x300', 160, 300, '', 'Sponsored advertisement, 160 by 300'));
        right.appendChild(rightShell);

        document.body.appendChild(left);
        document.body.appendChild(right);
    }

    function addDirectLink() {
        var footer = document.querySelector('.site-footer');
        if (!footer) return;
        var link = document.createElement('a');
        link.className = 'ad-sponsored-link';
        link.href = DIRECT_LINK;
        link.target = '_blank';
        link.rel = 'sponsored nofollow noopener noreferrer';
        link.textContent = 'Sponsored link';
        insertAfter(footer, link);
    }

    function loadNetworkScript(src) {
        var script = document.createElement('script');
        script.async = true;
        script.src = src;
        document.body.appendChild(script);
    }

    function loadPageLevelAds() {
        loadNetworkScript('https://pl30526454.effectivecpmnetwork.com/21/9d/2a/219d2ad1543dd248860a9f53a9e6e355.js');
        loadNetworkScript('https://pl30526456.effectivecpmnetwork.com/8a/2a/2d/8a2a2dc69352f75f96cdac2f83d2d0a8.js');
    }

    function init() {
        addPagePlacements();
        addSideRails();
        addDirectLink();
        window.setTimeout(loadPageLevelAds, 2500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
}());
