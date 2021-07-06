console.log("background-running ");

const buttonClicked = (tab) => {
  chrome.tabs.sendMessage(tab.id, { message: "toggle-tab" }, (isActive) => {
    setIcon(tab.id, isActive);
  });
};

chrome.browserAction.onClicked.addListener(buttonClicked);

// Set the right icon in the given tab id, depending on that tab's active state.
function setIcon(tabId, isActive) {
  const path = isActive ? "icons/icon-16-active.png" : "icons/icon-16.png";
  chrome.browserAction.setIcon({
    path,
    tabId,
  });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    chrome.tabs.sendMessage(
      tabId,
      {
        message: "TabUpdated",
      },
      (isActive) => {
        setIcon(tabId, isActive);
      }
    );
  }
});
