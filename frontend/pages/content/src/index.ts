

(function monitorAmazonProductPage() {
    let lastCheckedUrl: string | null = localStorage.getItem('lastCheckedUrl');
    let isRedirecting = false;



    function isAmazonProductPage(url: string): boolean {
        const amazonProductRegex = /^https:\/\/www\.amazon\.com.*\/dp\/[A-Z0-9]{10}/;
        return amazonProductRegex.test(url);
    }

    function hasRequiredParams(url: string): boolean {
        const urlParams = new URL(url).searchParams;
        return urlParams.has('asc_source') && urlParams.has('tag');
    }

    function stripUrlParams(url: string): string {
        const urlObj = new URL(url);
        urlObj.search = ''; // Remove all query parameters
        urlObj.hash = ''; // Remove anchor tags
        let strippedUrl = urlObj.toString();
        if (strippedUrl.endsWith('/')) {
            strippedUrl = strippedUrl.slice(0, -1); // Remove the trailing slash
        }
        return strippedUrl;
    }

    function redirectToAffiliateUrl(currentUrl: string): void {

        const redirectUrl = currentUrl;
        alert('Redirecting to affiliate URL: ' + redirectUrl);
        isRedirecting = true;
        window.location.href = redirectUrl;

        // Stop the interval for 2 seconds
        setTimeout(() => {
            isRedirecting = false;
        }, 2000);
    }

    setInterval(() => {
        if (isRedirecting) return;

        const currentUrl = window.location.href;
        const currentStrippedUrl = stripUrlParams(currentUrl);
        if (currentStrippedUrl !== lastCheckedUrl && isAmazonProductPage(currentUrl) && currentUrl !== lastCheckedUrl && !currentUrl.includes(lastCheckedUrl || '') && !(lastCheckedUrl || currentStrippedUrl).includes(currentStrippedUrl || '')) {
            const strippedUrl = stripUrlParams(currentUrl);
            lastCheckedUrl = strippedUrl;
            localStorage.setItem('lastCheckedUrl', strippedUrl);

            if (!hasRequiredParams(currentUrl)) {
                redirectToAffiliateUrl(strippedUrl);
            }
        }
    }, 100);
})();