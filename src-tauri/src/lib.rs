use std::fs;
use std::path::PathBuf;

fn get_data_dir() -> Result<PathBuf, String> {
    dirs::data_local_dir()
        .map(|dir| dir.join("link-arm"))
        .ok_or_else(|| "无法获取数据目录".to_string())
}

#[tauri::command]
async fn save_data(key: String, value: String) -> Result<(), String> {
    let data_dir = get_data_dir()?;

    // 创建父目录（包括子目录）
    // 如果 key 已经包含扩展名，直接使用；否则添加 .json
    let file_path = if key.contains('.') {
        data_dir.join(&key)
    } else {
        data_dir.join(format!("{}.json", key))
    };

    if let Some(parent) = file_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("创建目录失败: {}", e))?;
    }

    // 写入文件
    fs::write(&file_path, value)
        .map_err(|e| format!("写入文件失败: {}", e))?;

    Ok(())
}

#[tauri::command]
async fn load_data(key: String) -> Result<Option<String>, String> {
    let data_dir = get_data_dir()?;
    // 如果 key 已经包含扩展名，直接使用；否则添加 .json
    let file_path = if key.contains('.') {
        data_dir.join(&key)
    } else {
        data_dir.join(format!("{}.json", key))
    };

    match fs::read_to_string(&file_path) {
        Ok(content) => Ok(Some(content)),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(e) => Err(format!("读取文件失败: {}", e)),
    }
}

#[tauri::command]
async fn delete_data(key: String) -> Result<(), String> {
    let data_dir = get_data_dir()?;
    // 如果 key 已经包含扩展名，直接使用；否则添加 .json
    let file_path = if key.contains('.') {
        data_dir.join(&key)
    } else {
        data_dir.join(format!("{}.json", key))
    };

    if file_path.exists() {
        fs::remove_file(&file_path)
            .map_err(|e| format!("删除文件失败: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
async fn get_all_keys() -> Result<Vec<String>, String> {
    let data_dir = get_data_dir()?;

    let mut keys = Vec::new();

    if data_dir.exists() {
        collect_keys(&data_dir, &mut keys);
    }

    Ok(keys)
}

fn collect_keys(dir: &PathBuf, keys: &mut Vec<String>) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                
                if path.is_file() {
                    if let Ok(relative_path) = path.strip_prefix(dir.parent().unwrap_or(dir)) {
                        if let Some(path_str) = relative_path.to_str() {
                            keys.push(path_str.to_string());
                        }
                    }
                } else if path.is_dir() {
                    collect_keys(&path, keys);
                }
            }
        }
    }
}

#[tauri::command]
async fn clear_all_data() -> Result<(), String> {
    let data_dir = get_data_dir()?;

    if data_dir.exists() {
        fs::remove_dir_all(&data_dir)
            .map_err(|e| format!("清空目录失败: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
async fn open_document_file(document_id: String, user_id: String, extension: String, parent_id: Option<String>) -> Result<(), String> {
    // 获取数据目录
    let data_dir = get_data_dir()?;
    let user_dir = data_dir.join(format!("user_{}", user_id));
    let knowledge_dir = user_dir.join("knowledge");

    // 构建文件路径，支持直接父文件夹名
    let doc_path = if let Some(parent) = parent_id {
        knowledge_dir.join(&parent)
    } else {
        knowledge_dir.clone()
    };
    let file_path = doc_path.join(format!("doc_{}{}", document_id, extension));

    // 检查文件是否存在
    if !file_path.exists() {
        return Err(format!("文档文件不存在: {}", file_path.display()));
    }

    // 使用系统默认程序打开原件
    opener::open(&file_path)
        .map_err(|e| format!("打开文件失败: {}", e))?;

    Ok(())
}

#[tauri::command]
async fn save_document_dialog(_app: tauri::AppHandle, _document_id: String, content: String, suggested_name: String, extension: String) -> Result<(), String> {
    use std::io::Write;

    // 获取默认下载目录
    let download_dir = dirs::download_dir()
        .ok_or_else(|| "无法获取下载目录".to_string())?;

    // 构建建议的文件名
    let file_name = format!("{}{}", suggested_name, extension);

    // 使用 rfd 库弹出保存对话框
    let file_path = rfd::FileDialog::new()
        .set_file_name(&file_name)
        .set_directory(&download_dir)
        .save_file()
        .ok_or_else(|| "用户取消保存".to_string())?;

    // 创建文件
    let mut file = fs::File::create(&file_path)
        .map_err(|e| format!("创建文件失败: {}", e))?;

    // 根据扩展名决定如何写入内容
    if extension == ".docx" {
        // 对于 Word 文档，解码 Base64 并写入二进制数据
        use base64::{Engine as _, engine::general_purpose};
        let bytes = general_purpose::STANDARD.decode(&content)
            .map_err(|e| format!("解码 Base64 失败: {}", e))?;
        file.write_all(&bytes)
            .map_err(|e| format!("写入文件内容失败: {}", e))?;
    } else {
        // 对于文本文件，直接写入文本
        file.write_all(content.as_bytes())
            .map_err(|e| format!("写入文件内容失败: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
async fn open_document_dialog() -> Result<String, String> {
    // 使用 rfd 库弹出文件选择对话框
    let file_path = rfd::FileDialog::new()
        .pick_file()
        .ok_or_else(|| "用户取消选择".to_string())?;

    // 获取文件名（不带扩展名）
    let file_name = file_path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("document")
        .to_string();

    // 获取文件扩展名并确定文件类型
    let file_type = file_path
        .extension()
        .and_then(|s| s.to_str())
        .map(|ext| {
            match ext.to_lowercase().as_str() {
                "docx" => "docx",
                "jpg" | "jpeg" => "jpg",
                "png" => "png",
                "gif" => "gif",
                "webp" => "webp",
                _ => "txt", // 默认为 txt
            }
        })
        .unwrap_or("txt");

    // 根据文件类型决定如何处理
    let content = match file_type.as_ref() {
        "docx" | "jpg" | "png" | "gif" | "webp" => {
            // 对于二进制文件，读取内容并编码为 Base64
            let bytes = fs::read(&file_path)
                .map_err(|e| format!("读取文件失败: {}", e))?;
            use base64::{Engine as _, engine::general_purpose};
            general_purpose::STANDARD.encode(bytes)
        }
        _ => {
            // 对于文本文件，读取文本内容
            fs::read_to_string(&file_path)
                .map_err(|e| format!("读取文件失败: {}", e))?
        }
    };

    // 返回 JSON 格式：文件名、内容和文件类型
    let result = serde_json::json!({
        "filename": file_name,
        "content": content,
        "fileType": file_type
    });

    Ok(result.to_string())
}

#[tauri::command]
async fn create_folder(folder_path: String) -> Result<(), String> {
    let data_dir = get_data_dir()?;
    let full_path = data_dir.join(&folder_path);

    fs::create_dir_all(&full_path)
        .map_err(|e| format!("创建文件夹失败: {}", e))?;

    Ok(())
}

#[tauri::command]
async fn write_text_file(path: String, contents: String) -> Result<(), String> {
    let data_dir = get_data_dir()?;
    let full_path = data_dir.join(&path);

    if let Some(parent) = full_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("创建目录失败: {}", e))?;
    }

    fs::write(&full_path, contents)
        .map_err(|e| format!("写入文件失败: {}", e))?;

    Ok(())
}

#[tauri::command]
async fn delete_folder(folder_path: String) -> Result<(), String> {
    let data_dir = get_data_dir()?;
    let full_path = data_dir.join(&folder_path);

    if full_path.exists() && full_path.is_dir() {
        fs::remove_dir_all(&full_path)
            .map_err(|e| format!("删除文件夹失败: {}", e))?;
    }

    Ok(())
}

/// 下载文件夹到用户指定位置（直接复制，不打包）
#[tauri::command]
async fn download_folder(folder_id: String, folder_name: String, user_id: String, parent_id: Option<String>) -> Result<String, String> {
    let data_dir = get_data_dir()?;
    let user_dir = data_dir.join(format!("user_{}", user_id));
    let knowledge_dir = user_dir.join("knowledge");

    let source_path = if let Some(parent) = parent_id {
        knowledge_dir.join(&parent).join(&folder_id)
    } else {
        knowledge_dir.join(&folder_id)
    };

    if !source_path.exists() {
        return Err(format!("文件夹不存在: {}", source_path.display()));
    }

    let download_dir = dirs::download_dir()
        .ok_or_else(|| "无法获取下载目录".to_string())?;

    let target_path = rfd::FileDialog::new()
        .set_file_name(&folder_name)
        .set_directory(&download_dir)
        .pick_folder()
        .ok_or_else(|| "用户取消选择".to_string())?;

    let final_target = target_path.join(&folder_name);

    fn copy_dir_recursive(src: &PathBuf, dst: &PathBuf) -> Result<(), String> {
        if !dst.exists() {
            fs::create_dir_all(dst)
                .map_err(|e| format!("创建目录失败: {}", e))?;
        }

        for entry in fs::read_dir(src).map_err(|e| format!("读取目录失败: {}", e))? {
            if let Ok(entry) = entry {
                let src_path = entry.path();
                let dst_path = dst.join(entry.file_name());

                if src_path.is_dir() {
                    copy_dir_recursive(&src_path, &dst_path)?;
                } else {
                    fs::copy(&src_path, &dst_path)
                        .map_err(|e| format!("复制文件失败: {}", e))?;
                }
            }
        }
        Ok(())
    }

    copy_dir_recursive(&source_path, &final_target)?;

    Ok(final_target.to_string_lossy().to_string())
}

// ==================== 本地文件系统工具接口 ====================

#[derive(serde::Serialize)]
struct FileInfo {
    name: String,
    path: String,
    is_file: bool,
    is_dir: bool,
    size: u64,
    modified: Option<u64>,
}

/// 获取桌面路径
#[tauri::command]
async fn get_desktop_path() -> Result<String, String> {
    dirs::desktop_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "无法获取桌面路径".to_string())
}

/// 获取下载目录路径
#[tauri::command]
async fn get_downloads_path() -> Result<String, String> {
    dirs::download_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "无法获取下载目录路径".to_string())
}

/// 获取文档目录路径
#[tauri::command]
async fn get_documents_path() -> Result<String, String> {
    dirs::document_dir()
        .map(|p| p.to_string_lossy().to_string())
        .ok_or_else(|| "无法获取文档目录路径".to_string())
}

/// 列出目录内容
#[tauri::command]
async fn list_directory(path: String) -> Result<Vec<FileInfo>, String> {
    let dir_path = PathBuf::from(&path);
    
    if !dir_path.exists() {
        return Err(format!("目录不存在: {}", path));
    }
    
    if !dir_path.is_dir() {
        return Err(format!("路径不是目录: {}", path));
    }
    
    let mut files = Vec::new();
    
    for entry in fs::read_dir(&dir_path).map_err(|e| format!("读取目录失败: {}", e))? {
        if let Ok(entry) = entry {
            let path = entry.path();
            let metadata = entry.metadata().map_err(|e| format!("获取文件元数据失败: {}", e))?;
            
            files.push(FileInfo {
                name: entry.file_name().to_string_lossy().to_string(),
                path: path.to_string_lossy().to_string(),
                is_file: path.is_file(),
                is_dir: path.is_dir(),
                size: metadata.len(),
                modified: metadata.modified()
                    .ok()
                    .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                    .map(|d| d.as_secs()),
            });
        }
    }
    
    Ok(files)
}

/// 读取文件内容
#[tauri::command]
async fn read_local_file(path: String) -> Result<String, String> {
    let file_path = PathBuf::from(&path);
    
    if !file_path.exists() {
        return Err(format!("文件不存在: {}", path));
    }
    
    if !file_path.is_file() {
        return Err(format!("路径不是文件: {}", path));
    }
    
    fs::read_to_string(&file_path)
        .map_err(|e| format!("读取文件失败: {}", e))
}

/// 写入文件内容
#[tauri::command]
async fn write_local_file(path: String, content: String) -> Result<(), String> {
    let file_path = PathBuf::from(&path);
    
    // 确保父目录存在
    if let Some(parent) = file_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("创建目录失败: {}", e))?;
    }
    
    fs::write(&file_path, content)
        .map_err(|e| format!("写入文件失败: {}", e))
}

/// 创建本地目录
#[tauri::command]
async fn create_local_directory(path: String) -> Result<(), String> {
    let dir_path = PathBuf::from(&path);
    
    fs::create_dir_all(&dir_path)
        .map_err(|e| format!("创建目录失败: {}", e))
}

/// 删除本地文件
#[tauri::command]
async fn delete_local_file(path: String) -> Result<(), String> {
    let file_path = PathBuf::from(&path);
    
    if !file_path.exists() {
        return Err(format!("文件不存在: {}", path));
    }
    
    if file_path.is_file() {
        fs::remove_file(&file_path)
            .map_err(|e| format!("删除文件失败: {}", e))?;
    } else if file_path.is_dir() {
        fs::remove_dir_all(&file_path)
            .map_err(|e| format!("删除文件夹失败: {}", e))?;
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![
      // 通用接口
      save_data,
      load_data,
      delete_data,
      get_all_keys,
      clear_all_data,
      open_document_file,
      save_document_dialog,
      open_document_dialog,
      create_folder,
      write_text_file,
      delete_folder,
      download_folder,
      // 本地文件系统工具接口
      get_desktop_path,
      get_downloads_path,
      get_documents_path,
      list_directory,
      read_local_file,
      write_local_file,
      create_local_directory,
      delete_local_file
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
