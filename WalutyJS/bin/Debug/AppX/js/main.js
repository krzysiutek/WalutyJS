var checkConnection;
var sessionData = WinJS.Application.sessionState;
(function () {
  'use strict';
    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    var nav = WinJS.Navigation
    

  app.onactivated = function (args) {
    if (args.detail.kind === activation.ActivationKind.launch) {
      if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
        // TODO: This application has been newly launched. Initialize your application here.
      } else {
        // TODO: This application has been reactivated from suspension.
        // Restore application state here.
      }
      args.setPromise(WinJS.UI.processAll().then(function() {
          // TODO: Your code here.
          
          var exitButton = document.getElementById('exit-button');
          exitButton.addEventListener('click', function () {
              console.log("Exit button clicked");
              document.body.style.cursor = 'wait';
              setTimeout(function () {
                  window.close();
              }, 2000);
          });

          var backButton = document.getElementById('back-button');
          backButton.addEventListener('click', function () {
              var page = document.getElementById("contenthost").winControl.pageControl;
              if (page.uri !== "ms-appx://" + Windows.ApplicationModel.Package.current.id.name + "/pages/home.html") {
                  WinJS.Navigation.navigate("/pages/home.html");
              }
          });

          return nav.navigate(Application.navigator.home);
      }));
    }
  };
  app.oncheckpoint = function (args) {
    // TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
    // You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
    // If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
  };
  app.onerror = function (error) {
      console.log("BŁĄD");
  };
  app.start();
}());
