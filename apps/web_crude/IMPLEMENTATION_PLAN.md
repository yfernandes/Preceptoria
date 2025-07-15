# Preceptoria UI Implementation Plan - Testing First Approach

## 🎯 Current Status & Strategy

### ✅ What We Know Works (API Endpoints)

- **Health Check** (`GET /health`) - ✅ Tested and working
- **Sign In** (`POST /auth/signin`) - ✅ Tested and working
- **Classes** (`GET /classes`) - ✅ Tested and working

### 🧪 Testing-First Development

- **Playwright** for end-to-end testing
- **No fancy UI libraries** - Pure HTML/CSS for now
- **Prove functionality first**, add polish later
- **Focus on core user flows** that actually work

## 🚀 Phase 1: Testing Foundation (Week 1)

### 1.1 Setup Testing Infrastructure

- [x] Install Playwright
- [x] Configure test environment
- [x] Set up test data and fixtures
- [x] Create basic test structure

### 1.2 Core User Flow Tests

- [ ] **Health Check Test**
  - Verify API is reachable
  - Check response format
- [ ] **Authentication Flow Test**
  - Login with valid credentials
  - Verify session management
  - Test protected route access
- [ ] **Classes Data Test**
  - Fetch classes data
  - Display in simple table/list
  - Verify data integrity

### 1.3 Basic UI Implementation (Minimal)

- [x] **Simple Login Page**
  - Basic form with email/password
  - Error handling
  - Success redirect
- [x] **Classes Display Page**
  - Simple table or list view
  - No fancy styling, just functional
- [ ] **Simple Navigation**
  - Basic links between Login, Dashboard, Classes, and Documents pages
  - Logout functionality

## 🎯 Success Criteria (Phase 1)

### Technical Requirements

- [ ] All tests pass consistently
- [ ] API integration works reliably
- [ ] Basic user flows functional
- [ ] No external UI dependencies
- [ ] Test coverage metrics are tracked and meet minimum threshold

### User Experience (Minimal)

- [ ] Can log in successfully
- [ ] Can view classes data
- [ ] Can navigate between pages
- [ ] Can log out

## 🛠 Technical Implementation

### Testing Strategy

```typescript
// Example test structure
describe("Authentication Flow", () => {
	test("should login and access protected routes", async ({ page }) => {
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "yagoalmeida@gmail.com");
		await page.fill('[data-testid="password"]', "TotallyS3cr3tP4ssw_rd");
		await page.click('[data-testid="login-button"]');

		// Should redirect to dashboard
		await expect(page).toHaveURL("/dashboard");

		// Should be able to access classes
		await page.click('[data-testid="classes-link"]');
		await expect(page).toHaveURL("/classes");
	});
});
```

### API Integration (Proven Endpoints Only)

```typescript
// Only these endpoints are tested and working
const API_ENDPOINTS = {
	health: "GET /health",
	signin: "POST /auth/signin",
	classes: "GET /classes",
};
```

### Simple UI Structure

```html
<!-- No fancy components, just functional HTML -->
<div class="container">
	<h1>Classes</h1>
	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Status</th>
			</tr>
		</thead>
		<tbody>
			{classes.map(class => (
			<tr key="{class.id}">
				<td>{class.name}</td>
				<td>{class.status}</td>
			</tr>
			))}
		</tbody>
	</table>
</div>
```

## 📁 Simplified File Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── login/page.tsx     # Simple login form
│   ├── dashboard/page.tsx # Basic dashboard
│   ├── classes/page.tsx   # Classes display
│   └── layout.tsx         # Root layout
├── lib/
│   └── eden.ts           # API client (existing)
├── tests/                # Playwright tests
│   ├── auth.spec.ts      # Authentication tests
│   ├── classes.spec.ts   # Classes tests
│   └── health.spec.ts    # Health check tests
└── package.json
```

## 🎨 Design Philosophy (Phase 1)

### Minimal Viable UI

- **No CSS frameworks** - Pure CSS only
- **No component libraries** - Native HTML elements
- **Functional over beautiful** - Prove it works first
- **Accessible by default** - Semantic HTML

### Simple Styling Approach

```css
/* Basic, functional CSS only */
.container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 20px;
}
.table {
	width: 100%;
	border-collapse: collapse;
}
.table th,
.table td {
	padding: 8px;
	border: 1px solid #ddd;
}
.button {
	padding: 8px 16px;
	background: #007bff;
	color: white;
}
```

## 🔧 Development Workflow

### 1. Write Test First

```bash
# Create test for new feature
npx playwright test --grep "login flow"
```

### 2. Implement Minimal UI

```bash
# Build the simplest thing that could work
# Focus on functionality, not aesthetics
```

### 3. Verify with Tests

```bash
# Ensure tests pass
npx playwright test
```

### 4. Manual Testing

```bash
# Start dev server and test manually
bun run dev
```

## 📊 Success Metrics (Phase 1)

### Technical Metrics

- [ ] 100% test coverage for core flows
- [ ] 0 external UI dependencies
- [ ] < 2 second page load times
- [ ] 100% API endpoint success rate
- [ ] Test coverage is measured and reported (e.g., using Playwright or other tools)

### User Flow Metrics

- [ ] Login success rate > 95%
- [ ] Classes data loads successfully
- [ ] Navigation works reliably
- [ ] No broken links or 404s

## 🚀 Phase 2: Polish & Enhancement (Future)

### Only After Phase 1 is Complete

- [ ] Add proper CSS framework (Tailwind/shadcn)
- [ ] Implement component library
- [ ] Add advanced UI features
- [ ] Enhance user experience
- [ ] Add more endpoints as they're tested

## 📝 Development Rules

### ✅ Do's

- Write tests first
- Keep UI simple and functional
- Use only tested API endpoints
- Focus on user flows that work
- Document what works

### ❌ Don'ts

- Add fancy UI libraries yet
- Implement untested endpoints
- Over-engineer the solution
- Skip testing
- Assume API endpoints work

---

This approach ensures we build a solid, tested foundation before adding complexity. We'll prove the core functionality works before making it beautiful.
