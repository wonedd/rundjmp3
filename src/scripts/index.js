const addButton = document.getElementById("add-button-wrap");
const inputContainer = document.getElementById("new-input-box");
const mainButton = document.getElementById("main-button");
const form = document.querySelector("form");
const maxInputs = 4;
let inputValues = [];
let clicks = 0;

addButton.addEventListener('click', () => {
  if (clicks > maxInputs) {
    alert("You can add a maximum of 5 links.");
    return;
  }
  clicks++;

  const newInputBox = document.createElement("div");
  newInputBox.classList.add("button-box");

  const newInput = document.createElement("input");
  newInput.type = "text";
  newInput.name = "videos";
  newInput.classList.add('new-input');
  newInput.placeholder = "https://www.youtube.com";

  const deleteButton = document.createElement("span");
  deleteButton.type = "button";
  deleteButton.classList.add("material-symbols-outlined");
  deleteButton.id = "delete-input-button";
  deleteButton.innerText = "delete";

  deleteButton.addEventListener("click", () => {
    clicks--;
    inputContainer.removeChild(newInputBox);
    const index = inputValues.indexOf(newInput.value);
    if (index !== -1) {
      inputValues.splice(index, 1);
    }
  });

  newInputBox.appendChild(newInput);
  newInputBox.appendChild(deleteButton);
  inputContainer.appendChild(newInputBox);
});
function downloadAudio(audioLink, filename) {
  const a = document.createElement('a');
  a.href = audioLink;
  a.download = filename;
  a.click();
}
mainButton.addEventListener('click', (e) => {
  console.log('chegou aqui');
  e.preventDefault();
  inputValues = [];

  const inputs = document.querySelectorAll('input[name="videos"]');
  inputs.forEach((input) => {
    inputValues.push(input.value);
  });

  fetch('/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ videos: inputValues })
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      const resultContainer = document.getElementById('result-container');
      resultContainer.innerHTML = '';

      data.videos.forEach((audioLink, index) => {
        const downloadButton = document.createElement('button');
        downloadButton.innerText = `Download Audio ${index + 1}`;
        downloadButton.addEventListener('click', () => {
          downloadAudio(audioLink.audioLink, `audio_${index + 1}.mp3`);
        });
        resultContainer.appendChild(downloadButton);
      });
    })
    .catch(error => {
      console.error(error);
    });
});