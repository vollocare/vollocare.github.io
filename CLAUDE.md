# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a p5.js-based flocking simulation and velocity obstacle (VO) demonstration. The project implements group behavior algorithms for units that can move, attack, and avoid obstacles in a 2D environment. It's designed as a GitHub Pages website demonstrating AI pathfinding and flocking behaviors.

## Architecture

The project follows a hybrid architecture with both TypeScript source files and JavaScript runtime files:

- **TypeScript Source (`src/`)**: Contains interfaces and type definitions
  - `app.ts`: Main entry point for TypeScript compilation
  - `unit.ts`: Defines the IUnit interface with properties for position, velocity, health, attack mechanics
  - `test.ts`: Test utilities

- **JavaScript Runtime**: Core simulation logic implemented in vanilla JavaScript
  - `sketch.js`: Main p5.js sketch containing setup(), draw(), and game loop
  - `flock.js`: Implements flocking algorithms (separation, alignment, cohesion, avoidance)
  - `unit_obj.js`: Unit object implementation and behavior
  - `gup_unit_obj.js`: Group unit object management
  - `obstacles.js`: Obstacle collision and avoidance system

- **HTML Entry**: `index.html` loads p5.js from CDN and includes all JavaScript files

## Common Commands

### Development Setup
```bash
npm install
```

### Build Project
```bash
webpack
```
Output will be generated to `./dist/app.js`

### TypeScript Compilation
```bash
npx tsc
```
The TypeScript compiler outputs to `./dist/` directory as configured in `tsconfig.json`.

### Full Build Process
For complete deployment build:
```bash
npm install && npx tsc && webpack
```

### GitHub Operations
Use GitHub CLI (`gh`) for all GitHub-related operations:
```bash
gh pr create --title "title" --body "description"
gh pr list
gh pr view
gh issue create
gh repo view
```

## GitHub Actions Integration

This project has Claude Code GitHub Actions integration configured:

### Existing GitHub Actions
The repository includes two GitHub Actions workflows:

1. **Claude Code Interactive** (`.github/workflows/claude.yml`)
   - Triggers when `@claude` is mentioned in issues, PRs, or comments
   - Provides AI-powered assistance for development tasks
   - Requires `CLAUDE_CODE_OAUTH_TOKEN` secret

2. **Claude Code Review** (`.github/workflows/claude-code-review.yml`)
   - Automatic code review on pull requests
   - Provides feedback on code quality, security, and best practices
   - Runs on PR opened/synchronized events

### GitHub Pages Deployment
This project is configured for GitHub Pages deployment:

#### Manual Deployment
1. Build the project: `npm install && npx tsc && webpack`
2. Commit all changes including `dist/` directory
3. Push to main branch - GitHub Pages will serve from root directory

#### Repository Settings
- Enable GitHub Pages in repository settings
- Set source to "Deploy from a branch" 
- Select "main" branch and "/ (root)" folder

### Claude Code Usage
- Mention `@claude` in issues or PR comments to get AI assistance
- Claude can help with debugging, code review, and development tasks
- Automatic code review runs on all pull requests

## Key Systems

### Unit Behavior System
Units have multiple states: `move`, `stop`, `follow`, `attack`, `escape`, `die`. Each unit has:
- Position, velocity, acceleration vectors
- Health and life systems with cooldowns
- Attack mechanics with range and cooldown timers
- Destination targeting and approach behavior

### Flocking Algorithm
Implemented in `flock.js` with three core behaviors:
- **Separation**: Avoid crowding neighbors
- **Alignment**: Steer towards average heading of neighbors  
- **Cohesion**: Steer towards average position of neighbors
- **Avoidance**: Avoid obstacles and enemy units

### Control System
- `control` variable switches between player (1), enemy (2), enemy2 (3)
- PVP mode toggle available (`isPVP`)
- Mouse interaction for unit control and targeting

## Development Notes

- The project uses p5.js in WEBGL mode for 3D camera capabilities
- Viewport system implemented for camera control and text rendering
- Mixed TypeScript/JavaScript codebase - TypeScript for interfaces, JavaScript for runtime logic
- No test framework currently configured