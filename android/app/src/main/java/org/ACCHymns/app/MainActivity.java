package org.ACCHymns.app;

import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
     @Override
  public void onStart() {
    super.onStart();
    // Disable the rubber-band over-scroll effect that causes the app UI to get stretched.
    WebView v = getBridge().getWebView();
    v.setOverScrollMode(v.OVER_SCROLL_NEVER);
  }
}
