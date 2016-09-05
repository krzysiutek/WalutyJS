var checkConnection;
(function () {
  'use strict';
    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    var nav = WinJS.Navigation
    var sessionState = WinJS.Application.sessionState;
    

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
          
          
          //var itemArray = [
          //      { title: "Marvelous Mint", text: "Gelato", picture: "/images/fruits/60Mint.png" },
          //      { title: "Succulent Strawberry", text: "Sorbet", picture: "/images/fruits/60Strawberry.png" },
          //      { title: "Banana Blast", text: "Low-fat frozen yogurt", picture: "/images/fruits/60Banana.png" },
          //      { title: "Lavish Lemon Ice", text: "Sorbet", picture: "/images/fruits/60Lemon.png" },
          //      { title: "Creamy Orange", text: "Sorbet", picture: "/images/fruits/60Orange.png" },
          //      { title: "Very Vanilla", text: "Ice Cream", picture: "/images/fruits/60Vanilla.png" },
          //      { title: "Banana Blast", text: "Low-fat frozen yogurt", picture: "/images/fruits/60Banana.png" },
          //      { title: "Lavish Lemon Ice", text: "Sorbet", picture: "/images/fruits/60Lemon.png" }
          //];

          //var items = [];

          //// Generate 160 items
          //for (var i = 0; i < 20; i++) {
          //    itemArray.forEach(function (item) {
          //        items.push(item);
          //    });
          //}
          var exitButton = document.getElementById('exitButton');
          exitButton.addEventListener('click', function () {
              console.log("Exit button clicked");
              // TODO: close app
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
  app.start();
}());
