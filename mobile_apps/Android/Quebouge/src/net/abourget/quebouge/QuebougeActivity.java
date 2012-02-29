package net.abourget.quebouge;

import android.os.Bundle;

import com.phonegap.*;

public class QuebougeActivity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        super.loadUrl("http://quebouge.com/?mobile_app=android");
    }
}