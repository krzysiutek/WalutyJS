'use strict';

var BASE_DATES_URL = "http://www.nbp.pl/kursy/xml/";
var httpClient;
var dates = [];

(function () {

    var xmlNames = [];
    var dateSelect, yearSelect, confirmButton, listView;
    var XML_FILE_NAME = "xmlData.txt";
    var currencyList = [];
    var dataList = [];
    var filled = false;
    var loadingItems;

    checkConnection = function () {
        console.log("NAVIGATOR!!!!!!" + navigator.onLine);
        return navigator.onLine;
    }

    function getDates(url) {

        WinJS.xhr({
            url: url,
            responseType: "text"
        }).done(
            function complited(result) {
                if (result.readyState === 4) {
                    getDatesCallback(result)
                }
            }
        );

        //httpClient = new XMLHttpRequest();
        //httpClient.open('GET', url);
        //httpClient.onreadystatechange = getDatesCallback;
        //httpClient.send();
    }

    function getDatesCallback(result) {
        var response = result.responseText;
        if (result.readyState === 4) {
            var splittedResponseByLine = response.split('\n');

            getOnlyItemsWithA(splittedResponseByLine);

            
        }
    }

    function onDateChange (data) {
        //var selectedItemValue = dateSelect.value;
        //getXmlFile(selectedItemValue).then(function (data) {
        //    var fileContent = data;
        //    if (!fileContent) {
        //        downloadXml(selectedItemValue);
        //    } else {
        //        parseXmlFile(fileContent);
        //    }
        //});
    }

    function downloadXml(xmlName) {
        loadingItems.style.visibility = 'visible';

        var xmlUrl = "http://www.nbp.pl/kursy/xml/" + xmlName;
        var xmlData;
        var i;

        //httpClient = new XMLHttpRequest();
        //httpClient.open('GET', xmlUrl, false);
        //httpClient.send();
        WinJS.xhr({
            url: xmlUrl,
            responseType: "document"
        }).done(

            // When the result has completed, check the status.
            function completed(result) {
                if (result.status === 200) {

                    xmlData = result.responseXML;
                }

                //TODO: check how to save responseXML as xml file 
                saveXmlFile(xmlData, xmlName);

                parseXmlFile(xmlData);
            });
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

        currencyList.length = 0; // clear array before new data will be loaded

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

        dataList = new WinJS.Binding.List(currencyList);

        listView.itemDataSource = dataList.dataSource;
        loadingItems.style.visibility = 'hidden';
        // WinJS.UI.processAll();
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

    function fillYearSelect() {
        var i;


        var date = new Date();
        var lastYear = date.getFullYear(); 
        var firstYear = 2002; // 2002 is first year with data
        var option;

        yearSelect.options.length = 0;

        for (i = lastYear; i > firstYear; i--) {
            option = document.createElement('option');

            if (i === lastYear) {
                option.value = 'dir.txt';
            } else {
                option.value = 'dir' + i + '.txt';
            }
            option.text = i;

            yearSelect.appendChild(option);
            yearSelect.selectedIndex = 0;
            onYearChange(); // fill dateSelect after page loaded
        }
    }

    function onYearChange() {
        var selectedYear = yearSelect.value;

        dateSelect.options.length = 0;
    
        getDates(BASE_DATES_URL + selectedYear);
    }

    function fillDateSelect() {
        var i;

        dateSelect.options.length = 0;
 
        for (i = 0; i < dates.length; i++) {
            var option = document.createElement('option');
            
            option.value = xmlNames[i];
            //console.log("XML NAME " + xmlNames[i]);
            option.text = dates[i];

            dateSelect.appendChild(option);
        }

        if (sessionData.homePage) {
            yearSelect.selectedIndex = sessionData.homePage.selectedYear;
            dateSelect.selectedIndex = sessionData.homePage.selectedDate;
            listView.itemDataSource = sessionData.homePage.dataList.dataSource;
            loadingItems.style.visibility = 'hidden';
            sessionData.homePage = null;
        }
    }

    function confirmDate() {
        var selectedItemValue = dateSelect.value;
        getXmlFile(selectedItemValue).then(function (data) {
            var fileContent = data;
            //if (!fileContent) {
                downloadXml(selectedItemValue);
            //} else {
            //    parseXmlFile(fileContent);
            //}
        });
    }

    function getOnlyItemsWithA(items) {
        xmlNames.length = 0;
        dates.length = 0;

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

        fillDateSelect();
    }

    function listItemSelected(data) {
        loaded = false;
        console.log("HELLO");
        var item = listView.itemDataSource.list.getAt(event.detail.itemIndex);
        sessionData.homePage = {
            selectedYear: yearSelect.selectedIndex,
            selectedDate: dateSelect.selectedIndex,
            dataList: dataList
        }
        WinJS.Navigation.navigate("/pages/chartPage.html",
            {
                years: yearSelect.options,
                currencyName: item.name,
                currencyCode: item.code,
                dates: dates
            }
        );
    }

  
    var loaded = false;
    WinJS.UI.Pages.define("/pages/home.html", {
        ready: function (element, options) {
            
            if (loaded) {
                return;
            }
            loaded = true;
            if (checkConnection()) {

                yearSelect = document.getElementById('year-select');
                yearSelect.addEventListener('change', onYearChange);

                dateSelect = document.getElementById('date-select');

                confirmButton = document.getElementById('confirm-date-button');
                confirmButton.addEventListener('click', confirmDate);


                listView = document.getElementById('listView').winControl;
                listView.addEventListener("iteminvoked", listItemSelected);

                loadingItems = document.getElementById('loading-items');

                //getDates();
                fillYearSelect();
            }
        }
    });

    WinJS.Namespace.define("Sample.ListView", { data: dataList });

    WinJS.UI.processAll();

})();