// Toggle the explicit, user-controlled map enhancement. No broad page permissions or telemetry.
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.url || !/^https:\/\/(?:www|maps)\.google\.com\/maps(?:[/?#]|$)/.test(tab.url)) {
    // The extension only acts on Google Maps. Opening the map is not an implicit grant elsewhere.
    return;
  }
  try {
    const {enabled=false}=await chrome.storage.local.get({enabled:false});
    await chrome.storage.local.set({enabled:!enabled});
    await chrome.action.setBadgeText({text:enabled?'':'ON'});
    await chrome.action.setBadgeBackgroundColor({color:'#2d718f'});
  } catch (error) {
    console.warn('[Snow Emergency overlay] toggle failed:',error);
  }
});
