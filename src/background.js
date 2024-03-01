'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const fs = require('fs');
const path = require('path');
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 1440,
        height: 800,
        autoHideMenuBar: true,
        webPreferences: {
            webSecurity: false,
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
        }
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
        createProtocol('app')
            // Load the index.html when not in development
        win.loadURL('app://./index.html')
    }

}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async() => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS_DEVTOOLS)
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }
    createWindow()
})
ipcMain.on('copy-image', (event, filePath, targetFolderPath) => {
    const targetPath = path.join(targetFolderPath, path.basename(filePath));

    fs.copyFile(filePath, targetPath, (err) => {
        if (err) {
            console.error('Error copying file:', err);
            event.reply('copy-image-reply', { success: false, error: err });
        } else {
            console.log('File copied successfully');
            event.reply('copy-image-reply', { success: true, targetPath });
        }
    });
});
ipcMain.on('upload-image', async(event, filePath, targetFolderPath) => {
    try {
        // 检查源文件是否存在
        if (!fs.existsSync(filePath)) {
            throw new Error('Source file does not exist');
        }

        const fileName = path.basename(filePath);
        const destinationPath = path.join(targetFolderPath, fileName); // 指定的文件夹，这里使用的是用户图片目录

        // 检查目标文件夹是否存在，若不存在则创建
        if (!fs.existsSync(targetFolderPath)) {
            fs.mkdirSync(targetFolderPath);
        }
        // 复制文件
        // await fs.promises.copyFile(filePath, destinationPath);
        // event.reply('upload-image-reply', { success: true, destinationPath });
        // console.log('File copied successfully!');

        await fs.copyFile(filePath, destinationPath, (err) => {
            if (err) {
                console.error('Error copying file:', err);
                event.reply('upload-image-reply', { success: false, error: err });
            } else {
                console.log('File copied successfully', destinationPath);
                event.reply('upload-image-reply', { success: true, destinationPath: destinationPath });
            }
        });

    } catch (error) {
        console.error('Error copying file:', error.message);
    }
});
// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit()
            }
        })
    } else {
        process.on('SIGTERM', () => {
            app.quit()
        })
    }
}