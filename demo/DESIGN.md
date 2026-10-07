---
name: Three Days, Three Rules
description: Minneapolis rises, then unfolds; a historical tow-record data story.
colors:
  frost: "#f5f8fa"
  navy: "#173449"
  river: "#176a8a"
  needle: "#315d76"
  silver: "#c5d5de"
  muted: "#4f697b"
  action-hover: "#176a8a"
  share-track: "#d7e4eb"
  share-fill: "#6d9aaf"
  selected-row: "#e0edf3"
  scene-land: "#f3f7fa"
  scene-side: "#c6d8e1"
  scene-edge: "#9cb6c5"
  scene-water: "#315d76"
  scene-selected: "#168aad"
  scene-highlight: "#bbdbe7"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(82px, 8vw, 140px)"
    fontWeight: 700
    lineHeight: 0.91
    letterSpacing: "-0.025em"
  reading-headline:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(56px, 5.6vw, 88px)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  neighborhood-title:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.05
  count:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "66px"
    fontWeight: 700
    lineHeight: 1
  day-count:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: "Barlow, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Barlow, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  day-label:
    fontFamily: "Barlow, sans-serif"
    fontSize: "20px"
    fontWeight: 600
rounded:
  day-button: "30px"
  needle-key: "1px"
spacing:
  page-inline: "4.3vw"
  page-inline-narrow: "5vw"
  control-gap: "36px"
  profile-gap: "25px"
components:
  day-button:
    textColor: "{colors.navy}"
    rounded: "{rounded.day-button}"
    padding: "11px 24px"
  day-button-active:
    backgroundColor: "{colors.navy}"
    textColor: "white"
    rounded: "{rounded.day-button}"
    padding: "11px 24px"
  open-comparison:
    textColor: "{colors.navy}"
    padding: "12px 0"
  view-toggle:
    textColor: "{colors.navy}"
  neighborhood-select:
    textColor: "{colors.navy}"
    padding: "4px 21px 4px 0"
  event-select:
    textColor: "{colors.navy}"
    padding: "4px 23px 5px 0"
  metric-button:
    textColor: "{colors.muted}"
    padding: "4px 0 7px"
  metric-button-active:
    textColor: "{colors.navy}"
    padding: "4px 0 7px"
  highlight-action:
    textColor: "{colors.navy}"
    padding: "10px 0"
  page-navigation:
    textColor: "{colors.navy}"
    padding: "9px 0"
---

# Design System: Three Days, Three Rules

## Overview

**Creative North Star: "Minneapolis rises, then unfolds"**

浅色 City needles 是主体。紧凑标题建立阅读顺序，HTML controls 和精确数值保持清楚。Geometry 提供位置，Needle height 表示当前 Count 或 within-neighborhood Share；装饰不增加数据含义。

本文件记录 approved A+C 的当前代码实现。它不替换上级目录的 approved brief。Concept images 是 schematic references。运行界面使用 code-native Three.js Geometry，不使用 raster concept 作为数据图。

**Key Characteristics:**

- Frost surface、Navy text、Ice blue needles。
- 一座城市先展示一个 Day；Viewport ≥801px 可比较两个 Events，或展开三个 Day plates。
- 同一 Geometry、零起点 Count/Share scales、可读取的 HTML counts 与 denominators。
- 平面控件与有真实 Depth 的 City 分工清楚。

## Colors

Palette 使用冷色背景和浅冰蓝数据标记。Frontmatter 记录实际 CSS 与 Scene colors。

### Primary

- **Ice blue**：Count needles 与 Legend needle key。Selected needle 使用 Scene selected 色。
- **Navy**：标题、正文、Selected day button 与控件下划线。

### Secondary

- **River**：HTML focus outline。Scene water 使用独立材质色；两者当前不同。

### Neutral

- **Frost**：Page background 和浮动 Map labels 的浅色底。
- **Silver**：Controls、Inspection 和 Records 的分隔线。
- **Muted**：辅助文字、分母和来源说明。
- **Scene land / side / edge**：城市顶面、侧面和细边界。
- **Scene highlight**：当前 Neighborhood 与 Top-five Neighborhoods 的顶面填色。
- **Action hover**：Button/Link hover 与选中的 Top-five action。
- **Share track / fill**：History table 内的零起点 Share bars。Peak bars 使用 Ice blue。
- **Selected row**：Records table 的 Selected Neighborhood 与 History table 的当前 Event。

**The Metric Rule.** Ice blue needle 的 Height 只能来自 published Neighborhood count 或它在同一 Event 三日 Total 中的 Share。零 Total 的 Share 必须显示为 Undefined/N/A。

## Typography

Display 与数值使用 **Barlow Condensed**。正文与 Controls 使用 **Barlow**。两者都从 `public/fonts/` self-host；该目录包含 OFL license。没有第三种字体或固定 Modular scale。

Hierarchy 的桌面值在 frontmatter 中。补充的实际字号：Opening thesis（20px，line-height 1.45）；Reading body（19px）；Record heading（53px）；Sources heading（42px）；History heading（与 Reading headline 同一 Clamp）；Weather heading（`clamp(45px, 4.5vw, 64px)`，line-height 1）；Weather value（34px，line-height 1.1）；辅助正文（13–15px）。Count、Day profile 与 Table 使用 `font-variant-numeric: tabular-nums`。

Responsive type：800px 以下 Opening title（88px）、Selected title（34px）、Count（58px）、Day label（18px）；480px 以下 Opening title（82px）。Unfolded title 使用 `clamp(65px, 6vw, 105px)`，800px 以下为 68px。Scene day labels 使用 32px，800px 以下为 25px。Share count 使用 47px，≤800px 为 40px，≤480px 为 34px。Weather values 在 ≤800px 为 31px。不要把桌面 Display 值用于所有屏宽。

## Layout

桌面 Opening 使用 35% / 65% Grid。当前 Surface 高度为 `calc(100svh - 290px)`，下限 600px，上限 860px；展开模式使用 `calc(100svh - 310px)`，下限 650px，上限 980px。Event controls 位于 City 上方，使用 `1fr .65fr 1fr` Grid。Day controls 位于 City 下方。Inspection 使用四列，Reading 使用 42% / 58%，Sources 使用 35% / 65%。这些是当前页面布局，不是所有页面必须复用的模板。

1100px 以下 Opening 改为 38% / 62%。800px 以下为单列；Inspection 为两列，Page inline spacing 改为 5vw。≤800px 隐藏 Header 的 Sources link；≤480px 同时隐藏 Records link。相应 Sections 仍在页面内。History 与 Weather 桌面使用 42% / 58%，≤800px 为单列；Profile averages 为两列，窄屏为单列。

多 Plate 使用 `matchMedia('(min-width: 801px)')`。有 Comparison 时展示两个 Events 的同一 Day；否则可展开当前 Event 的三个 Day。Viewport ≤800px 时返回 Primary City，隐藏 Unfold action；第二 Event 与三日值仍在 HTML 中。801–1100px 的展开 Header 使用单列、64px title，并隐藏 Event note。Table wrapper 允许水平滚动。History table 最小宽度为 690px，≤800px 时为 640px。Event controls 窄屏为 `1fr auto`，Comparison select 跨整行。

**The Comparison Rule.** 两个 Events 或三个 Day 必须共享 Geometry 与当前 Metric scale。Count 范围为全 Collection 的 0–66；Share 范围为 0–100%。World maximum height 为 7.2。不要按 Event、Day 或 Selected Neighborhood 重新归一化。

## Elevation & Depth

HTML controls 和 sections 使用平面底色、细线与留白；没有 CSS box-shadow。Scene 使用由 `framing.js` 按真实 Geometry 和完整共享 Height bounds 拟合的 Orthographic Camera；拟合保持 Aspect ratio，并增加 16% clearance。Event、Day 和 Metric selection 不改变静态拟合 Bounds。Fit 保留用户 Camera orientation 与 zoom；Comparison 预留 Canvas bottom 85px（比例上限 30%），为 Plate captions 与 Controls 留空间。Scene 使用浅 Extrude plates（Depth 0.36）和 Soft shadows。Floor shadow opacity 为 0.13。不要把 Scene lighting 翻译成浮动 UI cards。

Scene 在 Metric/Day heights 与 Plate positions 变化时使用 exponential interpolation（`1 - exp(-8 × dt)`）；`dt` 上限为 0.05 seconds。Reduced-motion 直接切换。过渡中的 Selected map label 显示省略号，稳定后显示真实 Count。HTML Inspection 保留真实 Count。

## Shapes

Day buttons 使用 Capsule shape。其他控件使用透明背景、直线下边框和原生 Select arrow。Needles 等宽；Scene 使用 8-sided Cylinder（radius 0.072），零值不生成可见高度。Geography 由真实 Polygon/MultiPolygon 生成，不能用底面面积表达 Count。

## Components

### Day buttons

三个语义 `button` 位于有 Label 的 Group。Selected state 使用 Navy fill、white text 和 `aria-pressed`。非 Selected state 使用透明背景。Hover 使用 Action hover text；Selected Capsule 保持 white text。没有自定义 Hover animation。

### Comparison action

带内联 SVG 的文字 Button，下边框表示可操作性。`aria-pressed` 表示展开状态。它只在 Viewport ≥801px 且未选择第二 Event 时出现。

### View controls

Top view / Angled view 使用文字与 SVG。Selected state 使用下划线和 `aria-pressed`。Reset 保留当前 Event，恢复 Day 2、Count、Marcy Holmes、单 City 与 Angled view，并清除第二 Event 和 Top-five highlight。独立 Reset view 只重置 Camera rotation/zoom。

### Event and metric controls

Event 与 Compare with 使用原生 Select，显示 Event name 和 start date。Count/Share 使用带 Label 的 Button group；Selected metric 使用 Navy text 和 2px underline。Share 的分母始终写为当前 Neighborhood 的三日 Total。

### Neighborhood select

原生 `select` 使用可见 Label 和 accessible name。它更新 Scene highlight、Count、三日分布、City share 与 Peak text。Keyboard 用户无需直接操作 Canvas。

### Orbit navigation

Canvas 可 Focus。Pointer Drag 旋转；Scroll/Pinch 缩放。OrbitControls 禁用 Pan 和 Damping，zoom 限定为 0.65–2.5；Pointer movement 超过 6px 时不选择 Neighborhood。Keyboard arrows 旋转，+/- 缩放，Home 重置 Camera。Cursor 从 Grab 变为 Grabbing。Top/Angled presets 重置 orientation 和 zoom；普通数据选择保留用户视角。

### Top-five and history

Top-five 使用分隔线 List、可操作的 Neighborhood names 和 Count；Highlight action 使用文字与下边框。History 使用语义 Table：每个 Day cell 同时给 Count、Share 和 4px-high common-scale bar。Ties 显示所有 Peak Days；零 Total 显示 Undefined shares 和 No records。Pooled share 与 Equal-event share 是两种明确标注的汇总，不能互换。

### Weather context

Weather 使用有 Label 的 Definition list，展示 fixed-window snowfall、start-date depth 和 temperature。单位分别为 mm 与 °C。Trace、Missing、Status 和 Station ID 保留文字说明。比较 Event 的 Weather 在同一 Section 中给出；这不是新 Metric，也不改变 Needle height。

### Navigation and records

Header 使用有 Label 的语义 `nav`。Records 使用原生 `details` / `summary`、Table caption、Column/Row scopes 与 CSV download。Table 的 Neighborhood name buttons 可选择地区并滚动到 Controls。选中行使用浅冰蓝底，不是 Card。

### Accessibility behavior

代码含 Skip link、3px River focus outline（offset 5px）、HTML `aria-live="polite"` Inspection、Canvas accessible label 和 Reduced-motion 分支。Projected map labels 与 History share bars 为 `aria-hidden`，由 HTML counts/shares 提供相同信息。Canvas 具有 `tabindex="0"` 与 Keyboard instructions；Canvas Focus 使用浏览器默认 treatment，未加入自定义 River outline。这些是已读取的实现行为；本文不声称完成 WCAG certification 或 Screen-reader audit。

## Do's and Don'ts

### Do:

- **Do** 保持零起点、相同 Geometry 与共享 Height scale。
- **Do** 同时提供 HTML Count、Metric denominator、来源和未匹配 records。
- **Do** 将零 Count、Undefined Share、Trace weather 和 Missing weather 分别标注。
- **Do** 使用 self-hosted Barlow fonts 和现有语义 Controls。
- **Do** 将窄 Viewport 的三日比较交给 Day controls 与 HTML counts。

### Don't:

- **Don't** 把 Schematic concept image 当成运行时数据图。
- **Don't** 用 Snow depth、风险或装饰楼高解释 Needle height。
- **Don't** 用 Station weather 与 Selected Event counts 声称因果关系。
- **Don't** 为此界面添加不存在的 Cards、Fields 或视觉组件。
- **Don't** 把代码中的 Focus/Reduced-motion 分支写成已认证的 Accessibility 结论。

## Winter refinement · 2026-10-07

用户要求统一 Minneapolis snow 主题并精简文字。Hero 使用 “Snow in Minneapolis”。Snowflake wordmark、Snow-white land、Ice-blue water、Blue needles 与 Navy type 构成同一视觉主题。Needle height 仍只表示 Count 或 Share，不表示雪深。

Compare events 改为原生 details。选定第二 Event 后关闭 disclosure；Reset 同时关闭它。Event、Day、Count/Share、Neighborhood、三日展开、Camera navigation、HTML values、CSV 与来源保留。删除重复的 Count 说明，压缩辅助正文，保留单位、分母、样本限制与 Weather caveats。

截图：docs/screenshots/winter/。Canvas focus 使用 3px River outline。
