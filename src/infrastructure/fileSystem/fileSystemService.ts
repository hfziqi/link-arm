import { invoke } from '@tauri-apps/api/core'

export interface FileInfo {
  name: string
  path: string
  is_file: boolean
  is_dir: boolean
  size: number
  modified?: number
}

export class FileSystemService {
  async getDesktopPath(): Promise<string> {
    return await invoke<string>('get_desktop_path')
  }

  async getDownloadsPath(): Promise<string> {
    return await invoke<string>('get_downloads_path')
  }

  async listDirectory(path: string): Promise<FileInfo[]> {
    return await invoke<FileInfo[]>('list_directory', { path })
  }

  async readFile(path: string): Promise<string> {
    return await invoke<string>('read_local_file', { path })
  }

  async writeFile(path: string, content: string): Promise<void> {
    await invoke('write_local_file', { path, content })
  }

  async createDirectory(path: string): Promise<void> {
    await invoke('create_local_directory', { path })
  }

  async deleteFile(path: string): Promise<void> {
    await invoke('delete_local_file', { path })
  }
}

let instance: FileSystemService | null = null

export function getFileSystemService(): FileSystemService {
  if (!instance) {
    instance = new FileSystemService()
  }
  return instance
}

export const fileSystemService = getFileSystemService()
