const MODES = ["Erase", "Wall", "Player start pos", "Finish pos"];

const table = document.querySelector("table");
const output = document.querySelector(".output");
const stageSizeOutput = document.querySelector(".size");
const copyButton = document.getElementById("copy-output");
const changeModeButton = document.getElementById("change-mode");
const stageWidthInput = document.getElementById("stage-width");
const stageHeightInput = document.getElementById("stage-height");
const currentMode = document.querySelector(".current-mode");
const currentModeText = document.querySelector(".current-mode-text");

const stageSize = [0, 0];

let mode = 1;

copyButton.addEventListener("click",
  () => navigator.clipboard.writeText(stageSizeOutput.innerText + "\n" + output.innerText));

function stageSizeChanged() {
  const width = stageWidthInput.value;
  const height = stageHeightInput.value;

  if (!Number(width) || !Number(height)) {
    stageSize[0] = 0;
    stageSize[1] = 0;
    return;
  }

  stageSize[0] = width;
  stageSize[1] = height;

  stageSizeOutput.innerText = `${stageSize[0]}x${stageSize[1]}`;

  initTable();
  initOutput();
}

function tableChanged() {
  const cells = Array.from(table.querySelectorAll("td"));
  let text = output.innerText.split("\n").join("");

  for (let i = 0; i < cells.length; i++) {
    text = text.substring(0, i) + (cells[i].dataset.num || "0") + text.substring(i + 1, text.length);
  }

  let wrappedText = "";

  for (let i = 0; i < stageSize[1]; i++) {
    wrappedText += text.substring(i * stageSize[0], (i + 1) * stageSize[0]) + "\n";
  }

  output.innerText = wrappedText;
}

function initTable() {
  table.innerHTML = "";

  for (let i = 0; i < stageSize[1]; i++) {
    const row = document.createElement("tr");

    for (let j = 0; j < stageSize[0]; j++) {
      const cell = document.createElement("td");
      cell.addEventListener("click", () => {
        if (mode > 1) {
          const otherCell = table.querySelector(`td[data-num='${mode}']`);

          if (otherCell) {
            otherCell.dataset.num = "0";
            otherCell.style.backgroundColor = "transparent";
          }
        }

        cell.dataset.num = String(mode);
        cell.style.backgroundColor = mode === 0 ? "transparent"
          : mode === 1 ? "black" : mode === 2 ? "red" : "darkgreen";

        tableChanged();
      });

      row.append(cell);
    }

    table.append(row);
  }
}

function initOutput() {
  output.innerText = ("0".repeat(stageSize[0]) + "\n").repeat(stageSize[1]);
}

function modeChanged() {
  currentModeText.innerText = MODES[mode];
  currentMode.style.backgroundColor = mode === 0 ? "transparent" : mode === 1 ? "black"
    : mode === 2 ? "red" : "green";
}

window.addEventListener("DOMContentLoaded", () => {
  stageSizeChanged();
  initTable();
  initOutput();
});

window.addEventListener("keypress", (e) => {
  if (!MODES.find((modeInfo) => String(modeInfo[0]) === e.key)) {
    return;
  }

  mode = Number(e.key);
  modeChanged();
});

stageWidthInput.addEventListener("input", stageSizeChanged);
stageHeightInput.addEventListener("input", stageSizeChanged);

changeModeButton.addEventListener("click", () => {
  mode++;

  if (mode > 3) {
    mode = 0;
  }

  modeChanged();
});
