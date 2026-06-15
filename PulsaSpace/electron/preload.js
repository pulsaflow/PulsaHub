/**
 * PulsaSpace — Preload
 * Expose une API sécurisée au renderer via contextBridge.
 */

const { contextBridge, ipcRenderer } = require('electron')

const ALLOWED_INVOKE = [
  'get-drives',
  'scan-folder',
  'cancel-scan',
  'analyze-cleanable',
  'clean-files',
  'open-dialog',
  'open-in-explorer',
  'copy-path',
  'trash-path',
  'show-properties',
  'window-is-maximized',
  'show-notification',
]

const ALLOWED_SEND = ['window-close', 'window-minimize', 'window-maximize']

contextBridge.exposeInMainWorld('pulsaspace', {
  invoke: (channel, ...args) => {
    if (ALLOWED_INVOKE.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args)
    }
    return Promise.reject(new Error(`Channel ${channel} not allowed`))
  },
  send: (channel, ...args) => {
    if (ALLOWED_SEND.includes(channel)) {
      ipcRenderer.send(channel, ...args)
    }
  },
  on: (channel, fn) => {
    if (channel === 'scan-progress') {
      ipcRenderer.on(channel, (_, ...a) => fn(...a))
    }
  },
  removeListener: (channel) => {
    if (channel === 'scan-progress') {
      ipcRenderer.removeAllListeners(channel)
    }
  },
})
