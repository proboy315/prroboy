# 🛠️ ProBoy-MD Setup Guide

This guide explains how to install and run *ProBoy-MD*.

## Requirements
- Node.js >= 20
- Git (optional)
- FFmpeg (recommended for media features)

## Folder Structure
- `session/` → your WhatsApp credentials (creds.json)
- `plugins/` → all commands/features
- `data/` → bot data (json files)
- `assets/` → images (menu image etc)

## Install
```bash
cd ProBoy-MD
npm install
```

## Session (No QR / No pairing)
This build is made for your flow:
- You will *not* scan QR in terminal.
- You will upload `creds.json` into the `session/` folder.

Steps:
1) Put your creds here:
   - `ProBoy-MD/session/creds.json`
2) Start bot:
```bash
npm start
```

## Config
You can set environment variables in `config.env`:
```env
BOT_NAME=ProBoy-MD
OWNER_NAME=Shahan
MODE=public
HANDLERS=.
BOT_IMAGE_URL=https://proboy.vercel.app/botimg.png
FOOTER=> ProBoy-MD
```

## Run with PM2 (recommended)
```bash
npm i -g pm2
pm2 start index.js --name proboy-md
pm2 save
pm2 logs proboy-md
```
