# 开发与验证

插件通过 `sidebar.brand.mark` 和 `sidebar.brand.name` 两个单值插槽接管品牌显示，
在 `plugins.bundle.config` 提供本地选图入口。
插件只注册自己的插槽与样式。
样式以插件标记和宿主语义属性为锚点，收起展开栏中已经没有内容的品牌区域，或在折叠时显示原生展开图标。
没有品牌整排的独立插槽，Web 侧栏开关与品牌共享一条容器，因此无图时保留开关所需的 28 px。

图片只存当前浏览器的 `localStorage`，不上传，也不改写 DSH 配置。
文件大小、类型和浏览器解码通过检查后才替换旧图。
停用会撤销两个品牌插槽、插件详情入口和布局样式，但保留已选择的图片。
若当前页面仍保留已停用客户端模块，插件监听官方插件管理事件，读取运行中的插件行状态并同步界面。
独立安装和外观 Atlas 共用同一行状态，聚合包被启用不代表它的每个成员都被启用。

## 验证

在插件目录运行 `pnpm install`、`npm test`、`npm run check` 及 `npm pack --dry-run --json`。
在工作区根目录运行 `node tools/new-dsh-plugin/cli.mts --check plugins/dsh-sidebar-brand`。

使用工作区的 `tools/dsh-web-dev.mts` 准备两个一次性 profile，分别只安装侧栏品牌和只安装外观 Atlas。
在两份测试 profile 的 `cordis.patch.yml` 中把 `ui-settings-models` 的 `config.credentialOnboarding` 设为 `false`，
以便测试不需要模型凭证。
启动各自的 DSH Web，将打印的测试地址放进 `SIDEBAR_BRAND_TEST_URL`。
从工作区根运行 `node plugins/dsh-sidebar-brand/docs/verify-web.mts standalone` 和相应的 `atlas` 模式。
脚本用 Chrome 实际点击侧栏开关、选择样图并切换侧栏品牌的插件行，检查无图隐藏、折叠图标、无效图片和禁用后重新启用。

升级 DSH 时，重新核对品牌插槽的优先级和 `SidebarRoot` 的侧栏结构，再重复浏览器测试。
