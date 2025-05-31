chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;

  chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: "index.html",
    enabled: true,
  });

  chrome.sidePanel.open({ tabId: tab.id });
});

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (!tab?.id) return;

  switch (command) {
    case "toggle-subtitles":
      try {
        await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_SUBTITLES" });
      } catch (error) {
        console.error("Error toggling subtitles:", error);
      }
      break;
  }
});
