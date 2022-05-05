var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var convertTimestamp = function (timestamp) {
    var d = new Date(timestamp),
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),
        dd = ('0' + d.getDate()).slice(-2),
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),
        ampm = 'AM',
        time;

    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh === 0) {
        h = 12;
    }

    // ie: 2013-02-18, 8:35 AM
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

    return time;
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    } else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    } else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};

//</editor-fold>

app.controller('ScreenshotReportController', ['$scope', '$http', 'TitleService', function ($scope, $http, titleService) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    this.warningTime = 1400;
    this.dangerTime = 1900;
    this.totalDurationFormat = clientDefaults.totalDurationFormat;
    this.showTotalDurationIn = clientDefaults.showTotalDurationIn;

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
        if (initialColumnSettings.warningTime) {
            this.warningTime = initialColumnSettings.warningTime;
        }
        if (initialColumnSettings.dangerTime) {
            this.dangerTime = initialColumnSettings.dangerTime;
        }
    }


    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };
    this.hasNextScreenshot = function (index) {
        var old = index;
        return old !== this.getNextScreenshotIdx(index);
    };

    this.hasPreviousScreenshot = function (index) {
        var old = index;
        return old !== this.getPreviousScreenshotIdx(index);
    };
    this.getNextScreenshotIdx = function (index) {
        var next = index;
        var hit = false;
        while (next + 2 < this.results.length) {
            next++;
            if (this.results[next].screenShotFile && !this.results[next].pending) {
                hit = true;
                break;
            }
        }
        return hit ? next : index;
    };

    this.getPreviousScreenshotIdx = function (index) {
        var prev = index;
        var hit = false;
        while (prev > 0) {
            prev--;
            if (this.results[prev].screenShotFile && !this.results[prev].pending) {
                hit = true;
                break;
            }
        }
        return hit ? prev : index;
    };

    this.convertTimestamp = convertTimestamp;


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };

    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.totalDuration = function () {
        var sum = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.duration) {
                sum += result.duration;
            }
        }
        return sum;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };


    var results = [
    {
        "description": "should display welcome message|workspace-project App",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 12532,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Failed: No element found using locator: By(css selector, app-root h1)"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(css selector, app-root h1)\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)Error: \n    at ElementArrayFinder.applyAction_ (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as getText] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as getText] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:831:22)\n    at AppPage.getTitleText (D:\\AntencionMedicaFront\\e2e\\src\\app.po.ts:53:43)\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\app.e2e-spec.ts:13:17)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\nFrom: Task: Run it(\"should display welcome message\") in control flow\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\app.e2e-spec.ts:11:3)\n    at addSpecsToSuite (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\app.e2e-spec.ts:4:1)\n    at Module._compile (node:internal/modules/cjs/loader:1105:14)\n    at Module.m._compile (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1056:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)\n    at Object.require.extensions.<computed> [as .ts] (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1059:12)"
        ],
        "browserLogs": [],
        "screenShotFile": "002200ef-001b-0057-0088-000200b800fb.png",
        "timestamp": 1651767129236,
        "duration": 1585
    },
    {
        "description": "should display welcome message|workspace-project App",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 29568,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Failed: No element found using locator: By(css selector, app-root h1)"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(css selector, app-root h1)\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)Error: \n    at ElementArrayFinder.applyAction_ (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as getText] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as getText] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:831:22)\n    at AppPage.getTitleText (D:\\AntencionMedicaFront\\e2e\\src\\app.po.ts:53:43)\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\app.e2e-spec.ts:13:17)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\nFrom: Task: Run it(\"should display welcome message\") in control flow\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\app.e2e-spec.ts:11:3)\n    at addSpecsToSuite (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\app.e2e-spec.ts:4:1)\n    at Module._compile (node:internal/modules/cjs/loader:1105:14)\n    at Module.m._compile (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1056:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)\n    at Object.require.extensions.<computed> [as .ts] (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1059:12)"
        ],
        "browserLogs": [],
        "screenShotFile": "0003008c-0048-00ac-0064-000c00e1006d.png",
        "timestamp": 1651767175124,
        "duration": 1612
    },
    {
        "description": "should display welcome message|workspace-project App",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 4320,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Failed: No element found using locator: By(css selector, app-root h1)"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(css selector, app-root h1)\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)Error: \n    at ElementArrayFinder.applyAction_ (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as getText] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as getText] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:831:22)\n    at AppPage.getTitleText (D:\\AntencionMedicaFront\\e2e\\src\\app.po.ts:53:43)\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\app.e2e-spec.ts:13:17)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\nFrom: Task: Run it(\"should display welcome message\") in control flow\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\app.e2e-spec.ts:11:3)\n    at addSpecsToSuite (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\app.e2e-spec.ts:4:1)\n    at Module._compile (node:internal/modules/cjs/loader:1105:14)\n    at Module.m._compile (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1056:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)\n    at Object.require.extensions.<computed> [as .ts] (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1059:12)"
        ],
        "browserLogs": [],
        "screenShotFile": "00fe0018-00f0-007c-0099-00e700880000.png",
        "timestamp": 1651767213633,
        "duration": 1569
    },
    {
        "description": "should display welcome message|workspace-project App",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 24988,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Failed: No element found using locator: By(css selector, app-root h1)"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(css selector, app-root h1)\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)Error: \n    at ElementArrayFinder.applyAction_ (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as getText] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as getText] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:831:22)\n    at AppPage.getTitleText (D:\\AntencionMedicaFront\\e2e\\src\\app.po.ts:53:43)\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\app.e2e-spec.ts:13:17)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\nFrom: Task: Run it(\"should display welcome message\") in control flow\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\app.e2e-spec.ts:11:3)\n    at addSpecsToSuite (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\app.e2e-spec.ts:4:1)\n    at Module._compile (node:internal/modules/cjs/loader:1105:14)\n    at Module.m._compile (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1056:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)\n    at Object.require.extensions.<computed> [as .ts] (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1059:12)"
        ],
        "browserLogs": [],
        "screenShotFile": "00830083-00c9-0015-00db-002d001b00bb.png",
        "timestamp": 1651767265569,
        "duration": 1404
    },
    {
        "description": "should display welcome message|workspace-project App",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 14588,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Expected 'ATENCIÓN MEDICA' to equal 'Atencion Medica'."
        ],
        "trace": [
            "Error: Failed expectation\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\app.e2e-spec.ts:13:33)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7"
        ],
        "browserLogs": [],
        "screenShotFile": "0000004b-00e7-00e0-0013-0000008300d2.png",
        "timestamp": 1651767589997,
        "duration": 1850
    },
    {
        "description": "should display welcome message|workspace-project App",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 26956,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00b200a6-0087-00ad-0085-00db00bf0002.png",
        "timestamp": 1651767623507,
        "duration": 1136
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Usuario",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 24708,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Failed: Cannot read properties of null (reading 'ver')"
        ],
        "trace": [
            "TypeError: Cannot read properties of null (reading 'ver')\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\browser.js:714:56\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: Run it(\"Deberia redenrizarse correctamente\") in control flow\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\home.e2e.-spec.ts:15:3)\n    at addSpecsToSuite (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\home.e2e.-spec.ts:5:1)\n    at Module._compile (node:internal/modules/cjs/loader:1105:14)\n    at Module.m._compile (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1056:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)\n    at Object.require.extensions.<computed> [as .ts] (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1059:12)"
        ],
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "chrome-error://chromewebdata/ 6771:10 \"crbug/1173575, non-JS module files deprecated.\"",
                "timestamp": 1651769566174,
                "type": ""
            }
        ],
        "timestamp": 1651769561934,
        "duration": 13967
    },
    {
        "description": "Deberia redirigir a Usaurio|workspace-project Usuario",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 24708,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Failed: no such window: target window already closed\nfrom unknown error: web view not found\n  (Session info: chrome=101.0.4951.54)\n  (Driver info: chromedriver=101.0.4951.41 (93c720db8323b3ec10d056025ab95c23a31997c9-refs/branch-heads/4951@{#904}),platform=Windows NT 10.0.22000 x86_64)"
        ],
        "trace": [
            "NoSuchWindowError: no such window: target window already closed\nfrom unknown error: web view not found\n  (Session info: chrome=101.0.4951.54)\n  (Driver info: chromedriver=101.0.4951.41 (93c720db8323b3ec10d056025ab95c23a31997c9-refs/branch-heads/4951@{#904}),platform=Windows NT 10.0.22000 x86_64)\n    at Object.checkLegacyResponse (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\error.js:546:15)\n    at parseHttpResponse (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\http.js:509:13)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\http.js:441:30\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:807:17)\n    at Navigation.to (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:1133:25)\n    at Driver.get (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:988:28)\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\browser.js:673:32\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: Run it(\"Deberia redirigir a Usaurio\") in control flow\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\home.e2e.-spec.ts:23:3)\n    at addSpecsToSuite (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\home.e2e.-spec.ts:5:1)\n    at Module._compile (node:internal/modules/cjs/loader:1105:14)\n    at Module.m._compile (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1056:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)\n    at Object.require.extensions.<computed> [as .ts] (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1059:12)"
        ],
        "browserLogs": [],
        "timestamp": 1651769576281,
        "duration": 13
    },
    {
        "description": "Deberia redirigir a Doctor|workspace-project Usuario",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 24708,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Failed: no such window: target window already closed\nfrom unknown error: web view not found\n  (Session info: chrome=101.0.4951.54)\n  (Driver info: chromedriver=101.0.4951.41 (93c720db8323b3ec10d056025ab95c23a31997c9-refs/branch-heads/4951@{#904}),platform=Windows NT 10.0.22000 x86_64)"
        ],
        "trace": [
            "NoSuchWindowError: no such window: target window already closed\nfrom unknown error: web view not found\n  (Session info: chrome=101.0.4951.54)\n  (Driver info: chromedriver=101.0.4951.41 (93c720db8323b3ec10d056025ab95c23a31997c9-refs/branch-heads/4951@{#904}),platform=Windows NT 10.0.22000 x86_64)\n    at Object.checkLegacyResponse (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\error.js:546:15)\n    at parseHttpResponse (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\http.js:509:13)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\http.js:441:30\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:807:17)\n    at Navigation.to (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:1133:25)\n    at Driver.get (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:988:28)\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\browser.js:673:32\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: Run it(\"Deberia redirigir a Doctor\") in control flow\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\home.e2e.-spec.ts:29:3)\n    at addSpecsToSuite (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\home.e2e.-spec.ts:5:1)\n    at Module._compile (node:internal/modules/cjs/loader:1105:14)\n    at Module.m._compile (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1056:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)\n    at Object.require.extensions.<computed> [as .ts] (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1059:12)"
        ],
        "browserLogs": [],
        "timestamp": 1651769576320,
        "duration": 8
    },
    {
        "description": "Deberia redirigir a Cita|workspace-project Usuario",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 24708,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Failed: no such window: target window already closed\nfrom unknown error: web view not found\n  (Session info: chrome=101.0.4951.54)\n  (Driver info: chromedriver=101.0.4951.41 (93c720db8323b3ec10d056025ab95c23a31997c9-refs/branch-heads/4951@{#904}),platform=Windows NT 10.0.22000 x86_64)"
        ],
        "trace": [
            "NoSuchWindowError: no such window: target window already closed\nfrom unknown error: web view not found\n  (Session info: chrome=101.0.4951.54)\n  (Driver info: chromedriver=101.0.4951.41 (93c720db8323b3ec10d056025ab95c23a31997c9-refs/branch-heads/4951@{#904}),platform=Windows NT 10.0.22000 x86_64)\n    at Object.checkLegacyResponse (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\error.js:546:15)\n    at parseHttpResponse (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\http.js:509:13)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\http.js:441:30\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:807:17)\n    at Navigation.to (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:1133:25)\n    at Driver.get (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:988:28)\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\browser.js:673:32\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: Run it(\"Deberia redirigir a Cita\") in control flow\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\home.e2e.-spec.ts:35:3)\n    at addSpecsToSuite (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\home.e2e.-spec.ts:5:1)\n    at Module._compile (node:internal/modules/cjs/loader:1105:14)\n    at Module.m._compile (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1056:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)\n    at Object.require.extensions.<computed> [as .ts] (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1059:12)"
        ],
        "browserLogs": [],
        "timestamp": 1651769576358,
        "duration": 7
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Usuario",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 29540,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Failed: Cannot read properties of null (reading 'ver')"
        ],
        "trace": [
            "TypeError: Cannot read properties of null (reading 'ver')\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\browser.js:714:56\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: Run it(\"Deberia redenrizarse correctamente\") in control flow\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\home.e2e.-spec.ts:14:3)\n    at addSpecsToSuite (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\home.e2e.-spec.ts:5:1)\n    at Module._compile (node:internal/modules/cjs/loader:1105:14)\n    at Module.m._compile (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1056:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)\n    at Object.require.extensions.<computed> [as .ts] (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1059:12)"
        ],
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "chrome-error://chromewebdata/ 6771:10 \"crbug/1173575, non-JS module files deprecated.\"",
                "timestamp": 1651769737758,
                "type": ""
            }
        ],
        "timestamp": 1651769733519,
        "duration": 10974
    },
    {
        "description": "Deberia redirigir a Usaurio|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 29540,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00cc0069-005f-008a-00c5-00bf002600f8.png",
        "timestamp": 1651769744853,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a Doctor|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 29540,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "0092008c-0036-00e2-00fc-00b5009e0076.png",
        "timestamp": 1651769744882,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a Cita|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 29540,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "003e0064-0067-0008-00cb-000300b3001b.png",
        "timestamp": 1651769744908,
        "duration": 0
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Usuario",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 12220,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Failed: No element found using locator: By(css selector, *[id=\"Usuarios\"])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"Usuarios\"])\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)Error: \n    at ElementArrayFinder.applyAction_ (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as getText] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as getText] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:831:22)\n    at HomePage.getTitleFirstText (D:\\AntencionMedicaFront\\e2e\\src\\page\\home\\home.po.ts:9:32)\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\home.e2e.-spec.ts:16:10)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\nFrom: Task: Run it(\"Deberia redenrizarse correctamente\") in control flow\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\home.e2e.-spec.ts:14:3)\n    at addSpecsToSuite (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\home.e2e.-spec.ts:5:1)\n    at Module._compile (node:internal/modules/cjs/loader:1105:14)\n    at Module.m._compile (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1056:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)\n    at Object.require.extensions.<computed> [as .ts] (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1059:12)"
        ],
        "browserLogs": [],
        "screenShotFile": "00e50054-00fd-000a-0051-0006005400e6.png",
        "timestamp": 1651770011647,
        "duration": 1146
    },
    {
        "description": "Deberia redirigir a Usaurio|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 12220,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00e3005f-00cc-004b-0018-003400930033.png",
        "timestamp": 1651770013377,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a Doctor|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 12220,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00070062-00bc-00b9-006a-00dc001b005f.png",
        "timestamp": 1651770013402,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a Cita|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 12220,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "006d0019-003a-006e-0011-0017001700ab.png",
        "timestamp": 1651770013426,
        "duration": 0
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 11780,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00a100fc-003b-0078-00ce-0050004000f3.png",
        "timestamp": 1651770485863,
        "duration": 1317
    },
    {
        "description": "Deberia redirigir a Usaurio|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 11780,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00cb00e4-00c9-00ce-006e-00940087003a.png",
        "timestamp": 1651770487727,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a Doctor|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 11780,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "005c005d-0092-00f6-00d5-005400db001f.png",
        "timestamp": 1651770487755,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a Cita|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 11780,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00fb0081-0022-0033-000c-007e00540093.png",
        "timestamp": 1651770487779,
        "duration": 0
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 9600,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00f500d5-00cb-0022-0082-00a1002c0016.png",
        "timestamp": 1651777871732,
        "duration": 1
    },
    {
        "description": "Deberia redirigir a Usaurio|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 9600,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00e800c6-0058-0089-006e-00de00a60002.png",
        "timestamp": 1651777871978,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a Doctor|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 9600,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/doctores - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651777873573,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651777873597,
                "type": ""
            }
        ],
        "screenShotFile": "00a700cf-00cc-004f-009b-00c000fc00f4.png",
        "timestamp": 1651777872008,
        "duration": 1612
    },
    {
        "description": "Deberia redirigir a Cita|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 9600,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00760083-003a-0099-0069-0075006a001d.png",
        "timestamp": 1651777873982,
        "duration": 0
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 5284,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "0087000d-00db-00d7-00d8-0076000a00ed.png",
        "timestamp": 1651777921323,
        "duration": 1
    },
    {
        "description": "Deberia redirigir a Usaurio|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 5284,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00ba00e8-00e5-00bc-00b4-00e2005e00d2.png",
        "timestamp": 1651777921632,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a Doctor|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 5284,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00f5008a-0063-00d1-0011-001d005200d1.png",
        "timestamp": 1651777921699,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a Cita|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 5284,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651777923568,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651777923589,
                "type": ""
            }
        ],
        "screenShotFile": "00a60059-0060-0026-0068-00db002f000e.png",
        "timestamp": 1651777921743,
        "duration": 1868
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 26908,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00ba00b3-0086-00a9-0050-004000310015.png",
        "timestamp": 1651777933749,
        "duration": 1707
    },
    {
        "description": "Deberia redirigir a Usaurio|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 26908,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/usuarios - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651777936855,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651777936873,
                "type": ""
            }
        ],
        "screenShotFile": "00540067-00dd-00e5-0012-00f700a3004e.png",
        "timestamp": 1651777936105,
        "duration": 781
    },
    {
        "description": "Deberia redirigir a Doctor|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 26908,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/doctores - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651777937795,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651777937814,
                "type": ""
            }
        ],
        "screenShotFile": "00d10015-00c4-001f-0099-0075004a000e.png",
        "timestamp": 1651777937100,
        "duration": 725
    },
    {
        "description": "Deberia redirigir a Cita|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 26908,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651777938605,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651777938622,
                "type": ""
            }
        ],
        "screenShotFile": "001500a4-00be-00f7-008d-00a900a300a8.png",
        "timestamp": 1651777938044,
        "duration": 588
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Usuario",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 5800,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Expected 'http://localhost:4200/home' to contain '/usuario/listar'."
        ],
        "trace": [
            "Error: Failed expectation\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\usuario.e2e-spec.ts:20:37)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7"
        ],
        "browserLogs": [],
        "screenShotFile": "00d0008c-00ba-0093-00a1-00e5009a00f6.png",
        "timestamp": 1651779678750,
        "duration": 1260
    },
    {
        "description": "Deberia redirigir a Usaurio|workspace-project Usuario",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 5800,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Expected 'http://localhost:4200/doctor/listar' to contain '/usuario/crear'."
        ],
        "trace": [
            "Error: Failed expectation\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\usuario.e2e-spec.ts:26:37)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7"
        ],
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/doctores - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651779681293,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651779681309,
                "type": ""
            }
        ],
        "screenShotFile": "007c00a8-008e-00fe-00d9-009b00630066.png",
        "timestamp": 1651779680757,
        "duration": 560
    },
    {
        "description": "Deberia redirigir a Doctor|workspace-project Usuario",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 5800,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Expected 'http://localhost:4200/cita/listar' to contain '/doctor/actualizar'."
        ],
        "trace": [
            "Error: Failed expectation\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\usuario.e2e-spec.ts:32:37)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7"
        ],
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651779682053,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651779682068,
                "type": ""
            }
        ],
        "screenShotFile": "000200a7-00d7-003a-00b3-00e30015006a.png",
        "timestamp": 1651779681501,
        "duration": 579
    },
    {
        "description": "Deberia redirigir a Cita|workspace-project Usuario",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 5800,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Expected 'http://localhost:4200/cita/listar' to contain '/cita/eliminar'."
        ],
        "trace": [
            "Error: Failed expectation\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\usuario.e2e-spec.ts:38:37)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7"
        ],
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651779682815,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651779682830,
                "type": ""
            }
        ],
        "screenShotFile": "00650076-0075-00d7-006a-002000ad00db.png",
        "timestamp": 1651779682245,
        "duration": 595
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 19624,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "009800b9-0047-0075-0010-0011006f00ba.png",
        "timestamp": 1651779746400,
        "duration": 1435
    },
    {
        "description": "Deberia redirigir a Usaurio|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 19624,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00350084-00fb-006e-0048-002a003d0026.png",
        "timestamp": 1651779748361,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a Doctor|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 19624,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00680011-0072-0077-0045-00b300d2008a.png",
        "timestamp": 1651779748388,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a Cita|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 19624,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "000e006f-0029-00d7-00bf-00fb009a0057.png",
        "timestamp": 1651779748416,
        "duration": 0
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 14632,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "0097009e-00c8-00c1-001b-004e002500d2.png",
        "timestamp": 1651779939380,
        "duration": 1
    },
    {
        "description": "Deberia redirigir a Usaurio|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 14632,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "009b00e2-003e-0086-00ec-0049001700ca.png",
        "timestamp": 1651779939604,
        "duration": 1
    },
    {
        "description": "Deberia redirigir a Doctor|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 14632,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/doctores - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651779940902,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651779940916,
                "type": ""
            }
        ],
        "screenShotFile": "005500aa-0067-0071-005f-0017006800db.png",
        "timestamp": 1651779939636,
        "duration": 1292
    },
    {
        "description": "Deberia redirigir a Cita|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 14632,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00ed008a-0083-0076-004e-006c00800016.png",
        "timestamp": 1651779941128,
        "duration": 0
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 9508,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "007900c7-0063-003d-007d-004700970058.png",
        "timestamp": 1651779950306,
        "duration": 1
    },
    {
        "description": "Deberia redirigir a Usaurio|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 9508,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00b300c1-00b7-0036-001e-006e00c400b0.png",
        "timestamp": 1651779950529,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a Doctor|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 9508,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "007800d8-0083-00b7-0032-000c00af0023.png",
        "timestamp": 1651779950572,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a Cita|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 9508,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651779951837,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651779951853,
                "type": ""
            }
        ],
        "screenShotFile": "008e00ef-0016-0025-00a0-002600890067.png",
        "timestamp": 1651779950609,
        "duration": 1258
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 6276,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "009300d0-00a7-006c-0049-004f00210031.png",
        "timestamp": 1651779967001,
        "duration": 1
    },
    {
        "description": "Deberia redirigir a Usaurio|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 6276,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "000b0068-0041-0039-00b7-004c00fd0058.png",
        "timestamp": 1651779967320,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a Doctor|workspace-project Usuario",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 6276,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Expected 'http://localhost:4200/cita/listar' to contain '/usuario/actualizar'."
        ],
        "trace": [
            "Error: Failed expectation\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\usuario.e2e-spec.ts:32:37)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7"
        ],
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651779968644,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651779968662,
                "type": ""
            }
        ],
        "screenShotFile": "009a0053-0072-0070-0060-004b00450030.png",
        "timestamp": 1651779967362,
        "duration": 1315
    },
    {
        "description": "Deberia redirigir a Cita|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 6276,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "004b008d-00a2-00ea-00b8-00cb00960078.png",
        "timestamp": 1651779968885,
        "duration": 0
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 15792,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0090002a-0069-00e8-00b3-00ec0012001e.png",
        "timestamp": 1651780114798,
        "duration": 1524
    },
    {
        "description": "Deberia redirigir a Usaurio|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 15792,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "005d0005-003d-00cf-0056-0076009900b0.png",
        "timestamp": 1651780116894,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a usuario actualizar|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 15792,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00c000a1-00c5-00bd-006c-00f400a800c7.png",
        "timestamp": 1651780116953,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a usuairo eliminar|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 15792,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "003100c2-0000-0025-00eb-001a00ec00e0.png",
        "timestamp": 1651780116982,
        "duration": 0
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 16532,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "001c005b-00ed-0065-0055-00c10000003a.png",
        "timestamp": 1651780308610,
        "duration": 1699
    },
    {
        "description": "Deberia redirigir a home|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 16532,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00b0008e-0096-003d-00f2-00360067008f.png",
        "timestamp": 1651780310810,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a Usaurio|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 16532,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "006f0029-0040-0011-00a4-00d600ba006b.png",
        "timestamp": 1651780310844,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a usuario actualizar|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 16532,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00db005b-00c8-0088-0054-0070006100e9.png",
        "timestamp": 1651780310876,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a usuairo eliminar|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 16532,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00eb0092-003d-0068-000e-00620079000e.png",
        "timestamp": 1651780310906,
        "duration": 0
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 15588,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/usuarios - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651781670203,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651781670217,
                "type": ""
            }
        ],
        "screenShotFile": "009400f2-0095-00c2-004e-000200b30066.png",
        "timestamp": 1651781669589,
        "duration": 1011
    },
    {
        "description": "Deberia redirigir a home|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 15588,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "008c000d-00e6-00d1-0039-00f3004d0047.png",
        "timestamp": 1651781670925,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a Usaurio|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 15588,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "004a004e-0006-00f9-0090-004d009600ed.png",
        "timestamp": 1651781670955,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a usuario actualizar|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 15588,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "009b0058-008d-00b4-00d0-006d00280077.png",
        "timestamp": 1651781670986,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a usuairo eliminar|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 15588,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00870022-0065-0027-001d-00b7006f00e1.png",
        "timestamp": 1651781671016,
        "duration": 0
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Doctor",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 19624,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/doctores - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651782064512,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651782064526,
                "type": ""
            }
        ],
        "screenShotFile": "0054006e-00cd-00e5-002b-00cc002a000c.png",
        "timestamp": 1651782035677,
        "duration": 29160
    },
    {
        "description": "Deberia redirigir a home|workspace-project Doctor",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 19624,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"home\"])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"home\"])\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)Error: \n    at ElementArrayFinder.applyAction_ (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:831:22)\n    at DoctorPage.clickHomeButton (D:\\AntencionMedicaFront\\e2e\\src\\page\\doctor\\doctor.po.ts:26:27)\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\doctor.e2e-spec.ts:25:12)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)"
        ],
        "browserLogs": [],
        "screenShotFile": "00540061-00e9-0077-0046-00e5004900ce.png",
        "timestamp": 1651782065164,
        "duration": 792
    },
    {
        "description": "Deberia redirigir a doctor|workspace-project Doctor",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 19624,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"crear\"])",
            "Expected 'http://localhost:4200/home' to contain '/doctor/crear'."
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"crear\"])\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)Error: \n    at ElementArrayFinder.applyAction_ (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:831:22)\n    at DoctorPage.clickCrearButton (D:\\AntencionMedicaFront\\e2e\\src\\page\\doctor\\doctor.po.ts:30:28)\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\doctor.e2e-spec.ts:31:12)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)",
            "Error: Failed expectation\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\doctor.e2e-spec.ts:32:37)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7"
        ],
        "browserLogs": [],
        "screenShotFile": "004200cc-00a0-0039-00b6-0036009e0025.png",
        "timestamp": 1651782066137,
        "duration": 531
    },
    {
        "description": "Deberia redirigir a doctor actualizar|workspace-project Doctor",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 19624,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"actualizar\"])",
            "Expected 'http://localhost:4200/home' to contain '/doctor/actualizar'."
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"actualizar\"])\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)Error: \n    at ElementArrayFinder.applyAction_ (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:831:22)\n    at DoctorPage.clickActualizarButton (D:\\AntencionMedicaFront\\e2e\\src\\page\\doctor\\doctor.po.ts:34:33)\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\doctor.e2e-spec.ts:37:12)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)",
            "Error: Failed expectation\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\doctor.e2e-spec.ts:38:37)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7"
        ],
        "browserLogs": [],
        "screenShotFile": "008600a8-00d4-008e-0081-0041006c0025.png",
        "timestamp": 1651782066815,
        "duration": 494
    },
    {
        "description": "Deberia redirigir a usuairo eliminar|workspace-project Doctor",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 19624,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"eliminar\"])",
            "Expected 'http://localhost:4200/home' to contain '/doctor/eliminar'."
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"eliminar\"])\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)Error: \n    at ElementArrayFinder.applyAction_ (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:831:22)\n    at DoctorPage.clickEliminarButton (D:\\AntencionMedicaFront\\e2e\\src\\page\\doctor\\doctor.po.ts:38:31)\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\doctor.e2e-spec.ts:43:12)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)",
            "Error: Failed expectation\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\doctor.e2e-spec.ts:44:37)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7"
        ],
        "browserLogs": [],
        "screenShotFile": "009600cb-0005-0000-003c-00ae009300f5.png",
        "timestamp": 1651782067464,
        "duration": 474
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Doctor",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 20828,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00220070-0028-0017-00b7-00da0072001e.png",
        "timestamp": 1651782160210,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a home|workspace-project Doctor",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 20828,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00dc00e2-00ec-0003-0020-0003006900a3.png",
        "timestamp": 1651782160433,
        "duration": 0
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Doctor",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 19092,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00eb0022-0037-0077-00c9-00d600a70034.png",
        "timestamp": 1651782271763,
        "duration": 2
    },
    {
        "description": "Deberia redirigir a home|workspace-project Doctor",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 19092,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "005d00be-003f-0065-0095-0007001e001d.png",
        "timestamp": 1651782271980,
        "duration": 1
    },
    {
        "description": "Deberia redirigir a doctor|workspace-project Doctor",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 19092,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00c50097-0018-0036-0042-007600be0051.png",
        "timestamp": 1651782272024,
        "duration": 0
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 8000,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/usuarios - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651782437381,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651782437429,
                "type": ""
            }
        ],
        "screenShotFile": "0034000f-0032-00ef-00c8-00b50068002a.png",
        "timestamp": 1651782407768,
        "duration": 29800
    },
    {
        "description": "Deberia redirigir a home|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 8000,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/usuarios - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651782438691,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651782438739,
                "type": ""
            }
        ],
        "screenShotFile": "00960074-0060-0054-009b-00bc00630014.png",
        "timestamp": 1651782437875,
        "duration": 1099
    },
    {
        "description": "Deberia redirigir a Usaurio|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 8000,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/usuarios - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651782439815,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651782439863,
                "type": ""
            }
        ],
        "screenShotFile": "00940022-00e6-00a5-0047-0091005400e9.png",
        "timestamp": 1651782439138,
        "duration": 918
    },
    {
        "description": "Deberia redirigir a usuario actualizar|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 8000,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/usuarios - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651782441002,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651782441057,
                "type": ""
            }
        ],
        "screenShotFile": "003900b8-0095-00a1-00d8-0094003a004c.png",
        "timestamp": 1651782440190,
        "duration": 1081
    },
    {
        "description": "Deberia redirigir a usuairo eliminar|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 8000,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/usuarios - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651782442199,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651782442245,
                "type": ""
            }
        ],
        "screenShotFile": "00e30054-0013-0098-00e1-00c500960035.png",
        "timestamp": 1651782441407,
        "duration": 1045
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Doctor",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 13896,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/doctores - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651782666080,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651782666137,
                "type": ""
            }
        ],
        "screenShotFile": "00680037-00d6-00a8-00f0-004b006400a9.png",
        "timestamp": 1651782664163,
        "duration": 2233
    },
    {
        "description": "Deberia redirigir a home|workspace-project Doctor",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 13896,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/doctores - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651782667600,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651782667663,
                "type": ""
            }
        ],
        "screenShotFile": "00500004-005f-0083-00d4-00e3005d00a4.png",
        "timestamp": 1651782666734,
        "duration": 1126
    },
    {
        "description": "Deberia redirigir a doctor|workspace-project Doctor",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 13896,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/doctores - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651782668871,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651782668923,
                "type": ""
            }
        ],
        "screenShotFile": "00510024-0021-00f8-0040-0012007e0089.png",
        "timestamp": 1651782668016,
        "duration": 1204
    },
    {
        "description": "Deberia redirigir a doctor actualizar|workspace-project Doctor",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 13896,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/doctores - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651782670113,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651782670161,
                "type": ""
            }
        ],
        "screenShotFile": "00110097-00d1-0038-0021-00bc00bb0099.png",
        "timestamp": 1651782669337,
        "duration": 924
    },
    {
        "description": "Deberia redirigir a usuairo eliminar|workspace-project Doctor",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 13896,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/doctores - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651782671347,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651782671401,
                "type": ""
            }
        ],
        "screenShotFile": "00360031-0004-0001-00a0-0023009400ed.png",
        "timestamp": 1651782670393,
        "duration": 1341
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Cita",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 13168,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651782947022,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651782947071,
                "type": ""
            }
        ],
        "screenShotFile": "00b4003e-00b6-0049-00b3-001f00b400e9.png",
        "timestamp": 1651782945124,
        "duration": 2185
    },
    {
        "description": "Deberia redirigir a home|workspace-project Cita",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 13168,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651782948371,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651782948417,
                "type": ""
            }
        ],
        "screenShotFile": "00320033-0078-00fa-0079-00100026003f.png",
        "timestamp": 1651782947639,
        "duration": 995
    },
    {
        "description": "Deberia redirigir a cita|workspace-project Cita",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 13168,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651782949659,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651782949706,
                "type": ""
            }
        ],
        "screenShotFile": "00dc00fe-007f-00fe-00b1-009b00c30046.png",
        "timestamp": 1651782948998,
        "duration": 922
    },
    {
        "description": "Deberia redirigir a cita actualizar|workspace-project Cita",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 13168,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651782950856,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651782950903,
                "type": ""
            }
        ],
        "screenShotFile": "00780046-00ce-0082-00aa-008600b300de.png",
        "timestamp": 1651782950114,
        "duration": 998
    },
    {
        "description": "Deberia redirigir a usuairo eliminar|workspace-project Cita",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 13168,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651782952049,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651782952100,
                "type": ""
            }
        ],
        "screenShotFile": "009b00be-00c9-0023-00dd-00d700450099.png",
        "timestamp": 1651782951277,
        "duration": 1042
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Cita",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 2344,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Failed: Cannot read properties of null (reading 'ver')"
        ],
        "trace": [
            "TypeError: Cannot read properties of null (reading 'ver')\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\browser.js:714:56\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: Run it(\"Deberia redenrizarse correctamente\") in control flow\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\cita.e2e-spec.ts:14:3)\n    at addSpecsToSuite (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\cita.e2e-spec.ts:5:1)\n    at Module._compile (node:internal/modules/cjs/loader:1105:14)\n    at Module.m._compile (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1056:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)\n    at Object.require.extensions.<computed> [as .ts] (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1059:12)"
        ],
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "chrome-error://chromewebdata/ 6771:10 \"crbug/1173575, non-JS module files deprecated.\"",
                "timestamp": 1651783043056,
                "type": ""
            }
        ],
        "timestamp": 1651783038877,
        "duration": 6859
    },
    {
        "description": "Deberia redirigir a home|workspace-project Cita",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 2344,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Failed: no such window: target window already closed\nfrom unknown error: web view not found\n  (Session info: chrome=101.0.4951.54)\n  (Driver info: chromedriver=101.0.4951.41 (93c720db8323b3ec10d056025ab95c23a31997c9-refs/branch-heads/4951@{#904}),platform=Windows NT 10.0.22000 x86_64)"
        ],
        "trace": [
            "NoSuchWindowError: no such window: target window already closed\nfrom unknown error: web view not found\n  (Session info: chrome=101.0.4951.54)\n  (Driver info: chromedriver=101.0.4951.41 (93c720db8323b3ec10d056025ab95c23a31997c9-refs/branch-heads/4951@{#904}),platform=Windows NT 10.0.22000 x86_64)\n    at Object.checkLegacyResponse (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\error.js:546:15)\n    at parseHttpResponse (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\http.js:509:13)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\http.js:441:30\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:807:17)\n    at Navigation.to (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:1133:25)\n    at Driver.get (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:988:28)\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\browser.js:673:32\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: Run it(\"Deberia redirigir a home\") in control flow\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\cita.e2e-spec.ts:24:3)\n    at addSpecsToSuite (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\cita.e2e-spec.ts:5:1)\n    at Module._compile (node:internal/modules/cjs/loader:1105:14)\n    at Module.m._compile (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1056:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)\n    at Object.require.extensions.<computed> [as .ts] (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1059:12)"
        ],
        "browserLogs": [],
        "timestamp": 1651783046028,
        "duration": 7
    },
    {
        "description": "Deberia redirigir a cita|workspace-project Cita",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 2344,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Failed: no such window: target window already closed\nfrom unknown error: web view not found\n  (Session info: chrome=101.0.4951.54)\n  (Driver info: chromedriver=101.0.4951.41 (93c720db8323b3ec10d056025ab95c23a31997c9-refs/branch-heads/4951@{#904}),platform=Windows NT 10.0.22000 x86_64)"
        ],
        "trace": [
            "NoSuchWindowError: no such window: target window already closed\nfrom unknown error: web view not found\n  (Session info: chrome=101.0.4951.54)\n  (Driver info: chromedriver=101.0.4951.41 (93c720db8323b3ec10d056025ab95c23a31997c9-refs/branch-heads/4951@{#904}),platform=Windows NT 10.0.22000 x86_64)\n    at Object.checkLegacyResponse (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\error.js:546:15)\n    at parseHttpResponse (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\http.js:509:13)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\http.js:441:30\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:807:17)\n    at Navigation.to (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:1133:25)\n    at Driver.get (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:988:28)\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\browser.js:673:32\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: Run it(\"Deberia redirigir a cita\") in control flow\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\cita.e2e-spec.ts:31:3)\n    at addSpecsToSuite (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\cita.e2e-spec.ts:5:1)\n    at Module._compile (node:internal/modules/cjs/loader:1105:14)\n    at Module.m._compile (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1056:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)\n    at Object.require.extensions.<computed> [as .ts] (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1059:12)"
        ],
        "browserLogs": [],
        "timestamp": 1651783046076,
        "duration": 5
    },
    {
        "description": "Deberia redirigir a cita actualizar|workspace-project Cita",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 2344,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Failed: no such window: target window already closed\nfrom unknown error: web view not found\n  (Session info: chrome=101.0.4951.54)\n  (Driver info: chromedriver=101.0.4951.41 (93c720db8323b3ec10d056025ab95c23a31997c9-refs/branch-heads/4951@{#904}),platform=Windows NT 10.0.22000 x86_64)"
        ],
        "trace": [
            "NoSuchWindowError: no such window: target window already closed\nfrom unknown error: web view not found\n  (Session info: chrome=101.0.4951.54)\n  (Driver info: chromedriver=101.0.4951.41 (93c720db8323b3ec10d056025ab95c23a31997c9-refs/branch-heads/4951@{#904}),platform=Windows NT 10.0.22000 x86_64)\n    at Object.checkLegacyResponse (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\error.js:546:15)\n    at parseHttpResponse (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\http.js:509:13)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\http.js:441:30\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:807:17)\n    at Navigation.to (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:1133:25)\n    at Driver.get (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:988:28)\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\browser.js:673:32\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: Run it(\"Deberia redirigir a cita actualizar\") in control flow\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\cita.e2e-spec.ts:38:3)\n    at addSpecsToSuite (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\cita.e2e-spec.ts:5:1)\n    at Module._compile (node:internal/modules/cjs/loader:1105:14)\n    at Module.m._compile (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1056:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)\n    at Object.require.extensions.<computed> [as .ts] (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1059:12)"
        ],
        "browserLogs": [],
        "timestamp": 1651783046131,
        "duration": 7
    },
    {
        "description": "Deberia redirigir a usuairo eliminar|workspace-project Cita",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 2344,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Failed: no such window: target window already closed\nfrom unknown error: web view not found\n  (Session info: chrome=101.0.4951.54)\n  (Driver info: chromedriver=101.0.4951.41 (93c720db8323b3ec10d056025ab95c23a31997c9-refs/branch-heads/4951@{#904}),platform=Windows NT 10.0.22000 x86_64)"
        ],
        "trace": [
            "NoSuchWindowError: no such window: target window already closed\nfrom unknown error: web view not found\n  (Session info: chrome=101.0.4951.54)\n  (Driver info: chromedriver=101.0.4951.41 (93c720db8323b3ec10d056025ab95c23a31997c9-refs/branch-heads/4951@{#904}),platform=Windows NT 10.0.22000 x86_64)\n    at Object.checkLegacyResponse (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\error.js:546:15)\n    at parseHttpResponse (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\http.js:509:13)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\http.js:441:30\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: WebDriver.navigate().to(data:text/html,<html></html>)\n    at Driver.schedule (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:807:17)\n    at Navigation.to (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:1133:25)\n    at Driver.get (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\webdriver.js:988:28)\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\browser.js:673:32\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: Run it(\"Deberia redirigir a usuairo eliminar\") in control flow\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\cita.e2e-spec.ts:45:3)\n    at addSpecsToSuite (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\cita.e2e-spec.ts:5:1)\n    at Module._compile (node:internal/modules/cjs/loader:1105:14)\n    at Module.m._compile (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1056:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)\n    at Object.require.extensions.<computed> [as .ts] (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1059:12)"
        ],
        "browserLogs": [],
        "timestamp": 1651783046189,
        "duration": 6
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Cita",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 15992,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651783096872,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651783096925,
                "type": ""
            }
        ],
        "screenShotFile": "00190088-00b7-00d7-007f-009e00cf0058.png",
        "timestamp": 1651783095157,
        "duration": 2020
    },
    {
        "description": "Deberia redirigir a home|workspace-project Cita",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 15992,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651783098344,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651783098391,
                "type": ""
            }
        ],
        "screenShotFile": "00f6002d-00fd-008f-00b0-008a006400fb.png",
        "timestamp": 1651783097533,
        "duration": 1054
    },
    {
        "description": "Deberia redirigir a cita|workspace-project Cita",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 15992,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651783099826,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651783099883,
                "type": ""
            }
        ],
        "screenShotFile": "00b800b0-0016-0003-00a2-00fd00d200bb.png",
        "timestamp": 1651783098950,
        "duration": 1140
    },
    {
        "description": "Deberia redirigir a cita actualizar|workspace-project Cita",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 15992,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651783101292,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651783101348,
                "type": ""
            }
        ],
        "screenShotFile": "002700e5-0072-0071-0038-00370060003f.png",
        "timestamp": 1651783100314,
        "duration": 1249
    },
    {
        "description": "Deberia redirigir a usuairo eliminar|workspace-project Cita",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 15992,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651783102796,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651783102855,
                "type": ""
            }
        ],
        "screenShotFile": "002200bc-0020-0024-00a6-0042003400b0.png",
        "timestamp": 1651783101755,
        "duration": 1202
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Cita",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 14512,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00ba0087-0032-0058-00ce-00b600320004.png",
        "timestamp": 1651783425851,
        "duration": 1
    },
    {
        "description": "Deberia redirigir a home|workspace-project Cita",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 14512,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00ca0001-00e0-0087-0073-00cd0008000f.png",
        "timestamp": 1651783426082,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a cita|workspace-project Cita",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 14512,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00330017-00e8-00ff-008c-0068005e0058.png",
        "timestamp": 1651783426143,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a cita actualizar|workspace-project Cita",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 14512,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00570082-000a-0039-00a0-0036008600f9.png",
        "timestamp": 1651783426190,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a usuairo eliminar|workspace-project Cita",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 14512,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Failed: Cannot read properties of null (reading 'ver')"
        ],
        "trace": [
            "TypeError: Cannot read properties of null (reading 'ver')\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\browser.js:714:56\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: Run it(\"Deberia redirigir a usuairo eliminar\") in control flow\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\cita.e2e-spec.ts:45:3)\n    at addSpecsToSuite (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\cita.e2e-spec.ts:5:1)\n    at Module._compile (node:internal/modules/cjs/loader:1105:14)\n    at Module.m._compile (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1056:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)\n    at Object.require.extensions.<computed> [as .ts] (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1059:12)"
        ],
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "chrome-error://chromewebdata/ 6771:10 \"crbug/1173575, non-JS module files deprecated.\"",
                "timestamp": 1651783430405,
                "type": ""
            }
        ],
        "timestamp": 1651783426238,
        "duration": 9941
    },
    {
        "description": "Deberia ir a eliminar usuario|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 8772,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/usuarios/1 - Failed to load resource: the server responded with a status of 504 (Gateway Timeout)",
                "timestamp": 1651786511876,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651786511891,
                "type": ""
            }
        ],
        "screenShotFile": "003d002d-001b-004e-0092-0017000400d2.png",
        "timestamp": 1651786510656,
        "duration": 1244
    },
    {
        "description": "Deberia no iniciar sesion (credenciales incorrectas)|workspace-project Usuario",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 8772,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00560057-0065-00a7-0015-003c00c900d6.png",
        "timestamp": 1651786512341,
        "duration": 0
    },
    {
        "description": "Deberia ir a eliminar usuario|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 3520,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00360032-0040-0076-00e6-00f500e7002e.png",
        "timestamp": 1651787028262,
        "duration": 1452
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Doctor",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 25252,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00040082-00f8-00ca-00c9-00ce00b50055.png",
        "timestamp": 1651787609936,
        "duration": 1228
    },
    {
        "description": "Deberia redirigir a home|workspace-project Doctor",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 25252,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00ca0007-0018-003c-00e2-00e8004d00de.png",
        "timestamp": 1651787611523,
        "duration": 539
    },
    {
        "description": "Deberia redirigir a doctor|workspace-project Doctor",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 25252,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0042000e-00f5-0049-00d6-0053002b00c0.png",
        "timestamp": 1651787612239,
        "duration": 488
    },
    {
        "description": "Deberia redirigir a doctor actualizar|workspace-project Doctor",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 25252,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00280004-0015-0061-0078-002c003c00f5.png",
        "timestamp": 1651787612948,
        "duration": 581
    },
    {
        "description": "Deberia redirigir a usuairo eliminar|workspace-project Doctor",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 25252,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00930069-0027-0041-0079-009f00c30023.png",
        "timestamp": 1651787613720,
        "duration": 584
    },
    {
        "description": "Deberia redenrizarse correctamente|workspace-project Cita",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 9924,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00080013-009a-00d9-00aa-001700ae00b0.png",
        "timestamp": 1651787698624,
        "duration": 1
    },
    {
        "description": "Deberia redirigir a home|workspace-project Cita",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 9924,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "00e30032-00df-001a-0070-004d00260056.png",
        "timestamp": 1651787698856,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a cita|workspace-project Cita",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 9924,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "005f0070-0037-00c4-004f-008800940052.png",
        "timestamp": 1651787698909,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a cita actualizar|workspace-project Cita",
        "passed": false,
        "pending": true,
        "os": "Windows",
        "instanceId": 9924,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Pending",
        "browserLogs": [],
        "screenShotFile": "0004003c-000c-00c5-0078-001a004a003c.png",
        "timestamp": 1651787698980,
        "duration": 0
    },
    {
        "description": "Deberia redirigir a usuairo eliminar|workspace-project Cita",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 9924,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00bb00e2-004e-0004-0068-00af00f800f9.png",
        "timestamp": 1651787699058,
        "duration": 1246
    },
    {
        "description": "Deberia ir a eliminar doctor|workspace-project Doctor",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 10020,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"eliminar\"])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"eliminar\"])\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)Error: \n    at ElementArrayFinder.applyAction_ (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:831:22)\n    at EliminarDoctorPage.eliminar (D:\\AntencionMedicaFront\\e2e\\src\\page\\doctor\\eliminarDocotor.po.ts:14:29)\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\eliminarDoctor.e2e-spec.ts:17:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)"
        ],
        "browserLogs": [],
        "screenShotFile": "006b0030-00ba-0071-0059-0004007e0052.png",
        "timestamp": 1651787963055,
        "duration": 1137
    },
    {
        "description": "Deberia ir a eliminar doctor|workspace-project Doctor",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 17544,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"eliminar\"])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"eliminar\"])\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)Error: \n    at ElementArrayFinder.applyAction_ (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:831:22)\n    at EliminarDoctorPage.eliminar (D:\\AntencionMedicaFront\\e2e\\src\\page\\doctor\\eliminarDocotor.po.ts:14:29)\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\eliminarDoctor.e2e-spec.ts:17:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)"
        ],
        "browserLogs": [],
        "screenShotFile": "00c200d7-008d-0047-0030-004c002400d8.png",
        "timestamp": 1651787977640,
        "duration": 1073
    },
    {
        "description": "Deberia ir a eliminar doctor|workspace-project Doctor",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 21128,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"eliminar\"])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"eliminar\"])\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)Error: \n    at ElementArrayFinder.applyAction_ (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:831:22)\n    at EliminarDoctorPage.eliminar (D:\\AntencionMedicaFront\\e2e\\src\\page\\doctor\\eliminarDocotor.po.ts:14:29)\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\eliminarDoctor.e2e-spec.ts:17:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)"
        ],
        "browserLogs": [],
        "screenShotFile": "00d400dc-0043-00f2-00b1-009600d800ee.png",
        "timestamp": 1651788038417,
        "duration": 1185
    },
    {
        "description": "Deberia ir a eliminar doctor|workspace-project Doctor",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 21080,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00ad0059-0095-00f6-00dc-00b2001800dd.png",
        "timestamp": 1651788105242,
        "duration": 1600
    },
    {
        "description": "Deberia ir a eliminar cita|workspace-project Cita",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 18708,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00270010-00a6-00dc-0003-006d00140082.png",
        "timestamp": 1651788303121,
        "duration": 1360
    },
    {
        "description": "Deberia ir a Crear doctor|workspace-project Doctor",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 11932,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Expected 'http://localhost:4200/doctor/crear' to contain '/doctor/Crear'."
        ],
        "trace": [
            "Error: Failed expectation\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\crearDoctor.e2e-spec.ts:20:37)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7"
        ],
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/doctores/crear - Failed to load resource: the server responded with a status of 400 (Bad Request)",
                "timestamp": 1651789128158,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651789128158,
                "type": ""
            }
        ],
        "screenShotFile": "00090057-009a-002c-00b9-005c00590013.png",
        "timestamp": 1651789126785,
        "duration": 1385
    },
    {
        "description": "Deberia ir a Crear doctor|workspace-project Doctor",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 28860,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Expected 'http://localhost:4200/doctor/crear' to contain '/doctor/Crear'."
        ],
        "trace": [
            "Error: Failed expectation\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\crearDoctor.e2e-spec.ts:20:37)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7"
        ],
        "browserLogs": [],
        "screenShotFile": "001a0008-00ee-0098-0081-004400b200d7.png",
        "timestamp": 1651789163186,
        "duration": 1332
    },
    {
        "description": "Deberia ir a Crear doctor|workspace-project Doctor",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 18464,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Expected 'http://localhost:4200/doctor/crear' to contain '/doctor/Crear'."
        ],
        "trace": [
            "Error: Failed expectation\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\crearDoctor.e2e-spec.ts:20:37)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2974:25\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7"
        ],
        "browserLogs": [],
        "screenShotFile": "00e600f2-00a4-0054-007a-00fc001a00b1.png",
        "timestamp": 1651789206789,
        "duration": 1423
    },
    {
        "description": "Deberia ir a Crear doctor|workspace-project Doctor",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 16544,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "006400a6-00ef-00c6-00dc-003e007a0092.png",
        "timestamp": 1651789325727,
        "duration": 1365
    },
    {
        "description": "Deberia ir a Actualizar doctor|workspace-project Doctor",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 2344,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/doctores/1 - Failed to load resource: the server responded with a status of 400 (Bad Request)",
                "timestamp": 1651789752747,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651789752748,
                "type": ""
            }
        ],
        "screenShotFile": "00d20018-000f-0049-00dd-00170055000b.png",
        "timestamp": 1651789751287,
        "duration": 1484
    },
    {
        "description": "Deberia ir a Actualizar usuario|workspace-project Usuario",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 11236,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"actualizar\"])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"actualizar\"])\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)Error: \n    at ElementArrayFinder.applyAction_ (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:831:22)\n    at ActualizarUsuarioPage.actualizar (D:\\AntencionMedicaFront\\e2e\\src\\page\\usuario\\actualizarUsuario.po.ts:19:31)\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\actualizarUsuario.e2e-spec.ts:18:23)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)"
        ],
        "browserLogs": [],
        "screenShotFile": "008900e6-0005-00b7-0077-00f1001f006a.png",
        "timestamp": 1651790202348,
        "duration": 1244
    },
    {
        "description": "Deberia ir a Actualizar usuario|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 7876,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/usuarios/1 - Failed to load resource: the server responded with a status of 400 (Bad Request)",
                "timestamp": 1651790264196,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651790264196,
                "type": ""
            }
        ],
        "screenShotFile": "000500e7-0054-002c-0079-002e00b900e7.png",
        "timestamp": 1651790262636,
        "duration": 1575
    },
    {
        "description": "Deberia ir a Agregar usuario|workspace-project Usuario",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 8440,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"actualizar\"])"
        ],
        "trace": [
            "NoSuchElementError: No element found using locator: By(css selector, *[id=\"actualizar\"])\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:814:27\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)Error: \n    at ElementArrayFinder.applyAction_ (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:459:27)\n    at ElementArrayFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:91:29)\n    at ElementFinder.<computed> [as click] (D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\element.js:831:22)\n    at AgregarUsuarioPage.agregar (D:\\AntencionMedicaFront\\e2e\\src\\page\\usuario\\crearUsuario.po.ts:15:28)\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\crearUsuario.e2e-spec.ts:17:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:112:25\n    at new ManagedPromise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1077:7)\n    at ControlFlow.promise (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2505:12)\n    at schedulerExecute (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:95:18)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)"
        ],
        "browserLogs": [],
        "screenShotFile": "002400b4-00a2-003c-00b7-00b800bf004f.png",
        "timestamp": 1651790553651,
        "duration": 1135
    },
    {
        "description": "Deberia ir a Agregar usuario|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 22496,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00b80048-009b-00c9-00cb-00c900c50018.png",
        "timestamp": 1651790579638,
        "duration": 1403
    },
    {
        "description": "Deberia ir a Actualizar cita|workspace-project Cita",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 1592,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas/1 - Failed to load resource: the server responded with a status of 400 (Bad Request)",
                "timestamp": 1651791677795,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651791677795,
                "type": ""
            }
        ],
        "screenShotFile": "00560078-0017-00cb-0005-00f8001900fe.png",
        "timestamp": 1651791676102,
        "duration": 1704
    },
    {
        "description": "Deberia ir a Crear cita|workspace-project Cita",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 8404,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas/crear - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1651792223002,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651792223002,
                "type": ""
            }
        ],
        "screenShotFile": "002100c8-00a8-002e-00db-00f800c300ea.png",
        "timestamp": 1651792220717,
        "duration": 2303
    },
    {
        "description": "Deberia ir a Crear cita|workspace-project Cita",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 27220,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/AtencionMedica/citas/crear - Failed to load resource: the server responded with a status of 500 (Internal Server Error)",
                "timestamp": 1651792299835,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "http://localhost:4200/main.js 1956:27 \"Error inesperado:\\n\" Object",
                "timestamp": 1651792299835,
                "type": ""
            }
        ],
        "screenShotFile": "00e2005f-007b-00d6-00fb-00df00530066.png",
        "timestamp": 1651792297618,
        "duration": 2239
    },
    {
        "description": "Deberia ir a Agregar usuario|workspace-project Usuario",
        "passed": false,
        "pending": false,
        "os": "Windows",
        "instanceId": 5336,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": [
            "Failed: Cannot read properties of null (reading 'ver')"
        ],
        "trace": [
            "TypeError: Cannot read properties of null (reading 'ver')\n    at D:\\AntencionMedicaFront\\node_modules\\protractor\\built\\browser.js:714:56\n    at ManagedPromise.invokeCallback_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:1376:14)\n    at TaskQueue.execute_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3084:14)\n    at TaskQueue.executeNext_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:3067:27)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2927:27\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:668:7\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: Run it(\"Deberia ir a Agregar usuario\") in control flow\n    at UserContext.<anonymous> (D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:94:19)\n    at attempt (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4297:26)\n    at QueueRunner.run (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4217:20)\n    at runNext (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4257:20)\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4264:13\n    at D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4172:9\n    at D:\\AntencionMedicaFront\\node_modules\\jasminewd2\\index.js:64:48\n    at ControlFlow.emit (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\events.js:62:21)\n    at ControlFlow.shutdown_ (D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2674:10)\n    at D:\\AntencionMedicaFront\\node_modules\\selenium-webdriver\\lib\\promise.js:2599:53\nFrom asynchronous test: \nError: \n    at Suite.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\crearUsuario.e2e-spec.ts:14:3)\n    at addSpecsToSuite (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1107:25)\n    at Env.describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:1074:7)\n    at describe (D:\\AntencionMedicaFront\\node_modules\\jasmine\\node_modules\\jasmine-core\\lib\\jasmine-core\\jasmine.js:4399:18)\n    at Object.<anonymous> (D:\\AntencionMedicaFront\\e2e\\src\\test\\crearUsuario.e2e-spec.ts:5:1)\n    at Module._compile (node:internal/modules/cjs/loader:1105:14)\n    at Module.m._compile (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1056:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1159:10)\n    at Object.require.extensions.<computed> [as .ts] (D:\\AntencionMedicaFront\\node_modules\\ts-node\\src\\index.ts:1059:12)"
        ],
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "chrome-error://chromewebdata/ 6771:10 \"crbug/1173575, non-JS module files deprecated.\"",
                "timestamp": 1651793060761,
                "type": ""
            }
        ],
        "timestamp": 1651793056464,
        "duration": 8846
    },
    {
        "description": "Deberia ir a Agregar usuario|workspace-project Usuario",
        "passed": true,
        "pending": false,
        "os": "Windows",
        "instanceId": 16724,
        "browser": {
            "name": "chrome",
            "version": "101.0.4951.54"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00bb0088-00ad-00cc-0024-0094003d004e.png",
        "timestamp": 1651793203460,
        "duration": 1691
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});

    };

    this.setTitle = function () {
        var title = $('.report-title').text();
        titleService.setTitle(title);
    };

    // is run after all test data has been prepared/loaded
    this.afterLoadingJobs = function () {
        this.sortSpecs();
        this.setTitle();
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    } else {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.afterLoadingJobs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.afterLoadingJobs();
    }

}]);

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

//formats millseconds to h m s
app.filter('timeFormat', function () {
    return function (tr, fmt) {
        if(tr == null){
            return "NaN";
        }

        switch (fmt) {
            case 'h':
                var h = tr / 1000 / 60 / 60;
                return "".concat(h.toFixed(2)).concat("h");
            case 'm':
                var m = tr / 1000 / 60;
                return "".concat(m.toFixed(2)).concat("min");
            case 's' :
                var s = tr / 1000;
                return "".concat(s.toFixed(2)).concat("s");
            case 'hm':
            case 'h:m':
                var hmMt = tr / 1000 / 60;
                var hmHr = Math.trunc(hmMt / 60);
                var hmMr = hmMt - (hmHr * 60);
                if (fmt === 'h:m') {
                    return "".concat(hmHr).concat(":").concat(hmMr < 10 ? "0" : "").concat(Math.round(hmMr));
                }
                return "".concat(hmHr).concat("h ").concat(hmMr.toFixed(2)).concat("min");
            case 'hms':
            case 'h:m:s':
                var hmsS = tr / 1000;
                var hmsHr = Math.trunc(hmsS / 60 / 60);
                var hmsM = hmsS / 60;
                var hmsMr = Math.trunc(hmsM - hmsHr * 60);
                var hmsSo = hmsS - (hmsHr * 60 * 60) - (hmsMr*60);
                if (fmt === 'h:m:s') {
                    return "".concat(hmsHr).concat(":").concat(hmsMr < 10 ? "0" : "").concat(hmsMr).concat(":").concat(hmsSo < 10 ? "0" : "").concat(Math.round(hmsSo));
                }
                return "".concat(hmsHr).concat("h ").concat(hmsMr).concat("min ").concat(hmsSo.toFixed(2)).concat("s");
            case 'ms':
                var msS = tr / 1000;
                var msMr = Math.trunc(msS / 60);
                var msMs = msS - (msMr * 60);
                return "".concat(msMr).concat("min ").concat(msMs.toFixed(2)).concat("s");
        }

        return tr;
    };
});


function PbrStackModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;
    ctrl.convertTimestamp = convertTimestamp;
    ctrl.isValueAnArray = isValueAnArray;
    ctrl.toggleSmartStackTraceHighlight = function () {
        var inv = !ctrl.rootScope.showSmartStackTraceHighlight;
        ctrl.rootScope.showSmartStackTraceHighlight = inv;
    };
    ctrl.applySmartHighlight = function (line) {
        if ($rootScope.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return '';
    };
}


app.component('pbrStackModal', {
    templateUrl: "pbr-stack-modal.html",
    bindings: {
        index: '=',
        data: '='
    },
    controller: PbrStackModalController
});

function PbrScreenshotModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;

    /**
     * Updates which modal is selected.
     */
    this.updateSelectedModal = function (event, index) {
        var key = event.key; //try to use non-deprecated key first https://developer.mozilla.org/de/docs/Web/API/KeyboardEvent/keyCode
        if (key == null) {
            var keyMap = {
                37: 'ArrowLeft',
                39: 'ArrowRight'
            };
            key = keyMap[event.keyCode]; //fallback to keycode
        }
        if (key === "ArrowLeft" && this.hasPrevious) {
            this.showHideModal(index, this.previous);
        } else if (key === "ArrowRight" && this.hasNext) {
            this.showHideModal(index, this.next);
        }
    };

    /**
     * Hides the modal with the #oldIndex and shows the modal with the #newIndex.
     */
    this.showHideModal = function (oldIndex, newIndex) {
        const modalName = '#imageModal';
        $(modalName + oldIndex).modal("hide");
        $(modalName + newIndex).modal("show");
    };

}

app.component('pbrScreenshotModal', {
    templateUrl: "pbr-screenshot-modal.html",
    bindings: {
        index: '=',
        data: '=',
        next: '=',
        previous: '=',
        hasNext: '=',
        hasPrevious: '='
    },
    controller: PbrScreenshotModalController
});

app.factory('TitleService', ['$document', function ($document) {
    return {
        setTitle: function (title) {
            $document[0].title = title;
        }
    };
}]);


app.run(
    function ($rootScope, $templateCache) {
        //make sure this option is on by default
        $rootScope.showSmartStackTraceHighlight = true;
        
  $templateCache.put('pbr-screenshot-modal.html',
    '<div class="modal" id="imageModal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="imageModalLabel{{$ctrl.index}}" ng-keydown="$ctrl.updateSelectedModal($event,$ctrl.index)">\n' +
    '    <div class="modal-dialog modal-lg m-screenhot-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="imageModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="imageModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <img class="screenshotImage" ng-src="{{$ctrl.data.screenShotFile}}">\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <div class="pull-left">\n' +
    '                    <button ng-disabled="!$ctrl.hasPrevious" class="btn btn-default btn-previous" data-dismiss="modal"\n' +
    '                            data-toggle="modal" data-target="#imageModal{{$ctrl.previous}}">\n' +
    '                        Prev\n' +
    '                    </button>\n' +
    '                    <button ng-disabled="!$ctrl.hasNext" class="btn btn-default btn-next"\n' +
    '                            data-dismiss="modal" data-toggle="modal"\n' +
    '                            data-target="#imageModal{{$ctrl.next}}">\n' +
    '                        Next\n' +
    '                    </button>\n' +
    '                </div>\n' +
    '                <a class="btn btn-primary" href="{{$ctrl.data.screenShotFile}}" target="_blank">\n' +
    '                    Open Image in New Tab\n' +
    '                    <span class="glyphicon glyphicon-new-window" aria-hidden="true"></span>\n' +
    '                </a>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

  $templateCache.put('pbr-stack-modal.html',
    '<div class="modal" id="modal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="stackModalLabel{{$ctrl.index}}">\n' +
    '    <div class="modal-dialog modal-lg m-stack-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="stackModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="stackModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <div ng-if="$ctrl.data.trace.length > 0">\n' +
    '                    <div ng-if="$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer" ng-repeat="trace in $ctrl.data.trace track by $index"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                    <div ng-if="!$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in $ctrl.data.trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '                <div ng-if="$ctrl.data.browserLogs.length > 0">\n' +
    '                    <h5 class="modal-title">\n' +
    '                        Browser logs:\n' +
    '                    </h5>\n' +
    '                    <pre class="logContainer"><div class="browserLogItem"\n' +
    '                                                   ng-repeat="logError in $ctrl.data.browserLogs track by $index"><div><span class="label browserLogLabel label-default"\n' +
    '                                                                                                                             ng-class="{\'label-danger\': logError.level===\'SEVERE\', \'label-warning\': logError.level===\'WARNING\'}">{{logError.level}}</span><span class="label label-default">{{$ctrl.convertTimestamp(logError.timestamp)}}</span><div ng-repeat="messageLine in logError.message.split(\'\\\\n\') track by $index">{{ messageLine }}</div></div></div></pre>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <button class="btn btn-default"\n' +
    '                        ng-class="{active: $ctrl.rootScope.showSmartStackTraceHighlight}"\n' +
    '                        ng-click="$ctrl.toggleSmartStackTraceHighlight()">\n' +
    '                    <span class="glyphicon glyphicon-education black"></span> Smart Stack Trace\n' +
    '                </button>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

    });
