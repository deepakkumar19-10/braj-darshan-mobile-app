# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# React Native & Hermes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
    @com.facebook.react.uimanager.annotations.ReactProp *;
    @com.facebook.react.uimanager.annotations.ReactPropGroup *;
}

# Braj Darshan Devotional Audio
-keep class com.brajdarshan.app.** { *; }

# Async Storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# React Native Screens & Safe Area
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }
