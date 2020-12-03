//! Global selections and variables
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll(".adjust");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
const lockButton = document.querySelectorAll(".lock");
let initialColors;

//! Local storage
let savedPalettes = [];

//! Event Listeners

//* generate colors when click to refrsh
generateBtn.addEventListener("click", randomColors);

//* Control the sliders (sat,hue,brigth)
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});

//* Update the Hex text
colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

//* make the popup open & copy hex
currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

//* pop up end animation
popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

//* adjust panel
adjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});

closeAdjustments.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});

//* add lock button
lockButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    addLockClass(index);
  });
});

//! Functions

// Generate random color
//? func to generate color without a library
/* function generateHex() {
    const letters = "0123456789ABCDEF";
    let hash = "#";
    for (let i = 0; i < 6; i++) {
        hash += letters[Math.floor(Math.random()*16)];
    }
    return hash;
} */

function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

//* adding lock clas
function addLockClass(index) {
  // div colors target
  const lockTarget = colorDivs[index];
  // icon locker target
  const icon = lockButton[index].children[0];
  // add class in the div & btn
  lockTarget.classList.toggle("locked");
  icon.classList.toggle("fa-lock-open");
  icon.classList.toggle("fa-lock");
}

// Insert hex code to bg
function randomColors() {
  //create the empty array to store the hex value
  initialColors = [];

  colorDivs.forEach((div, index) => {
    //  console.log(div.children[0]); // im accessing the div inside colorDivs and then his 1st children
    const hexText = div.children[0]; // selecting h2
    const randomColor = generateHex();

    // add it to the array (hex code) & addind lock feature
    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }

    // add the color to bg
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    //adding check for contrast
    checkTextContrast(randomColor, hexText);

    // Initial colorize sliders
    //?/ grab each of the colors & sliders and store in a var so we can manipulate
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    // calling fn to be able to manipulate colors through sliders
    colorizeSliders(color, hue, brightness, saturation);
  });

  //* reset inputs
  resetInputs();

  //* check for button contrast
  adjustButton.forEach((button, index) => {
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockButton[index]);
  });
}

// Check the text contrast
//? based on the rate of the contrast text will be white or black
//? im using chroma's library funcionallity luminance to check
//? the parameters are refering to the color & text that'll be input

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();

  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

// fn to manipulate sliders
function colorizeSliders(color, hue, brightness, saturation) {
  // Scale saturation
  //? this scale is to get the min max value of sat hue brightness then makea a bg with gradient to ours sliders
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]); // creates the aray with the values to the slider

  //Scale brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  // Update input colors
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
    0
  )}, ${scaleSat(1)})`;

  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
    0
  )}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
  //? hue we don't do scale bc it will always be the same intercalating between rgb of the colors
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

//Control sliders

function hslControls(e) {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  // get the current color
  //   const bgColor = colorDivs[index].querySelector("h2").innerText; // this is not dinyamic, so we use the value stored in the array bellow
  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  // colorize inputs/sliders
  colorizeSliders(color, hue, brightness, saturation);
}

//Update text UI
function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex();

  //Check contrast
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

// Reset input

function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}

//fn copy to clipboard
//? we create a text area fist to attach our hex value
function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select(); // select whats inside the element
  // native method to exec a command and copy
  document.execCommand("copy");
  document.body.removeChild(el);

  // pop up animation
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}
function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}
function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

//! Save to palette & local storage stuff
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

//! Event listeners

saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

//! Fn

function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}
function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}

function savePalette(e) {
  saveContainer.classList.remove("active");
  popup.classList.remove("active");

  // Giving the properties that the new array will have
  const name = saveInput.value;
  const colors = [];
  // adding the hex value into the array colors
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });

  // generate object
  let paletteNr;
  const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
  if (paletteObjects) {
    paletteNr = paletteObjects.length;
  } else {
    paletteNr = savedPalettes.length;
  }




  const paletteObj = { name, colors, nr: paletteNr };
  savedPalettes.push(paletteObj);
  // Save to local storage
  savetoLocal(paletteObj);
  saveInput.value = "";

  // generate obj to the library
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerText = "Select";

  // attach event to the button select generated
  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInputs();
  });

  // Append to library

  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryContainer.children[0].append(palette);
}

function savetoLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}
function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}


function getLocal() {
  if (localStorage.getItem('palettes') === null) {
    localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    savedPalettes = [...paletteObjects];

    paletteObjects.forEach(paletteObj => {
      // generate obj to the library
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      paletteObj.colors.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(paletteObj.nr);
      paletteBtn.innerText = "Select";

      // attach event to the button select generated
      paletteBtn.addEventListener("click", (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInputs();
      });

      // Append to library

      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      libraryContainer.children[0].append(palette);
    });
  }
}


getLocal();
randomColors();
