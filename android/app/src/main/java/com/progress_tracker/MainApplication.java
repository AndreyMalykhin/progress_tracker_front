package com.progress_tracker;

import android.app.Application;

import com.facebook.react.ReactApplication;
import io.sentry.RNSentryPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.rnfs.RNFSPackage;
import com.actionsheet.ActionSheetPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNSentryPackage(MainApplication.this),
            new SplashScreenReactPackage(),
            new RNFSPackage(),
            new ActionSheetPackage(),
            new PickerPackage(),
            new VectorIconsPackage(),
            new FBSDKPackage(),
            new RNDeviceInfo()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
