FROM node:22-bullseye

# Autoria do Gemini, não dei conta de entender como configurar

# Instala dependências do sistema e Java (necessário para Android)
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Configura o Android SDK
ENV ANDROID_SDK_URL="https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip"
ENV ANDROID_HOME="/usr/local/android-sdk"
ENV PATH="$PATH:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools"

RUN mkdir -p ${ANDROID_HOME}/cmdline-tools \
    && wget -O tools.zip ${ANDROID_SDK_URL} \
    && unzip tools.zip -d ${ANDROID_HOME}/cmdline-tools \
    && mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest \
    && rm tools.zip

# Aceita as licenças do Android
RUN yes | sdkmanager --licenses
RUN sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos do projeto e instala dependências
COPY package*.json ./
RUN npm install

COPY . .

# Expõe a porta do Metro Bundler (React Native)
EXPOSE 8081
EXPOSE 19000
EXPOSE 19001