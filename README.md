# Sidebar brand

[简体中文](README.zh.md)

Hide the sidebar logo and brand name, or replace them with one local image.
The sidebar toggle remains accessible.

On DSH 0.2.2-rc.5, run `pnpm install` in this directory to build it,
then select the directory from **Plugins → Add plugin**.
In **Plugins → Sidebar brand**, choose a PNG, JPEG, WebP, SVG, GIF, or AVIF up to 1 MiB.
A wide image works best in expanded mode.
The collapsed rail fits the same image into a square and shows the native expand icon on hover.

Removing the image hides the brand and keeps the expand control visible.
Disabling the plugin restores the stock brand.
The image is stored in this browser for this DSH address, so it is still available when the plugin is re-enabled.

[Development and verification](docs/README.md)
