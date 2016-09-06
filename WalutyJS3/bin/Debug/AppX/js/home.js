'use strict';

var BASE_DATES_URL = "http://www.nbp.pl/kursy/xml/";
var httpClient;

(function () {

    var dates = [];
    var xmlNames = [];
    var dateSelect, yearSelect, confirmButton, listView;
    var XML_FILE_NAME = "xmlData.txt";
    var currencyList = [];
    var dataList = [];

    checkConnection = function () {
        console.log("NAVIGATOR!!!!!!" + navigator.onLine);
        return navigator.onLine;
    }

    function getDates(url) {
        httpClient = new XMLHttpRequest();
        httpClient.open('GET', url);
        httpClient.onreadystatechange = getDatesCallback;
        httpClient.send();
    }

    function getDatesCallback() {
        var response = httpClient.responseText;
        if (httpClient.readyState === 4) {
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
        var watingText = document.getElementById('waitingText').style.visibility = 'visible';
        var xmlUrl = "http://www.nbp.pl/kursy/xml/" + xmlName;
        var xmlData;
        var i;

        //httpClient = new XMLHttpRequest();
        //httpClient.open('GET', xmlUrl, false);
        //httpClient.send();
        WinJS.xhr({
            url: "http://www.nbp.pl/kursy/xml/a163z160824.xml",
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
        }
    }

    function onYearChange() {
        var selectedYear = yearSelect.value;
        dateSelect = document.getElementById('date-select');
        //dateSelect.options.length = 0;
        for (var i = 0; i < dateSelect.options.length; i++) {
            dateSelect.options[i] = null;
        }
    
        getDates(BASE_DATES_URL + selectedYear);
    }

    function fillDateSelect() {
        var i;

        //dateSelect.options = []; /* will no works :( */ 
        for (var i = 0; i < dateSelect.options.length; i++) {
            dateSelect.options[i] = null;
        } // clear options array 

        for (i = 0; i < dates.length; i++) {
            var option = document.createElement('option');
            
            option.value = xmlNames[i];
            //console.log("XML NAME " + xmlNames[i]);
            option.text = dates[i];

            dateSelect.appendChild(option);
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
        //WinJS.UI.Pages.define('/pages/chartPage.html', {
        //    ready: function (element, options) {
        console.log("HELLO");
        var item = listView.itemDataSource.list.getAt(event.detail.itemIndex);
        WinJS.Navigation.navigate("/pages/chartPage.html",
            {
                years: yearSelect.options,
                currencyName: item.name,
                currencyCode: item.code
            }
        );
        //    }
        //})
        //return nav.navigate(Application.navigator.chartPage);
    }

  

    WinJS.UI.Pages.define("/pages/home.html", {
        ready: function (element, options) {
    
            if (checkConnection()) {

                yearSelect = document.getElementById('year-select');
                yearSelect.addEventListener('change', onYearChange);

                dateSelect = document.getElementById('date-select');
                //dateSelect.addEventListener('change', onDateChange);

                confirmButton = document.getElementById('confirm-date-button');
                confirmButton.addEventListener('click', confirmDate);


                listView = document.getElementById('listView').winControl;
                listView.addEventListener("iteminvoked", listItemSelected);

                //getDates();
                fillYearSelect();

            }
        }
    });

    WinJS.Namespace.define("Sample.ListView", { data: dataList });

    WinJS.UI.processAll();


    
    //WinJS.Namespace.define("Sample.ListView", kurencyList);
    //WinJS.Namespace.define("Sample.ListView", {
    //    data: new WinJS.Binding.List(kurencyList)
    //});
})();