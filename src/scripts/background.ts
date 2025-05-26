chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;

  chrome.sidePanel.setOptions({
    tabId: tab.id,
    path: "index.html",
    enabled: true,
  });

  chrome.sidePanel.open({ tabId: tab.id });
});
