'use strict';

(function () {
    var yearSelect, startDateSelect, endDateSelect, drawButton;
    var xmlNames = [];
    var stateOptions;
    var currencyDates = [], currencyRates = [];
    var loadingItems, waitingItems, currencyNameSpan;

    function drawChart() {
        var ctx = document.getElementById("myChart");

        loadingItems.style.visibility = 'hidden';

        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: currencyDates,
                datasets: [{
                    label: 'Hostoria notowań dla: ' + stateOptions.currencyName,
                    data: currencyRates,
                    fill: false,
                    lineTension: 0.1,
                    borderColor: "rgba(75,192,192,1)",
                    pointBorderColor: "rgba(75,192,192,1)"
                }]
            },
            options: {
                legend: {
                    display: true,
                    onClick: null
                }
            }
        });
    }

    function prepareChartData() {
        var i;
        var xmlName;

        currencyDates.length = 0;
        currencyRates.length = 0;

        for (i = 0; i < endDateSelect.options.length + 1; i++) {

            xmlName = startDateSelect.options[i].value;

            WinJS.xhr({
                url: 'http://www.nbp.pl/kursy/xml/' + xmlName,
                responseType: 'document'
            }).done(

                // When the result has completed, check the status.
                function completed(result) {
                    if (result.status === 200) {

                        // Get the XML document from the results. 
                        var xmlDocument = result.responseXML;

                        parseXML(xmlDocument)

                    } else {
                        // TODO: handle ERROR!!
                    }
                });
        }
        loadingItems.style.visibility = 'visible';
        waitingItems.style.visibility = 'hidden';
        setTimeout(function () {

            drawChart();
        }, 4000);
    }
    
    function parseXML(xmlDocument) {
        var i;
        var currenciesAll = xmlDocument.getElementsByTagName('pozycja');
        var currencyObject;
        for (i=0;i<currenciesAll.length;i++){
            if (currenciesAll[i].getElementsByTagName('kod_waluty')[0].childNodes[0].nodeValue === stateOptions.currencyCode) {
                currencyObject = {
                    name: currenciesAll[i].getElementsByTagName('nazwa_waluty')[0].childNodes[0].nodeValue,
                    code: currenciesAll[i].getElementsByTagName('kod_waluty')[0].childNodes[0].nodeValue,
                    conversionRate: currenciesAll[i].getElementsByTagName('przelicznik')[0].childNodes[0].nodeValue,
                    exchangeRate: currenciesAll[i].getElementsByTagName('kurs_sredni')[0].childNodes[0].nodeValue,
                    date: xmlDocument.getElementsByTagName('data_publikacji')[0].childNodes[0].nodeValue
                }
                currencyDates.push(currencyObject.date);
                currencyRates.push(parseFloat(currencyObject.exchangeRate.replace(',', '.')));
            }
        }
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

        fillStartDateSelect();
    }

    function fillStartDateSelect() {
        var i;
        var option;

        startDateSelect.options.length = 0;

        for (i = 0; i < startDateSelect.options.length; i++) {
            startDateSelect.options[i] = null;
        } // clear options array 

        for (i = 0; i < dates.length; i++) {
            option = document.createElement('option');

            option.value = xmlNames[i];
            option.text = dates[i];

            startDateSelect.appendChild(option);
            
        }
    }

    function onStartYearChanged() {

        var selectedYear = yearSelect.value;

        // clear endDateSelect options to prevent incorrect dates selection
        endDateSelect.options.length = 0;
       
        getDates(BASE_DATES_URL + selectedYear);
    }

    function onStartDateChanged() {
        var i;
        var option;
        var selectedStartDateIndex = startDateSelect.selectedIndex;

        endDateSelect.options.length = 0;

        for (i = 0; i < endDateSelect.options.length; i++) {
            endDateSelect.options[i] = null;
        } // clear options array 

        for (i = 0; i < selectedStartDateIndex; i++) {
            option = document.createElement('option');

            option.value = xmlNames[i];
            option.text = dates[i];

            endDateSelect.appendChild(option);
        }
    }

    function init(data) {
        var option;
        var i;
        var size = Object.keys(data.years).length;


        yearSelect = document.getElementById('start-year-select');
        yearSelect.addEventListener('change', onStartYearChanged);

        startDateSelect = document.getElementById('start-date-select');
        startDateSelect.addEventListener('change', onStartDateChanged);

        endDateSelect = document.getElementById('end-date-select');

        drawButton = document.getElementById('confirm-date-button');
        drawButton.addEventListener('click', prepareChartData);

        loadingItems = document.getElementById('loading-items2');
        waitingItems = document.getElementById('waiting-items2');

        for (i = 0; i < size; i++) {
            option = document.createElement('option');

            option.value = data.years[i].value;
            option.text = data.years[i].text;
            yearSelect.appendChild(option);
            yearSelect.selectedIndex = 0;
            onStartYearChanged();
        }
        currencyNameSpan = document.getElementById('currency-name');
        WinJS.Binding.processAll(currencyNameSpan, stateOptions);

    }

    WinJS.UI.Pages.define("/pages/chartPage.html", {
        ready: function (element, options) {
            stateOptions = options || {};
            console.log("PAGE CHART");
            init(stateOptions);
        }
    });
    WinJS.UI.processAll();
})();