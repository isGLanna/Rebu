export default {
  expo: {
    name: 'Rebu',
    slug: 'mobile',
    version: '0.1.0',
    orientation: 'portrait',
    icon: './src/assets/images/icon.png',
    scheme: 'mobile',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './src/assets/images/android-icon-foreground.png',
        backgroundImage: './src/assets/images/android-icon-background.png',
        monochromeImage: './src/assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: 'com.isglanna.mobile',
    },
    web: {
      output: 'static',
      favicon: './src/assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './src/assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      [
        'expo-font',
        {
          fonts: [
            './src/assets/font/Orbitron/Orbitron-Regular.ttf',
            './src/assets/font/Orbitron/Orbitron-Medium.ttf',
            './src/assets/font/Orbitron/Orbitron-SemiBold.ttf',
            './src/assets/font/Orbitron/Orbitron-Bold.ttf',
            './src/assets/font/Orbitron/Orbitron-ExtraBold.ttf',
            './src/assets/font/Orbitron/Orbitron-Black.ttf',
          ],
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Permitir Rebu acessar sua localização mesmo quando você não estiver usando o aplicativo.',
          locationWhenInUsePermission:
            'Permitir Rebu acessar sua localização enquanto você estiver usando o aplicativo.',
        },
      ],
      [
        '@rnmapbox/maps',
        {
          RNMAPBOX_MAPS_DOWNLOAD_TOKEN: process.env.MAPBOX_DOWNLOADS_TOKEN,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
}
