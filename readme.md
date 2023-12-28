# Chatronix

## Overview

Chatronix is a real-time chat application built with React Native, Firebase Firestore, and Firebase Storage. It allows users to exchange text messages, share their location, and send images. The application works both online and offline, caching messages and syncing with the Firestore database when the connection is available.

## Features

- Real-time messaging
- Offline support with AsyncStorage
- Location sharing
- Image sending from the camera or photo library

## Installation

To get started with Chatronix, clone this repository and install the dependencies.

```
   git clone https://github.com/your-username/chatronix.git
   cd chatronix
   npm install
```

## Setup

Before running the application, you need to set up Firebase:

1. Create a Firebase project at Firebase Console.
2. Add a new application and choose 'Web'.
3. Copy the Firebase configuration and replace it in FirestoreContext.tsx.

## Running the Application

To run the application on your device/emulator, use the following command:

```npm start
```