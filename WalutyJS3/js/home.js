'use strict';

(function () {

    var httpClient;
    var BASE_DATES_URL = "http://www.nbp.pl/kursy/xml/dir.txt";
    var dates = [];
    var xmlNames = [];
    var dateSelect;
    var XML_FILE_NAME = "xmlData.txt";
    var currencyList = [];

    checkConnection = function () {
        console.log("NAVIGATOR!!!!!!" + navigator.onLine);
        return navigator.onLine;
    }

    function getDates() {
        httpClient = new XMLHttpRequest();
        httpClient.open('GET', BASE_DATES_URL);
        httpClient.onreadystatechange = getDatesCallback;
        httpClient.send();
    }

    function getDatesCallback() {
        var response = httpClient.responseText;
        if (httpClient.readyState === 4) {
            var splittedResponseByLine = response.split('\n');

            getOnlyItemsWithA(splittedResponseByLine);

            fillDateSelect();

        }
    }

    function onDateChange (data) {
        var selectedItemValue = dateSelect.value;
        getXmlFile(selectedItemValue).then(function (data) {
            var fileContent = data;
            if (!fileContent) {
                downloadXml(selectedItemValue);
            } else {
                parseXmlFile(fileContent);
            }
        });
    }

    function downloadXml(xmlName) {
        var watingText = document.getElementById('waitingText').style.visibility = 'visible';
        var xmlUrl = "http://www.nbp.pl/kursy/xml/" + xmlName;
        var xmlData;
        var i;

        httpClient = new XMLHttpRequest();
        httpClient.open('GET', xmlUrl, false);
        httpClient.send();

        xmlData = httpClient.responseXML;
        
        //TODO: check how to save responseXML as xml file 
        saveXmlFile(xmlData, xmlName);

        parseXmlFile(xmlData);
    }

    function getXmlFile(fileName) {
        var that = this;
        return Windows.Storage.ApplicationData.current.localFolder.getFileAsync(fileName).then(function (file) {
            return Windows.Storage.FileIO.readTextAsync(file).then(function (fileContent) {
                return fileContent;
            },
            function (error) {
                console.log("Błąd odczytu");
            });
        },
        function (error) {
            console.log("Nie znaleziono pliku");
        });
    }

    function parseXmlFile(data) {
        var currencyObject = {};
        var currencies;
        var i;
        currencies = data.getElementsByTagName('pozycja');

        for (i = 0; i < currencies.length; i++) {
            currencyObject = {
                name: currencies[i].getElementsByTagName('nazwa_waluty')[0].childNodes[0].nodeValue,
                code: currencies[i].getElementsByTagName('kod_waluty')[0].childNodes[0].nodeValue,
                conversionRate: currencies[i].getElementsByTagName('przelicznik')[0].childNodes[0].nodeValue,
                exchangeRate: currencies[i].getElementsByTagName('kurs_sredni')[0].childNodes[0].nodeValue
            }
            currencyList.push(currencyObject);
        }
    }

    function saveXmlFile(data, fileName) {
        var applicationData = Windows.Storage.ApplicationData.current;
        var localFolder = applicationData.localFolder;
        localFolder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.replaceExisting)
            .then(function (file) {
                return Windows.Storage.FileIO.writeTextAsync(file, data);
            }).done(function () {
        });
    }

    function fillDateSelect() {
        var i;

        dateSelect = document.getElementById("date-select");
        dateSelect.addEventListener('change', onDateChange);

        //dateSelect.options = []; /* will no works :( */ 
        dateSelect.options.length = 0; // clear options array 

        for (i = 0; i < dates.length; i++) {
            var option = document.createElement('option');
            
            option.value = xmlNames[i];
            option.text = dates[i];

            dateSelect.appendChild(option);
        }
    }

    function getOnlyItemsWithA(items) {
        var i, j = 0;
        for (i = 0; i < items.length; i++) {
            if (items[i].substring(0, 1) === 'a') {
                dates[j] = '20' + items[i].substring(5, 7) +
                    '-' + items[i].substring(7, 9) + '-' + items[i].substring(9, 11); // make proper date (eg. 2016-02-01)
                xmlNames[j] = items[i].substring(0, 11) + '.xml'; // remove EOL sign
                j++;
            }
        }
        dates.reverse(); // reverse array to set last date on top
        xmlNames.reverse();
    }

  

    WinJS.UI.Pages.define("/pages/home.html", {
        ready: function (element, options) {
    
            if (checkConnection()) {
                getDates();
            }
        }
    });

    WinJS.UI.processAll();
})();