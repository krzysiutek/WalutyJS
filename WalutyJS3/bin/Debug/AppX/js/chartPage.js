'use strict';

(function () {
    var startYearSelect, endYearSelect, startDateSelect, endDateSelect, drawButton;
    var xmlNames = [];
    var dates = [];
    var stateOptions;
    var currencyDates = [], currencyRates = [];

    //var Chart = require('js/Chart.min.js')
    function drawChart() {
        var ctx = document.getElementById("myChart");
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: currencyDates,
                datasets: [{
                    label: 'Wykres notowań dla: ' + stateOptions.currencyName,
                    data: currencyRates,
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: "rgba(75,192,192,0.4)",
                    borderColor: "rgba(75,192,192,1)",
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: "rgba(75,192,192,1)",
                    pointBackgroundColor: "#fff",
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "rgba(75,192,192,1)",
                    pointHoverBorderColor: "rgba(220,220,220,1)",
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    spanGaps: false,
                
                }]
            },
            //options: {
            //    showLines: true,
            //    scales: {
            //        yAxes: [{
            //            ticks: {
            //                beginAtZero: true,
            //                max: currencyRates[0] + 1,
            //                min: currencyRates[0] - 1,
                            
            //            }
            //        }],
            //        xAxes: [{
            //            //ticks: {
            //            //    //stepSize: currencyDates.length * 0.1,
            //            //}
            //        }]
            //    }
            //}
        });
    }

    function prepareChartData() {
        var i;
        var xmlName;

        currencyDates.length = 0;
        currencyRates.length = 0;

        for (i = 0; i < endDateSelect.options.length; i++) {

            xmlName = endDateSelect.options[i].value;

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
        setTimeout(function () {

            drawChart();
        }, 5000);
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
        // TODO: remove it later only for now
        endYearSelect.text = startYearSelect.text;
        endYearSelect.value = startYearSelect.value;

        var selectedYear = startYearSelect.value;
      
        getDates(BASE_DATES_URL + selectedYear);
    }

    function onEndYearChanged() {
        // TODO: add handling end year to get data from many years
        onStartYearChanged();
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

    function onEndDateChanged() {

    }

    function init(data) {
        var option;
        var i;
        var size = Object.keys(data.years).length;


        startYearSelect = document.getElementById('start-year-select');
        for (i = 0; i < size; i++) {
            option = document.createElement('option');

            option.value = data.years[i].value;
            option.text = data.years[i].text;
            startYearSelect.appendChild(option);
        }
        startYearSelect.addEventListener('change', onStartYearChanged);

        endYearSelect = document.getElementById('end-year-select');
        for (i = 0; i < size; i++) {
            option = document.createElement('option');

            option.value = data.years[i].value;
            option.text = data.years[i].text;
            endYearSelect.appendChild(option);
        }
        endYearSelect.addEventListener('change', onEndYearChanged);

        startDateSelect = document.getElementById('start-date-select');
        startDateSelect.addEventListener('change', onStartDateChanged);

        endDateSelect = document.getElementById('end-date-select');
        endDateSelect.addEventListener('change', onEndDateChanged);

        drawButton = document.getElementById('confirm-date-button');
        drawButton.addEventListener('click', prepareChartData);

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