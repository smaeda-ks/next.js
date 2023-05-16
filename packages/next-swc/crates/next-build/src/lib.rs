use turbopack_binding::turbo::{
    tasks::{run_once, TransientInstance, TurboTasks},
    tasks_memory::MemoryBackend,
};

pub mod build_options;
pub mod manifests;
pub(crate) mod next_build;
pub(crate) mod next_pages;

use anyhow::Result;
use turbo_tasks::{StatsType, TurboTasksBackendApi};

pub use self::build_options::BuildOptions;

pub async fn build(options: BuildOptions) -> Result<()> {
    #[cfg(feature = "tokio_console")]
    console_subscriber::init();
    register();

    let tt = TurboTasks::new(MemoryBackend::new(
        options.memory_limit.map_or(usize::MAX, |l| l * 1024 * 1024),
    ));

    let stats_type = match options.full_stats {
        true => StatsType::Full,
        false => StatsType::Essential,
    };
    tt.set_stats_type(stats_type);

    run_once(tt, async move {
        next_build::next_build(TransientInstance::new(options)).await?;

        Ok(())
    })
    .await?;

    Ok(())
}

pub fn register() {
    turbopack_binding::turbo::tasks::register();
    turbopack_binding::turbo::tasks_fs::register();
    turbopack_binding::turbopack::turbopack::register();
    turbopack_binding::turbopack::core::register();
    turbopack_binding::turbopack::node::register();
    turbopack_binding::turbopack::dev::register();
    turbopack_binding::turbopack::build::register();
    next_core::register();
    include!(concat!(env!("OUT_DIR"), "/register.rs"));
}
