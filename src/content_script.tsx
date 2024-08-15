// chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
//   if (msg.color) {
//     console.log("Receive color = " + msg.color);
//     document.body.style.backgroundColor = msg.color;
//     sendResponse("Change color to " + msg.color);
//   } else {
//     sendResponse("Color message is none.");
//   }
// });

let mouseX: number;
let mouseY: number;

document.addEventListener('mousemove', event => {
  mouseX = event.pageX;
  mouseY = event.pageY;
});

document.addEventListener('mouseup', (e) => {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  const text = selection.toString().trim();
  if (text) {
    console.log(text);
  }
});
