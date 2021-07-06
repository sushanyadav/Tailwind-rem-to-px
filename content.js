console.log("hello");

const write = (element) => {
  //* convert array two smaller chunks
  const getArrayChunks = (arr, len) => {
    const chunks = [];
    let i = 0;
    const n = arr.length;

    while (i < n) {
      chunks.push(arr.slice(i, (i += len)));
    }

    return chunks;
  };

  //* convert to pixels
  function convertRemToPixels(rem) {
    const converted = rem * 16;
    if (isNaN(converted)) return;
    return `${converted}px<change_line>`;
  }

  //=> getting the text content of element to overwrite and converting it array
  const overWriteEl = element.lastChild.textContent
    .replace(/\n/g, " ")
    .split(" ");

  //=> breaking into array chunks with 2 elements
  const converted = getArrayChunks(overWriteEl, 2);

  if (converted.length > 0) {
    converted.map((co) => {
      if (co.length < 1) return;
      //=> getting the unit element "ie: 0.125rem;"
      const unit = co[1];

      if (unit && unit.includes("rem")) {
        //=> converting into pixel if it includes rem
        const convertedToPixel = `${convertRemToPixels(
          +unit.replace("rem;", "")
        )}`;

        //=> overwriting the existing unit in array
        co[1] = `${co[1]} //${convertedToPixel}`;
      }
    });
  }

  //=> converting the chunks into array
  const stringConversion = [].concat.apply([], converted).join(" ");

  //=> overwriting the existing unit in document
  if (stringConversion.includes("<change_line>")) {
    element.lastChild.textContent = stringConversion.replaceAll(
      "<change_line>",
      ";\n"
    );
  } else if (element.lastChild.textContent.includes("rem")) {
    element.lastChild.textContent = stringConversion.replaceAll(";", ";\n");
  }
};

//* erase the changes
const erase = (element) => {
  const overWriteEl = element.lastChild.textContent;
  const result = overWriteEl.split(" //")[0];

  element.lastChild.textContent = result;
};

//* active global state
let isActive = false;

//* DOM content changer function
const changer = (table) => {
  table.forEach((element) => {
    if (isActive) {
      //^ overwrites the document
      write(element);
    } else {
      //^ restore the overwrite
      erase(element);
    }
  });
};

//* CHROME LISTENER
const gotMessage = (request, sender, sendResponse) => {
  //=> url change
  if (request.message === "TabUpdated") {
    const table = document.querySelectorAll("table tbody tr");
    sendResponse(isActive);
    changer(table);
  }

  //=> extension click
  if (request.message === "toggle-tab") {
    isActive = !isActive; //~ changing active state to toggle
    const table = document.querySelectorAll("table tbody tr");
    sendResponse(isActive); //~ responding active state
    if (table) {
      changer(table);
    }
  }
};

chrome.runtime.onMessage.addListener(gotMessage);
