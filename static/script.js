const boxes = document.querySelectorAll(".box");

let currentPlayerFront = null;

let currentBox = null;

const modal = document.querySelector(".modal");

const modalContent = document.querySelector('.modal-content');

const modalText = document.querySelector(".modal-text");

const dots = document.querySelector(".dots")


// Create a style element
const style = document.createElement('style');

// Add your CSS rules to override the modal-content::after properties
style.innerHTML = `
.modal-content::after {
    content: none;
    animation: none;
}

.modal-text .dots {
    display: none;
}`;

let showModal = false;

let clientId = Date.now() - 1_703_023_345_436;

let receivedData;

const socket = new WebSocket(`ws://localhost:8000/ws/${clientId}`);

socket.onopen = function (event) {
  console.log("WebSocket connection established");
  console.log(event);
  modal.style.display = "none";
};

socket.onclose = function (e) {
  console.log("WebSocket connection closed", e);
  // modal.style.display = "block";
};

window.onbeforeunload = function () {
  return socket.close()
}

socket.onmessage = function (event) {
  console.log("on message event");
  console.log(event);

  if (event.data === "waiting_for_player") {
    modal.style.display = "block";
    modalText.textContent = "Please wait! I'll login shortly";
    return;
  }
  //   else if (event.data === 'logged_in' + `${clientId}`) {
  //   modal.style.display = "block";
  //   modalText.textContent = "I've just logged in, thinking of my first move";
  //   return;
    
  // }
    else if (event.data === "full_room") {
    modal.style.display = "block";
    modalText.textContent = "Sorry, the room is currently full, please try again later!";
    document.head.appendChild(style);
    return;
  } else if (event.data === "player_dc") {
    modal.style.display = "block";
    modalText.textContent = 'The player has disconnected, please click "restart the game" button or refresh the page';
    document.head.appendChild(style);
    return;
  }

  receivedData = JSON.parse(event.data);
  let temporaryId = clientId;
  let receivedId = receivedData.playerId;
  console.log(receivedData);
  if (receivedId === temporaryId) {
    modal.style.display = "block";
    modalText.textContent = "Waiting for the other player turn";
  } else {
    modal.style.display = "none";
  }
  for (let i = 0; i < 9; i++) {
    boxes[i].textContent = receivedData["board"][i];
  }
  if (receivedData.type === "playerCount") {
    console.log(receivedData.count);
  }
  currentPlayerFront = receivedData["currentPlayer"];
};

socket.onerror = function (err) {
  console.error("WebSocket error", err);
  socket.close();
};

console.log(boxes[0]);
console.log("boxes above this");

boxes.forEach(function (element, index) {
  element.addEventListener("click", function (boardData) {
    if (boxes[index].textContent === "") {
      socket.send(JSON.stringify([index.toString(), clientId.toString()]));
    }
  });
});
