# Dev³ Design Guidelines

## Design Approach
**System:** Hybrid approach drawing from Linear's precision + Stripe's clarity + Web3 aesthetic (Uniswap, Rainbow)

**Core Principles:**
- Technical sophistication with approachable UX
- Visual representation of AI collaboration/trinity
- Sharp, futuristic aesthetic balancing professionalism with innovation

---

## Typography

**Font Stack:**
- Headings: Inter (700/800 weights) - geometric precision
- Body: Inter (400/500) - excellent readability
- Code/Technical: JetBrains Mono (400/500) - for model outputs/logs

**Scale:**
- Hero: text-6xl to text-7xl (60-72px)
- Section Headers: text-4xl (36px)
- Subsections: text-2xl (24px)
- Body: text-base to text-lg (16-18px)
- Captions: text-sm (14px)

---

## Layout System

**Spacing Units:** Tailwind's 4, 6, 8, 12, 16, 24, 32
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24
- Grid gaps: gap-6 to gap-8

**Container Strategy:**
- Max width: max-w-7xl
- Content sections: max-w-6xl
- Text blocks: max-w-3xl

---

## Component Library

### Hero Section (Full viewport)
- Large headline introducing Dev³ concept
- Subheading explaining three-AI architecture
- Primary CTA: "Watch Dev³ Build" + Secondary: "Learn More"
- Animated visualization: Three nodes (Grok/ChatGPT/Claude) interconnected with subtle pulse effects
- Background: Abstract gradient mesh or neural network visualization

### AI Trinity Cards (3-column grid)
Three cards representing each AI model:
- Icon/avatar for each model
- Model name + role subtitle
- 2-3 bullet points of specialization
- Subtle border styling with hover elevation

### How It Works Section
- 4-step horizontal timeline on desktop (stacked mobile)
- Each step: Number badge, title, description
- Connecting lines between steps
- Visual flow from decision → collaboration → execution

### Live Decision Board (if real-time)
- Dashboard-style panel showing recent decisions
- Three columns for each AI's input
- Consensus indicator/voting visualization
- Timestamp + decision outcome

### Technical Architecture
- System diagram showing AI interaction flow
- Clean, minimal icons for each component
- Connecting arrows/lines
- Hover states revealing additional detail

### CTA Section
- Bold headline about experiencing AI collaboration
- Two-button layout (primary + secondary action)
- Supporting text about getting started

### Footer
- Navigation links (About, Documentation, GitHub, Contact)
- Social links (Twitter, Discord, GitHub)
- Copyright + "Powered by three minds" tagline

---

## Images

**Hero Background:**
Large, high-quality abstract visualization representing AI neural networks or three interconnected spheres/nodes. Gradient overlays to ensure text readability. Image should feel futuristic and technical.

**AI Model Avatars:**
Three distinct geometric or abstract icons representing each AI's personality:
- Grok: Dynamic, sharp angles (lightning/momentum)
- ChatGPT: Structured, grid-based (organized/systematic)  
- Claude: Balanced, flowing curves (thoughtful/ethical)

**Architecture Diagram:**
Custom illustration showing data flow between the three models and final output. Clean, technical style similar to Linear's system diagrams.

---

## Interaction Patterns

**Buttons:** Solid fills with subtle shadows, rounded corners (rounded-lg), hover state with slight elevation and brightness shift

**Cards:** Bordered with subtle shadows, hover elevation (translate-y effect), rounded-xl corners

**Links:** Underline on hover, smooth color transition

**Animations:** Minimal and purposeful - subtle fades, gentle slides, avoid distracting motion. Hero elements can have slow ambient animations.

**Navigation:** Fixed header with blur backdrop, smooth scroll anchors to sections

---

## Unique Elements

**Trinity Visualization:** Interactive diagram showing real-time or conceptual flow between three AI models - central hub with branching decision paths

**Decision Consensus Meter:** Visual indicator showing agreement level between models (progress bar or circular gauge)

**Code Preview Boxes:** Terminal-style boxes showing sample AI outputs with syntax highlighting (use Prism.js)