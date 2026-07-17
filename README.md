# KernelSU Web

KernelSU Manager 模拟器 — 纯前端实现的 KernelSU 管理界面原型。

## 功能

- 首页仪表盘：两种主题风格（Material / Miuix）
- 超级用户管理：应用列表、App Profile、SU 日志
- 模块管理：模块列表、开关、详情对话框、启用计数角标
- 设置页：开关选项、下拉选择、主题切换（跟随系统/浅色/深色）
- 模块仓库（预留）
- 安装页、关于页

## 项目结构

```
KernelSU-Web/
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式（含深色/浅色主题变量）
├── js/
│   └── app.js          # 全部逻辑
└── img/
    └── yuanshen.png    # 示例应用图标
```

## 技术栈

原生 HTML + CSS + JavaScript，零依赖。使用 Material Symbols Rounded 图标字体。

## 许可

MIT
