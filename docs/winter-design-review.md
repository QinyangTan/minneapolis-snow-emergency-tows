# Winter visual review

Date: 2026-10-07

**Decision: ship.** 本次检查没有发现需要阻止发布的 UI 或数据编码问题。

## Scope and evidence

检查独立 Demo 的 `demo/src/App.svelte`、`demo/src/style.css`、`demo/src/lib/City.svelte`、`demo/src/lib/scene.js` 与 `demo/src/lib/analysis.js`。查看同一轮新截图：`docs/screenshots/winter/desktop.jpg`、`unfolded.jpg`、`comparison.jpg` 和 `mobile.jpg`。这是范围有限的代码和截图检查；没有另开 Browser 重复主代理的交互测试，也不声称完成 Screen-reader 或 WCAG certification。

## Findings

- Snowflake wordmark、雪白城市、冷蓝水体和 Blue needles 使用同一 Minneapolis winter theme。标题有清楚主次；三日展开保留城市形态和精确值。
- Event、Count/Share 和 Day controls 保持可见。Compare 使用原生 `details` / `summary` 和有 Label 的 `select`。Comparison 截图显示 Bridge 与 Howard 的同一 Day、同一 Neighborhood；69.7% 与 53.2% 没有误用不同分母。
- Count 共享全样本的零起点 Scale（0–66）。Share 共享 0–100%，定义为 Day count ÷ 同一 Neighborhood 的三日 Total。零 Total 仍返回 null。Scene 不因 Event、Day 或 Neighborhood 重新缩放 Height。
- 390px Mobile 截图中，正文、控件与精确值适配单列。History table 的水平滚动限制在 `.table-scroll`。窄屏显示一个 Primary map；Comparison 的 HTML 值仍保留。
- Drag rotation、Scroll/Pinch zoom、Keyboard arrows、Home 和独立 Reset view 保留。Click 与 Drag 的区分逻辑没有被本次视觉修改移除。
- CSS text contrast 的计算值：Navy/Frost 12.13:1，Muted/Frost 5.41:1，Hover/Frost 5.68:1，Muted/section background 5.06:1，White/active Day 12.93:1。这些计算支持主要文字可读性；不是完整 Accessibility audit。
- Needle legend、Share denominator、未匹配 records、样本范围与 NOAA weather limits 保留。简化文字没有改变数值含义。

## Non-blocking observations

- Compare 展开时会覆盖标题区域；它是临时选择层，Summary 可关闭，Select 可正常使用。选定 Event 后 disclosure 自动关闭；Reset 也关闭它。最终 Mobile 截图为收起状态。
- History 的完整 Caption 位于可滚动 Table 内，部分说明在窄屏需要水平滚动后才能看到。精确 Counts 与 Shares 仍可读取。
- `demo/PRODUCT.md` 和 `demo/DESIGN.md` 已同步为 Blue palette。

以上观察不要求增加控件或文案。保持本次简洁范围即可发布。
