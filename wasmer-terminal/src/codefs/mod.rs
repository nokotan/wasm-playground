pub mod client;
pub mod file;
pub mod fs;
pub mod opener;

use std::path::PathBuf;

use tokio::sync::mpsc::Sender;
use wasmer_os::wasmer_vfs::Result;
use wasmer_os::wasmer_vfs::{Metadata, ReadDir};

#[derive(Debug)]
pub enum FileCommands {
    Stat {
        path: PathBuf,
        tx: Sender<Result<Metadata>>,
    },

    ReadDirectory {
        path: PathBuf,
        tx: Sender<Result<ReadDir>>,
    },

    CreateDirectory {
        path: PathBuf,
        tx: Sender<()>,
    },

    ReadFile {
        path: PathBuf,
        tx: Sender<Vec<u8>>,
    },

    WriteFile {
        path: PathBuf,
        data: Vec<u8>,
        tx: Sender<()>,
    },

    Delete {
        path: PathBuf,
        tx: Sender<()>,
    },

    Rename {
        old_path: PathBuf,
        new_path: PathBuf,
        tx: Sender<()>,
    },
}
