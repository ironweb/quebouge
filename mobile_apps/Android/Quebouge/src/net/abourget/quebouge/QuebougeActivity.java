package net.abourget.quebouge;

import android.os.Bundle;

import com.phonegap.*;

public class QuebougeActivity extends DroidGap {
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        super.loadUrl("http://192.168.43.68:6543/?mobile_app=android");
    }
}