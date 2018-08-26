document.addEventListener("DOMContentLoaded", function() {
  var socket = io();

  function makeToast(message, duration) {
    var toastHTML = `<div class="toast-wrapper" ><p class="toast-msg">${message}</p><button class="btn-flat toast-action toast-close" id="toast-dismiss" > X </button></div>`;
    M.toast({
      html: toastHTML,
      displayLength: duration || 15000
    });
    document
      .querySelector("button#toast-dismiss")
      .addEventListener("click", function(e) {
        var toastElement = document.querySelector(".toast");

        var toastInstance = M.Toast.getInstance(toastElement);
        toastInstance.dismiss();
      });
  }

  socket.on("connect", function() {
    socket.on("newMessage", function(message) {
      var node = document.createElement("li");
      node.classList.add("collection-item");
      node.innerHTML = "<b>" + message.from + "</b> : " + message.body;
      document.querySelector("ul#messages").appendChild(node);
    });

    //
    socket.on("locationShared", function(location) {
      var node = document.createElement("li");
      node.classList.add("collection-item");
      node.innerHTML =
        "<b>" +
        location.from +
        "</b> :  <a href=" +
        location.url +
        " target=`_blank` > -->location</a>";
      document.querySelector("ul#messages").appendChild(node);
    });

    //share locatiom
    document
      .querySelector("button#location")
      .addEventListener("click", function() {
        if (!navigator.geolocation) {
          return makeToast(
            `<b class="red-text">error</> : your navigator dont support gelocation`,
            100000000
          );
        }
        navigator.geolocation.getCurrentPosition(
          function(postition) {
            socket.emit(
              "shareLocation",
              {
                latitude: postition.coords.latitude,
                longitude: postition.coords.longitude
              },
              function(data) {
                makeToast(`<b class="green-text">success: </b>${data}`);
              }
            );
          },
          function(error) {
            makeToast(
              `<b class="red-text"> error : </b> unable to fecht location `,
              30000
            );
          }
        );
      });

    //create new message
    document
      .querySelector("#sendMessage")
      .addEventListener("click", function(e) {
        e.preventDefault();
        var message = document.querySelector("input#message");
        if (!message.value) {
          return false;
        }
        socket.emit(
          "createMessage",
          {
            from: "User",
            body: message.value
          },
          function(data) {
            console.log(data);
            message.value = null;
          }
        );
      });

    socket.on("disconnect", function() {
      console.log("disconnected from the server");
    });
  });
});
